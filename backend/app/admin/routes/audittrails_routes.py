from fastapi import HTTPException, Depends, APIRouter, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.database.connection import get_db
from app.models.base import User, Organization, AuditTrail
import logging

logger = logging.getLogger(__name__)

# Pydantic Schemas
class AuditTrailBase(BaseModel):
    organization_id: int
    user_id: int
    action: str
    details: Optional[str] = None
    activity_type: Optional[str] = None

class AuditTrailCreate(AuditTrailBase):
    pass

class AuditTrailSchema(AuditTrailBase):
    audit_id: int
    timestamp: datetime
    username: str
    organization_name: str
    role: str
    
    model_config = {
        "from_attributes": True
    }

# Router
audit_router = APIRouter()

# Controller Class
class AuditController:
    @staticmethod
    async def get_all_audit_logs(db: Session) -> List[AuditTrail]:
        """Get all audit logs from the database."""
        try:
            logs = db.query(AuditTrail).join(User).join(Organization).all()
            return logs
        except Exception as e:
            logger.error(f"Error retrieving audit logs: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to retrieve audit logs")

    @staticmethod
    async def get_audit_logs_by_organization(db: Session, organization_id: int) -> List[AuditTrail]:
        """Get audit logs for a specific organization."""
        try:
            logs = db.query(AuditTrail).join(User).join(Organization).filter(
                AuditTrail.organization_id == organization_id
            ).all()
            if not logs:
                return []
            return logs
        except Exception as e:
            logger.error(f"Error retrieving audit logs for organization {organization_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to retrieve audit logs")

    @staticmethod
    async def create_audit_log(db: Session, audit_data: AuditTrailCreate) -> AuditTrail:
        """Create a new audit log entry."""
        try:
            # Validate foreign keys
            user = db.query(User).filter(User.user_id == audit_data.user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail=f"User with ID {audit_data.user_id} not found")
            
            org = db.query(Organization).filter(
                Organization.organization_id == audit_data.organization_id
            ).first()
            if not org:
                raise HTTPException(status_code=404, detail=f"Organization with ID {audit_data.organization_id} not found")

            db_audit = AuditTrail(
                organization_id=audit_data.organization_id,
                user_id=audit_data.user_id,
                action=audit_data.action,
                details=audit_data.details,
                activity_type=audit_data.activity_type
            )
            db.add(db_audit)
            db.commit()
            db.refresh(db_audit)
            return db_audit
        except HTTPException as e:
            raise e
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating audit log: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

# Routes
@audit_router.get("/logs", response_model=List[AuditTrailSchema])
async def get_all_audit_logs(db: Session = Depends(get_db)):
    """Get all audit logs."""
    logs = await AuditController.get_all_audit_logs(db)
    return [
        AuditTrailSchema(
            audit_id=log.audit_id,
            organization_id=log.organization_id,
            user_id=log.user_id,
            action=log.action,
            details=log.details,
            activity_type=log.activity_type,
            timestamp=log.timestamp,
            username=log.user.username,
            organization_name=log.organization.organization_name,
            role=log.user.role_name
        ) for log in logs
    ]

@audit_router.get("/logs/organization/{organization_id}", response_model=List[AuditTrailSchema])
async def get_organization_audit_logs(organization_id: int, db: Session = Depends(get_db)):
    """Get audit logs for a specific organization."""
    logs = await AuditController.get_audit_logs_by_organization(db, organization_id)
    return [
        AuditTrailSchema(
            audit_id=log.audit_id,
            organization_id=log.organization_id,
            user_id=log.user_id,
            action=log.action,
            details=log.details,
            activity_type=log.activity_type,
            timestamp=log.timestamp,
            username=log.user.username,
            organization_name=log.organization.organization_name,
            role=log.user.role_name
        ) for log in logs
    ]

@audit_router.post("/logs", response_model=AuditTrailSchema, status_code=status.HTTP_201_CREATED)
async def create_audit_log(audit: AuditTrailCreate, db: Session = Depends(get_db)):
    """Create a new audit log."""
    new_log = await AuditController.create_audit_log(db, audit)
    return AuditTrailSchema(
        audit_id=new_log.audit_id,
        organization_id=new_log.organization_id,
        user_id=new_log.user_id,
        action=new_log.action,
        details=new_log.details,
        activity_type=new_log.activity_type,
        timestamp=new_log.timestamp,
        username=new_log.user.username,
        organization_name=new_log.organization.organization_name,
        role=new_log.user.role_name
    )
