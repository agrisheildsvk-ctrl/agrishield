import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMic } from 'react-icons/fi';
import HeroBanner from '../components/shop/HeroBanner';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductGrid from '../components/shop/ProductGrid';
import ShopFeatures from '../components/shop/ShopFeatures';
import Newsletter from '../components/shop/Newsletter';

import { products } from '../data/products';
import SEO from '../components/SEO';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState(3000);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setSearchParams({});
    setPriceRange(3000);
    setSelectedRating(0);
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description?.toLowerCase().includes(q);
      const matchSpecies = product.targetSpecies?.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchSpecies) return false;
    }
    
    if (selectedCategories.length > 0) {
      const matchCategory = selectedCategories.some(cat => 
        product.category.toLowerCase().includes(cat.toLowerCase())
      );
      if (!matchCategory) return false;
    }

    const productPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    if (productPrice > priceRange) return false;

    if (selectedRating > 0 && product.rating < selectedRating) return false;
    
    return true;
  });

  return (
    <motion.div 
      className="bg-bg-shop min-h-screen font-sans pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEO
        title="Agrishield Shop | Buy Organic Crop Protection & Repellents Online in India"
        description="Browse and buy certified organic wild boar repellents, snake repellents, solar alarm strobes, and agricultural fencing products at Agrishield India."
        keywords={['buy agricultural repellents India', 'organic crop protection products online', 'wild boar repellent price', 'snake repellent powder buy', 'Agrishield shop']}
        canonical="https://agrishield.in/shop"
      />
      <HeroBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12 -mt-8 z-20 px-4 sm:px-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setSearchParams({ search: searchQuery.trim() });
              } else {
                setSearchParams({});
              }
            }}
            className="bg-white rounded-full shadow-xl flex items-center p-1.5 sm:p-2 border border-gray-100 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
          >
            <FiSearch className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6 ml-3 sm:ml-4 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim()) {
                  setSearchParams({ search: val });
                } else {
                  setSearchParams({});
                }
              }}
              placeholder="Search for products, brands..." 
              className="flex-1 min-w-0 bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-gray-800 focus:outline-none font-medium text-sm sm:text-base"
            />
            <button type="button" className="text-gray-400 hover:text-primary p-1 sm:p-2 mr-1 sm:mr-2 transition shrink-0" aria-label="Voice Search">
              <FiMic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-md transition shrink-0 text-sm sm:text-base cursor-pointer">
              Search
            </button>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FilterSidebar 
            isOpen={isMobileFiltersOpen} 
            onClose={() => setIsMobileFiltersOpen(false)} 
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            onClearFilters={handleClearFilters}
          />
          <ProductGrid 
            products={filteredProducts} 
            onOpenMobileFilters={() => setIsMobileFiltersOpen(true)} 
          />
        </div>
      </div>

      <ShopFeatures />
      <Newsletter />
    </motion.div>
  );
};

export default Shop;
