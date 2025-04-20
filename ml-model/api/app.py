from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
from datetime import datetime
import logging
from pythonjsonlogger import jsonlogger
import traceback
import requests
from pathlib import Path

# Configure logging
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get the absolute path to the models directory
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'best_model_20250420_000125.joblib')

# Global variables for model and feature names
model = None
feature_names = None

def download_model_if_needed():
    """Download model from GitHub if not present"""
    model_path = Path('models/best_model.joblib')
    if not model_path.exists():
        logger.info("Model not found locally, downloading...")
        # Replace with your GitHub raw URL
        model_url = os.getenv('MODEL_URL', 'https://raw.githubusercontent.com/yourusername/your-repo/main/models/best_model.joblib')
        response = requests.get(model_url)
        if response.status_code == 200:
            model_path.parent.mkdir(exist_ok=True)
            with open(model_path, 'wb') as f:
                f.write(response.content)
            logger.info("Model downloaded successfully")
        else:
            logger.error(f"Failed to download model: {response.status_code}")

def load_model():
    """Load the trained model from disk"""
    try:
        if not os.path.exists(MODELS_DIR):
            logger.error(f"Models directory not found at: {MODELS_DIR}")
            raise FileNotFoundError(f"Models directory not found at: {MODELS_DIR}")
        
        if not os.path.exists(MODEL_PATH):
            logger.error(f"Model file not found at: {MODEL_PATH}")
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        
        model_data = joblib.load(MODEL_PATH)
        logger.info("Model loaded successfully")
        return model_data['model'], model_data['feature_names']
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}", exc_info=True)
        raise

# Load model at startup
try:
    model, feature_names = load_model()
    logger.info("Model loaded successfully at startup")
except Exception as e:
    logger.error(f"Could not load model. Error: {str(e)}")
    model = None
    feature_names = None

@app.route('/')
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'EstateIQ API is running',
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'health': '/health',
            'predict': '/predict'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat(),
        'environment': os.getenv('FLASK_ENV', 'production')
    })

# Feature name mapping from API input to model features
FEATURE_MAPPING = {
    'bedrooms': 'number of bedrooms',
    'bathrooms': 'number of bathrooms',
    'sqft_living': 'living area',
    'sqft_lot': 'lot area',
    'floors': 'number of floors',
    'waterfront': 'waterfront present',
    'view': 'number of views',
    'condition': 'condition of the house',
    'grade': 'grade of the house',
    'sqft_above': 'Area of the house(excluding basement)',
    'sqft_basement': 'Area of the basement',
    'yr_built': 'Built Year',
    'yr_renovated': 'Renovation Year',
    'zipcode': 'Postal Code',
    'sqft_living15': 'living_area_renov',
    'sqft_lot15': 'lot_area_renov'
}

@app.route('/predict', methods=['POST'])
def predict():
    """Make predictions using the loaded model"""
    if model is None or feature_names is None:
        return jsonify({
            'error': 'Model not loaded',
            'message': 'The prediction model is not available'
        }), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide input data in JSON format'
            }), 400

        # Map input features to model features
        mapped_data = {}
        for api_name, model_name in FEATURE_MAPPING.items():
            if api_name in data:
                mapped_data[model_name] = data[api_name]

        # Add default values for missing features
        mapped_data['Number of schools nearby'] = data.get('schools_nearby', 5)  # Default value
        mapped_data['Distance from the airport'] = data.get('airport_distance', 10.5)  # Default value

        # Convert input data to DataFrame
        input_data = pd.DataFrame([mapped_data])
        
        # Make prediction
        prediction = model.predict(input_data)
        
        return jsonify({
            'prediction': float(prediction[0]),
            'currency': 'USD',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))  # Default to 8000 if PORT not set
    app.run(host='0.0.0.0', port=port)  # Bind to all interfaces 