import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  selectedCategories = [], 
  onCategoryChange = () => {},
  priceRange = 1000,
  onPriceChange = () => {},
  selectedRating = 0,
  onRatingChange = () => {},
  onClearFilters = () => {}
}) => {
  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed lg:sticky top-0 lg:top-24 left-0 h-full lg:h-auto 
        w-72 lg:w-64 bg-white lg:bg-transparent shadow-2xl lg:shadow-none 
        z-50 lg:z-0 transform transition-transform duration-300 ease-in-out
        overflow-y-auto lg:overflow-visible p-6 lg:p-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiFilter /> Filters
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Categories</h3>
          <div className="flex flex-col space-y-3">
            {['Repellents', 'BONDON-B', 'Rodent Control', 'Pest Control', 'Specialty'].map((item, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(item)}
                  onChange={() => handleCategoryToggle(item)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2" 
                />
                <span className="text-gray-600 group-hover:text-primary transition">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Price Range</h3>
          <input 
            type="range" 
            min="0" 
            max="3000" 
            step="100"
            value={priceRange}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>₹0</span>
            <span>Up to ₹{priceRange}</span>
          </div>
        </div>

        {/* Ratings */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Ratings</h3>
          <div className="flex flex-col space-y-3">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="rating" 
                  checked={selectedRating === rating}
                  onChange={() => onRatingChange(rating)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary focus:ring-2" 
                />
                <span className="text-gray-600 group-hover:text-primary transition">{rating} Stars & Up</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={onClearFilters}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
        >
          Clear All Filters
        </button>
      </div>
    </>
  );
};

export default FilterSidebar;
