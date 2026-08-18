import os
import json
import joblib
import pandas as pd
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
        
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
                
        if os.path.exists(self.data_path):
            self.dataset = pd.read_excel(self.data_path)

    def is_loaded(self):
        return self.model is not None and self.metadata is not None

    def predict(self, req: PredictionRequest) -> float:
        if not self.is_loaded():
            raise Exception("Model not loaded")

        input_data = pd.DataFrame([{
            'Area_Sqft': req.area_sqft,
            'Facing': req.facing,
            'Floor': req.floor,
            'Car_Parking_Sqft': req.car_parking_sqft,
            'Bedrooms': req.bedrooms
        }])
        
        prediction = self.model.predict(input_data)[0]
        return round(float(prediction), 2)

    def get_model_info(self) -> ModelInfoResponse:
        if not self.is_loaded():
            raise Exception("Model not loaded")
        return ModelInfoResponse(**self.metadata)

    def get_dataset_stats(self) -> DatasetStatsResponse:
        if self.dataset is None:
            raise Exception("Dataset not loaded")
            
        df = self.dataset
        return DatasetStatsResponse(
            number_of_records=int(len(df)),
            average_price=float(round(df['Price_Lakh'].mean(), 2)),
            min_price=float(round(df['Price_Lakh'].min(), 2)),
            max_price=float(round(df['Price_Lakh'].max(), 2)),
            average_area=float(round(df['Area_Sqft'].mean(), 2)),
            bedroom_distribution={str(k): int(v) for k, v in df['Bedrooms'].value_counts().items()},
            facing_distribution={str(k): int(v) for k, v in df['Facing'].value_counts().items()}
        )

model_service = ModelService()
