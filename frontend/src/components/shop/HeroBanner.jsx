import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiSearch } from 'react-icons/fi';

const HeroBanner = () => {
  return (
    <div className="relative bg-primary-dark text-white overflow-hidden rounded-2xl sm:rounded-3xl mx-3 mt-3 sm:mx-4 sm:mt-4 lg:mx-8 mb-8 sm:mb-12 shadow-xl">
      {/* Background Pattern / Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90 z-0"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
      
      <div className="relative z-10 px-4 py-8 sm:px-8 sm:py-12 md:py-16 lg:px-16 flex flex-col items-center md:items-start text-center md:text-left">
        
        {/* Breadcrumb */}
        <nav className="flex text-xs sm:text-sm text-gray-200 mb-3 sm:mb-6 space-x-1.5 sm:space-x-2 items-center" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <FiChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-semibold text-white">Shop</span>
        </nav>

        <motion.h1 
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Premium <span className="text-accent">Agriculture</span> Marketplace
        </motion.h1>
        
        <motion.p 
          className="text-xs sm:text-base md:text-lg text-green-50/90 max-w-2xl mb-4 sm:mb-8 leading-relaxed font-normal"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Discover top-tier pest control, fertilizers, and crop protection products designed to keep your farm safe, productive, and thriving.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button className="bg-accent hover:bg-green-500 text-white font-extrabold py-2.5 sm:py-3.5 px-6 sm:px-8 rounded-full shadow-md transition transform hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto text-xs sm:text-base cursor-pointer">
            Explore Offers
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;
