# app/database/connection.py
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.Config import settings
from contextlib import contextmanager
import logging
import time
from app.utils.activity_logger import activity_logger
import inspect
import traceback

# Configure logger
logger = logging.getLogger(__name__)

DATABASE_URL = "postgresql:/1234@localhost:5432/fasthire999"
SQLALCHEMY_DATABASE_URL = f"postgresql://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Error in database operation: {e}")
        db.rollback()
        
        # Log the error with trace
        stack_trace = traceback.format_exc()
        
        # Try to identify the caller 
        calling_frame = inspect.currentframe().f_back
        if calling_frame:
            calling_func = calling_frame.f_code.co_name
            calling_file = calling_frame.f_code.co_filename
            
            # Log to activity log
            activity_logger.log_activity(
                user_id="system",
                action="database_error",
                resource="database",
                details={
                    "error": str(e),
                    "caller": f"{calling_file}:{calling_func}",
                    "stack_trace": stack_trace
                }
            )
        
        # Re-raise the exception
        raise
    finally:
        db.close()

# Add event listeners to track SQL operations
@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())
    logger.debug(f"SQL Query: {statement}")
    logger.debug(f"Parameters: {parameters}")

@event.listens_for(engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info['query_start_time'].pop(-1)
    logger.debug(f"Query Execution Time: {total:.6f} seconds")
    
    # Log the SQL operation if it's a write operation
    operation_type = statement.split()[0].lower() if statement else ""
    if operation_type in ["insert", "update", "delete", "create", "drop", "alter"]:
        # Try to identify the caller 
        calling_frame = inspect.currentframe().f_back
        if calling_frame and calling_frame.f_back:
            # Skip the sqlalchemy frames to find the actual caller
            for _ in range(5):  # Look back up to 5 frames to find a non-sqlalchemy caller
                if calling_frame and not (
                    calling_frame.f_code.co_filename.endswith('sqlalchemy') or 
                    calling_frame.f_code.co_filename.endswith('orm')
                ):
                    break
                calling_frame = calling_frame.f_back
                
            if calling_frame:
                calling_func = calling_frame.f_code.co_name
                calling_file = calling_frame.f_code.co_filename
                
                # Log to activity log
                activity_logger.log_activity(
                    user_id="system", 
                    action=f"database_{operation_type}",
                    resource="database",
                    details={
                        "execution_time": f"{total:.6f} seconds",
                        "caller": f"{calling_file}:{calling_func}"
                    }
                )

