import { motion } from 'framer-motion';
import { MdOutlineDocumentScanner, MdOutlineCalculate, MdHistory } from 'react-icons/md';
import platformOverview from '../assets/images/platform overview.png';
import propertyDetailsForm from '../assets/images/Property details form.png';
import aiAnalysis from '../assets/images/ai analysis.png';
import priceCalculation from '../assets/images/Price calculation.png';
import keyFeatures from '../assets/images/key features.png';
import guideline from '../assets/images/guideline.png';

export default function Documentation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Documentation & User Guide
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn how to use EstateIQ to get accurate property price predictions and make informed real estate decisions.
        </p>
      </div>

      {/* Overview Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Overview</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-600 mb-6">
              EstateIQ is an advanced property price prediction platform that uses machine learning algorithms to provide accurate estimates for real estate properties. Our system analyzes various factors including location, property features, and historical data to deliver reliable price predictions.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <MdOutlineCalculate className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Accurate Predictions</h3>
                  <p className="text-gray-600">Advanced algorithms providing precise property valuations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <MdHistory className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Historical Data</h3>
                  <p className="text-gray-600">Access to past predictions for reference</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={platformOverview} 
              alt="EstateIQ Platform Overview" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square mb-4">
              <img 
                src={propertyDetailsForm} 
                alt="Enter Property Details" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Property Details</h3>
            <p className="text-gray-600">
              Input essential property information including location, size, features, and condition.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square mb-4">
              <img 
                src={aiAnalysis} 
                alt="AI Analysis Process" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              Our AI model processes the data and analyzes property features to generate predictions.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square mb-4">
              <img 
                src={priceCalculation} 
                alt="Price Prediction Results" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Results</h3>
            <p className="text-gray-600">
              Receive detailed price predictions with confidence scores and price ranges.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg overflow-hidden p-4 flex items-center justify-center h-[300px]">
            <img 
              src={keyFeatures} 
              alt="EstateIQ Features Overview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-primary-600 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Price Predictions</h3>
              <p className="text-gray-600">
                Advanced machine learning models trained on extensive real estate data provide highly accurate price estimates.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Historical Tracking</h3>
              <p className="text-gray-600">
                Keep track of all your previous predictions for future reference.
              </p>
            </div>
            <div className="border-l-4 border-primary-600 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">
                Get comprehensive insights including confidence scores and price ranges for each prediction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guidelines Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Usage Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-white rounded-l-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start gap-3">
                <MdOutlineDocumentScanner className="h-6 w-6 text-primary-600 mt-1" />
                <span>Ensure all property details are accurate and up-to-date</span>
              </li>
              <li className="flex items-start gap-3">
                <MdOutlineDocumentScanner className="h-6 w-6 text-primary-600 mt-1" />
                <span>Include as many property features as possible for better accuracy</span>
              </li>
              <li className="flex items-start gap-3">
                <MdOutlineDocumentScanner className="h-6 w-6 text-primary-600 mt-1" />
                <span>Regularly update property information for the most accurate predictions</span>
              </li>
              <li className="flex items-start gap-3">
                <MdOutlineDocumentScanner className="h-6 w-6 text-primary-600 mt-1" />
                <span>Review your prediction history for reference</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-100 overflow-hidden flex items-center justify-center h-[400px] rounded-r-lg">
            <img 
              src={guideline} 
              alt="Usage Guidelines" 
              className="max-w-full max-h-full object-contain scale-125"
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
} 