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
import pymongo
from pymongo import MongoClient

# Configure logger
logger = logging.getLogger(__name__)

class ActivityLogger:
    """
    A class to log user activities in the system.
    Logs are stored in MongoDB database in a collection named 'user_activities'.
    """
    
    def __init__(self):
        # MongoDB connection settings
        self.mongo_uri = settings.MONGODB_URI if hasattr(settings, 'MONGODB_URI') else "mongodb://localhost:27017/"
        self.db_name = "security"
        self.collection_name = "user_activities"
        
        # Initialize MongoDB connection
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            self.collection = self.db[self.collection_name]
            
            # Create indexes for efficient querying
            self.collection.create_index("user_id")
            self.collection.create_index("timestamp")
            
            logger.info(f"Connected to MongoDB: {self.db_name}.{self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            # Fallback to file-based logging in case of MongoDB connection failure
            self.log_dir = Path(settings.BASE_DIR) / "logs"
            self.log_dir.mkdir(exist_ok=True)
            self.log_file = self.log_dir / "user_activity.json"
            self.lock = threading.Lock()
            
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
        Log a user activity to MongoDB collection.
        
        Args:
            user_id: ID of the user performing the action
            action: Type of action (e.g., "login", "create", "update", "delete", "view", "button_click")
            resource: Resource being acted upon (e.g., "job", "candidate", "resume")
            details: Additional details about the action
            ip_address: IP address of the user (if available)
        """
        timestamp = datetime.now()
        
        log_entry = {
            "timestamp": timestamp,
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "details": details or {}
        }
        
        try:
            # Insert log entry into MongoDB collection
            self.collection.insert_one(log_entry)
            logger.info(f"Activity logged in MongoDB: {user_id} - {action} - {resource}")
        except Exception as e:
            logger.error(f"Failed to log activity in MongoDB: {e}")
            # Fallback to file-based logging if MongoDB insertion fails
            try:
                if hasattr(self, 'lock'):
                    with self.lock:
                        # Convert datetime to ISO format string for JSON serialization
                        log_entry["timestamp"] = timestamp.isoformat()
                        
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
                    
                    logger.info(f"Activity logged to fallback file: {user_id} - {action} - {resource}")
            except Exception as fallback_error:
                logger.error(f"Failed to log activity to fallback file: {fallback_error}")
    
    def get_user_activity(self, user_id: Optional[str] = None, 
                         start_date: Optional[str] = None,
                         end_date: Optional[str] = None) -> list:
        """
        Retrieve user activity logs with optional filtering from MongoDB.
        
        Args:
            user_id: Filter logs by user ID
            start_date: Filter logs starting from this date (ISO format)
            end_date: Filter logs until this date (ISO format)
            
        Returns:
            List of log entries matching the criteria
        """
        try:
            # Build query based on filters
            query = {}
            
            if user_id:
                query["user_id"] = user_id
            
            if start_date or end_date:
                query["timestamp"] = {}
                
            if start_date:
                query["timestamp"]["$gte"] = datetime.fromisoformat(start_date)
            
            if end_date:
                query["timestamp"]["$lte"] = datetime.fromisoformat(end_date)
            
            # Query MongoDB collection
            logs = list(self.collection.find(query, {"_id": 0}))
            
            # Convert datetime objects to ISO format for better serialization
            for log in logs:
                if isinstance(log.get("timestamp"), datetime):
                    log["timestamp"] = log["timestamp"].isoformat()
            
            return logs
            
        except Exception as e:
            logger.error(f"Failed to retrieve activity logs from MongoDB: {e}")
            
            # Fallback to file-based retrieval if MongoDB query fails
            if hasattr(self, 'log_file'):
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
                except Exception as fallback_error:
                    logger.error(f"Failed to retrieve activity logs from fallback file: {fallback_error}")
            
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

    def __del__(self):
        """
        Close MongoDB connection when object is destroyed
        """
        if hasattr(self, 'client'):
            try:
                self.client.close()
                logger.info("MongoDB connection closed")
            except Exception as e:
                logger.error(f"Error closing MongoDB connection: {e}")

# Create singleton instance
activity_logger = ActivityLogger()