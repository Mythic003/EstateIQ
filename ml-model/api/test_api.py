# -*- coding: utf-8 -*-
import requests
import json
import time
import os

# API base URL (change this to your deployed URL when testing production)
BASE_URL = os.getenv('API_URL', 'http://localhost:5000')  # Default to localhost if not set

def test_health_endpoint():
    print(f"\nTesting Health Endpoint at {BASE_URL}...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_prediction_endpoint(expect_model=False):
    print("\nTesting Prediction Endpoint...")
    # Sample house data
    sample_data = {
        "features": {
            "bedrooms": 3,
            "bathrooms": 2,
            "sqft_living": 1500,
            "sqft_lot": 4000,
            "floors": 1,
            "waterfront": 0,
            "view": 0,
            "condition": 3,
            "grade": 7,
            "sqft_above": 1500,
            "sqft_basement": 0,
            "yr_built": 1955,
            "yr_renovated": 0,
            "zipcode": 98178,
            "lat": 47.5112,
            "long": -122.257,
            "sqft_living15": 1500,
            "sqft_lot15": 4000
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(sample_data)
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if expect_model:
            return response.status_code == 200
        else:
            # If we don't expect a model, a 500 status with "Model not loaded" is acceptable
            if response.status_code == 500 and "Model not loaded" in response.json().get("error", ""):
                print("✓ Correctly reported model not loaded")
                return True
            return response.status_code == 200
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_error_handling():
    print("\nTesting Error Handling...")
    
    # Test 1: Missing features
    print("\nTest 1: Missing features")
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps({})
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 400 and "No features provided" in response.json().get("error", ""):
            print("✓ Correctly handled missing features")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    # Test 2: Invalid data type
    print("\nTest 2: Invalid data type")
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps({
                "features": {
                    "bedrooms": "three",  # Invalid: should be number
                    "bathrooms": 2,
                    "sqft_living": 1500
                }
            })
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 500:
            print("✓ Correctly handled invalid data type")
    except Exception as e:
        print(f"Error: {str(e)}")

def test_api():
    # Test health endpoint
    print("Testing health endpoint...")
    response = requests.get("http://127.0.0.1:5000/health")
    print(f"Health check response: {response.json()}\n")

    # Test prediction endpoint
    print("Testing prediction endpoint...")
    features = {
        "number of bedrooms": 3,
        "number of floors": 2,
        "waterfront present": 0,
        "Distance from the airport": 10,
        "Number of schools nearby": 3,
        "living area": 2000,
        "number of views": 0,
        "condition of the house": 3,
        "grade of the house": 7,
        "Area of the basement": 0,
        "Postal Code": 98105,
        "living_area_renov": 2000,
        "lot_area_renov": 5000,
        "number of bathrooms": 2,
        "lot area": 5000,
        "Area of the house(excluding basement)": 2000,
        "Built Year": 1990,
        "Renovation Year": 0
    }

    payload = {"features": features}
    response = requests.post(
        "http://127.0.0.1:5000/predict",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    print(f"Prediction response: {response.json()}")

def main():
    print("Starting API Tests...")
    print("Note: No model is currently loaded, so some errors are expected")
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    print(f"Health Check: {'✓' if health_ok else '✗'}")
    
    # Test prediction endpoint
    prediction_ok = test_prediction_endpoint(expect_model=False)
    print(f"Prediction Test: {'✓' if prediction_ok else '✗'}")
    
    # Test error handling
    test_error_handling()
    
    print("\nTest Summary:")
    print(f"Health Check: {'✓' if health_ok else '✗'}")
    print(f"Prediction Test: {'✓' if prediction_ok else '✗'}")
    print("\nNote: Some errors are expected because no model is loaded.")
    print("To fix this, train and save a model to the ml-model/models directory.")

if __name__ == "__main__":
    test_api() 