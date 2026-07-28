import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const BlogCard = ({ blog, index = 0 }) => {
  if (!blog) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100/80 flex flex-col h-full group"
    >
      {/* Top: Large Image with Category Overlay */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden shrink-0">
        <Link to={`/blog/${blog.id}`} className="block h-full w-full">
          <img
            src={blog.image}
            alt={blog.imageAlt || blog.title}
            title={blog.imageName || `${blog.slug}.jpg`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-white shadow-md shadow-primary/30 tracking-wide">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-medium">
            <span className="flex items-center gap-1.5">
              <FiCalendar className="text-primary w-3.5 h-3.5" />
              {blog.date}
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock className="text-primary w-3.5 h-3.5" />
              {blog.readTime}
            </span>
          </div>

          {/* Title */}
          <Link to={`/blog/${blog.id}`} className="block">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug mb-3 line-clamp-2">
              {blog.title}
            </h3>
          </Link>

          {/* Short Description (2-3 lines) */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
            {blog.shortDescription}
          </p>
        </div>

        {/* Footer: Read More Button */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <img
              src={blog.authorAvatar}
              alt={blog.author}
              className="w-7 h-7 rounded-full object-cover border border-primary/30"
            />
            <span className="text-xs font-semibold text-gray-700">
              {blog.author}
            </span>
          </div>

          <Link
            to={`/blog/${blog.id}`}
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-bold text-sm transition-colors group/btn"
          >
            <span>Read More</span>
            <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
