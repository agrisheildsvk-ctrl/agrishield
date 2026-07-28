import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiShare2,
  FiBookmark,
  FiCheckCircle,
  FiAlertTriangle,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiShoppingBag,
  FiCheck,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getBlogById, getRelatedBlogs } from '../data/blogsData';
import BlogCard from '../components/blog/BlogCard';
import SEO from '../components/SEO';

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const foundBlog = getBlogById(id);
    if (foundBlog) {
      setBlog(foundBlog);
      setRelatedBlogs(getRelatedBlogs(foundBlog.id, foundBlog.category, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setBlog(null);
    }
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-primary mb-4">
          <FiHelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Article Not Found
        </h2>
        <p className="text-gray-500 max-w-md mb-6">
          The blog post you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-full transition-colors shadow-md"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Blogs</span>
        </Link>
      </div>
    );
  }

  const { content } = blog;

  return (
    <article className="bg-gray-50 min-h-screen pb-20">
      {blog && (
        <SEO
          title={blog.metaTitle || `${blog.title} | Agrishield Blog`}
          description={blog.metaDescription || blog.shortDescription}
          keywords={blog.metaKeywords || [blog.title, blog.category, 'Agrishield blog', 'farming guide']}
          canonical={blog.canonicalUrl || `https://agrishield.in/blog/${blog.slug}`}
          image={blog.image}
          type="article"
          schema={{
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": blog.title,
            "description": blog.metaDescription || blog.shortDescription,
            "image": blog.image,
            "author": {
              "@type": "Person",
              "name": blog.author,
              "jobTitle": blog.authorRole
            },
            "publisher": {
              "@type": "Organization",
              "name": "Agrishield India",
              "logo": {
                "@type": "ImageObject",
                "url": "https://agrishield.in/agri%20logo.webp"
              }
            },
            "datePublished": blog.date
          }}
        />
      )}
      {/* Top Bar Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary font-bold text-sm sm:text-base transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Blogs</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-primary">
              <FiBookmark className="w-3.5 h-3.5" />
              {blog.category}
            </span>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-primary px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              title="Share article"
            >
              {copied ? (
                <>
                  <FiCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <FiShare2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Article Header Container */}
      <div className="max-w-4xl mx-auto px-4 pt-10 sm:pt-14 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category Pill for Mobile */}
          <div className="sm:hidden mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-primary">
              <FiBookmark className="w-3.5 h-3.5" />
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            {blog.title}
          </h1>

          {/* Author & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-gray-200/80">
            <div className="flex items-center gap-3">
              <img
                src={blog.authorAvatar}
                alt={blog.author}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 shadow-sm"
              />
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-snug">
                  {blog.author}
                </h3>
                <p className="text-xs text-primary font-medium">
                  {blog.authorRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs sm:text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <FiCalendar className="text-primary w-4 h-4" />
                {blog.date}
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock className="text-primary w-4 h-4" />
                {blog.readTime}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Large Banner Image */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden shadow-2xl bg-gray-900 relative max-h-[500px]"
        >
          <img
            src={blog.image}
            alt={blog.imageAlt || blog.title}
            title={blog.imageName || `${blog.slug}.jpg`}
            className="w-full h-full object-cover max-h-[500px]"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6 text-right">
            <span className="text-xs text-white/80 font-medium">
              Agrishield Knowledge Base • {blog.category}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Article Body Content */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Intro */}
        {content?.intro && (
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-normal mb-10 border-l-4 border-primary pl-5 py-1 bg-green-50/50 rounded-r-2xl">
            {content.intro}
          </p>
        )}

        {/* Sections */}
        {content?.sections?.map((section, index) => (
          <section key={index} className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              {section.heading}
            </h2>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              {section.body}
            </p>

            {/* Optional image between sections */}
            {section.image && (
              <figure className="my-8 rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 bg-white">
                <img
                  src={section.image}
                  alt={section.imageAlt || section.heading}
                  title={section.imageName || `${blog.slug}-section.jpg`}
                  className="w-full h-auto max-h-[420px] object-cover"
                />
                {section.imageCaption && (
                  <figcaption className="p-3 bg-gray-50 text-center text-xs sm:text-sm text-gray-500 italic border-t border-gray-100">
                    {section.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </section>
        ))}

        {/* Tips Box */}
        {content?.tipsBox && (
          <div className="my-12 bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-3xl p-6 sm:p-8 border border-green-200 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {content.tipsBox.title}
              </h3>
            </div>
            <ul className="space-y-3.5">
              {content.tipsBox.items.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700 text-base">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning Box */}
        {content?.warningBox && (
          <div className="my-12 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50/40 rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-amber-900">
                {content.warningBox.title}
              </h3>
            </div>
            <p className="text-amber-950 text-base leading-relaxed font-medium">
              {content.warningBox.content}
            </p>
          </div>
        )}

        {/* FAQ Section */}
        {content?.faqs && content.faqs.length > 0 && (
          <section className="my-14 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <FiHelpCircle className="w-6 h-6 text-primary" />
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-3">
              {content.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="text-base sm:text-lg">{faq.question}</span>
                      {isOpen ? (
                        <FiChevronUp className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-3">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom CTA Card */}
        <div className="my-14 bg-gradient-to-r from-primary-dark via-primary to-green-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Need Expert Protection for Your Farm?
          </h3>
          <p className="text-green-100 max-w-xl mx-auto text-sm sm:text-base mb-6">
            Explore our certified organic crop protection products, wild animal repellents, and snake control formulas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-green-50 font-bold px-7 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <FiShoppingBag className="w-4 h-4" />
              <span>Shop All Products</span>
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-7 py-3.5 rounded-full border border-white/30 backdrop-blur-sm transition-transform hover:scale-105 text-sm sm:text-base"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to All Blogs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Related Blogs Section */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-16 pt-12 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary">
                Keep Reading
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                Related Articles
              </h3>
            </div>
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-bold text-sm"
            >
              <span>View All Blogs</span>
              <FiArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {relatedBlogs.map((relBlog, idx) => (
              <BlogCard key={relBlog.id} blog={relBlog} index={idx} />
            ))}
          </div>

          <div className="sm:hidden text-center mt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full text-sm"
            >
              <span>View All Blogs</span>
            </Link>
          </div>
        </section>
      )}
    </article>
  );
};

export default BlogDetails;
