from sklearn.linear_model import LassoCV, ElasticNetCV
from sklearn.preprocessing import StandardScaler, PolynomialFeatures, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import cross_val_score
from sklearn.feature_selection import SelectKBest, f_regression, VarianceThreshold
import numpy as np
import pandas as pd
import warnings


def train_linear_regression(X_train, y_train):
    """
    Train an optimized Linear Regression model with improved accuracy
    and ensemble compatibility.
    
    Args:
        X_train: Training features (numpy array or pandas DataFrame)
        y_train: Training target values (numpy array or pandas Series)

    Returns:
        Trained regression pipeline
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
    
    # Identify numeric columns
    numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
    
    print(f"\n🔍 Processing {len(numeric_cols)} numeric features")
    
    # Optimized numeric features pipeline
    numeric_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('variance_filter', VarianceThreshold(threshold=0.01)),
        ('feature_selection', SelectKBest(f_regression, k=min(15, len(numeric_cols)))),
        ('interactions', PolynomialFeatures(degree=2, interaction_only=True, include_bias=False))
    ])
    
    # Full column transformer
    preprocessor = ColumnTransformer([
        ('num', numeric_pipeline, numeric_cols)
    ], remainder='drop')
    
    # Optimized regressor with better regularization
    regressor = ElasticNetCV(
        l1_ratio=[0.1, 0.5, 0.9],
        n_alphas=50,
        max_iter=2000,
        tol=0.001,
        cv=3,
        random_state=42,
        selection='random',
        n_jobs=-1
    )
    
    # Final pipeline
    pipeline = Pipeline([
        ('preprocess', preprocessor),
        ('regressor', regressor)
    ])
    
    # Start timer
    import time
    start_time = time.time()
    
    # Train the model
    print("\n🔍 Training optimized Linear Regression model...")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        pipeline.fit(X_train, y_train)
    
    # End timer
    training_time = time.time() - start_time
    print(f"Training completed in {training_time:.2f} seconds")
    
    # Get feature importances
    try:
        if hasattr(pipeline.named_steps['regressor'], 'coef_'):
            coefs = pipeline.named_steps['regressor'].coef_
            non_zero = np.sum(coefs != 0)
            print(f"\nModel uses {non_zero} features out of {len(coefs)} after regularization")
            
            if hasattr(pipeline.named_steps['regressor'], 'alpha_'):
                print(f"Optimal alpha: {pipeline.named_steps['regressor'].alpha_:.6f}")
                print(f"Optimal l1_ratio: {pipeline.named_steps['regressor'].l1_ratio_:.6f}")
    except Exception as e:
        print(f"Couldn't extract feature importances: {e}")
    
    # Cross-validation
    cv_scores = cross_val_score(
        pipeline, X_train, y_train,
        cv=3,
        scoring='r2'
    )
    print(f"\n🔍 Optimized Linear Regression CV R²: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    return pipeline