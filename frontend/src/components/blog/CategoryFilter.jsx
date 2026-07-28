import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory, categoryCounts }) => {
  return (
    <div className="w-full py-4 overflow-x-auto scrollbar-hide">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-4 max-w-6xl mx-auto">
        {categories.map((category, idx) => {
          const isSelected = selectedCategory === category;
          const count = categoryCounts ? categoryCounts[category] || 0 : null;

          return (
            <motion.button
              key={category}
              onClick={() => onSelectCategory(category)}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer select-none shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-r from-green-700 to-primary text-white shadow-md shadow-green-700/30 ring-2 ring-primary/40'
                  : 'bg-white text-gray-700 hover:bg-green-50 hover:text-primary border border-gray-200/80 hover:border-green-300'
              }`}
              aria-pressed={isSelected}
            >
              <span>{category}</span>
              {count !== null && count > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-primary'
                  }`}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
