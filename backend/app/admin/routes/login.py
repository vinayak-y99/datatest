from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from werkzeug.security import check_password_hash
from app.database.connection import get_db
from app.models.base import User, Organization, Admin

login_router = APIRouter()

# Pydantic model for login request
class LoginRequest(BaseModel):
    email: str
    password: str

@login_router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email = request.email
    password = request.password

    # Check Admin table
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin and admin.password == password:  # Plain text password (use hashing in production)
        return {"role": "Admin", "redirect": "/admin"}

    # Check User table
    user = db.query(User).filter(User.email == email).first()
    if user and check_password_hash(user.password_hash, password):
        role = user.role_name.lower()
        redirect_map = {
            "hiring": "/hiring",
            "technical": "/technical",
            "recruiter": "/recruiter",
            "client": "/client"
        }
        return {"role": role.capitalize(), "redirect": redirect_map.get(role, "/")}

    # Check Organization table
    org = db.query(Organization).filter(Organization.email == email).first()
    if org and check_password_hash(org.password_hash, password):
        return {"role": "Organization", "redirect": "/organization"}

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")