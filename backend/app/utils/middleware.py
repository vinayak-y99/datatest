from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import json
import logging
from typing import Optional, Callable
from .activity_logger import activity_logger

class ActivityLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all API requests with user activity tracking.
    """
    
    def __init__(
        self, 
        app: ASGIApp, 
        exclude_paths: Optional[list] = None,
        get_user_id: Optional[Callable] = None
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/redoc", "/openapi.json"]
        self.get_user_id = get_user_id  # Optional function to extract user ID from request
        self.logger = logging.getLogger(__name__)
    
    async def dispatch(self, request: Request, call_next):
        # Don't log excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Start timing the request
        start_time = time.time()
        
        # Get client IP
        client_host = request.client.host if request.client else "unknown"
        
        # Try to get user ID if available (from token or session)
        user_id = "anonymous"
        if self.get_user_id:
            try:
                user_id = await self.get_user_id(request)
            except Exception as e:
                self.logger.warning(f"Failed to get user_id: {e}")
        
        # Extract request body if it's a POST/PUT request
        request_body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                # Create a copy of the request before consuming the body
                body_bytes = await request.body()
                
                # Use a more reliable method to make the body available again
                # This is needed because FastAPI/Starlette consumes the body stream
                request._body = body_bytes  # Set the body directly without using set()
                
                # Try to parse as JSON
                try:
                    if body_bytes:
                        request_body = json.loads(body_bytes.decode())
                        # Remove sensitive fields if any
                        if isinstance(request_body, dict):
                            sensitive_fields = ["password", "token", "secret", "key", "credential"]
                            for field in sensitive_fields:
                                if field in request_body:
                                    request_body[field] = "***REDACTED***"
                except:
                    # If not JSON, just note the content type
                    content_type = request.headers.get("content-type", "unknown")
                    request_body = f"Non-JSON body ({content_type})"
            except Exception as e:
                self.logger.warning(f"Failed to extract request body: {e}")
        
        # Process the request
        response = await call_next(request)
        
        # Calculate request duration
        duration = time.time() - start_time
        
        # Log activity
        resource = request.url.path
        action = request.method.lower()
        
        # Prepare details
        details = {
            "duration_ms": round(duration * 1000, 2),
            "query_params": dict(request.query_params),
            "status_code": response.status_code,
            "headers": dict(request.headers)
        }
        
        if request_body:
            details["request_body"] = request_body
        
        # Log the activity
        activity_logger.log_activity(
            user_id=user_id,
            action=action, 
            resource=resource,
            details=details,
            ip_address=client_host
        )
        
        return response 