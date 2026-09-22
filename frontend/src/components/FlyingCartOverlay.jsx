import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FiCheck, FiShoppingCart, FiArrowRight, FiX } from 'react-icons/fi';

export const FlyingCartOverlay = () => {
  const { flyingItems, cartToast, setCartToast } = useCart();

  return (
    <>
      {/* Flying particles container */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        {flyingItems && flyingItems.map(item => (
          <motion.div
            key={item.id}
            initial={{
              left: item.startX - 28,
              top: item.startY - 28,
              scale: 0.85,
              opacity: 1,
              rotate: 0
            }}
            animate={{
              left: [
                item.startX - 28,
                (item.startX * 0.5 + item.targetX * 0.5) - 30,
                item.targetX - 16
              ],
              top: [
                item.startY - 28,
                Math.max(15, Math.min(item.startY, item.targetY) - 80),
                item.targetY - 16
              ],
              scale: [0.9, 1.25, 0.3],
              opacity: [1, 1, 0.75],
              rotate: [0, -12, 360]
            }}
            transition={{
              duration: 1.35,
              times: [0, 0.45, 1],
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed w-14 h-14 rounded-full bg-white shadow-2xl border-2 border-emerald-500 flex items-center justify-center p-1.5 pointer-events-none ring-4 ring-emerald-400/20"
            style={{ willChange: 'left, top, transform' }}
          >
            {item.image ? (
              <img 
                src={item.image} 
                alt="Added item" 
                className="w-full h-full object-contain rounded-full" 
              />
            ) : (
              <FiShoppingCart className="w-6 h-6 text-primary" />
            )}
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              +1
            </span>
          </motion.div>
        ))}
      </div>

      {/* Modern Floating Toast Notification */}
      <AnimatePresence>
        {cartToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[99998] bg-gray-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-gray-700/80 flex items-center gap-3.5 max-w-sm pointer-events-auto"
          >
            {cartToast.image && (
              <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                <img 
                  src={cartToast.image} 
                  alt={cartToast.name} 
                  className="w-full h-full object-contain" 
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-0.5">
                <FiCheck className="w-3.5 h-3.5 stroke-[3px]" />
                <span>Added to Cart!</span>
              </div>
              <div className="text-sm font-extrabold text-white truncate">
                {cartToast.name}
              </div>
              <div className="text-xs text-gray-300 font-medium mt-0.5">
                {cartToast.size && <span className="font-bold text-gray-200">{cartToast.size} • </span>}
                <span className="text-emerald-300 font-extrabold">{cartToast.price}</span>
              </div>
            </div>
            <Link
              to="/cart"
              onClick={() => setCartToast(null)}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shadow-md hover:scale-105 shrink-0"
            >
              <FiShoppingCart className="w-3.5 h-3.5" />
              <span>View Cart</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setCartToast(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors ml-1 cursor-pointer"
              aria-label="Close notification"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FlyingCartOverlay;
