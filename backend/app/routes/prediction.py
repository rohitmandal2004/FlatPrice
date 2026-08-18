from fastapi import APIRouter, HTTPException
from app.schemas import PredictionRequest, PredictionResponse
from app.model_service import model_service

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_price(req: PredictionRequest):
    try:
        # Validate inputs
        if req.area_sqft <= 0 or req.floor < 0 or req.car_parking_sqft < 0 or req.bedrooms <= 0:
            raise HTTPException(status_code=400, detail="Invalid numerical inputs.")
            
        valid_facings = ["North", "South", "East", "West"]
        if req.facing not in valid_facings:
            raise HTTPException(status_code=400, detail=f"Facing must be one of {valid_facings}")

        predicted_price = model_service.predict(req)
        
        return PredictionResponse(
            predicted_price_lakh=predicted_price
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Prediction failed. Model might not be loaded.")
