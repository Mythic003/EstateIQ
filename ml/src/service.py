import os
import logging
from typing import Dict, Union, List
import numpy as np
import pandas as pd
from model import HousePriceModel
from preprocessing import create_features

logger = logging.getLogger(__name__)

class HousePricePredictionService:
    def __init__(self, model_path: str = None):
        """
        Initialize the prediction service
        
        Args:
            model_path (str): Path to the trained model file
        """
        self.model = None
        self.model_path = model_path or self._get_latest_model()
        self.load_model()
        
    def _get_latest_model(self) -> str:
        """Get the most recently trained model from the models directory"""
        try:
            models_dir = "models"
            model_files = [f for f in os.listdir(models_dir) if f.endswith('.joblib')]
            if not model_files:
                raise FileNotFoundError("No model files found in models directory")
            
            latest_model = max(model_files, key=lambda x: os.path.getctime(os.path.join(models_dir, x)))
            return os.path.join(models_dir, latest_model)
        except Exception as e:
            logger.error(f"Error finding latest model: {str(e)}")
            raise
    
    def load_model(self):
        """Load the trained model"""
        try:
            logger.info(f"Loading model from {self.model_path}")
            self.model = HousePriceModel.load_model(self.model_path)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def _validate_input(self, data: Dict) -> bool:
        """
        Validate input data format and required fields
        
        Args:
            data (dict): Input data dictionary
            
        Returns:
            bool: True if valid, raises ValueError if invalid
        """
        required_fields = {
            'pincode': str,
            'lotArea': (int, float),
            'livingArea': (int, float),
            'builtYear': int,
            'floors': (int, float),
            'bedrooms': (int, float),
            'bathrooms': (int, float),
            'condition': int
        }
        
        for field, field_type in required_fields.items():
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
            if not isinstance(data[field], field_type):
                raise ValueError(f"Invalid type for {field}. Expected {field_type}")
        
        # Additional validation rules
        if not len(data['pincode']) == 6 or not data['pincode'].isdigit():
            raise ValueError("pincode must be a 6-digit number")
            
        if not (1800 <= data['builtYear'] <= 2024):
            raise ValueError("builtYear must be between 1800 and 2024")
            
        if not (1 <= data['condition'] <= 10):
            raise ValueError("condition must be between 1 and 10")
            
        if data['lotArea'] <= 0 or data['livingArea'] <= 0:
            raise ValueError("area values must be positive")
            
        if data['bedrooms'] <= 0 or data['bathrooms'] <= 0:
            raise ValueError("bedrooms and bathrooms must be positive")
            
        # Validate that bedrooms and bathrooms are whole numbers or .5
        for field in ['bedrooms', 'bathrooms']:
            decimal_part = data[field] % 1
            if decimal_part != 0 and decimal_part != 0.5:
                raise ValueError(f"{field} must be a whole number or end in .5")
            
        # Validate floors can be whole numbers or .5
        decimal_part = data['floors'] % 1
        if decimal_part != 0 and decimal_part != 0.5:
            raise ValueError("floors must be a whole number or end in .5")
        
        return True
    
    def _preprocess_input(self, data: Dict) -> pd.DataFrame:
        """
        Preprocess input data for prediction
        
        Args:
            data (dict): Input data dictionary
            
        Returns:
            pd.DataFrame: Preprocessed features
        """
        try:
            # Convert input to DataFrame
            df = pd.DataFrame([data])
            
            # Apply feature engineering
            df = create_features(df)
            
            return df
        except Exception as e:
            logger.error(f"Error preprocessing input: {str(e)}")
            raise
    
    def predict(self, data: Dict) -> Dict[str, Union[float, str]]:
        """
        Make price prediction for input data
        
        Args:
            data (dict): Input features
            
        Returns:
            dict: Prediction result with price and confidence
        """
        try:
            # Validate input
            self._validate_input(data)
            
            # Preprocess input
            features = self._preprocess_input(data)
            
            # Make prediction
            prediction = self.model.predict(features)[0]
            
            return {
                'predicted_price': round(float(prediction), 2),
                'status': 'success'
            }
            
        except ValueError as ve:
            logger.warning(f"Validation error: {str(ve)}")
            return {'error': str(ve), 'status': 'validation_error'}
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {'error': 'Internal prediction error', 'status': 'error'} 