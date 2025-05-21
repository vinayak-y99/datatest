from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.models.base import Role, RolePermission
from app.database.connection import get_db
from app.models.base_models import RoleResponse, RoleCreate, RoleBase
from app.utils.security import handle_db_error
from datetime import datetime
from sqlalchemy import text

role_router = APIRouter()

@role_router.get("/Role", response_model=List[RoleResponse])
@handle_db_error
async def get_all_roles(db: Session = Depends(get_db)):
    """Get all Roles"""
    roles = db.query(Role).all()
    
    role_responses = []
    for role in roles:
        permissions = {}
        role_permissions = db.query(RolePermission).filter(RolePermission.role_id == role.role_id).all()
        for perm in role_permissions:
            permissions[perm.permission_name] = True
            
        role_response = RoleResponse(
            role_id=role.role_id,
            role_name=role.role_name,
            permissions=permissions
        )
        role_responses.append(role_response)
        
    return role_responses

@role_router.post("/Role", response_model=RoleResponse)
@handle_db_error
async def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    """Create a new role"""
    try:
        existing_role = db.query(Role).filter(Role.role_name == role.name).first()
        if existing_role:
            raise HTTPException(status_code=400, detail=f"Role with name '{role.name}' already exists")
        
        new_role = Role(
            role_name=role.name,
            activity_type="CREATE",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(new_role)
        db.flush()
        
        for permission_name, enabled in role.permissions.items():
            if enabled:
                permission = RolePermission(
                    role_id=new_role.role_id,
                    permission_name=permission_name,
                    activity_type="CREATE"
                )
                db.add(permission)
        
        db.commit()
        
        return RoleResponse(
            role_id=new_role.role_id,
            role_name=new_role.role_name,
            permissions=role.permissions
        )
    except Exception as e: 
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating role: {str(e)}")

@role_router.put("/Role/{role_id}", response_model=RoleResponse)
@handle_db_error
async def update_role(role_id: int, role_update: RoleBase, db: Session = Depends(get_db)):
    """Update a role"""
    db_role = db.query(Role).filter(Role.role_id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    if role_update.role_name:
        existing_role = db.query(Role).filter(
            Role.role_name == role_update.role_name,
            Role.role_id != role_id
        ).first()
        if existing_role:
            raise HTTPException(status_code=400, detail=f"Role name '{role_update.role_name}' already exists")

    try:
        db_role.role_name = role_update.role_name
        db_role.updated_at = datetime.now()
        db_role.activity_type = "UPDATE"
        
        db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
        
        for permission_name, enabled in role_update.permissions.items():
            if enabled:
                permission = RolePermission(
                    role_id=role_id,
                    permission_name=permission_name,
                    activity_type="UPDATE"
                )
                db.add(permission)
        
        db.commit()
        
        return RoleResponse(
            role_id=db_role.role_id,
            role_name=db_role.role_name,
            permissions=role_update.permissions
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating role: {str(e)}")

@role_router.delete("/Role/{role_id}")
@handle_db_error
async def delete_role(role_id: int, db: Session = Depends(get_db)):
    """Delete a role"""
    db_role = db.query(Role).filter(Role.role_id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    from app.models.base import User
    users_with_role = db.query(User).filter(User.role_id == role_id).count()
    if users_with_role > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete role: it is assigned to {users_with_role} users"
        )
    
    try:
        db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
        db.delete(db_role)
        db.commit()
        return {"message": "Role deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting role: {str(e)}")

@role_router.get("/Role/debug")
async def debug_role_model():
    """Debug endpoint to check Role model structure"""
    try:
        model_columns = [column.name for column in Role.__table__.columns]
        permission_columns = [column.name for column in RolePermission.__table__.columns]
        
        return {
            "role_columns": model_columns,
            "permission_columns": permission_columns,
            "note": "The Role table has role_name column, and permissions are stored in the RolePermission table."
        }
    except Exception as e:
        return {"error": str(e)}