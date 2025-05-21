from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel

from app.database.connection import get_db
from app.models.base_models import UserResponse, UserCreate
from app.models.base import User, Role
from app.utils.security import hash_password, verify_password, handle_db_error

class BulkUserRequest(BaseModel):
    users: List[Dict[str, Any]]

user_router = APIRouter(tags=["users"])

async def create_multiple_users(users_data: List[Dict[str, Any]], db: Session) -> Tuple[List[User], List[Dict[str, Any]]]:
    created_users = []
    errors = []
    
    for index, user_data in enumerate(users_data):
        try:
            # Convert dict to UserCreate model
            user = UserCreate(**user_data)
            
            # Check if email already exists
            existing_user = db.query(User).filter(User.email == user.email).first()
            
            if existing_user:
                errors.append({
                    "index": index,
                    "email": user.email,
                    "error": "Email already exists"
                })
                continue

            # Create new user
            new_user = User(
                name=user.name,
                email=user.email,
                password_hash=hash_password(user.password),
                credentials=user.credentials
            )
            
            db.add(new_user)
            created_users.append(new_user)
            
        except Exception as e:
            errors.append({
                "index": index,
                "error": str(e)
            })
    
    # Commit all valid users at once if any were created
    if created_users: 
        try:
            db.commit()
            # Refresh all created users to get their IDs
            for user in created_users:
                db.refresh(user)
        except Exception as e:
            db.rollback()
            errors.append({"error": f"Database commit failed: {str(e)}"})
            return [], errors
    
    return created_users, errors

@user_router.get("/users", response_model=List[UserResponse])
@handle_db_error
async def get_users(db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).all()
    return users
@user_router.post("/user", response_model=UserResponse)
@handle_db_error
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a single user"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user with correct field names
    new_user_data = {
        "name": user.name,
        "email": user.email,
        "password_hash": hash_password(user.password),
    }

    # Only check role_id if it's provided
    if hasattr(user, 'role_id') and user.role_id:
        # Check if role exists
        role = db.query(Role).filter(Role.role_id == user.role_id).first()
        if not role:
            # Instead of failing, just don't set the role_id
            print(f"Warning: Role with ID {user.role_id} does not exist. Creating user without role.")
        else:
            new_user_data["role_id"] = user.role_id

    # Only add optional fields if they exist in the model
    if hasattr(user, 'username') and user.username:
        new_user_data["username"] = user.username

    if hasattr(user, 'credentials') and user.credentials:
        new_user_data["credentials"] = user.credentials

    if hasattr(user, 'organization_id') and user.organization_id:
        new_user_data["organization_id"] = user.organization_id

    new_user = User(**new_user_data)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
    return new_user@user_router.delete("/users/{user_id}")
@handle_db_error
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@user_router.put("/users/{user_id}", response_model=UserResponse)
@handle_db_error
async def update_user(
    user_id: int,
    user_update: UserCreate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.name = user_update.name
    user.email = user_update.email
    if user_update.password:
        user.password_hash = hash_password(user_update.password)
    
    if hasattr(user_update, 'role_id') and user_update.role_id:
        role = db.query(Role).filter(Role.role_id == user_update.role_id).first()
        if not role:
            raise HTTPException(status_code=400, detail=f"Role with ID {user_update.role_id} does not exist")
        user.role_id = user_update.role_id
    
    if hasattr(user_update, 'credentials'):
        user.credentials = user_update.credentials
    
    db.commit()
    db.refresh(user)
    return user

@user_router.post("/bulk-users", response_model=Dict[str, Any])
@handle_db_error
async def create_bulk_users(request: BulkUserRequest, db: Session = Depends(get_db)):
    """Create multiple users at once"""
    created_users, errors = await create_multiple_users(request.users, db)
    
    return {
        "success": len(created_users),
        "failed": len(errors),
        "errors": errors,
        "users": created_users
    }
