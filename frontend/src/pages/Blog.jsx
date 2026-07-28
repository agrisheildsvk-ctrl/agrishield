import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowDown, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';
import { blogsData } from '../data/blogsData';
import SearchBar from '../components/blog/SearchBar';
import BlogCard from '../components/blog/BlogCard';
import BlogNewsletter from '../components/blog/BlogNewsletter';
import SEO from '../components/SEO';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const blogsSectionRef = useRef(null);

  // Set page title and SEO metadata
  // Filtered blogs based on search query
  const filteredBlogs = useMemo(() => {
    return blogsData.filter((blog) => {
      const query = searchQuery.trim().toLowerCase();
      return (
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.shortDescription.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query) ||
        blog.author.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Smooth scroll to blogs section
  const scrollToBlogs = () => {
    if (blogsSectionRef.current) {
      blogsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 pb-12">
      <SEO
        title="Agrishield Blog | Latest Farming Tips & Pest Control Guides"
        description="Read expert agricultural guides on organic pest control, wild animal deterrence, and farming tips from Agrishield agricultural scientists."
        keywords={['Agrishield blog', 'farming tips India', 'wild boar repellent guide', 'snake control agriculture', 'crop protection methods']}
        canonical="https://agrishield.in/blog"
      />
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-green-800 text-white py-10 sm:py-14 flex items-center justify-center">
        {/* Background Image with Dark & Green Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80"
            alt="Agrishield Agriculture Knowledge Hub - Indian Farming & Crop Protection Blog"
            title="agrishield-agriculture-knowledge-hub-banner.jpg"
            className="w-full h-full object-cover object-center opacity-25 scale-105 animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-primary-dark/85 to-primary-dark/70" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8 sm:py-10 relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase bg-white/15 backdrop-blur-md text-green-200 border border-white/20 mb-4 shadow-sm">
              Agrishield Knowledge Hub
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Agrishield Blog
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-green-100 max-w-xl mx-auto leading-relaxed mb-6 font-normal">
              Latest Farming Tips, Pest Control Guides, Crop Protection and Organic Farming Knowledge.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToBlogs}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-7 py-3.5 sm:py-4 rounded-full shadow-lg shadow-green-900/40 hover:shadow-xl transition-all duration-300 text-sm sm:text-base cursor-pointer"
              >
                <span>Explore Blogs</span>
                <FiArrowDown className="w-4 h-4 animate-bounce" />
              </motion.button>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-7 py-3.5 sm:py-4 rounded-full border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base shadow-sm"
              >
                <FiShoppingBag className="w-4 h-4" />
                <span>Shop Products</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </section>

      {/* Anchor for Explore Blogs scroll */}
      <div ref={blogsSectionRef} className="scroll-mt-16 pt-8" />

      {/* 3. Search Bar */}
      <section className="mb-8">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={filteredBlogs.length}
        />
      </section>

      {/* 5. Blog Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <AnimatePresence mode="wait">
          {filteredBlogs.length > 0 ? (
            <motion.div
              key={searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {filteredBlogs.map((blog, idx) => (
                <BlogCard key={blog.id} blog={blog} index={idx} />
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm border border-gray-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center text-primary">
                <FiRefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                We couldn&apos;t find any blog posts matching your search &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-md transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 6. Newsletter Section */}
      <BlogNewsletter />
    </div>
  );
};

export default Blog;
