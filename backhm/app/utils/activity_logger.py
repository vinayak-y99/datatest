import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Callable
import threading
import logging
from functools import wraps
from app.core.Config import settings
import asyncio

# Configure logger
logger = logging.getLogger(__name__)

class ActivityLogger:
    """
    A class to log user activities in the system.
    Logs are stored in JSON format with entries for each user action.
    """
    
    def __init__(self):
        self.log_dir = Path(settings.BASE_DIR) / "logs"
        self.log_dir.mkdir(exist_ok=True)
        self.log_file = self.log_dir / "user_activity.json"
        self.lock = threading.Lock()  # Thread lock for concurrent writes
        
        # Initialize the log file if it doesn't exist
        if not self.log_file.exists():
            with open(self.log_file, 'w') as f:
                json.dump([], f)
    
    def log_activity(self, 
                   user_id: str, 
                   action: str, 
                   resource: str, 
                   details: Optional[Dict[str, Any]] = None, 
                   ip_address: Optional[str] = None) -> None:
        """
        Log a user activity to the JSON file.
        
        Args:
            user_id: ID of the user performing the action
            action: Type of action (e.g., "login", "create", "update", "delete", "view", "button_click")
            resource: Resource being acted upon (e.g., "job", "candidate", "resume")
            details: Additional details about the action
            ip_address: IP address of the user (if available)
        """
        timestamp = datetime.now().isoformat()
        
        log_entry = {
            "timestamp": timestamp,
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "details": details or {}
        }
        
        try:
            with self.lock:  # Use lock to prevent race conditions
                # Read current logs
                with open(self.log_file, 'r') as f:
                    try:
                        logs = json.load(f)
                    except json.JSONDecodeError:
                        logs = []
                
                # Append new log entry
                logs.append(log_entry)
                
                # Write back to file
                with open(self.log_file, 'w') as f:
                    json.dump(logs, f, indent=2)
            
            logger.info(f"Activity logged: {user_id} - {action} - {resource}")
        except Exception as e:
            logger.error(f"Failed to log activity: {e}")
    
    def get_user_activity(self, user_id: Optional[str] = None, 
                         start_date: Optional[str] = None,
                         end_date: Optional[str] = None) -> list:
        """
        Retrieve user activity logs with optional filtering.
        
        Args:
            user_id: Filter logs by user ID
            start_date: Filter logs starting from this date (ISO format)
            end_date: Filter logs until this date (ISO format)
            
        Returns:
            List of log entries matching the criteria
        """
        try:
            with open(self.log_file, 'r') as f:
                try:
                    logs = json.load(f)
                except json.JSONDecodeError:
                    return []
            
            # Apply filters
            if user_id:
                logs = [log for log in logs if log.get("user_id") == user_id]
            
            if start_date:
                start = datetime.fromisoformat(start_date)
                logs = [log for log in logs if datetime.fromisoformat(log.get("timestamp", "")) >= start]
            
            if end_date:
                end = datetime.fromisoformat(end_date)
                logs = [log for log in logs if datetime.fromisoformat(log.get("timestamp", "")) <= end]
            
            return logs
        except Exception as e:
            logger.error(f"Failed to retrieve activity logs: {e}")
            return []

    def log_function_call(self, action: str, resource: str, get_user_id: Optional[Callable] = None):
        """
        Decorator to log function calls as user activities.
        
        Args:
            action: Action being performed (e.g., "create", "update")
            resource: Resource being affected (e.g., "job", "candidate")
            get_user_id: Optional function to extract user_id from function args
        """
        def decorator(func):
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                # Try to get user ID
                user_id = "system"
                if get_user_id:
                    try:
                        user_id = get_user_id(*args, **kwargs)
                    except Exception as e:
                        logger.warning(f"Failed to get user ID in decorator: {e}")
                
                # Extract relevant details from args/kwargs
                details = {
                    "function": func.__name__,
                    "module": func.__module__
                }
                
                # Log before execution
                self.log_activity(
                    user_id=user_id,
                    action=f"{action}_started",
                    resource=resource,
                    details=details
                )
                
                # Execute function
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    success = True
                except Exception as e:
                    result = None
                    success = False
                    error_msg = str(e)
                    details["error"] = error_msg
                    # Re-raise the exception
                    raise
                finally:
                    # Log after execution
                    duration = time.time() - start_time
                    details["duration_ms"] = round(duration * 1000, 2)
                    details["success"] = success
                    
                    self.log_activity(
                        user_id=user_id,
                        action=f"{action}_completed" if success else f"{action}_failed",
                        resource=resource,
                        details=details
                    )
                
                return result
            
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                # Try to get user ID
                user_id = "system"
                if get_user_id:
                    try:
                        user_id = get_user_id(*args, **kwargs)
                    except Exception as e:
                        logger.warning(f"Failed to get user ID in decorator: {e}")
                
                # Extract relevant details from args/kwargs
                details = {
                    "function": func.__name__,
                    "module": func.__module__
                }
                
                # Log before execution
                self.log_activity(
                    user_id=user_id,
                    action=f"{action}_started",
                    resource=resource,
                    details=details
                )
                
                # Execute function
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    success = True
                except Exception as e:
                    result = None
                    success = False
                    error_msg = str(e)
                    details["error"] = error_msg
                    # Re-raise the exception
                    raise
                finally:
                    # Log after execution
                    duration = time.time() - start_time
                    details["duration_ms"] = round(duration * 1000, 2)
                    details["success"] = success
                    
                    self.log_activity(
                        user_id=user_id,
                        action=f"{action}_completed" if success else f"{action}_failed",
                        resource=resource,
                        details=details
                    )
                
                return result
            
            # Determine if the function is async or not
            if asyncio.iscoroutinefunction(func):
                return async_wrapper
            else:
                return sync_wrapper
        
        return decorator

# Create singleton instance
activity_logger = ActivityLogger() 