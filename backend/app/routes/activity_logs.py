from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.utils.activity_logger import activity_logger
from app.utils.security import oauth2_scheme, get_user_id_from_request
import jwt
from app.core.Config import settings
import logging

# Configure logger
logger = logging.getLogger(__name__)

class ActivityLogEntry(BaseModel):
    timestamp: str
    user_id: str
    action: str
    resource: str
    ip_address: Optional[str] = None
    details: dict = {}

class ActivityLogsResponse(BaseModel):
    logs: List[ActivityLogEntry]
    count: int

class FrontendActionLog(BaseModel):
    action: str
    resource: str  
    details: Optional[dict] = {}
    
activity_logs_router = APIRouter(prefix="/activity-logs")

# Utility function to verify admin access
async def verify_admin_access(token: str = Depends(oauth2_scheme)):
    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        
        # Check if user is admin
        if not payload.get("is_admin", False):
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )
        
        return payload
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

@activity_logs_router.get("/", response_model=ActivityLogsResponse)
async def get_activity_logs(
    user_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    _: dict = Depends(verify_admin_access)
):
    """
    Get activity logs with optional filtering.
    Only accessible by admin users.
    """
    try:
        # Validate date format if provided
        if start_date:
            try:
                datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid start_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        if end_date:
            try:
                datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid end_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        # Get logs
        logs = activity_logger.get_user_activity(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Apply pagination
        paginated_logs = logs[skip:skip+limit]
        
        return ActivityLogsResponse(logs=paginated_logs, count=len(logs))
    
    except Exception as e:
        logger.error(f"Error retrieving activity logs: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve activity logs: {str(e)}"
        )

@activity_logs_router.delete("/")
async def clear_activity_logs(
    before_date: Optional[str] = None,
    _: dict = Depends(verify_admin_access)
):
    """
    Clear activity logs before a specified date.
    If no date is provided, all logs will be cleared.
    Only accessible by admin users.
    """
    try:
        # If before_date provided, validate format
        if before_date:
            try:
                cutoff_date = datetime.fromisoformat(before_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid before_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        # Get all logs
        logs = activity_logger.get_user_activity()
        
        if before_date:
            # Filter logs to keep only those after the cutoff date
            filtered_logs = [
                log for log in logs 
                if datetime.fromisoformat(log.get("timestamp", "")) >= cutoff_date
            ]
            removed_count = len(logs) - len(filtered_logs)
            
            # Write back the filtered logs
            with open(activity_logger.log_file, 'w') as f:
                import json
                json.dump(filtered_logs, f, indent=2)
                
            return {"message": f"Removed {removed_count} logs before {before_date}", "count": removed_count}
        else:
            # Clear all logs
            with open(activity_logger.log_file, 'w') as f:
                import json
                json.dump([], f, indent=2)
                
            return {"message": f"Cleared all {len(logs)} activity logs", "count": len(logs)}
    
    except Exception as e:
        logger.error(f"Error clearing activity logs: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear activity logs: {str(e)}"
        )

@activity_logs_router.post("/frontend-action")
async def log_frontend_action(
    action_log: FrontendActionLog,
    request: Request
):
    """
    Log user actions from the frontend (e.g., button clicks, page views).
    This endpoint is designed to be called from frontend applications.
    """
    try:
        # Extract user ID from request 
        user_id = await get_user_id_from_request(request)
        
        # Get client IP
        client_ip = request.client.host if request.client else None
        
        # Log the action
        activity_logger.log_activity(
            user_id=user_id,
            action=action_log.action,
            resource=action_log.resource,
            details=action_log.details or {},
            ip_address=client_ip
        )
        
        return {"status": "success", "message": "Action logged successfully"}
    
    except Exception as e:
        logger.error(f"Error logging frontend action: {e}")
        # Don't return detailed error to client
        return {"status": "error", "message": "Failed to log action"} 