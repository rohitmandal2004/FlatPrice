import json
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes import health, prediction, model
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Flat Price Predictor API",
    description="API for predicting flat prices using Multiple Linear Regression",
    version="1.0.0"
)

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Parse ALLOWED_ORIGINS from environment, defaulting to '*' if not set
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", '["*"]')
try:
    allowed_origins = json.loads(allowed_origins_str)
except json.JSONDecodeError:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")
app.include_router(model.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # In production, this file shouldn't be run directly like this ideally, but via gunicorn
    # For local development compatibility, we'll keep it but check an env flag if available
    is_dev = os.getenv("ENVIRONMENT", "development") == "development"
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=is_dev)
