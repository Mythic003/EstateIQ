from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Dict, Union, List
import uvicorn
from service import HousePricePredictionService
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get allowed origins from environment variables or use defaults
def get_allowed_origins() -> List[str]:
    # Default origins for development
    origins = ["http://localhost:3000"]
    
    # Add production origins from environment variable
    prod_origins = os.getenv("ALLOWED_ORIGINS")
    if prod_origins:
        # Split by comma and strip whitespace
        origins.extend([origin.strip() for origin in prod_origins.split(",")])
    
    logger.info(f"Allowed origins: {origins}")
    return origins

# Initialize FastAPI app
app = FastAPI(
    title="House Price Prediction API",
    description="API for predicting house prices using machine learning",
    version="1.0.0"
)

# Add CORS middleware with dynamic origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Specify only the methods we need
    allow_headers=["Content-Type", "Authorization"],  # Specify only the headers we need
)

# Initialize prediction service
prediction_service = HousePricePredictionService()

class HousePredictionRequest(BaseModel):
    pincode: str = Field(..., description="6-digit pincode of the area", min_length=6, max_length=6)
    lotArea: float = Field(..., description="Total lot area in square feet", gt=0)
    livingArea: float = Field(..., description="Living area in square feet", gt=0)
    builtYear: int = Field(..., description="Year the house was built", ge=1800, le=2024)
    floors: float = Field(..., description="Number of floors", gt=0)
    bedrooms: float = Field(..., description="Number of bedrooms", gt=0)
    bathrooms: float = Field(..., description="Number of bathrooms", gt=0)
    condition: int = Field(..., description="Condition rating (1-10)", ge=1, le=10)
    
    @validator('pincode')
    def validate_pincode(cls, v):
        if not v.isdigit():
            raise ValueError("pincode must contain only digits")
        return v
    
    @validator('bedrooms', 'bathrooms', 'floors')
    def validate_decimal_values(cls, v, field):
        decimal_part = v % 1
        if decimal_part != 0 and decimal_part != 0.5:
            raise ValueError(f"{field.name} must be a whole number or end in .5")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "pincode": "400001",
                "lotArea": 5000,
                "livingArea": 2000,
                "builtYear": 2000,
                "floors": 2,
                "bedrooms": 3,
                "bathrooms": 2.5,
                "condition": 8
            }
        }

@app.post("/predict", response_model=Dict[str, Union[float, str]])
async def predict_price(request: HousePredictionRequest):
    """
    Predict house price based on input features
    """
    try:
        prediction = prediction_service.predict(request.dict())
        if prediction.get('status') == 'error':
            raise HTTPException(status_code=500, detail=prediction.get('error'))
        if prediction.get('status') == 'validation_error':
            raise HTTPException(status_code=400, detail=prediction.get('error'))
        return prediction
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "model_path": prediction_service.model_path}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True) 