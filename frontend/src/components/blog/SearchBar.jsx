import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SearchBar = ({ searchQuery, onSearchChange, resultsCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="max-w-2xl mx-auto w-full px-4"
    >
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200/80 px-5 py-3.5 transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <FiSearch className="text-primary w-5 h-5 shrink-0 mr-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search blogs... (e.g., wild boars, snake repellent, organic farming)"
            className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm md:text-base outline-none font-medium"
            aria-label="Search blogs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-gray-400 hover:text-primary p-1 rounded-full transition-colors shrink-0 ml-2"
              title="Clear search"
              aria-label="Clear search"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center text-xs md:text-sm text-gray-600 font-medium"
        >
          Found <span className="text-primary font-bold">{resultsCount}</span> {resultsCount === 1 ? 'article' : 'articles'} matching "{searchQuery}"
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;
