import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import logging

def preprocess_data(df):
    """
    Preprocess the input data for model training
    
    Args:
        df (pd.DataFrame): Raw input data
        
    Returns:
        tuple: (X, y) preprocessed features and target
    """
    logger = logging.getLogger(__name__)
    logger.info("Starting data preprocessing")
    
    try:
        # Create a copy to avoid modifying original data
        df = df.copy()
        
        # Handle missing values
        df = handle_missing_values(df)
        
        # Feature engineering
        df = create_features(df)
        
        # Prepare features and target
        target_col = 'price'
        feature_cols = [col for col in df.columns if col != target_col]
        
        X = df[feature_cols]
        y = df[target_col]
        
        logger.info(f"Preprocessing complete. Features shape: {X.shape}")
        return X, y
        
    except Exception as e:
        logger.error(f"Error in preprocessing: {str(e)}")
        raise

def handle_missing_values(df):
    """
    Handle missing values in the dataset
    
    Args:
        df (pd.DataFrame): Input dataframe
        
    Returns:
        pd.DataFrame: Dataframe with handled missing values
    """
    # Fill numeric columns with median
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    
    # Fill categorical columns with mode
    categorical_cols = df.select_dtypes(include=['object']).columns
    df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])
    
    return df

def create_features(df):
    """
    Create new features and transform existing ones
    
    Args:
        df (pd.DataFrame): Input dataframe
        
    Returns:
        pd.DataFrame: Dataframe with engineered features
    """
    # Calculate age of house
    current_year = pd.Timestamp.now().year
    df['house_age'] = current_year - df['built_year']
    
    # Calculate area ratios
    df['living_lot_ratio'] = df['living_area'] / df['lot_area']
    
    # Create condition categories
    df['condition_category'] = pd.cut(
        df['condition'],
        bins=[0, 3, 6, 8, 10],
        labels=['Poor', 'Fair', 'Good', 'Excellent']
    )
    
    # Encode categorical variables
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
    
    return df 