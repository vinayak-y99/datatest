from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import base64

from app.database.connection import get_db
from app.models.base import Organization, User, Role
from app.models.base_models import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
    OrganizationStatusUpdate,
    OrganizationUserResponse,
    UserCreate,
    UserResponse
)
from app.utils.security import hash_password, verify_password, handle_db_error

organization_router = APIRouter()

@organization_router.post("/create", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
@handle_db_error
async def create_organization(
    organization_name: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    industry: Optional[str] = Form(None),
    size: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    website: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None), 
    tax_id: Optional[str] = Form(None),
    additional_information: Optional[str] = Form(None),
    company_email: Optional[str] = Form(None),
    company_phone: Optional[str] = Form(None),
    subscription_plan: Optional[str] = Form(None),
    subscription_duration: Optional[str] = Form("Monthly"),
    dbname: Optional[str] = Form(None),
    status: Optional[str] = Form("Active"),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    existing_org = db.query(Organization).filter(Organization.email == email).first()
    if existing_org:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization with this email already exists")
    
    hashed_password = hash_password(password)
    renewal_date = datetime.utcnow() + timedelta(days=30)
    logo_data = None
    if logo:
        logo_bytes = await logo.read()
        logo_data = base64.b64encode(logo_bytes).decode("utf-8")

    db_organization = Organization(
        organization_name=organization_name,
        username=username,
        email=email,
        password_hash=hashed_password,
        industry=industry,
        size=size,
        description=description,
        website=website,
        address=address,
        city=city,
        country=country,
        postal_code=postal_code,
        tax_id=tax_id,
        logo=logo_data,
        subscription_plan=subscription_plan,
        payment_status="Pending",
        subscription_duration=subscription_duration,
        renewal_date=renewal_date,
        active=True,
        additional_information=additional_information,
        company_email=company_email,
        company_phone=company_phone,
        plan_from=datetime.utcnow(),
        plan_to=renewal_date,
        dbname=dbname,
        status=status,
        settings={"theme": "light", "timezone": "UTC", "language": "en", "two_factor_auth": False, "data_retention_days": 365, "compliance_standards": [], "api_key": "", "notification_email": ""}
    )
     
    db.add(db_organization)
    db.commit()
    db.refresh(db_organization)
    return db_organization

@organization_router.get("/", response_model=Dict[str, List[OrganizationResponse]])
@handle_db_error
async def get_organizations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    organizations = db.query(Organization).offset(skip).limit(limit).all()
    return {"organizations": organizations}

@organization_router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(organization_id: int, db: Session = Depends(get_db)):
    organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return organization

@organization_router.put("/{organization_id}", response_model=OrganizationResponse)
@handle_db_error
async def update_organization(organization_id: int, organization_data: OrganizationUpdate, db: Session = Depends(get_db)):
    db_organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not db_organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    update_data = organization_data.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_organization, key, value)
    
    db.commit()
    db.refresh(db_organization)
    return db_organization

@organization_router.patch("/{organization_id}/status", response_model=OrganizationResponse)
@handle_db_error
async def update_organization_status(organization_id: int, status_data: OrganizationStatusUpdate, db: Session = Depends(get_db)):
    db_organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not db_organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    db_organization.active = status_data.active
    db.commit()
    db.refresh(db_organization)
    return db_organization

@organization_router.delete("/{organization_id}")
@handle_db_error
async def delete_organization(organization_id: int, db: Session = Depends(get_db)):
    db_organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not db_organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    db.delete(db_organization)
    db.commit()
    return {"detail": "Organization deleted successfully"}

@organization_router.post("/{organization_id}/users", response_model=UserResponse)
@handle_db_error
async def add_user_to_organization(organization_id: int, user_data: UserCreate, db: Session = Depends(get_db)):
    organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")
    
    role = db.query(Role).filter(Role.role_id == user_data.role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role_id provided")
    
    hashed_password = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        role_name=role.role_name,
        role_id=user_data.role_id,
        organization_id=organization_id,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "user_id": new_user.user_id,
        "name": new_user.name,
        "email": new_user.email,
        "username": new_user.username,
        "role_id": new_user.role_id,
        "role_name": new_user.role_name,
        "organization_id": new_user.organization_id,
        "organization_name": organization.organization_name  # Fixed typo here
    }

@organization_router.get("/{organization_id}/users", response_model=List[OrganizationUserResponse])
@handle_db_error
async def get_organization_users(organization_id: int, db: Session = Depends(get_db)):
    organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    users = db.query(
        User.user_id,
        User.name,
        User.email,
        User.username,
        User.role_id,
        Role.role_name,
        User.organization_id,
        Organization.organization_name
    ).join(Role, User.role_id == Role.role_id).join(Organization, User.organization_id == Organization.organization_id).filter(User.organization_id == organization_id).all()
    
    return [{
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "username": user.username,
        "role_id": user.role_id,
        "role_name": user.role_name,
        "organization_id": user.organization_id,
        "organization_name": user.organization_name
    } for user in users]

@organization_router.put("/{organization_id}/users/{user_id}", response_model=UserResponse)
@handle_db_error
async def update_organization_user(organization_id: int, user_id: int, user_data: UserCreate, db: Session = Depends(get_db)):
    organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    user = db.query(User).filter(User.user_id == user_id, User.organization_id == organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in this organization")
    
    if user_data.role_id and user.role_id != user_data.role_id:
        role = db.query(Role).filter(Role.role_id == user_data.role_id).first()
        if not role:
            raise HTTPException(status_code=400, detail="Invalid role_id provided")
        user.role_name = role.role_name
    
    user.name = user_data.name
    user.email = user_data.email
    user.username = user_data.username
    user.role_id = user_data.role_id
    if user_data.password:
        user.password_hash = hash_password(user_data.password)
    
    db.commit()
    db.refresh(user)
    return {
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "username": user.username,
        "role_id": user.role_id,
        "role_name": user.role_name,
        "organization_id": user.organization_id,
        "organization_name": organization.organization_name
    }

@organization_router.delete("/{organization_id}/users/{user_id}")
@handle_db_error
async def delete_organization_user(organization_id: int, user_id: int, db: Session = Depends(get_db)):
    organization = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    user = db.query(User).filter(User.user_id == user_id, User.organization_id == organization_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in this organization")
    
    db.delete(user)
    db.commit()
    return {"detail": "User deleted successfully"}

@organization_router.get("/check-email")
async def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    return {"exists": bool(user)}