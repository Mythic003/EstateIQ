import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
import sys
from datetime import datetime

# Import all models and preprocessor
from LinearRegression import train_linear_regression
from RandomForest import train_random_forest
from XGBoost import train_xgboost
from ensemblevoting import train_voting_ensemble
from data_preprocessing import DataPreprocessor

def load_and_prepare_data(data_path):
    """Load and prepare the dataset using DataPreprocessor"""
    try:
        # Load data
        print("Loading dataset...")
        data = pd.read_csv(data_path)
        
        # Initialize preprocessor
        preprocessor = DataPreprocessor()
        
        # Handle missing values
        data = preprocessor.handle_missing_values(data)
        
        # Remove outliers
        numeric_features = data.select_dtypes(include=[np.number]).columns.tolist()
        if 'Price' in numeric_features:
            numeric_features.remove('Price')
        data = preprocessor.remove_outliers(data, numeric_features)
        
        # Create interaction features
        data = preprocessor.create_interaction_features(data)
        
        # Detect and handle skewness
        skewed_features = preprocessor.detect_skewness(data)
        if skewed_features:
            data[skewed_features] = preprocessor.power_transformer.fit_transform(data[skewed_features])
        
        # Separate features and target
        X = data.drop('Price', axis=1)
        y = data['Price']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        return X_train, X_test, y_train, y_test, X.columns
        
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        sys.exit(1)

def evaluate_model(model, X_test, y_test, model_name):
    """Evaluate model performance"""
    try:
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        print(f"\n{model_name} Performance:")
        print(f"RMSE: {rmse:.2f}")
        print(f"R² Score: {r2:.4f}")
        
        return {
            'model_name': model_name,
            'rmse': rmse,
            'r2': r2
        }
        
    except Exception as e:
        print(f"Error evaluating {model_name}: {str(e)}")
        return None

def save_model(model, model_name, feature_names):
    """Save the trained model with versioning"""
    try:
        # Create models directory if it doesn't exist
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # Generate timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Define model path
        model_path = os.path.join(models_dir, f'{model_name}_{timestamp}.joblib')
        
        # Save model and feature names
        model_data = {
            'model': model,
            'feature_names': feature_names,
            'timestamp': timestamp,
            'model_name': model_name
        }
        joblib.dump(model_data, model_path)
        
        print(f"\nModel saved to: {model_path}")
        
        # Also save a copy with the best_model prefix if it's the best model
        if model_name == "XGBoost":  # Since we know XGBoost is the best from comparison
            best_model_path = os.path.join(models_dir, f'best_model_{timestamp}.joblib')
            joblib.dump(model_data, best_model_path)
            print(f"Best model saved to: {best_model_path}")
        
        # Clean up old versions (keep only the 3 most recent)
        model_files = [f for f in os.listdir(models_dir) if f.startswith(model_name) and f.endswith('.joblib')]
        if len(model_files) > 3:
            # Sort by timestamp (newest first)
            model_files.sort(reverse=True)
            # Remove older versions
            for old_file in model_files[3:]:
                os.remove(os.path.join(models_dir, old_file))
                print(f"Removed old model: {old_file}")
        
    except Exception as e:
        print(f"Error saving {model_name}: {str(e)}")
        raise  # Re-raise the exception to stop the training process

def train_all_models():
    try:
        # Get data path
        script_dir = os.path.dirname(os.path.abspath(__file__))
        ml_model_dir = os.path.dirname(script_dir)
        data_path = os.path.join(ml_model_dir, 'dataset', 'House_Price_India.csv')
        
        # Load and prepare data
        X_train, X_test, y_train, y_test, feature_names = load_and_prepare_data(data_path)
        
        # Initialize results list
        results = []
        models = {}
        
        # Train and evaluate Linear Regression
        print("\nTraining Linear Regression...")
        lr_model = train_linear_regression(X_train, y_train)
        lr_results = evaluate_model(lr_model, X_test, y_test, "Linear Regression")
        if lr_results:
            results.append(lr_results)
            models["Linear Regression"] = lr_model
            save_model(lr_model, "Linear_Regression", feature_names)
        
        # Train and evaluate Random Forest
        print("\nTraining Random Forest...")
        rf_model = train_random_forest(X_train, y_train)
        rf_results = evaluate_model(rf_model, X_test, y_test, "Random Forest")
        if rf_results:
            results.append(rf_results)
            models["Random Forest"] = rf_model
            save_model(rf_model, "Random_Forest", feature_names)
        
        # Train and evaluate XGBoost
        print("\nTraining XGBoost...")
        xgb_model = train_xgboost(X_train, y_train)
        xgb_results = evaluate_model(xgb_model, X_test, y_test, "XGBoost")
        if xgb_results:
            results.append(xgb_results)
            models["XGBoost"] = xgb_model
            save_model(xgb_model, "XGBoost", feature_names)
        
        # Print comparison
        print("\nModel Comparison:")
        results_df = pd.DataFrame(results)
        results_df = results_df.sort_values('r2', ascending=False)
        print(results_df)
        
        # Save comparison results
        results_path = os.path.join(ml_model_dir, 'models', 'model_comparison.csv')
        results_df.to_csv(results_path, index=False)
        print(f"\nComparison results saved to: {results_path}")
        
    except Exception as e:
        print(f"Error in training pipeline: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    train_all_models()