# app/database/connection.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.Config import settings

DATABASE_URL = f"postgresql://postgres:Temp1234@localhost:5432/fasthire999"
SQLALCHEMY_DATABASE_URL = f"postgresql://postgres:Temp1234@localhost:5432/fasthire999" # Change as needed


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"Error in database operation: {e}")
        db.rollback()
    finally:
        db.close()

