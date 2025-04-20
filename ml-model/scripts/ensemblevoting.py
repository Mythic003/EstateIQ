import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, RegressorMixin
import joblib
import os
import sys
from sklearn.metrics import mean_squared_error, r2_score
import time


class VotingEnsembleRegressor(BaseEstimator, RegressorMixin):
    """
    A voting ensemble that combines multiple regression models.
    It can use weighted average, median, or rank-based voting.
    """
    
    def __init__(self, models=None, weights=None, method='weighted'):
        """
        Initialize the voting ensemble.
        
        Args:
            models: List of (name, model) tuples
            weights: List of weights for each model (used with weighted method)
            method: Voting method ('weighted', 'median', or 'rank')
        """
        self.models = models if models else []
        self.weights = weights if weights else None
        self.method = method
        self.is_fitted = False
        
    def fit(self, X, y):
        """Fit all models in the ensemble"""
        if not self.models:
            raise ValueError("No models provided to the ensemble")
            
        print(f"\n🔄 Training Voting Ensemble with {len(self.models)} models...")
        
        for name, model in self.models:
            print(f"Training {name}...")
            model.fit(X, y)
            
        self.is_fitted = True
        return self
    
    def predict(self, X):
        """
        Make predictions using all models and combine them 
        based on the specified method
        """
        if not self.is_fitted:
            raise ValueError("Models need to be fitted before prediction")
            
        predictions = []
        model_names = []
        
        # Collect predictions from all models
        for name, model in self.models:
            try:
                y_pred = model.predict(X)
                predictions.append(y_pred)
                model_names.append(name)
                print(f"Used {name} for prediction")
            except Exception as e:
                print(f"Error with {name} prediction: {str(e)}")
        
        if not predictions:
            raise ValueError("No valid predictions from any model")
        
        # Convert to numpy array for easier manipulation
        predictions = np.array(predictions)
        
        # Apply the selected voting method
        if self.method == 'weighted' and self.weights:
            # Normalize weights to sum to 1
            weights = np.array(self.weights) / sum(self.weights)
            # Weighted average of predictions
            final_pred = np.average(predictions, axis=0, weights=weights)
            print(f"Applied weighted voting with weights: {list(zip(model_names, weights))}")
            
        elif self.method == 'median':
            # Median of predictions (robust to outliers)
            final_pred = np.median(predictions, axis=0)
            print("Applied median voting")
            
        elif self.method == 'rank':
            # Rank-based weighted average (gives more weight to models that are more confident)
            # Calculate mean squared error for each model's prediction
            mse_values = []
            for i in range(len(predictions)):
                # Calculate MSE relative to the average prediction
                avg_pred = np.mean(np.delete(predictions, i, axis=0), axis=0)
                mse = np.mean((predictions[i] - avg_pred) ** 2)
                mse_values.append(mse)
            
            # Convert MSE to weights (lower MSE = higher weight)
            inv_mse = 1 / (np.array(mse_values) + 1e-10)  # Add small constant to avoid division by zero
            weights = inv_mse / np.sum(inv_mse)
            
            # Apply weighted average using inverse MSE weights
            final_pred = np.average(predictions, axis=0, weights=weights)
            print(f"Applied rank-based voting with weights: {list(zip(model_names, weights))}")
            
        else:
            # Default to simple average
            final_pred = np.mean(predictions, axis=0)
            print("Applied simple average voting")
        
        return final_pred


def load_trained_models(models_dir):
    """
    Load trained models from the specified directory
    """
    model_files = [f for f in os.listdir(models_dir) if f.endswith('.joblib')]
    
    loaded_models = []
    for model_file in model_files:
        try:
            model_path = os.path.join(models_dir, model_file)
            model_data = joblib.load(model_path)
            
            # Handle different model loading formats
            if isinstance(model_data, dict) and 'model' in model_data:
                model = model_data['model']
                name = model_file.split('_')[0]  # Extract name from filename
            else:
                model = model_data
                name = model_file.split('_')[0]
                
            loaded_models.append((name, model))
            print(f"Loaded model: {name} from {model_file}")
            
        except Exception as e:
            print(f"Error loading model {model_file}: {str(e)}")
    
    return loaded_models


def train_voting_ensemble(X_train, y_train, X_test, y_test):
    """
    Train and evaluate a voting ensemble with Linear Regression, Random Forest, and XGBoost
    """
    # Import model training functions
    from LinearRegression import train_linear_regression
    from RandomForest import train_random_forest
    from XGBoost import train_xgboost
    
    # Start timer
    start_time = time.time()
    
    # Train individual models
    print("\n🔍 Training Linear Regression...")
    lr_model = train_linear_regression(X_train, y_train)
    
    print("\n🔍 Training Random Forest...")
    rf_model = train_random_forest(X_train, y_train)
    
    print("\n🔍 Training XGBoost...")
    xgb_model = train_xgboost(X_train, y_train)
    
    # Create model list for ensemble
    models = [
        ('linear', lr_model),
        ('random_forest', rf_model),
        ('xgboost', xgb_model)
    ]
    
    # Evaluate individual models first
    lr_pred = lr_model.predict(X_test)
    lr_r2 = r2_score(y_test, lr_pred)
    lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))
    
    rf_pred = rf_model.predict(X_test)
    rf_r2 = r2_score(y_test, rf_pred)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
    
    xgb_pred = xgb_model.predict(X_test)
    xgb_r2 = r2_score(y_test, xgb_pred)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_pred))
    
    # Calculate performance-based weights
    r2_values = np.array([lr_r2, rf_r2, xgb_r2])
    # Ensure all values are positive and add small constant
    adjusted_r2 = r2_values - min(0, np.min(r2_values)) + 0.01
    weights = adjusted_r2 / np.sum(adjusted_r2)
    
    print(f"\nModel weights based on performance: {list(zip(['Linear', 'Random Forest', 'XGBoost'], weights))}")
    
    # Create and train ensemble with optimized weights
    ensemble = VotingEnsembleRegressor(models=models, weights=weights, method='weighted')
    ensemble.fit(X_train, y_train)
    
    # End timer
    training_time = time.time() - start_time
    print(f"\nTotal training time: {training_time:.2f} seconds")
    
    # Evaluate ensemble
    ensemble_pred = ensemble.predict(X_test)
    ensemble_r2 = r2_score(y_test, ensemble_pred)
    ensemble_rmse = np.sqrt(mean_squared_error(y_test, ensemble_pred))
    
    # Print performance comparison
    print("\n==== Model Performance Comparison ====")
    print(f"Linear Regression:  R² = {lr_r2:.4f}, RMSE = {lr_rmse:.4f}")
    print(f"Random Forest:      R² = {rf_r2:.4f}, RMSE = {rf_rmse:.4f}")
    print(f"XGBoost:            R² = {xgb_r2:.4f}, RMSE = {xgb_rmse:.4f}")
    print(f"Voting Ensemble:    R² = {ensemble_r2:.4f}, RMSE = {ensemble_rmse:.4f}")
    
    return ensemble


def save_ensemble(ensemble, output_path):
    """Save the trained ensemble model"""
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save ensemble
        joblib.dump(ensemble, output_path)
        print(f"\nEnsemble model saved to: {output_path}")
        
    except Exception as e:
        print(f"Error saving ensemble model: {str(e)}")


if __name__ == "__main__":
    try:
        # Get script directory and project paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        ml_model_dir = os.path.dirname(script_dir)
        
        # Define data and output paths
        data_path = os.path.join(ml_model_dir, 'dataset', 'House_Price_India.csv')
        output_path = os.path.join(ml_model_dir, 'models', 'voting_ensemble.joblib')
        
        # Load data
        print("Loading dataset...")
        data = pd.read_csv(data_path)
        
        # Separate features and target
        X = data.drop('Price', axis=1)
        y = data['Price']
        
        # Split data
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train and evaluate ensemble
        ensemble = train_voting_ensemble(X_train, y_train, X_test, y_test)
        
        # Save trained ensemble
        save_ensemble(ensemble, output_path)
        
        print("\n✅ Ensemble training complete!")
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nPlease ensure that:")
        print("1. The dataset file exists in the correct location")
        print("2. You have write permissions in the output directory")
        print("3. All required packages are installed")