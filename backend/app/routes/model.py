from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.schemas import ModelInfoResponse, DatasetStatsResponse
from app.model_service import model_service
import os

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

@router.get("/dataset-download")
def download_dataset():
    if not os.path.exists(model_service.data_path):
        raise HTTPException(status_code=404, detail="Dataset file not found")
    
    return FileResponse(
        path=model_service.data_path,
        filename="Flat_Price_Multiple_Linear_Regression_100.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
