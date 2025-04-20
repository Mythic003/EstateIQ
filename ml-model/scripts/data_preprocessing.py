import pandas as pd
import numpy as np
from sklearn.preprocessing import PowerTransformer, RobustScaler, StandardScaler
from sklearn.impute import SimpleImputer
from scipy import stats
import os

class DataPreprocessor:
    def __init__(self):
        self.power_transformer = PowerTransformer(method='yeo-johnson')
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='median')
        self.skewed_features = []
        
    def remove_outliers(self, data, columns, n_std=3.0):
        """Remove outliers using IQR method and z-score"""
        for column in columns:
            # IQR method
            Q1 = data[column].quantile(0.25)
            Q3 = data[column].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Combine with z-score method
            z_scores = np.abs(stats.zscore(data[column]))
            data = data[
                (data[column] >= lower_bound) & 
                (data[column] <= upper_bound) & 
                (z_scores < n_std)
            ]
        return data
    
    def create_interaction_features(self, data):
        """Create essential features that strongly influence house prices"""
        # Convert to DataFrame if numpy array
        if isinstance(data, np.ndarray):
            data = pd.DataFrame(data)
            
        # Only create essential interaction features
        if 'lotArea' in data.columns and 'livingArea' in data.columns:
            data['space_utilization_ratio'] = data['livingArea'] / data['lotArea']
        
        return data
    
    def detect_skewness(self, data, threshold=1.0):
        """Detect skewed features with a higher threshold"""
        if isinstance(data, np.ndarray):
            data = pd.DataFrame(data)
            
        numeric_features = data.select_dtypes(include=[np.number]).columns
        self.skewed_features = []
        
        for feature in numeric_features:
            skewness = data[feature].skew()
            if abs(skewness) > threshold:
                self.skewed_features.append(feature)
        
        return self.skewed_features
    
    def handle_missing_values(self, data):
        """Handle missing values in the dataset"""
        if isinstance(data, np.ndarray):
            data = pd.DataFrame(data)
        return data.fillna(data.median())
    
    def normalize_dataset(self, data_path, output_path):
        """Normalize the dataset and save to output path"""
        try:
            # Load data
            data = pd.read_csv(data_path)
            
            # Handle missing values
            data = self.handle_missing_values(data)
            
            # Remove outliers (less aggressive)
            numeric_features = data.select_dtypes(include=[np.number]).columns.tolist()
            if 'Price' in numeric_features:
                numeric_features.remove('Price')
            data = self.remove_outliers(data, numeric_features)
            
            # Create interaction features (minimal)
            data = self.create_interaction_features(data)
            
            # Detect and handle skewness (less aggressive)
            skewed_features = self.detect_skewness(data)
            if skewed_features:
                data[skewed_features] = self.power_transformer.fit_transform(data[skewed_features])
            
            # Save normalized data
            data.to_csv(output_path, index=False)
            print(f"Normalized dataset saved to: {output_path}")
            
        except Exception as e:
            print(f"Error normalizing dataset: {str(e)}")
            raise

if __name__ == "__main__":
    try:
        # Get the absolute path to the script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up one level to the ml-model directory
        ml_model_dir = os.path.dirname(script_dir)
        
        # Define input and output paths
        input_path = os.path.join(ml_model_dir, 'dataset', 'House_Price_India.csv')
        output_path = os.path.join(ml_model_dir, 'dataset', 'House_Price_India_normalized.csv')
        
        # Initialize preprocessor
        preprocessor = DataPreprocessor()
        
        # Process and normalize dataset
        preprocessor.normalize_dataset(input_path, output_path)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Please ensure that:")
        print("1. The dataset file exists in the correct location")
        print("2. You have write permissions in the output directory")
        print("3. The dataset contains the expected columns")