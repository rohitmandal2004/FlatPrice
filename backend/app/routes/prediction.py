from fastapi import APIRouter, HTTPException, Request
from app.schemas import PredictionRequest, PredictionResponse
from app.model_service import model_service
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/predict", response_model=PredictionResponse)
@limiter.limit("10/minute")
def predict_price(request: Request, req: PredictionRequest):
    try:
        predicted_price = model_service.predict(req)
        
        return PredictionResponse(
            predicted_price_lakh=predicted_price
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Prediction failed. Model might not be loaded.")
