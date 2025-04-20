from sklearn.ensemble import GradientBoostingRegressor
import numpy as np
import joblib
import logging

class HousePriceModel:
    """
    House price prediction model using Gradient Boosting Regressor
    """
    
    def __init__(self, params=None):
        """
        Initialize the model with given parameters
        
        Args:
            params (dict): Model hyperparameters
        """
        self.logger = logging.getLogger(__name__)
        
        if params is None:
            params = {
                'n_estimators': 100,
                'learning_rate': 0.1,
                'max_depth': 5,
                'min_samples_split': 5,
                'min_samples_leaf': 2,
                'random_state': 42
            }
        
        self.model = GradientBoostingRegressor(**params)
        self.logger.info("Model initialized with parameters: %s", params)
    
    def train(self, X, y):
        """
        Train the model on given data
        
        Args:
            X (np.array): Features
            y (np.array): Target values
        """
        try:
            self.logger.info("Starting model training")
            self.model.fit(X, y)
            self.logger.info("Model training completed")
        except Exception as e:
            self.logger.error("Error during model training: %s", str(e))
            raise
    
    def predict(self, X):
        """
        Make predictions on new data
        
        Args:
            X (np.array): Features
            
        Returns:
            np.array: Predicted values
        """
        try:
            predictions = self.model.predict(X)
            return predictions
        except Exception as e:
            self.logger.error("Error during prediction: %s", str(e))
            raise
    
    def get_feature_importance(self):
        """
        Get feature importance scores
        
        Returns:
            dict: Feature names and their importance scores
        """
        try:
            importance = self.model.feature_importances_
            return importance
        except Exception as e:
            self.logger.error("Error getting feature importance: %s", str(e))
            raise
    
    def save_model(self, filepath):
        """
        Save the trained model to disk
        
        Args:
            filepath (str): Path to save the model
        """
        try:
            joblib.dump(self.model, filepath)
            self.logger.info("Model saved successfully to %s", filepath)
        except Exception as e:
            self.logger.error("Error saving model: %s", str(e))
            raise
    
    @staticmethod
    def load_model(filepath):
        """
        Load a trained model from disk
        
        Args:
            filepath (str): Path to the saved model
            
        Returns:
            HousePriceModel: Loaded model instance
        """
        try:
            model = HousePriceModel()
            model.model = joblib.load(filepath)
            return model
        except Exception as e:
            logging.error("Error loading model: %s", str(e))
            raise 