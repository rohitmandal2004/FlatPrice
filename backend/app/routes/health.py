from fastapi import APIRouter
from app.model_service import model_service

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded()
    }
