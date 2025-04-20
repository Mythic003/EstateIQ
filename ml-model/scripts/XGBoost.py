import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score, train_test_split
import numpy as np

def train_xgboost(X_train, y_train):
    """
    Train an XGBoost model with preprocessing pipeline and optimized parameters
    """
    # Create preprocessing and model pipeline
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', xgb.XGBRegressor(
            n_estimators=1000,
            learning_rate=0.01,
            max_depth=7,
            min_child_weight=1,
            gamma=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            # Remove early_stopping_rounds parameter
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    # Perform cross-validation
    cv_scores = cross_val_score(
        pipeline, X_train, y_train,
        cv=5,
        scoring='neg_mean_squared_error'
    )
    rmse_scores = np.sqrt(-cv_scores)
    print(f"Cross-validation RMSE: {rmse_scores.mean():.4f} (+/- {rmse_scores.std() * 2:.4f})")
    
    # Train the final model
    pipeline.fit(X_train, y_train)
    
    return pipeline