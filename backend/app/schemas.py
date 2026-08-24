from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal

class PredictionRequest(BaseModel):
    area_sqft: float = Field(..., gt=200, le=15000, description="Area must be between 200 and 15000 sqft")
    facing: Literal["North", "South", "East", "West"]
    floor: int = Field(..., ge=0, le=150, description="Floor must be between 0 and 150")
    car_parking_sqft: float = Field(..., ge=0, le=5000, description="Car parking area cannot be negative or exceed 5000")
    bedrooms: int = Field(..., ge=1, le=20, description="Number of bedrooms must be between 1 and 20")

    @model_validator(mode='after')
    def validate_parking_area(self) -> 'PredictionRequest':
        if self.car_parking_sqft > self.area_sqft * 0.8:
            raise ValueError("Car parking area cannot be larger than 80% of the flat area (Unrealistic Input)")
        return self

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
