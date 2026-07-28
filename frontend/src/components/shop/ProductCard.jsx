import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0] || {
    size: product.packageSize || '1 kg',
    price: product.price || '₹400',
    originalPrice: product.originalPrice || '₹680',
    discount: product.discount || 41
  };
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({ 
      ...product, 
      packageSize: selectedVariant.size, 
      price: selectedVariant.price, 
      originalPrice: selectedVariant.originalPrice, 
      discount: selectedVariant.discount 
    });
    navigate('/cart');
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart({ 
      ...product, 
      packageSize: selectedVariant.size, 
      price: selectedVariant.price, 
      originalPrice: selectedVariant.originalPrice, 
      discount: selectedVariant.discount 
    });
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
              alt={product.seoAlt || `${product.name} - Agrishield Organic Crop Protection India`}
              title={product.seoTitle || `${product.name} | Agrishield India Agriculture Store`}
              width="400"
              height="400"
              loading="lazy"
              decoding="async"
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
        
        {/* Ratings & Reviews */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md text-xs font-bold border border-yellow-200/80 shadow-2xs">
            <span>{product.rating || '4.5'}</span>
            <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
          </div>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-500">
            ({product.reviews || 0} reviews)
          </span>
        </div>

        {/* Short description to eliminate empty space */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed font-normal">
          {product.description || product.technicalContent || '100% Organic, eco-friendly protection safe for crops, animals, and soil.'}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex flex-col gap-1 mb-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Package Size</label>
            <div className="relative">
              {product.variants && product.variants.length > 0 ? (
                <select 
                  value={selectedVariant.size}
                  onChange={(e) => {
                    e.stopPropagation();
                    const found = product.variants.find(v => v.size === e.target.value);
                    if (found) setSelectedVariant(found);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 pr-8 cursor-pointer transition"
                >
                  {product.variants.map((v, i) => (
                    <option key={i} value={v.size}>
                      {v.size} — {v.price}
                    </option>
                  ))}
                </select>
              ) : (
                <select 
                  value={selectedVariant.size}
                  onChange={(e) => setSelectedVariant({ ...selectedVariant, size: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 pr-8 cursor-pointer transition"
                >
                  <option value={product.packageSize || '1 kg'}>{product.packageSize || '1 kg'}</option>
                </select>
              )}
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
                  {selectedVariant.price}
                </div>
                {selectedVariant.originalPrice && (
                  <div className="text-sm text-gray-400 line-through mb-0.5">
                    MRP {selectedVariant.originalPrice}
                  </div>
                )}
              </div>
            </div>
            {selectedVariant.discount && (
              <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                Save {selectedVariant.discount}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-white border border-primary text-primary hover:bg-green-50 font-bold py-2.5 px-2 rounded-xl shadow-sm transition flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm" 
              aria-label="Add to Cart"
            >
              <FiShoppingCart className="w-4 h-4" /> <span>Cart</span>
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-accent hover:bg-green-500 text-white font-bold py-2.5 px-2 rounded-xl shadow-md transition text-xs sm:text-sm" 
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
