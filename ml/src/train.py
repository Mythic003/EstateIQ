import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import logging
import os
from datetime import datetime

from preprocessing import preprocess_data
from model import HousePriceModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_data(filepath):
    """
    Load data from CSV file
    
    Args:
        filepath (str): Path to the CSV file
        
    Returns:
        pd.DataFrame: Loaded data
    """
    try:
        data = pd.read_csv(filepath)
        logger.info("Data loaded successfully from %s", filepath)
        return data
    except Exception as e:
        logger.error("Error loading data: %s", str(e))
        raise

def evaluate_model(model, X_test, y_test):
    """
    Evaluate model performance
    
    Args:
        model (HousePriceModel): Trained model
        X_test (np.array): Test features
        y_test (np.array): Test target values
        
    Returns:
        dict: Dictionary of evaluation metrics
    """
    try:
        predictions = model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, predictions)
        
        metrics = {
            'mse': mse,
            'rmse': rmse,
            'r2': r2
        }
        
        logger.info("Model Evaluation Metrics:")
        logger.info("MSE: %.2f", mse)
        logger.info("RMSE: %.2f", rmse)
        logger.info("R2 Score: %.2f", r2)
        
        return metrics
    except Exception as e:
        logger.error("Error during model evaluation: %s", str(e))
        raise

def main():
    try:
        # Create models directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Load and preprocess data
        data = load_data('data/house_data.csv')
        X, y = preprocess_data(data)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        logger.info("Data split into train and test sets")
        
        # Initialize and train model
        model = HousePriceModel()
        model.train(X_train, y_train)
        
        # Evaluate model
        metrics = evaluate_model(model, X_test, y_test)
        
        # Save model
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_path = f"models/house_price_model_{timestamp}.joblib"
        model.save_model(model_path)
        
        logger.info("Training completed successfully")
        
    except Exception as e:
        logger.error("Error in main training pipeline: %s", str(e))
        raise

if __name__ == "__main__":
    main() 