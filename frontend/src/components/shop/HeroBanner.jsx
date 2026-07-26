import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiSearch } from 'react-icons/fi';

const HeroBanner = () => {
  return (
    <div className="relative bg-primary-dark text-white overflow-hidden rounded-3xl mx-4 mt-4 lg:mx-8 mb-12 shadow-2xl">
      {/* Background Pattern / Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90 z-0"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
      
      <div className="relative z-10 px-6 py-16 md:py-20 lg:px-16 flex flex-col items-center md:items-start text-center md:text-left">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-200 mb-6 space-x-2 items-center" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="font-semibold text-white">Shop</span>
        </nav>

        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Premium <span className="text-accent">Agriculture</span> Marketplace
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-gray-100 max-w-2xl mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover top-tier pest control, fertilizers, and crop protection products designed to keep your farm safe, productive, and thriving.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button className="bg-accent hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto">
            Explore Offers
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;
