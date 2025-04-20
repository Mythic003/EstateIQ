import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BanknotesIcon,
  ChartBarIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { 
  MdLocationPin,
  MdCalendarMonth,
  MdSquareFoot,
  MdMeetingRoom,
  MdApartment,
  MdStars,
  MdBed,
  MdBathroom
} from 'react-icons/md';

export default function RecentlyViewed() {
  const [predictions, setPredictions] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Load predictions from localStorage and ensure uniqueness by ID
    const savedPredictions = JSON.parse(localStorage.getItem('predictions') || '[]');
    // Remove duplicates by keeping only the first occurrence of each ID
    const uniquePredictions = savedPredictions.filter((prediction, index, self) =>
      index === self.findIndex((p) => p.id === prediction.id)
    );
    setPredictions(uniquePredictions);
  }, []);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    // Update state immediately but keep the item for animation
    setPredictions(prev => prev.map(p => 
      p.id === id ? { ...p, isDeleting: true } : p
    ));
    
    // Wait for slide out animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Now remove the item
    const updatedPredictions = predictions.filter(p => p.id !== id);
    localStorage.setItem('predictions', JSON.stringify(updatedPredictions));
    setPredictions(updatedPredictions);
    setDeleteConfirm(null);
    setIsDeleting(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
        <p className="mt-2 text-gray-600">View and compare your previous property price predictions</p>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: prediction.isDeleting ? 0 : 1,
                y: 0,
                x: prediction.isDeleting ? "100%" : 0,
                transition: { 
                  duration: prediction.isDeleting ? 0.8 : 0.4,
                  delay: prediction.isDeleting ? 0 : index * 0.1,
                  ease: prediction.isDeleting ? [0.32, 0.72, 0, 1] : [0.4, 0, 0.2, 1]
                }
              }}
              layout
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
                deleteConfirm === prediction.id ? 'ring-2 ring-red-100' : ''
              }`}
            >
              {/* Delete Button Area */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <AnimatePresence mode="wait">
                  {deleteConfirm === prediction.id ? (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <motion.button
                        onClick={() => !isDeleting && setDeleteConfirm(null)}
                        className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 group ${
                          isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                      </motion.button>
                      <motion.button
                        onClick={() => !isDeleting && handleDelete(prediction.id)}
                        className={`p-2 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-300 group ${
                          isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckIcon className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => !isDeleting && setDeleteConfirm(prediction.id)}
                      className={`p-2 rounded-full bg-gray-50 hover:bg-red-50 transition-all duration-300 group ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrashIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MdLocationPin size={20} className="text-gray-400" />
                        <span className="text-gray-600">Pincode: {prediction.pincode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdCalendarMonth size={20} className="text-gray-400" />
                        <span className="text-gray-600">Built: {prediction.builtYear}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdSquareFoot size={20} className="text-gray-400" />
                        <span className="text-gray-600">Total Area: {prediction.lotArea} sqft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdMeetingRoom size={20} className="text-gray-400" />
                        <span className="text-gray-600">Living Area: {prediction.livingArea} sqft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdApartment size={20} className="text-gray-400" />
                        <span className="text-gray-600">Floors: {prediction.floors}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdStars size={20} className="text-gray-400" />
                        <span className="text-gray-600">Condition: {prediction.condition}/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdBed size={20} className="text-gray-400" />
                        <span className="text-gray-600">Bedrooms: {prediction.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdBathroom size={20} className="text-gray-400" />
                        <span className="text-gray-600">Bathrooms: {prediction.bathrooms}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prediction Results */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Results</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Predicted Price</div>
                          <div className="text-2xl font-bold text-primary-600 flex items-center gap-2">
                            <BanknotesIcon className="h-6 w-6" />
                            ${prediction.predictedPrice.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Price Range</div>
                          <div className="text-lg text-gray-700 flex items-center gap-2">
                            <BanknotesIcon className="h-5 w-5 text-gray-400" />
                            ${prediction.priceRange.min.toLocaleString()} - ${prediction.priceRange.max.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Confidence Score</div>
                          <div className="text-lg text-gray-700 flex items-center gap-2">
                            <ChartBarIcon className="h-5 w-5 text-gray-400" />
                            {prediction.confidence}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Prediction Date</div>
                          <div className="text-lg text-gray-700 flex items-center gap-2">
                            <MdCalendarMonth size={16} className="text-gray-400" />
                            {formatDate(prediction.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {predictions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <MdApartment size={48} className="mx-auto fill-current" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions yet</h3>
            <p className="text-gray-500">Make your first property price prediction to see it here.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 