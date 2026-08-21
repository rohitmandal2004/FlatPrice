from fastapi import APIRouter, HTTPException
from app.schemas import PredictionRequest, PredictionResponse
from app.model_service import model_service

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_price(req: PredictionRequest):
    try:
        predicted_price = model_service.predict(req)
        
        return PredictionResponse(
            predicted_price_lakh=predicted_price
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Prediction failed. Model might not be loaded.")
