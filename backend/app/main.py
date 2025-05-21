import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.skills_evaluation import analyze_job_description_router
from app.routes.jd import CreateJD_router
from app.routes.activity_logs import activity_logs_router
from app.utils.middleware import ActivityLoggingMiddleware
from app.utils.security import get_user_id_from_request
from pathlib import Path

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Activity Logging Middleware
app.add_middleware(
    ActivityLoggingMiddleware,
    exclude_paths=["/health", "/docs", "/redoc", "/openapi.json", "/favicon.ico", "/static"],
    get_user_id=get_user_id_from_request
)

# Include routers
app.include_router(analyze_job_description_router, tags=["Job Analysis"])
app.include_router(CreateJD_router, tags=["create"])
app.include_router(activity_logs_router, tags=["Activity Logs"])

# Create static directory if it doesn't exist
static_dir = Path("backhm/app/static")
static_dir.mkdir(exist_ok=True, parents=True)

# Mount static files
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/")
async def root():
    return {"message": "Welcome to Tech Panel API"}

# Add this new health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    # Startup: Create directories
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("uploads/resumes", exist_ok=True)
    os.makedirs("uploads/jobs", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    os.makedirs("backhm/app/static/js", exist_ok=True)
    os.makedirs("backhm/app/static/css", exist_ok=True)

@app.on_event("shutdown")
async def shutdown_event():
    # Shutdown: Clean up if needed
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
