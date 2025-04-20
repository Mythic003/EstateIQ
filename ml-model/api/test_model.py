import joblib
import pandas as pd
import os

# Get the absolute path to the models directory
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'best_model_20250420_000125.joblib')

# Load the model
print(f"Loading model from: {MODEL_PATH}")
model_data = joblib.load(MODEL_PATH)
print("Model loaded successfully")

# Extract the actual model from the dictionary
model = model_data['model']
feature_names = model_data['feature_names']
print(f"Model type: {type(model)}")
print(f"Feature names: {feature_names}")

# Test prediction with correct feature names
test_data = {
    'number of bedrooms': 3,
    'number of bathrooms': 2,
    'living area': 1500,
    'lot area': 4000,
    'number of floors': 1,
    'waterfront present': 0,
    'number of views': 0,
    'condition of the house': 3,
    'grade of the house': 7,
    'Area of the house(excluding basement)': 1500,
    'Area of the basement': 0,
    'Built Year': 1955,
    'Renovation Year': 0,
    'Postal Code': 98178,
    'living_area_renov': 1500,
    'lot_area_renov': 4000,
    'Number of schools nearby': 5,
    'Distance from the airport': 10.5
}

# Create DataFrame with all required features
input_data = pd.DataFrame([test_data])

# Make prediction
prediction = model.predict(input_data)
print(f"Prediction: ${prediction[0]:,.2f}") 