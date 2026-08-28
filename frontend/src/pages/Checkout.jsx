import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiDollarSign, FiSmartphone, FiTrash2, FiLock } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SEO from '../components/SEO';
import { trackBeginCheckout } from '../utils/analytics';

const Checkout = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { cartItems, cartSubtotal, cartTotal, clearCart, removeFromCart } = useCart();
  const baseTotal = cartItems.reduce((total, item) => {
    const priceNum = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    const qty = item.quantity || 1;
    return total + (priceNum * qty);
  }, 0);

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

  useEffect(() => {
    window.scrollTo(0, 0);
    if (cartItems.length > 0) {
      trackBeginCheckout(cartItems, baseTotal);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const names = (user.name || user.fullName || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || names[0] || '',
        lastName: prev.lastName || user.lastName || names.slice(1).join(' ') || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        address: prev.address || user.village || '',
        pin: prev.pin || user.pincode || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (discount > 0 && baseTotal < 1000) {
      setDiscount(0);
      setCouponSuccess('');
      setCouponError('Coupon removed: Minimum purchase of ₹1000 required.');
    }
  }, [baseTotal, discount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const onlyNums = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({ ...formData, phone: onlyNums });
    } else if (name === 'pin') {
      const onlyNums = value.replace(/[^0-9]/g, '').slice(0, 6);
      setFormData({ ...formData, pin: onlyNums });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // If user is NOT logged in, enforce compulsory login before checkout
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-bg-shop px-4 py-12">
        <SEO title="Login Required | Agrishield Checkout" description="Please login to place your order on Agrishield India." />
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
            <FiLock className="w-10 h-10 text-emerald-700" />
          </div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full mb-3 uppercase tracking-wider">
            Login Required
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Login to Place Order</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium">
            To ensure your agricultural product order is processed safely and linked to your farmer profile, please log in or register before checking out.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2 text-base cursor-pointer"
            >
              Log In / Register Now →
            </button>
            <Link
              to="/cart"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-6 rounded-2xl transition-all text-sm"
            >
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const finalTotal = Math.max(0, paymentMethod === 'cod' ? baseTotal + 40 - discount : baseTotal - discount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!/^[0-9]{6}$/.test(formData.pin)) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    const generateOrderData = (paymentId = null) => {
      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      return {
        orderId,
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: cartItems,
        totals: {
          subtotal: baseTotal,
          discount,
          codFee: paymentMethod === 'cod' ? 40 : 0,
          total: finalTotal
        },
        shippingAddress: formData,
        paymentMethod,
        paymentId
      };
    };

    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const saveOrderToDB = async (data) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
        await axios.post(`${apiUrl}/orders`, data, { headers: authHeader });
      } catch (err) {
        console.error('Failed to save order to database:', err);
      }
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';

    if (paymentMethod === 'online') {
      try {
        const createOrderRes = await axios.post(`${apiUrl}/payments/create-order`, {
          amount: finalTotal,
          currency: 'INR',
          receipt: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          notes: {
            phone: formData.phone,
            email: formData.email,
            customerName: `${formData.firstName} ${formData.lastName}`.trim()
          }
        }, { headers: authHeader });

        if (!createOrderRes.data.success) {
          alert('Failed to initialize online payment. Please try again.');
          return;
        }

        const { razorpayOrderId, amount, currency, keyId } = createOrderRes.data;

        const options = {
          key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_THeLChW5klDXa0',
          amount: amount,
          currency: currency,
          name: 'Agrishield',
          description: 'Agricultural Products Purchase',
          order_id: razorpayOrderId,
          handler: async function (response) {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: generateOrderData(response.razorpay_payment_id)
            };

            try {
              const verifyRes = await axios.post(`${apiUrl}/payments/verify`, verifyData, { headers: authHeader });
              if (verifyRes.data.success) {
                clearCart();
                navigate('/order-success', { state: { orderData: verifyRes.data.order || verifyData.orderData } });
              } else {
                alert('Payment verification failed: ' + (verifyRes.data.message || 'Please contact support.'));
              }
            } catch (verErr) {
              console.error('Payment verification error:', verErr);
              alert('Payment verification error. If your account was charged, please contact support.');
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email || '',
            contact: formData.phone || ''
          },
          theme: {
            color: '#16a34a'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('Razorpay payment failed:', response.error);
          alert('Payment failed: ' + (response.error.description || 'Unknown error'));
        });
        rzp.open();
      } catch (err) {
        console.error('Error initiating online payment:', err);
        alert('Could not connect to payment server. Please try again.');
      }
    } else {
      const data = generateOrderData(null);
      try {
        await axios.post(`${apiUrl}/orders`, data, { headers: authHeader });
        clearCart();
        navigate('/order-success', { state: { orderData: data } });
      } catch (err) {
        console.error('Failed to place COD order:', err);
        alert('Failed to place COD order. Please try again.');
      }
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'SVK10') {
      if (baseTotal < 1000) {
        setDiscount(0);
        setCouponError('Coupon SVK10 is available only on purchases of ₹1000 or above.');
        setCouponSuccess('');
      } else {
        setDiscount(25);
        setCouponSuccess('Coupon applied! You saved ₹25.');
        setCouponError('');
      }
    } else if (code === '') {
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
      <SEO
        title="Secure Checkout | Agrishield Shop"
        description="Complete your order for certified agricultural crop protection products with secure Razorpay and cash-on-delivery options."
        canonical="https://agrishield.in/checkout"
      />
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
              <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <span>Contact Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(10 digits)</span>
                    </label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} pattern="[0-9]{10}" maxLength="10" minLength="10" title="Please enter a valid 10-digit phone number" placeholder="10-digit Phone Number (e.g. 9876543210)" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <span>Shipping Address</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Last Name <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Farm Road, Suite 4B" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      PIN Code <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(6 digits)</span>
                    </label>
                    <input required type="text" name="pin" value={formData.pin} onChange={handleInputChange} pattern="[0-9]{6}" maxLength="6" minLength="6" title="Please enter a valid 6-digit PIN code" placeholder="6-digit PIN Code" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-medium" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Payment Method</h2>
                <div className="flex flex-col gap-4">
                  <label className={`flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 mt-1 sm:mt-0 text-primary accent-primary flex-shrink-0" />
                    <div className="flex items-start sm:items-center gap-3 w-full min-w-0">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                        <FiSmartphone className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 flex-1 min-w-0">
                        <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">Pay Online (UPI, Cards)</span>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 self-start sm:self-auto flex-wrap max-w-full">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-3 sm:h-3.5 object-contain flex-shrink-0" />
                          <div className="w-px h-3 bg-gray-200"></div>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-3 sm:h-4 object-contain flex-shrink-0" />
                          <div className="w-px h-3 bg-gray-200"></div>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-2.5 sm:h-3 object-contain flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 mt-1 sm:mt-0 text-primary accent-primary flex-shrink-0" />
                    <div className="flex items-start sm:items-center gap-3 w-full min-w-0">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                        <FiDollarSign className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 flex-1 min-w-0">
                        <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">Cash on Delivery (COD)</span>
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md self-start sm:self-auto">Pay at your doorstep</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Mini Cart Items */}
              <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100 max-h-72 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                    <div className="w-14 h-14 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden p-1.5 shadow-sm">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[8px] font-bold text-gray-400">NO IMG</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">
                        Qty: {item.quantity} • <span className="font-bold text-gray-800">{item.packageSize || '1 kg'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="text-sm font-extrabold text-gray-900">
                        ₹{(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.packageSize)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title="Remove from Order"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code (Min ₹1000)" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full sm:flex-1 min-w-0 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm uppercase font-bold text-gray-800"
                  />
                  <button type="submit" className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm flex-shrink-0 text-center">
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
                  <span key={`sub-${baseTotal}`} className="text-gray-900 transition-all duration-200">₹{baseTotal.toFixed(2)}</span>
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
                    <span className="font-bold">₹40.00</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span key={`tot-${finalTotal}`} className="text-3xl font-extrabold text-primary transition-all duration-200">₹{finalTotal.toFixed(2)}</span>
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
