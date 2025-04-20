import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from xgboost import XGBRegressor
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
import joblib
import os

class EnhancedHousePriceModel:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.feature_importance = None
        
    def create_preprocessor(self, numeric_features):
        """
        Create a preprocessing pipeline
        """
        try:
            numeric_transformer = Pipeline(steps=[
                ('imputer', SimpleImputer(strategy='median')),
                ('scaler', RobustScaler())
            ])
            
            return ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, numeric_features)
                ])
        except Exception as e:
            print(f"Error creating preprocessor: {str(e)}")
            raise
    
    def train(self, X_train, y_train, X_test, y_test):
        """
        Train the model with the given preprocessed data
        """
        try:
            # Create base models for stacking with optimized parameters
            estimators = [
                ('rf', RandomForestRegressor(
                    n_estimators=100,
                    max_depth=15,
                    min_samples_split=4,
                    min_samples_leaf=2,
                    max_features='sqrt',
                    bootstrap=True,
                    random_state=42,
                    n_jobs=-1
                )),
                ('gb', GradientBoostingRegressor(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=5,
                    min_samples_split=4,
                    min_samples_leaf=2,
                    random_state=42
                )),
                ('xgb', XGBRegressor(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=5,
                    min_child_weight=1,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    random_state=42,
                    n_jobs=-1
                ))
            ]
            
            # Create final estimator
            final_estimator = RandomForestRegressor(
                n_estimators=50,
                max_depth=10,
                min_samples_split=4,
                min_samples_leaf=2,
                max_features='sqrt',
                bootstrap=True,
                random_state=42,
                n_jobs=-1
            )
            
            # Create stacking regressor
            self.model = StackingRegressor(
                estimators=estimators,
                final_estimator=final_estimator,
                n_jobs=-1
            )
            
            # Fit the model
            print("Training enhanced model...")
            self.model.fit(X_train, y_train)
            
            # Calculate feature importance
            self.feature_importance = pd.DataFrame({
                'feature': X_train.columns,
                'importance': self.model.final_estimator_.feature_importances_
            }).sort_values('importance', ascending=False)
            
            # Evaluate the model
            y_pred = self.model.predict(X_test)
            r2 = r2_score(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            
            print(f"\nEnhanced Model Performance:")
            print(f"R² Score: {r2:.4f}")
            print(f"RMSE: {rmse:.2f}")
            
        except Exception as e:
            print(f"Error training enhanced model: {str(e)}")
            raise
    
    def predict(self, features):
        """
        Make predictions using the trained model
        """
        try:
            if self.model is None:
                raise ValueError("Model not trained. Call train() first.")
            
            # Create DataFrame from features
            features_df = pd.DataFrame([features])
            
            # Make prediction
            prediction = self.model.predict(features_df)
            
            # Convert back from log scale
            return np.expm1(prediction[0])
            
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            raise
    
    def save_model(self, path):
        """
        Save the trained model to disk
        """
        try:
            if self.model is None:
                raise ValueError("No model to save. Train the model first.")
            
            # Create output directory if it doesn't exist
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            joblib.dump(self.model, path)
            print(f"Model saved successfully to {path}")
            
        except Exception as e:
            print(f"Error saving model: {str(e)}")
            raise
    
    def load_model(self, path):
        """
        Load a trained model from disk
        """
        try:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Model file not found: {path}")
            
            self.model = joblib.load(path)
            print(f"Model loaded successfully from {path}")
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise

if __name__ == "__main__":
    try:
        # Get the absolute path to the script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up one level to the ml-model directory
        ml_model_dir = os.path.dirname(script_dir)
        
        # Define input and output paths
        input_path = os.path.join(ml_model_dir, 'dataset', 'House_Price_India.csv')
        model_path = os.path.join(ml_model_dir, 'models', 'enhanced_house_price_model.joblib')
        
        # Initialize and train the model
        model = EnhancedHousePriceModel()
        
        # Train on normalized dataset
        trained_model = model.train(input_path)
        
        # Save the model
        model.save_model(model_path)
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nPlease ensure that:")
        print("1. The normalized dataset file exists in the correct location")
        print("2. You have write permissions in the output directory")
        print("3. All required packages are installed")
        print("4. The dataset contains the expected columns") 