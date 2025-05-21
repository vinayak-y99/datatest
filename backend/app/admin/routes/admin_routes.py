from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
from pydantic import BaseModel
from datetime import datetime

from app.database.connection import get_db
from app.models.base_models import AdminResponse, AdminCreate, LoginRequest, OTPRequest
from app.models.base import Admin, User, Role
from app.utils.security import hash_password, verify_password, handle_db_error

 
admin_router = APIRouter()

@admin_router.post("/admin", response_model=AdminResponse)
@handle_db_error
async def create_admin_user(admin: AdminCreate, db: Session = Depends(get_db)):
    existing_email = db.query(Admin).filter(Admin.email == admin.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    current_time = datetime.now()
    new_admin = Admin(
        username=admin.username,
        email=admin.email,
        password=hash_password(admin.password),
        mobile=admin.mobile or "N/A",
        department=admin.role or "ADMIN",
        activity_type="CREATE",
        created_at=current_time,
        updated_at=current_time
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return AdminResponse(
        admin_id=new_admin.admin_id,
        username=new_admin.username,
        email=new_admin.email,
        mobile=new_admin.mobile,
        department=new_admin.department,
        is_active=True,
        created_at=new_admin.created_at,
        updated_at=new_admin.updated_at
    )