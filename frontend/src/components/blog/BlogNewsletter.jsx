import React, { useState } from 'react';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const BlogNewsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto px-4 my-20"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-dark via-primary to-green-700 text-white shadow-2xl p-8 sm:p-12 md:p-16 border border-green-600/40">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/15 backdrop-blur-sm text-green-200 mb-4 border border-white/20">
            Weekly Agricultural Digest
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            Stay Updated with Farming Tips
          </h2>
          <p className="text-green-100 text-sm sm:text-base md:text-lg mb-8 leading-relaxed">
            Join over 15,000 farmers and agro-specialists. Get our latest pest control guides, crop protection techniques, and seasonal advice delivered directly to your inbox.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 text-white flex items-center justify-center gap-3 shadow-lg"
            >
              <FiCheckCircle className="w-6 h-6 text-green-300 shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                Thank you for subscribing! Check your inbox soon for agricultural tips.
              </span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full flex-grow">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-white text-gray-800 placeholder-gray-400 pl-12 pr-4 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base outline-none focus:ring-4 focus:ring-white/30 font-medium shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-green-950 hover:bg-black text-white font-bold px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 text-sm sm:text-base cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-xs text-green-200/80 mt-4">
            We respect your privacy. No spam ever — unsubscribe at any time.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default BlogNewsletter;
