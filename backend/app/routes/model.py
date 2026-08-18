from fastapi import APIRouter, HTTPException
from app.schemas import ModelInfoResponse, DatasetStatsResponse
from app.model_service import model_service

router = APIRouter()

@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    try:
        return model_service.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dataset-stats", response_model=DatasetStatsResponse)
def get_dataset_stats():
    try:
        return model_service.get_dataset_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
