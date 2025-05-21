__all__ = [
    "app",
    "core",
    "database",
    "models",
    "routes",
    "services",
    "tempates",
    "utils",
    "uploads",
    "helpers",
]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.skills_evaluation import analyze_job_description_router
from app.routes.skills_evaluation import create_dashboards_router
from app.admin.admin import admin_router
from app.services.resume.resume_evaluation import resume_evaluation_router
from app.technicalpanel.techpanel_routes import techpanel_router
from app.recruiter import recruiter_router
from app.client.clientpanel import clientpanel_router
from app.routes.jd import CreateJD_router

app = FastAPI(title="FastHire99 API", version="1.0.0") 

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Router configurations
app.include_router(analyze_job_description_router, tags=["Job Analysis"])
app.include_router(create_dashboards_router, tags=["Dashboards"])
app.include_router(resume_evaluation_router, tags=["Resume Evaluation"])
app.include_router(admin_router, tags=["admin"])
app.include_router(techpanel_router, tags=["Candidate"])
app.include_router(recruiter_router, tags=["Recruiter Panel"])
app.include_router(clientpanel_router, tags=["Client Panel"])
app.include_router(CreateJD_router, tags=["Job Description"])