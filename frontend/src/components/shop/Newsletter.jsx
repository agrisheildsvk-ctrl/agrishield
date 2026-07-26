import React from 'react';
import { motion } from 'framer-motion';

const Newsletter = () => {
  return (
    <div className="bg-primary-dark text-white py-16 mt-8 rounded-3xl mx-4 lg:mx-8 mb-16 relative overflow-hidden shadow-2xl">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-extrabold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Subscribe to Agrishield Newsletter
        </motion.h2>
        <motion.p 
          className="text-lg text-green-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Get the latest updates on new agriculture products, expert farming tips, and exclusive discounts straight to your inbox.
        </motion.p>
        
        <motion.form 
          className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-accent focus:border-transparent font-medium"
            required
          />
          <button 
            type="submit" 
            className="bg-accent hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl whitespace-nowrap"
          >
            Subscribe Now
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default Newsletter;
