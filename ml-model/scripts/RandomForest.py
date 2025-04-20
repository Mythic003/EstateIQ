from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
import numpy as np
import pandas as pd

def train_random_forest(X_train, y_train):
    """
    Train a Random Forest model with preprocessing pipeline and optimized parameters
    
    Args:
        X_train: Training features (numpy array or pandas DataFrame)
        y_train: Training target values (numpy array or pandas Series)
        
    Returns:
        Trained Random Forest pipeline
    """
    # Convert inputs to consistent types
    if isinstance(X_train, np.ndarray):
        X_train = pd.DataFrame(X_train)
    if isinstance(y_train, np.ndarray):
        y_train = pd.Series(y_train)
    
    # Ensure all data is numeric
    X_train = X_train.apply(pd.to_numeric, errors='coerce')
    y_train = pd.to_numeric(y_train, errors='coerce')
    
    # Handle any remaining NaN values
    X_train = X_train.fillna(X_train.median())
    y_train = y_train.fillna(y_train.median())
    
    # Create preprocessing and model pipeline
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(
            n_estimators=500,          # More trees for better ensemble
            max_depth=20,              # Deeper trees for complex patterns
            min_samples_split=4,       # Minimum samples required to split
            min_samples_leaf=2,        # Minimum samples required at leaf node
            max_features='sqrt',       # Number of features to consider for best split
            bootstrap=True,            # Use bootstrap samples
            random_state=42,
            n_jobs=-1                  # Use all CPU cores
        ))
    ])
    
    # Perform cross-validation
    cv_scores = cross_val_score(
        pipeline, X_train, y_train,
        cv=5,
        scoring='neg_mean_squared_error'
    )
    rmse_scores = np.sqrt(-cv_scores)
    print(f"\nCross-validation RMSE: {rmse_scores.mean():.4f} (+/- {rmse_scores.std() * 2:.4f})")
    
    # Train the final model
    pipeline.fit(X_train, y_train)
    
    # Print feature importances
    feature_importances = pipeline.named_steps['regressor'].feature_importances_
    print("\nTop 10 most important features:")
    feature_names = X_train.columns
    sorted_idx = np.argsort(feature_importances)[::-1]
    for idx in sorted_idx[:10]:
        print(f"{feature_names[idx]}: {feature_importances[idx]:.4f}")
    
    return pipeline
