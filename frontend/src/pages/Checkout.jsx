import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiDollarSign, FiSmartphone } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // If cart is empty and not ordered, redirect to shop
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-bg-shop px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <Link to="/shop" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2">
          <FiArrowLeft /> Return to Shop
        </Link>
      </div>
    );
  }

  const finalTotal = paymentMethod === 'cod' ? cartTotal + 80 - discount : cartTotal - discount;

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    const generateOrderData = (paymentId = null) => {
      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      return {
        orderId,
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: cartItems,
        totals: {
          subtotal: cartTotal,
          discount,
          codFee: paymentMethod === 'cod' ? 80 : 0,
          total: finalTotal
        },
        shippingAddress: formData,
        paymentMethod,
        paymentId
      };
    };

    const saveOrderToDB = async (data) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        await axios.post(`${apiUrl}/orders`, data);
      } catch (err) {
        console.error('Failed to save order to database:', err);
      }
    };

    if (paymentMethod === 'online') {
      const options = {
        key: 'rzp_live_THeLChW5klDXa0',
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'Agrishield',
        description: 'Agricultural Products Purchase',
        handler: async function (response) {
          const data = generateOrderData(response.razorpay_payment_id);
          await saveOrderToDB(data);
          clearCart();
          navigate('/order-success', { state: { orderData: data } });
        },
        theme: {
          color: '#16a34a'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } else {
      const data = generateOrderData(null);
      saveOrderToDB(data).then(() => {
        clearCart();
        navigate('/order-success', { state: { orderData: data } });
      });
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SVK10') {
      setDiscount(25);
      setCouponSuccess('Coupon applied! You saved ₹25.');
      setCouponError('');
    } else if (couponCode.trim() === '') {
      setCouponError('Please enter a coupon code.');
      setCouponSuccess('');
    } else {
      setDiscount(0);
      setCouponError('Invalid coupon code.');
      setCouponSuccess('');
    }
  };


  return (
    <motion.div 
      className="min-h-screen bg-bg-shop font-sans py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="text-gray-500 hover:text-primary transition bg-white p-3 rounded-full shadow-sm">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Forms */}
          <div className="lg:w-2/3">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-8">
              
              {/* Contact Info */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Farm Road, Suite 4B" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code</label>
                    <input required type="text" name="pin" value={formData.pin} onChange={handleInputChange} placeholder="PIN Code" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Payment Method</h2>
                <div className="flex flex-col gap-4">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 text-primary accent-primary flex-shrink-0" />
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm flex-shrink-0"><FiSmartphone /></div>
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-bold text-gray-900">Pay Online (UPI, Cards)</span>
                        <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded shadow-sm border border-gray-100">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-3 sm:h-3.5 object-contain" />
                          <div className="w-px h-3 bg-gray-200"></div>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-3 sm:h-4 object-contain" />
                          <div className="w-px h-3 bg-gray-200"></div>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-2.5 sm:h-3 object-contain" />
                        </div>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-primary accent-primary flex-shrink-0" />
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm flex-shrink-0"><FiDollarSign /></div>
                      <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                    </div>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Mini Cart Items */}
              <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                       <span className="text-[8px] font-bold text-gray-400 rotate-[-45deg]">IMG</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <div className="text-xs text-gray-500">Qty: {item.quantity} • {item.packageSize === '50' ? '50ml' : item.packageSize === '1000' ? '1kg' : item.packageSize === '5000' ? '5kg' : 'Pack'}</div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">₹{(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm uppercase font-bold text-gray-800"
                  />
                  <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm">
                    Apply
                  </button>
                </form>
                {couponError && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{couponError}</p>}
                {couponSuccess && <p className="text-green-600 text-xs font-bold mt-2 ml-1">{couponSuccess}</p>}
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-4 text-gray-600 mb-6 font-medium border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Discount ({couponCode.toUpperCase()})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-orange-600">
                    <span>Cash on Delivery Fee</span>
                    <span className="font-bold">₹80.00</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-3xl font-extrabold text-primary">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                className="w-full bg-accent hover:bg-green-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] flex justify-center items-center gap-3"
              >
                Place Order <FiCheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
