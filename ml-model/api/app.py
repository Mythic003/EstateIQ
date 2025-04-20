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

# Load the best model
def load_model():
    try:
        # Download model if needed
        download_model_if_needed()
        
        # Get the absolute path to the models directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(current_dir, 'models')
        
        if not os.path.exists(models_dir):
            logger.error(f"Models directory not found at: {models_dir}")
            raise FileNotFoundError(f"Models directory not found at: {models_dir}")
            
        # Find all .joblib files
        model_files = [f for f in os.listdir(models_dir) if f.endswith('.joblib')]
        
        if not model_files:
            logger.error("No model files found in models directory")
            raise FileNotFoundError("No model files found in models directory")
            
        # Get the most recent model (prefer best_model if available)
        best_models = [f for f in model_files if f.startswith('best_model')]
        if best_models:
            model_file = sorted(best_models)[-1]
        else:
            model_file = sorted(model_files)[-1]
            
        model_path = os.path.join(models_dir, model_file)
        
        logger.info(f"Loading model from: {model_path}")
        model_data = joblib.load(model_path)
        return model_data['model'], model_data['feature_names']
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}", exc_info=True)
        raise

# Initialize model and feature names
try:
    model, feature_names = load_model()
    logger.info("Model loaded successfully!")
except Exception as e:
    logger.warning(f"Could not load model. Error: {str(e)}")
    model, feature_names = None, None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        features = np.array(data['features']).reshape(1, -1)
        prediction = model.predict(features)[0]
        return jsonify({"prediction": float(prediction)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat(),
        'environment': os.getenv('FLASK_ENV', 'production')
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 