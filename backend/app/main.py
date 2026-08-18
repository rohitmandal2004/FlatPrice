from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, prediction, model
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Flat Price Predictor API",
    description="API for predicting flat prices using Multiple Linear Regression",
    version="1.0.0"
)

# Configure CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins to avoid CORS issues
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")
app.include_router(model.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
