import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.skills_evaluation import analyze_job_description_router
from app.routes.jd import CreateJD_router
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_job_description_router, tags=["Job Analysis"])
app.include_router(CreateJD_router, tags=["create"])
@app.get("/")
async def root():
    return {"message": "Welcome to Tech Panel API"}

# Add this new health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    ## Startup: Create directories
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("uploads/resumes", exist_ok=True)
    os.makedirs("uploads/jobs", exist_ok=True)
    yield
    # Shutdown: Clean up if needed
    pass
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app,host="127.0.0.1",port=8000,reload=True)
