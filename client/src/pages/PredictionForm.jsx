import { useState } from 'react';

export default function PredictionForm() {
  const [formData, setFormData] = useState({
    location: '',
    squareFeet: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white px-6 py-12 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Get Your Property Valuation
        </h2>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Fill in the details below to get an accurate price prediction.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <div className="mt-2.5">
              <input
                type="text"
                name="location"
                id="location"
                className="input-field"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="squareFeet" className="form-label">
              Square Feet
            </label>
            <div className="mt-2.5">
              <input
                type="number"
                name="squareFeet"
                id="squareFeet"
                className="input-field"
                value={formData.squareFeet}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="yearBuilt" className="form-label">
              Year Built
            </label>
            <div className="mt-2.5">
              <input
                type="number"
                name="yearBuilt"
                id="yearBuilt"
                className="input-field"
                value={formData.yearBuilt}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="bedrooms" className="form-label">
              Bedrooms
            </label>
            <div className="mt-2.5">
              <input
                type="number"
                name="bedrooms"
                id="bedrooms"
                className="input-field"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="bathrooms" className="form-label">
              Bathrooms
            </label>
            <div className="mt-2.5">
              <input
                type="number"
                name="bathrooms"
                id="bathrooms"
                className="input-field"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="btn-primary w-full"
          >
            Get Prediction
          </button>
        </div>
      </form>
    </div>
  );
} 