import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const [selectedPackage, setSelectedPackage] = useState(product.packageSize || '50');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({ ...product, packageSize: product.packageSize || selectedPackage });
    navigate('/cart');
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart({ ...product, packageSize: product.packageSize || selectedPackage });
    navigate('/checkout');
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-shadow duration-300 border border-gray-100 overflow-hidden relative group flex flex-col h-full"
      whileHover={{ y: -8 }}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.discount && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
            BEST SELLER
          </span>
        )}
      </div>

      {/* Image Container with Zoom Effect */}
      <div 
        className="relative h-64 bg-gray-50 overflow-hidden flex items-center justify-center p-6 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
      >
        <motion.div 
          className="w-full h-full bg-white rounded-xl relative overflow-hidden flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain p-2 transition-transform duration-300"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-gray-400 font-medium tracking-wider text-sm">NO IMAGE</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Hover Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5 pointer-events-none">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            className="pointer-events-auto bg-white p-3 rounded-full shadow-lg text-gray-700 hover:text-primary hover:bg-green-50 transition transform hover:scale-110" 
            aria-label="Quick View"
          >
            <FiEye className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="pointer-events-auto bg-white p-3 rounded-full shadow-lg text-gray-700 hover:text-red-500 hover:bg-red-50 transition transform hover:scale-110" aria-label="Add to Wishlist">
            <FiHeart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
          {product.category}
        </span>
        <h3 
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
        >
          {product.name}
        </h3>
        
        {/* Ratings */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <FiStar 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex flex-col gap-1 mb-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Package Size</label>
            <div className="relative">
              <select 
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 pr-8 cursor-pointer transition"
              >
                {product.packageSize && <option value={product.packageSize}>{product.packageSize}</option>}
                <option value="50">50 ml / 50 gm</option>
                <option value="100">100 ml / 100 gm</option>
                <option value="250">200 ml / 250 gm</option>
                <option value="500 ml">500 ml / 500 gm</option>
                <option value="1000">1 L / 1 kg</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">PRICE (Incl GST)</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-extrabold text-gray-900 leading-none">
                  {product.price}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-gray-400 line-through mb-0.5">
                    MRP {product.originalPrice}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-white border border-primary text-primary hover:bg-green-50 font-bold py-2.5 px-2 rounded-xl shadow-sm transition flex items-center justify-center gap-1 sm:gap-2" 
              aria-label="Add to Cart"
            >
              <FiShoppingCart className="w-4 h-4" /> <span className="hidden sm:inline">Cart</span>
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-accent hover:bg-green-500 text-white font-bold py-2.5 px-2 rounded-xl shadow-md transition animate-blink text-sm sm:text-base" 
              aria-label="Buy Now"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
