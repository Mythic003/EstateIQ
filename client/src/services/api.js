import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new Error('Error setting up the request.'));
    }
  }
);

export const predictPrice = async (data) => {
  try {
    // Convert string values to numbers where needed
    const transformedData = {
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      sqft_living: Number(data.sqft_living),
      sqft_lot: Number(data.sqft_lot),
      floors: Number(data.floors),
      waterfront: Number(data.waterfront),
      view: Number(data.view),
      condition: Number(data.condition),
      grade: Number(data.grade),
      sqft_above: Number(data.sqft_above) || Number(data.sqft_living),
      sqft_basement: Number(data.sqft_basement) || 0,
      yr_built: Number(data.yr_built),
      yr_renovated: Number(data.yr_renovated),
      zipcode: data.zipcode,
      sqft_living15: Number(data.sqft_living15) || Number(data.sqft_living),
      sqft_lot15: Number(data.sqft_lot15) || Number(data.sqft_lot),
      schools_nearby: Number(data.schools_nearby),
      airport_distance: Number(data.airport_distance)
    };

    const response = await api.post('/predict', transformedData);
    
    // Convert USD to INR (approximate conversion rate)
    const USD_TO_INR = 83.5;
    const predictionInINR = response.data.prediction * USD_TO_INR;
    
    return {
      prediction: predictionInINR,
      confidence_score: response.data.confidence_score || 92,
      currency: 'INR'
    };
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}; 