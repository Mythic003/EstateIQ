import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  MdLocationPin,
  MdCalendarMonth,
  MdSquareFoot,
  MdMeetingRoom,
  MdApartment,
  MdStars,
  MdBed,
  MdBathroom,
  MdWaterDrop,
  MdRemoveRedEye,
  MdGrade,
  MdSchool,
  MdFlight
} from 'react-icons/md';
import { Box, Stepper, Step, StepLabel, Paper, Grid, Button, CircularProgress, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import { Container, Typography } from '@mui/material';
import { predictPrice } from '../services/api';

const stats = [
  { 
    id: 1, 
    name: 'Total Properties', 
    value: '2,500+', 
    icon: MdApartment,
    change: '+12%',
    changeType: 'positive' 
  },
  { 
    id: 2, 
    name: 'Average Price', 
    value: '$450,000', 
    icon: BanknotesIcon,
    change: '+8%',
    changeType: 'positive'
  },
  { 
    id: 3, 
    name: 'Predictions Made', 
    value: '15,000+', 
    icon: ChartBarIcon,
    change: '+25%',
    changeType: 'positive'
  },
];

const features = [
  {
    name: 'Instant Price Predictions',
    description: 'Get accurate property price predictions in seconds using our advanced AI model.',
    icon: BanknotesIcon,
  },
  {
    name: 'Historical Data Analysis',
    description: 'Access comprehensive historical data and market trends for informed decision-making.',
    icon: ChartBarIcon,
  },
  {
    name: 'Location-based Insights',
    description: 'Explore property values and market dynamics across different neighborhoods.',
    icon: MdLocationPin,
  },
];

const steps = ['Location & Basic Info', 'Property Details', 'Additional Features'];

// Custom styles for TextField to remove focus outline
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)', // Same as unfocused
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)', // Same as unfocused
    },
    '& input': {
      '&:focus': {
        outline: 'none !important',
        boxShadow: 'none !important',
      },
      '&:invalid': {
        outline: 'none !important',
        boxShadow: 'none !important',
      },
      '&[type=number]': {
        'MozAppearance': 'textfield',
        '&::-webkit-outer-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '&::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        }
      }
    }
  }
};

export default function Home() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    zipcode: '',
    yr_built: '',
    sqft_lot: '',
    sqft_living: '',
    floors: '',
    yr_renovated: 0,
    condition: '',
    grade: '',
    sqft_basement: '',
    schools_nearby: 0,
    waterfront: 0,
    sqft_above: '',
    sqft_lot15: '',
    sqft_living15: '',
    airport_distance: 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle numeric fields
    if (name !== 'zipcode') {
      processedValue = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.zipcode) newErrors.zipcode = 'Required';
        if (!formData.yr_built) newErrors.yr_built = 'Required';
        if (!formData.sqft_lot) newErrors.sqft_lot = 'Required';
        if (!formData.sqft_living) newErrors.sqft_living = 'Required';
        
        if (!/^\d{6}$/.test(formData.zipcode)) {
          newErrors.zipcode = 'Must be a 6-digit code';
        }
        if (formData.yr_built < 1800 || formData.yr_built > new Date().getFullYear()) {
          newErrors.yr_built = 'Invalid year';
        }
        if (formData.sqft_lot <= 0) newErrors.sqft_lot = 'Must be greater than 0';
        if (formData.sqft_living <= 0) newErrors.sqft_living = 'Must be greater than 0';
        break;

      case 1:
        if (!formData.floors) newErrors.floors = 'Required';
        if (!formData.condition) newErrors.condition = 'Required';
        if (!formData.grade) newErrors.grade = 'Required';
        
        if (formData.floors <= 0) newErrors.floors = 'Must be greater than 0';
        if (formData.condition < 1 || formData.condition > 5) {
          newErrors.condition = 'Must be between 1 and 5';
        }
        if (formData.grade < 1 || formData.grade > 13) {
          newErrors.grade = 'Must be between 1 and 13';
        }
        if (formData.yr_renovated && (formData.yr_renovated < formData.yr_built || formData.yr_renovated > new Date().getFullYear())) {
          newErrors.yr_renovated = 'Invalid renovation year';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Set default values for missing features
      const submissionData = {
        ...formData,
        sqft_above: formData.sqft_above || formData.sqft_living,
        sqft_basement: formData.sqft_basement || 0,
        sqft_living15: formData.sqft_living15 || formData.sqft_living,
        sqft_lot15: formData.sqft_lot15 || formData.sqft_lot,
        yr_renovated: formData.yr_renovated || 0
      };

      const result = await predictPrice(submissionData);
      setPrediction(result);

      // Save prediction to localStorage
      const savedPredictions = JSON.parse(localStorage.getItem('predictions') || '[]');
      const newPrediction = {
        id: Date.now().toString(), // Unique ID for the prediction
        timestamp: new Date().toISOString(),
        prediction: result.prediction,
        ...submissionData // Include all form data
      };
      
      savedPredictions.unshift(newPrediction); // Add new prediction at the start
      localStorage.setItem('predictions', JSON.stringify(savedPredictions));

      setCurrentStep(3); // Move to result step
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to get prediction'
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zipcode"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleInputChange}
                error={!!errors.zipcode}
                helperText={errors.zipcode || 'Enter 6-digit zipcode'}
                inputProps={{ 
                  maxLength: 6,
                  pattern: '\\d{6}',
                  inputMode: 'numeric'
                }}
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year Built"
                name="yr_built"
                type="number"
                value={formData.yr_built}
                onChange={handleInputChange}
                error={!!errors.yr_built}
                helperText={errors.yr_built}
                inputProps={{ min: 1800, max: new Date().getFullYear() }}
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lot Area (sqft)"
                name="sqft_lot"
                type="number"
                value={formData.sqft_lot}
                onChange={handleInputChange}
                error={!!errors.sqft_lot}
                helperText={errors.sqft_lot}
                inputProps={{ min: 1 }}
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Living Area (sqft)"
                name="sqft_living"
                type="number"
                value={formData.sqft_living}
                onChange={handleInputChange}
                error={!!errors.sqft_living}
                helperText={errors.sqft_living}
                inputProps={{ min: 1 }}
                required
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Floors"
                name="floors"
                type="number"
                value={formData.floors}
                onChange={handleInputChange}
                error={!!errors.floors}
                helperText={errors.floors}
                inputProps={{ min: 1, step: 0.5 }}
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year Renovated"
                name="yr_renovated"
                type="number"
                value={formData.yr_renovated}
                onChange={handleInputChange}
                error={!!errors.yr_renovated}
                helperText={errors.yr_renovated || "0 if never renovated"}
                inputProps={{ min: 0, max: new Date().getFullYear() }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Condition (1-5)"
                name="condition"
                type="number"
                value={formData.condition}
                onChange={handleInputChange}
                error={!!errors.condition}
                helperText={errors.condition || '1: Poor, 2: Fair, 3: Average, 4: Good, 5: Excellent'}
                inputProps={{ min: 1, max: 5, step: 1 }}
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade (1-13)"
                name="grade"
                type="number"
                value={formData.grade}
                onChange={handleInputChange}
                error={!!errors.grade}
                helperText={errors.grade || '1-3: Poor, 4-6: Low, 7: Average, 8-10: Good, 11-13: High Quality'}
                inputProps={{ min: 1, max: 13, step: 1 }}
                required
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Basement Area (sqft)"
                name="sqft_basement"
                type="number"
                value={formData.sqft_basement}
                onChange={handleInputChange}
                helperText="Optional - defaults to 0 if not specified"
                inputProps={{ min: 0 }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Schools Nearby"
                name="schools_nearby"
                type="number"
                value={formData.schools_nearby}
                onChange={handleInputChange}
                helperText="Optional"
                inputProps={{ min: 0, step: 1 }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Waterfront"
                name="waterfront"
                select
                value={formData.waterfront}
                onChange={handleInputChange}
                helperText="Optional"
                SelectProps={{
                  native: true
                }}
                sx={textFieldStyle}
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </TextField>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 w-full"
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {/* Prediction Form */}
            <Grid item xs={12} md={7}>
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h4" gutterBottom sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } 
                  }}>
                    Predict Property Price
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Step {currentStep + 1} of {steps.length}
                  </Typography>
                </Box>

                <Stepper 
                  activeStep={currentStep} 
                  alternativeLabel 
                  sx={{ 
                    mb: { xs: 2, sm: 3, md: 4 },
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    }
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                      {renderStepContent(currentStep)}
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mt: { xs: 2, sm: 3, md: 4 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 2, sm: 0 }
                    }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        startIcon={<ArrowBackIcon />}
                        fullWidth={false}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={loading}
                        endIcon={currentStep === steps.length - 1 ? <SendIcon /> : <ArrowForwardIcon />}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : currentStep === steps.length - 1 ? (
                          'Get Prediction'
                        ) : (
                          'Next'
                        )}
                      </Button>
                    </Box>

                    {errors.submit && (
                      <Typography color="error" align="center" sx={{ mt: 2 }}>
                        {errors.submit}
                      </Typography>
                    )}
                  </form>
                </Box>
              </Paper>
            </Grid>

            {/* Prediction Output */}
            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center'
              }}>
                {prediction ? (
                  <Box>
                    <Typography variant="h4" color="primary" gutterBottom sx={{
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                    }}>
                      Estimated Price
                    </Typography>
                    <Typography variant="h2" sx={{ 
                      mb: 3, 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
                    }}>
                      ₹{Math.round(prediction.prediction * 1000000).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' }
                    }}>
                      Price Range
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ 
                      mb: 3,
                      fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                    }}>
                      ₹{Math.round(prediction.prediction * 0.98 * 1000000).toLocaleString('en-IN')} to ₹{Math.round(prediction.prediction * 1.02 * 1000000).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ 
                      mt: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      Confidence Score: 80%
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setCurrentStep(0);
                        setPrediction(null);
                        setFormData({
                          zipcode: '',
                          yr_built: '',
                          sqft_lot: '',
                          sqft_living: '',
                          floors: '',
                          yr_renovated: 0,
                          condition: '',
                          grade: '',
                          sqft_basement: '',
                          schools_nearby: 0,
                          waterfront: 0,
                          sqft_above: '',
                          sqft_lot15: '',
                          sqft_living15: '',
                          airport_distance: 0
                        });
                      }}
                      sx={{ 
                        mt: { xs: 2, sm: 3, md: 4 },
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Make Another Prediction
                    </Button>
                  </Box>
                ) : (
                  <Box textAlign="center">
                    <Typography variant="h6" color="textSecondary" sx={{
                      fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                    }}>
                      Fill out the form to get your property price prediction
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </motion.main>
  );
} 