from pydantic import BaseModel, Field
from typing import Optional, Literal

class PredictionRequest(BaseModel):
    area_sqft: float = Field(..., gt=0, description="Area in sqft must be greater than 0")
    facing: Literal["North", "South", "East", "West"]
    floor: int = Field(..., ge=0, description="Floor cannot be negative")
    car_parking_sqft: float = Field(..., ge=0, description="Car parking area cannot be negative")
    bedrooms: int = Field(..., gt=0, description="Number of bedrooms must be at least 1")

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
    scatter_data: list[dict]
