import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { FiChevronDown, FiFilter } from 'react-icons/fi';

const ProductGrid = ({ products, onOpenMobileFilters }) => {
  const [sortBy, setSortBy] = useState('Featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'Price: Low to High') {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return priceA - priceB;
    }
    if (sortBy === 'Price: High to Low') {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return priceB - priceA;
    }
    if (sortBy === 'Highest Rated') {
      return b.rating - a.rating;
    }
    if (sortBy === 'Best Selling') {
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    }
    if (sortBy === 'Newest') {
      return b.id - a.id;
    }
    return 0; // Featured
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  
  return (
    <div className="flex-1">
      {/* Top Bar: Results info & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex items-center gap-4">
          {/* Mobile Filter Button */}
          <button 
            className="lg:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
            onClick={onOpenMobileFilters}
          >
            <FiFilter /> Filters
          </button>
          <p className="text-gray-600 font-medium">
            Showing <span className="text-gray-900 font-bold">{products.length}</span> results
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="sort-select" className="text-gray-500 font-medium hidden sm:inline">Sort by:</label>
          <div className="relative w-full sm:w-48">
            <select 
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products by"
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 py-2.5 px-4 pr-8 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer min-h-[44px]"
            >
              <option>Featured</option>
              <option>Newest</option>
              <option>Best Selling</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <FiChevronDown />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition ${
                  currentPage === i + 1 
                    ? 'text-white bg-primary shadow-md' 
                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
