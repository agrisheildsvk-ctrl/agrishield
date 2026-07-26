import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiCopy, FiCheck, FiX, FiTag } from 'react-icons/fi';

const CouponPopup = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  // Automatically show popup when navigating to shop, cart, or checkout
  const targetPages = ['/shop', '/cart', '/checkout'];
  const shouldShow = targetPages.includes(location.pathname);

  useEffect(() => {
    if (shouldShow) {
      setIsOpen(true);
    }
  }, [location.pathname, shouldShow]);

  const handleCopy = () => {
    navigator.clipboard.writeText('SVK10');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed right-0 bottom-6 sm:bottom-10 z-50 flex items-end">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="popup-open"
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mr-3 sm:mr-6 w-72 sm:w-80 bg-gradient-to-br from-[#1b5e30] via-[#164e27] to-[#0f381c] text-white rounded-2xl shadow-2xl border-2 border-yellow-400 p-5 relative overflow-hidden"
          >
            {/* Background decorative glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-yellow-400/10 rounded-full blur-xl pointer-events-none"></div>

            {/* Top Bar: Badge & Close Button */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-gray-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <FiGift className="w-3.5 h-3.5" /> Special Offer
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors"
                title="Minimize Popup"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Headline */}
            <h4 className="text-xl sm:text-2xl font-extrabold text-yellow-300 tracking-tight leading-snug">
              Get ₹25 DISCOUNT!
            </h4>
            <p className="text-xs sm:text-sm text-green-100 mt-1 mb-4 leading-relaxed">
              Apply coupon code <strong className="text-white font-bold">SVK10</strong> during checkout to claim your instant ₹25 farmer discount.
            </p>

            {/* Coupon Code Ticket Box */}
            <div className="bg-black/30 border-2 border-dashed border-yellow-400/80 rounded-xl p-3 flex items-center justify-between gap-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <FiTag className="text-yellow-400 w-5 h-5 shrink-0" />
                <span className="font-mono text-lg sm:text-xl font-extrabold text-yellow-300 tracking-wider">
                  SVK10
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-400 hover:bg-yellow-300 text-gray-950'
                }`}
              >
                {copied ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Minimized Right-Edge Vertical Trigger Button */
          <motion.button
            key="popup-minimized"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={() => setIsOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-extrabold py-3 px-3 rounded-l-xl shadow-2xl border-l-2 border-t-2 border-b-2 border-yellow-500 flex items-center gap-2 cursor-pointer transition-transform hover:-translate-x-1"
            title="Open Coupon Code Offer"
          >
            <FiGift className="w-5 h-5 text-gray-950 animate-bounce" />
            <span className="text-xs tracking-wider uppercase font-extrabold whitespace-nowrap">
              🎁 ₹25 OFF COUPON
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponPopup;
