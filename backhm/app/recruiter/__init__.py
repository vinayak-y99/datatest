from fastapi import APIRouter

recruiter_router = APIRouter(tags=["Recruiter Panel"])

from .routes import *  # This will import all routes from the routes.py file 