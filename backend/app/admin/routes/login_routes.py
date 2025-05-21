# app/admin/routes/login_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from werkzeug.security import check_password_hash, generate_password_hash
from app.database.connection import get_db
from app.models.base import User, Organization, Admin
from fastapi.middleware.cors import CORSMiddleware
import secrets
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

login_router = APIRouter()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

# Simulated email sending function
def send_reset_email(email: str, reset_token: str):
    print(f"Sending reset email to {email} with token: {reset_token}")

@login_router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email = request.email
    password = request.password
    
    logger.info(f"Login attempt for email: {email}")

    # Check admin login
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin and admin.password == password:  # Plain text (use hashing in production)
        logger.info(f"Admin login successful: {email}")
        return {
            "role": "Admin",
            "redirect_to": "/Admin",
            "user_name": admin.username or admin.email.split("@")[0]
        }

    # Check user login
    user = db.query(User).filter(User.email == email).first()
    if user:
        try:
            # Debug the password hash
            if user.password_hash:
                logger.info(f"User found, checking password hash")
                
                # Safe password check with error handling
                if '$' in str(user.password_hash):
                    password_valid = check_password_hash(user.password_hash, password)
                else:
                    # Fallback for improperly formatted hashes
                    logger.warning(f"Invalid hash format, using direct comparison")
                    password_valid = (user.password_hash == password)
                    
                if password_valid:
                    role = user.role_name.lower()
                    redirect_map = {
                        "hiring": "/hiring",
                        "technical": "/Technical",
                        "recruiter": "/recruiter",
                        "client": "/client"
                    }
                    logger.info(f"User login successful: {email}, role: {role}")
                    return {
                        "role": role.capitalize(),
                        "redirect_to": redirect_map.get(role, "/dashboard"),
                        "user_name": user.username or user.email.split("@")[0]
                    }
            else:
                logger.warning(f"User has no password hash: {email}")
        except ValueError as e:
            # Handle invalid hash format
            logger.error(f"Password hash error: {str(e)}")
            # Try direct comparison as fallback
            if user.password_hash == password:
                role = user.role_name.lower()
                redirect_map = {
                    "hiring": "/hiring",
                    "technical": "/Technical",
                    "recruiter": "/recruiter",
                    "client": "/client"
                }
                logger.info(f"User login successful (fallback): {email}")
                return {
                    "role": role.capitalize(),
                    "redirect_to": redirect_map.get(role, "/dashboard"),
                    "user_name": user.username or user.email.split("@")[0]
                }

    # Check organization login
    org = db.query(Organization).filter(Organization.email == email).first()
    if org:
        try:
            # Debug the password hash
            if org.password_hash:
                logger.info(f"Organization found, checking password hash")
                
                # Safe password check with error handling
                if '$' in str(org.password_hash):
                    password_valid = check_password_hash(org.password_hash, password)
                else:
                    # Fallback for improperly formatted hashes
                    logger.warning(f"Invalid hash format, using direct comparison")
                    password_valid = (org.password_hash == password)
                    
                if password_valid:
                    logger.info(f"Organization login successful: {email}")
                    return {
                        "role": "Organization",
                        "redirect_to": "/organization",
                        "user_name": org.username or org.email.split("@")[0]
                    }
            else:
                logger.warning(f"Organization has no password hash: {email}")
        except ValueError as e:
            # Handle invalid hash format
            logger.error(f"Password hash error: {str(e)}")
            # Try direct comparison as fallback
            if org.password_hash == password:
                logger.info(f"Organization login successful (fallback): {email}")
                return {
                    "role": "Organization",
                    "redirect_to": "/organization",
                    "user_name": org.username or org.email.split("@")[0]
                }

    logger.warning(f"Failed login attempt for: {email}")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password ❌")

@login_router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = request.email

    admin = db.query(Admin).filter(Admin.email == email).first()
    user = db.query(User).filter(User.email == email).first()
    org = db.query(Organization).filter(Organization.email == email).first()

    if not (admin or user or org):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    reset_token = secrets.token_urlsafe(32)

    if admin:
        admin.password = reset_token
        admin.updated_at = datetime.utcnow()
    elif user:
        user.password_hash = generate_password_hash(reset_token)
        user.updated_at = datetime.utcnow()
    elif org:
        org.password_hash = generate_password_hash(reset_token)
        org.updated_at = datetime.utcnow()

    db.commit()

    send_reset_email(email, reset_token)

    return {"detail": "Password reset link sent to your email. Use the token to reset your password."}

@login_router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.password == token).first()
    user = db.query(User).filter(User.password_hash == generate_password_hash(token)).first()
    org = db.query(Organization).filter(Organization.password_hash == generate_password_hash(token)).first()

    if admin:
        admin.password = new_password
        admin.updated_at = datetime.utcnow()
    elif user:
        user.password_hash = generate_password_hash(new_password)
        user.updated_at = datetime.utcnow()
    elif org:
        org.password_hash = generate_password_hash(new_password)
        org.updated_at = datetime.utcnow()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token.")

    db.commit()
    return {"detail": "Password reset successfully."}
