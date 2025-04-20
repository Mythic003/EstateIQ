# House Price Prediction API

This API provides predictions for house prices based on various features.

## API Endpoints

### 1. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "status": "healthy",
    "timestamp": "2023-04-19T12:00:00.000Z"
  }
  ```

### 2. Prediction
- **URL**: `/predict`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "features": {
      "feature1": value1,
      "feature2": value2,
      ...
    }
  }
  ```
- **Success Response**:
  ```json
  {
    "prediction": 500000.0,
    "timestamp": "2023-04-19T12:00:00.000Z",
    "model_used": "best_model",
    "status": "success"
  }
  ```
- **Error Response**:
  ```json
  {
    "error": "Error message",
    "status": "error"
  }
  ```

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the API:
   ```bash
   python app.py
   ```

3. Test the API:
   ```bash
   curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" -d '{"features": {...}}'
   ```

## Deployment

This API is designed to be deployed on PythonAnywhere:

1. Create a free account on [PythonAnywhere](https://www.pythonanywhere.com)
2. Upload the API files
3. Configure the web app to use the WSGI file
4. Start the web app

## Error Handling

The API includes comprehensive error handling for:
- Missing features
- Invalid input data
- Model loading errors
- Prediction errors 