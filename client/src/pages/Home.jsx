import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  MdLocationPin, // for pincode
  MdCalendarMonth, // for built year
  MdSquareFoot, // for lot area
  MdMeetingRoom, // for living area
  MdApartment, // for floors
  MdStars, // for condition rating
  MdBed, // for bedrooms
  MdBathroom // for bathrooms
} from 'react-icons/md';

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

export default function Home() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pincode: '',
    builtYear: '',
    lotArea: '',
    livingArea: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    condition: '',
  });
  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);

  const validateInput = (name, value) => {
    switch (name) {
      case 'pincode':
        return /^\d{6}$/.test(value) ? '' : 'Please enter a valid 6-digit pincode';
      case 'builtYear': {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return /^\d{4}$/.test(value) && year >= 1800 && year <= currentYear 
          ? '' 
          : `Please enter a valid year between 1800 and ${currentYear}`;
      }
      case 'lotArea':
      case 'livingArea':
        return /^\d+$/.test(value) ? '' : 'Please enter a valid number';
      case 'bedrooms':
      case 'bathrooms':
      case 'floors':
        return /^(\d+|(\d*\.5))$/.test(value) && parseFloat(value) >= 0 
          ? '' 
          : 'Please enter a valid number (whole or .5 values only)';
      case 'condition':
        const conditionValue = parseInt(value);
        return /^\d+$/.test(value) && conditionValue >= 1 && conditionValue <= 10 
          ? '' 
          : 'Please enter a number between 1 and 10';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get fields for current step
    const currentFields = getFieldsForStep(step);
    
    // Validate current step fields
    const newErrors = {};
    currentFields.forEach(field => {
      const error = validateInput(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (step < 2) {
      // Move to next step
      setStep(step + 1);
      setErrors({});
    } else {
      // Handle final submission
      setPrediction(null);
      
      // Your API call logic here
      setTimeout(() => {
        const newPrediction = {
          id: Date.now(),
          ...formData,
          predictedPrice: 850000,
          priceRange: {
            min: 820000,
            max: 880000
          },
          confidence: 92,
          date: new Date().toISOString()
        };

        // Save prediction to localStorage
        const savedPredictions = JSON.parse(localStorage.getItem('predictions') || '[]');
        
        // Check if this exact prediction already exists
        const predictionExists = savedPredictions.some(p => 
          p.pincode === newPrediction.pincode &&
          p.lotArea === newPrediction.lotArea &&
          p.livingArea === newPrediction.livingArea &&
          p.bedrooms === newPrediction.bedrooms &&
          p.bathrooms === newPrediction.bathrooms &&
          p.floors === newPrediction.floors &&
          p.condition === newPrediction.condition &&
          p.builtYear === newPrediction.builtYear
        );

        if (!predictionExists) {
          localStorage.setItem('predictions', JSON.stringify([newPrediction, ...savedPredictions]));
        }

        setPrediction(newPrediction);
        
        // Reset form
        setFormData({
          pincode: '',
          builtYear: '',
          lotArea: '',
          livingArea: '',
          bedrooms: '',
          bathrooms: '',
          floors: '',
          condition: '',
        });
        setStep(1);
      }, 1000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for bedrooms, bathrooms, and floors
    if (['bedrooms', 'bathrooms', 'floors'].includes(name)) {
      // Only allow numbers and decimal point
      if (!/^\d*\.?\d*$/.test(value) && value !== '') return;
      
      // If it's a decimal number, check if it's a .5
      if (value.includes('.')) {
        const [whole, decimal] = value.split('.');
        if (decimal && decimal !== '5') return;
      }
    }
    
    // For numeric fields, only allow numbers
    if (['lotArea', 'livingArea', 'condition'].includes(name)) {
      if (!/^\d*$/.test(value) && value !== '') return;
    }
    
    // For pincode, only allow numbers and max 6 digits
    if (name === 'pincode' && (!/^\d*$/.test(value) || value.length > 6) && value !== '') return;

    // For built year, only allow numbers and max 4 digits
    if (name === 'builtYear' && (!/^\d*$/.test(value) || value.length > 4) && value !== '') return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getFieldsForStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return ['pincode', 'builtYear', 'lotArea', 'livingArea', 'bedrooms'];
      case 2:
        return ['bathrooms', 'floors', 'condition'];
      default:
        return [];
    }
  };

  const renderFormFields = () => {
    const fields = getFieldsForStep(step);
    
    return fields.map(field => (
      <div key={field} className={`${errors[field] ? 'mb-10' : 'mb-6'}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getFieldLabel(field)}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            {field === 'pincode' && <MdLocationPin size={20} className="text-gray-400" />}
            {field === 'builtYear' && <MdCalendarMonth size={20} className="text-gray-400" />}
            {field === 'lotArea' && <MdSquareFoot size={20} className="text-gray-400" />}
            {field === 'livingArea' && <MdMeetingRoom size={20} className="text-gray-400" />}
            {field === 'bedrooms' && <MdBed size={20} className="text-gray-400" />}
            {field === 'bathrooms' && <MdBathroom size={20} className="text-gray-400" />}
            {field === 'floors' && <MdApartment size={20} className="text-gray-400" />}
            {field === 'condition' && <MdStars size={20} className="text-gray-400" />}
          </div>
          <input
            type="text"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={getFieldPlaceholder(field)}
            maxLength={field === 'pincode' ? 6 : field === 'builtYear' ? 4 : undefined}
            className={`block w-full pl-10 rounded-md border ${
              errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            } py-2.5 text-gray-900 shadow-sm transition-all duration-300 ease-in-out hover:border-primary-400 sm:text-sm`}
            aria-invalid={errors[field] ? "true" : "false"}
            aria-describedby={errors[field] ? `${field}-error` : undefined}
          />
          {errors[field] && (
            <div className="absolute inset-x-0 top-full mt-1">
              <p 
                className="text-sm text-red-600" 
                id={`${field}-error`}
                role="alert"
              >
                {errors[field]}
              </p>
            </div>
          )}
        </div>
      </div>
    ));
  };

  const getFieldLabel = (field) => {
    const labels = {
      pincode: 'Pincode',
      builtYear: 'Built Year',
      lotArea: 'Total Property Area (sq ft)',
      livingArea: 'Living Area (sq ft)',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      floors: 'Number of Floors',
      condition: 'Property Condition (1-10)',
    };
    return labels[field];
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      pincode: 'Enter 6-digit pincode',
      builtYear: 'Enter year (e.g., 2010)',
      lotArea: 'Enter total property area',
      livingArea: 'Enter living area',
      bedrooms: 'Enter number (e.g., 2 or 2.5)',
      bathrooms: 'Enter number (e.g., 1 or 1.5)',
      floors: 'Enter number (e.g., 1 or 1.5)',
      condition: 'Rate from 1 to 10',
    };
    return placeholders[field];
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 w-full"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prediction Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Predict Property Price</h2>
              <div className="text-sm text-gray-500">Step {step} of 2</div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {renderFormFields()}
              </motion.div>

              <div className={`flex justify-between items-center ${Object.keys(errors).length > 0 ? 'mt-12' : 'mt-6'}`}>
                {step > 1 && (
                  <motion.button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-md transition-all duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Back
                  </motion.button>
                )}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${step > 1 ? 'ml-auto' : 'w-full'} bg-primary-600 text-white py-2.5 px-4 rounded-md transition-all duration-300 ease-in-out hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                >
                  {step < 2 ? 'Next' : 'Get Price Prediction'}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Prediction Results */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out hover:shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Estimated Price Range</h2>
            
            <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)]">
              {prediction ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-6xl font-bold text-gray-900 mb-4 transition-all duration-300">
                    ${prediction.predictedPrice.toLocaleString()}
                  </div>
                  <div className="text-lg text-gray-600 transition-all duration-300">
                    Range: ${prediction.priceRange.min.toLocaleString()} - ${prediction.priceRange.max.toLocaleString()}
                  </div>
                  <div className="mt-4 text-sm text-gray-500 transition-all duration-300">
                    Confidence Score: {prediction.confidence}%
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center text-gray-500"
                >
                  <p className="text-lg animate-pulse">Enter property details to get a price prediction</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
} 