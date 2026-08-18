from pydantic import BaseModel
from typing import Optional

class PredictionRequest(BaseModel):
    area_sqft: float
    facing: str
    floor: int
    car_parking_sqft: float
    bedrooms: int

class PredictionResponse(BaseModel):
    predicted_price_lakh: float
    currency: str = "INR"
    unit: str = "lakh"
    model: str = "Multiple Linear Regression"

class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    features: list[str]
    training_samples: int
    testing_samples: int
    r2_score: float
    mae: float
    mse: float
    rmse: float
    intercept: float
    coefficients: dict[str, float]

class DatasetStatsResponse(BaseModel):
    number_of_records: int
    average_price: float
    min_price: float
    max_price: float
    average_area: float
    bedroom_distribution: dict[str, int]
    facing_distribution: dict[str, int]
