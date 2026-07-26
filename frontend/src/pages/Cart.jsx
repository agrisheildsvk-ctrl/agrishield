import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <motion.div 
        className="min-h-[70vh] flex flex-col items-center justify-center bg-bg-shop px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center max-w-lg w-full text-center border border-gray-50">
          <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <FiShoppingBag className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8 font-medium">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/shop" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-3">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-bg-shop font-sans py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/shop" className="text-gray-500 hover:text-primary transition bg-white p-3 rounded-full shadow-sm">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
          <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">{cartItems.length} items</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            {cartItems.map((item, idx) => (
              <motion.div 
                key={`${item.id}-${item.packageSize}`}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {/* Item Image */}
                <div className="w-32 h-32 bg-white rounded-xl flex flex-shrink-0 items-center justify-center overflow-hidden border border-gray-100 p-2">
                   {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                   ) : (
                     <div className="text-gray-400 font-bold text-xs tracking-widest rotate-[-45deg] opacity-50">NO IMAGE</div>
                   )}
                </div>

                {/* Item Details */}
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{item.category}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                  <div className="text-sm text-gray-500 font-medium mb-3">Package Size: <span className="text-gray-800">{item.packageSize === '50' ? '50 ml / 50 gm' : item.packageSize === '100' ? '100 ml / 100 gm' : item.packageSize === '250' ? '200 ml / 250 gm' : '1 L / 1 kg'}</span></div>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="text-xl font-extrabold text-gray-900">{item.price}</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-auto gap-6 sm:gap-4 ml-auto">
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item.id, item.packageSize, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-lg transition shadow-sm"
                    >
                      <FiMinus />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.packageSize, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-lg transition shadow-sm"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id, item.packageSize)}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 text-gray-600 mb-6 font-medium border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST</span>
                  <span className="text-gray-500 text-sm">Included in price</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-3xl font-extrabold text-primary">₹{cartTotal.toFixed(2)}</span>
              </div>

              <Link to="/checkout" className="w-full bg-accent hover:bg-green-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] flex justify-center items-center gap-3">
                Proceed to Checkout <FiArrowLeft className="rotate-180" />
              </Link>
              
              <div className="mt-6 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
                <FiShoppingBag /> Secure Checkout powered by Agrishield
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
