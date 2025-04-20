import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { predictPrice } from '../services/api';

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    bedrooms: '',
    bathrooms: '',
    sqft_living: '',
    sqft_lot: '',
    floors: '',
    waterfront: '0',
    view: '0',
    condition: '',
    grade: '',
    sqft_above: '',
    sqft_basement: '',
    yr_built: '',
    yr_renovated: '0',
    zipcode: '',
    sqft_living15: '',
    sqft_lot15: '',
    schools_nearby: '5',
    airport_distance: '10.5'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateField = (name, value) => {
    if (value === '') return 'This field is required';
    
    switch (name) {
      case 'bedrooms':
      case 'bathrooms':
        if (value < 0) return 'Must be 0 or greater';
        if (value % 0.5 !== 0) return 'Must be a whole number or end in .5';
        break;
      case 'floors':
        if (value < 1) return 'Must be 1 or greater';
        if (value % 0.5 !== 0) return 'Must be a whole number or end in .5';
        break;
      case 'sqft_living':
      case 'sqft_lot':
      case 'sqft_above':
      case 'sqft_basement':
      case 'sqft_living15':
      case 'sqft_lot15':
        if (value < 0) return 'Must be 0 or greater';
        break;
      case 'condition':
        if (value < 1 || value > 5) return 'Must be between 1 and 5';
        break;
      case 'grade':
        if (value < 1 || value > 13) return 'Must be between 1 and 13';
        break;
      case 'yr_built':
        if (value < 1800 || value > new Date().getFullYear()) 
          return `Must be between 1800 and ${new Date().getFullYear()}`;
        break;
      case 'zipcode':
        if (!/^\d{5}$/.test(value)) return 'Must be a 5-digit number';
        break;
      case 'view':
        if (value < 0 || value > 4) return 'Must be between 0 and 4';
        break;
      case 'schools_nearby':
        if (value < 0) return 'Must be 0 or greater';
        break;
      case 'airport_distance':
        if (value < 0) return 'Must be 0 or greater';
        break;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await predictPrice(formData);
      // Convert USD to INR (approximate conversion rate)
      const USD_TO_INR = 83.5;
      const predictionInINR = response.prediction * USD_TO_INR;
      
      setPrediction({
        value: predictionInINR,
        currency: 'INR',
        timestamp: response.timestamp
      });
    } catch (err) {
      setError(err.message || 'Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const conditionLevels = [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Average' },
    { value: 4, label: '4 - Good' },
    { value: 5, label: '5 - Excellent' }
  ];

  const viewLevels = [
    { value: 0, label: '0 - None' },
    { value: 1, label: '1 - Fair' },
    { value: 2, label: '2 - Average' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Excellent' }
  ];

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        House Price Prediction
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {prediction && (
        <Box sx={{ textAlign: 'center', mb: 4, mt: 4 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Estimated Price Range
          </Typography>
          <Typography variant="h2" component="div" sx={{ my: 4, fontWeight: 'bold' }}>
            ₹{Math.round(prediction.value).toLocaleString('en-IN')}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Range: ₹{Math.round(prediction.value * 0.95).toLocaleString('en-IN')} - ₹{Math.round(prediction.value * 1.05).toLocaleString('en-IN')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Last Updated: {new Date(prediction.timestamp).toLocaleString()}
          </Typography>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange}
              error={!!validationErrors.bedrooms}
              helperText={validationErrors.bedrooms}
              inputProps={{ step: "0.5" }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleChange}
              error={!!validationErrors.bathrooms}
              helperText={validationErrors.bathrooms}
              inputProps={{ step: "0.5" }}
              required
            />
          </Grid>

          {/* Area Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Area Information</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Living Area"
              name="sqft_living"
              type="number"
              value={formData.sqft_living}
              onChange={handleChange}
              error={!!validationErrors.sqft_living}
              helperText={validationErrors.sqft_living}
              InputProps={{
                endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Lot Area"
              name="sqft_lot"
              type="number"
              value={formData.sqft_lot}
              onChange={handleChange}
              error={!!validationErrors.sqft_lot}
              helperText={validationErrors.sqft_lot}
              InputProps={{
                endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Above Ground Area"
              name="sqft_above"
              type="number"
              value={formData.sqft_above}
              onChange={handleChange}
              error={!!validationErrors.sqft_above}
              helperText={validationErrors.sqft_above}
              InputProps={{
                endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Basement Area"
              name="sqft_basement"
              type="number"
              value={formData.sqft_basement}
              onChange={handleChange}
              error={!!validationErrors.sqft_basement}
              helperText={validationErrors.sqft_basement}
              InputProps={{
                endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
              }}
              required
            />
          </Grid>

          {/* Property Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Property Details</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Floors"
              name="floors"
              type="number"
              value={formData.floors}
              onChange={handleChange}
              error={!!validationErrors.floors}
              helperText={validationErrors.floors}
              inputProps={{ step: "0.5", min: "1" }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Waterfront</InputLabel>
              <Select
                name="waterfront"
                value={formData.waterfront}
                onChange={handleChange}
                label="Waterfront"
                required
              >
                <MenuItem value="0">No</MenuItem>
                <MenuItem value="1">Yes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>View Quality</InputLabel>
              <Select
                name="view"
                value={formData.view}
                onChange={handleChange}
                label="View Quality"
                required
              >
                {viewLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                label="Condition"
                required
              >
                {conditionLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Grade (1-13)"
              name="grade"
              type="number"
              value={formData.grade}
              onChange={handleChange}
              error={!!validationErrors.grade}
              helperText={validationErrors.grade || "Building grade (1=poor, 13=excellent)"}
              inputProps={{ min: "1", max: "13" }}
              required
            />
          </Grid>

          {/* Year Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Year Information</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Year Built"
              name="yr_built"
              type="number"
              value={formData.yr_built}
              onChange={handleChange}
              error={!!validationErrors.yr_built}
              helperText={validationErrors.yr_built}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Year Renovated"
              name="yr_renovated"
              type="number"
              value={formData.yr_renovated}
              onChange={handleChange}
              error={!!validationErrors.yr_renovated}
              helperText={validationErrors.yr_renovated || "0 if never renovated"}
              required
            />
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Location Information</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              error={!!validationErrors.zipcode}
              helperText={validationErrors.zipcode}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Schools Nearby"
              name="schools_nearby"
              type="number"
              value={formData.schools_nearby}
              onChange={handleChange}
              error={!!validationErrors.schools_nearby}
              helperText={validationErrors.schools_nearby}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Airport Distance"
              name="airport_distance"
              type="number"
              value={formData.airport_distance}
              onChange={handleChange}
              error={!!validationErrors.airport_distance}
              helperText={validationErrors.airport_distance}
              InputProps={{
                endAdornment: <InputAdornment position="end">km</InputAdornment>,
              }}
              required
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading || Object.keys(validationErrors).length > 0}
            >
              {loading ? <CircularProgress size={24} /> : 'Predict Price'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PredictionForm; 