import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiArrowRight, FiBookmark } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FeaturedBlog = ({ blog }) => {
  if (!blog) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto px-4 mb-14"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-primary animate-ping"></span>
        <span className="text-xs uppercase font-bold tracking-widest text-primary">
          Featured Article
        </span>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-green-100/80 group">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left: Large Image */}
          <div className="lg:col-span-7 relative overflow-hidden h-72 sm:h-96 lg:h-auto min-h-[300px] bg-gray-900 flex items-center justify-center">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-white shadow-lg shadow-primary/30">
                <FiBookmark className="w-3.5 h-3.5" />
                {blog.category}
              </span>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-white to-green-50/30">
            <div>
              {/* Category tag for desktop if needed, or meta bar */}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <FiCalendar className="text-primary w-4 h-4" />
                  {blog.date}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <FiClock className="text-primary w-4 h-4" />
                  {blog.readTime}
                </span>
              </div>

              {/* Title */}
              <Link to={`/blog/${blog.slug}`} className="block group/link">
                <h2 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold text-gray-900 group-hover/link:text-primary transition-colors leading-tight mb-4">
                  {blog.title}
                </h2>
              </Link>

              {/* Short Description */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 line-clamp-4">
                {blog.shortDescription}
              </p>
            </div>

            <div>
              {/* Author Info */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-4">
                <div className="flex items-center gap-3">
                  <img
                    src={blog.authorAvatar}
                    alt={blog.author}
                    className="w-11 h-11 rounded-full object-cover border-2 border-primary/30 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-none">
                      {blog.author}
                    </h4>
                    <p className="text-xs text-primary font-medium mt-1">
                      {blog.authorRole}
                    </p>
                  </div>
                </div>

                {/* Read More CTA */}
                <Link
                  to={`/blog/${blog.slug}`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-green-600 hover:from-primary-dark hover:to-green-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Read More</span>
                  <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedBlog;
