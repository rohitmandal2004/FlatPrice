import os
import json
import joblib
import pandas as pd
from functools import lru_cache
from datetime import datetime
from app.schemas import PredictionRequest, ModelInfoResponse, DatasetStatsResponse

class ModelService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.artifacts_dir = os.path.join(self.base_dir, 'ml', 'artifacts')
        self.data_path = os.path.join(self.base_dir, 'data', 'Flat_Price_Multiple_Linear_Regression_100.xlsx')
        
        self.model = None
        self.metadata = None
        self.dataset = None
        self.load_artifacts()

    def load_artifacts(self):
        model_path = os.path.join(self.artifacts_dir, 'flat_price_model.joblib')
        metadata_path = os.path.join(self.artifacts_dir, 'model_metadata.json')
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            mtime = os.path.getmtime(model_path)
            self.model_version = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
        
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
                self.metadata['model_version'] = self.model_version
                
        if os.path.exists(self.data_path):
            self.dataset = pd.read_excel(self.data_path)

    def is_loaded(self):
        return self.model is not None and self.metadata is not None

    @lru_cache(maxsize=128)
    def _predict_cached(self, area_sqft, facing, floor, car_parking_sqft, bedrooms) -> float:
        input_data = pd.DataFrame([{
            'Area_Sqft': area_sqft,
            'Facing': facing,
            'Floor': floor,
            'Car_Parking_Sqft': car_parking_sqft,
            'Bedrooms': bedrooms
        }])
        
        prediction = self.model.predict(input_data)[0]
        return round(float(prediction), 2)

    def predict(self, req: PredictionRequest) -> float:
        if not self.is_loaded():
            raise Exception("Model not loaded")

        return self._predict_cached(
            req.area_sqft, req.facing, req.floor, req.car_parking_sqft, req.bedrooms
        )

    def get_model_info(self) -> ModelInfoResponse:
        if not self.is_loaded():
            raise Exception("Model not loaded")
        return ModelInfoResponse(**self.metadata)

    def get_dataset_stats(self) -> DatasetStatsResponse:
        if self.dataset is None:
            raise Exception("Dataset not loaded")
            
        df = self.dataset
        
        # Prepare scatter data for Area vs Price (limit to 200 points for performance if dataset is large)
        scatter_sample = df.sample(n=min(200, len(df))) if len(df) > 200 else df
        scatter_data = [
            {
                "area": float(row['Area_Sqft']),
                "price": float(round(row['Price_Lakh'], 2)),
                "z": int(row.get('Bedrooms', 2) * 20) # Use bedrooms as a size indicator for z-axis
            }
            for _, row in scatter_sample.iterrows()
        ]

        return DatasetStatsResponse(
            number_of_records=int(len(df)),
            average_price=float(round(df['Price_Lakh'].mean(), 2)),
            min_price=float(round(df['Price_Lakh'].min(), 2)),
            max_price=float(round(df['Price_Lakh'].max(), 2)),
            average_area=float(round(df['Area_Sqft'].mean(), 2)),
            bedroom_distribution={str(k): int(v) for k, v in df['Bedrooms'].value_counts().items()},
            facing_distribution={str(k): int(v) for k, v in df['Facing'].value_counts().items()},
            scatter_data=scatter_data
        )

model_service = ModelService()
