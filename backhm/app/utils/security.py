from passlib.context import CryptContext
from functools import wraps
from fastapi import HTTPException, Request, Depends
from sqlalchemy.exc import SQLAlchemyError
import logging
from fastapi.security import OAuth2PasswordBearer
import jwt
from typing import Optional
from app.core.Config import settings

# Set up password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Set up logging
logger = logging.getLogger(__name__)
 
def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against a provided password."""
    return pwd_context.verify(plain_password, hashed_password)

def handle_db_error(func):
    """Decorator to handle database errors in routes."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except SQLAlchemyError as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"An unexpected error occurred: {str(e)}"
            )
    return wrapper

# Setup OAuth2 for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_user_id_from_request(request: Request) -> str:
    """
    Extract user ID from the request's authorization header.
    
    Returns:
        str: User ID if found, or "anonymous" if not found or invalid.
    """
    try:
        # Try to get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return "anonymous"
        
        token = auth_header.replace("Bearer ", "")
        
        # Decode JWT token
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        
        # Return user ID from payload
        if "sub" in payload:
            return str(payload["sub"])
        return "anonymous"
        
    except Exception as e:
        logger.warning(f"Failed to extract user ID from request: {e}")
        return "anonymous"
