from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Dict, Any
import logging

class Settings(BaseSettings):
    db_user : str = "postgres"
    db_password : str = "Temp1234"
    db_host : str = "localhost"
    db_name : str = "fasthire999"
    db_port : str = "5432"

    # MongoDB settings
    mongodb_host: str = "localhost"
    mongodb_port: int = 27017
    mongodb_name: str = "default_db"
    mongodb_username: str = ""
    mongodb_password: str = ""
    
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    GOOGLE_API_KEY: str = "AIzaSyAWu-oajX5ufwmSCKlwYJyCtZZnW8MOfbg"
    MODEL_NAME: str = "gemini-1.5-pro" 
    MODEL_TEMPERATURE: float = 0.2

    # JD Analysis Constants
    PERCENTAGE_TOLERANCE: float = 1.0
    MAX_RATING: float = 10.0
    
    MODEL_CONFIG: Dict[str, Any] = {
        "name": MODEL_NAME,
        "temperature": MODEL_TEMPERATURE
    }

    JD_ANALYSIS_CONFIG: Dict[str, Any] = {
        "percentage_tolerance": PERCENTAGE_TOLERANCE,
        "max_rating": MAX_RATING,
        "categories": {
            "skills": "Skill",
            "achievements_certifications": "Achievement/Certification",
            "skilled_activities": "Skilled Activity"
        }
    }

    LOGGING_CONFIG: Dict[str, Any] = {
        "level": "INFO",
        "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    }

    class Config:
        env_file = "D:/FH99/backend/app/.env" 

settings = Settings()


logging.basicConfig(level=logging.INFO,format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(**settings.LOGGING_CONFIG)

# Export all required constants
UPLOAD_DIR = settings.UPLOAD_DIR
GOOGLE_API_KEY = settings.GOOGLE_API_KEY
MODEL_NAME = settings.MODEL_NAME
MODEL_TEMPERATURE = settings.MODEL_TEMPERATURE
MODEL_CONFIG = settings.MODEL_CONFIG
LOGGING_CONFIG = settings.LOGGING_CONFIG
JD_ANALYSIS_CONFIG = settings.JD_ANALYSIS_CONFIG
PERCENTAGE_TOLERANCE = settings.PERCENTAGE_TOLERANCE
MAX_RATING = settings.MAX_RATING

# Create uploads directory
UPLOAD_DIR.mkdir(exist_ok=True)
