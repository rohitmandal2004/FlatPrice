import pytest
from fastapi.testclient import TestClient
from app.main import app
import os

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_prediction_endpoint():
    # Make sure we don't hit rate limits in tests by sending one request
    payload = {
        "area_sqft": 1200,
        "facing": "North",
        "floor": 5,
        "car_parking_sqft": 100,
        "bedrooms": 2
    }
    
    response = client.post("/api/predict", json=payload)
    
    # It should either succeed (200) or fail if the model isn't downloaded yet.
    # We assert on 200 assuming the model exists in the environment.
    assert response.status_code == 200
    
    data = response.json()
    assert "predicted_price_lakh" in data
    assert isinstance(data["predicted_price_lakh"], float)
    assert data["predicted_price_lakh"] > 0

def test_rate_limiting():
    # Test that sending 11 requests triggers 429 Too Many Requests
    payload = {
        "area_sqft": 1000,
        "facing": "East",
        "floor": 2,
        "car_parking_sqft": 50,
        "bedrooms": 1
    }
    
    # Send 11 requests fast
    responses = [client.post("/api/predict", json=payload) for _ in range(11)]
    
    # At least the last one should be 429 Too Many Requests due to "10/minute" limit
    assert any(r.status_code == 429 for r in responses)
