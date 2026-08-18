import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SEO from '../components/SEO';
import BoughtProductsList from '../components/BoughtProductsList';
import { 
  FaGoogle, 
  FaPhoneAlt, 
  FaUser, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaArrowRight, 
  FaShieldAlt, 
  FaSeedling,
  FaTractor,
  FaTimes
} from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated, login, logout } = useAuth();

  // Redirect destination after login
  const from = location.state?.from?.pathname || '/';

  const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';

  // State machine: 'select' -> 'otp' -> 'register_phone' -> 'register_google'
  const [step, setStep] = useState('select');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');

  // Minimal form data for new user registration
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    googleId: '',
    profileImage: '',
    village: '',
    pincode: ''
  });

  // Demo Google Sign-In helper (works with or without live VITE_GOOGLE_CLIENT_ID)
  const [showDemoGoogleModal, setShowDemoGoogleModal] = useState(false);
  const [demoGoogleEmail, setDemoGoogleEmail] = useState('rajesh.farmer@agrishield.in');
  const [demoGoogleName, setDemoGoogleName] = useState('Rajesh Kumar');

  // Handle Google Sign-In
  const handleGoogleAuth = async (googleData) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${apiUrl}/auth/google`, googleData);
      if (res.data.success) {
        if (!res.data.isNewUser) {
          // Existing farmer -> automatic login
          login(res.data.token, res.data.user);
          navigate(from, { replace: true });
        } else {
          // New farmer -> Ask ONLY for missing information (Phone, Village, Pincode)
          const gd = res.data.googleData;
          const names = gd.name ? gd.name.split(' ') : ['Farmer', ''];
          setFormData({
            firstName: names[0] || 'Farmer',
            lastName: names.slice(1).join(' ') || '',
            phone: '',
            email: gd.email || '',
            googleId: gd.googleId || 'g_' + Date.now(),
            profileImage: gd.picture || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
            village: '',
            pincode: ''
          });
          setStep('register_google');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Send Mobile OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.post(`${apiUrl}/auth/send-otp`, { phone });
      if (res.data.success) {
        setStep('otp');
        setSuccessMsg(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Mobile OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${apiUrl}/auth/verify-otp`, { phone, otp });
      if (res.data.success) {
        if (!res.data.isNewUser) {
          // Existing farmer -> auto login! No registration form, No password!
          login(res.data.token, res.data.user);
          navigate(from, { replace: true });
        } else {
          // New farmer -> Show only: First Name, Last Name, Village, Pincode, Phone (read only)
          setFormData(prev => ({
            ...prev,
            phone: res.data.phone || phone.replace(/\D/g, ''),
            firstName: '',
            lastName: '',
            village: '',
            pincode: ''
          }));
          setStep('register_phone');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Complete Minimal Registration & Auto Login
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.village.trim() || !formData.pincode.trim()) {
      setError('Please fill in your Name, Village, and Pincode');
      return;
    }
    if (!formData.phone && !formData.googleId && !formData.email) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${apiUrl}/auth/register`, formData);
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If customer is already logged in, show their account dashboard & bought products list
  if (isAuthenticated && user) {
    const farmerName = user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Farmer';
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-emerald-50 via-white to-emerald-50 py-10 px-4">
        <SEO
          title={`${farmerName}'s Account & Bought Products | Agrishield`}
          description="View your farmer profile, order history, and re-order previously bought agricultural protection products."
          canonical="https://agrishield.in/login"
        />
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md p-1 border-2 border-white overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl font-extrabold shadow-inner">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={farmerName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{farmerName.charAt(0)}</span>
                )}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-1">
                  <FaSeedling /> Verified Farmer Account
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold">{farmerName}</h1>
                <p className="text-emerald-100 text-sm mt-0.5">
                  {user.phone ? `+91 ${user.phone}` : user.email} {user.village ? `• ${user.village}` : ''} {user.pincode ? `(${user.pincode})` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 sm:flex-initial px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaUser /> Edit Profile
              </button>
              <button
                onClick={logout}
                className="flex-1 sm:flex-initial px-5 py-3 bg-red-500/80 hover:bg-red-600 text-white font-bold rounded-2xl text-sm transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Already Bought Products & Orders Component */}
          <BoughtProductsList showTitle={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8">
      <SEO
        title="Farmer Login & Account | Agrishield India"
        description="Log in to your Agrishield farmer account using phone OTP or Google to manage agricultural crop protection orders and advisory."
        canonical="https://agrishield.in/login"
      />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-8 text-center text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 text-8xl">
            <FaTractor />
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl mb-3 shadow-inner">
            <FaSeedling className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome to Agrishield</h1>
          <p className="text-emerald-100 text-sm mt-1 font-medium">
            Farmer-Friendly Passwordless Login • Safe & Secure
          </p>
        </div>

        {/* Body Section */}
        <div className="p-6 sm:p-8">
          
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <FaTimes />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
              <FaCheckCircle className="text-emerald-600 text-lg flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 0/1: CHOOSE GOOGLE OR MOBILE OTP */}
          {step === 'select' && (
            <div className="space-y-6">
              {/* 1. Continue with Google Button (Recommended) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowDemoGoogleModal(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-2xl border-2 border-gray-200 shadow-sm transition-all text-base sm:text-lg active:scale-98 cursor-pointer"
                >
                  <FaGoogle className="text-red-500 text-xl" />
                  <span>Continue with Google</span>
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                    Recommended
                  </span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs uppercase font-bold tracking-widest text-gray-400">
                  OR
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* 2. Continue with Phone Number (OTP) */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Enter Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
                      <FaPhoneAlt className="text-lg" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-12 pr-4 py-4 text-xl font-bold tracking-wider text-gray-800 border-2 border-emerald-200 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-base"
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                  <FaArrowRight />
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                <FaShieldAlt className="text-emerald-600" />
                <span>No password required. Secure 30-day instant session.</span>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY 6-DIGIT OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  We sent a 6-digit verification code to
                </p>
                <p className="font-extrabold text-gray-900 text-lg mt-1">
                  +91 {phone}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('select');
                    setError('');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:underline mt-1 inline-block"
                >
                  Change Mobile Number
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center py-4 text-3xl font-extrabold tracking-[0.4em] text-emerald-800 border-2 border-emerald-300 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                <FaCheckCircle />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-sm font-bold text-gray-600 hover:text-emerald-700 underline"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3A: NEW USER PHONE REGISTRATION (MINIMAL TYPING) */}
          {step === 'register_phone' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="text-center mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full mb-2">
                  ONE-TIME FARMER REGISTRATION
                </span>
                <p className="text-sm text-gray-600">
                  Please confirm your details for faster delivery to your village.
                </p>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First Name"
                      className="w-full pl-9 pr-3 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="w-full px-3 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Village / Place */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Village / Place <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Enter your Village or Town name"
                    className="w-full pl-9 pr-3 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="6-digit postal pincode"
                    className="w-full pl-9 pr-3 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Phone Number (Read-Only) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Verified Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-700">
                    <FaPhoneAlt />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={`+91 ${formData.phone}`}
                    className="w-full pl-9 pr-3 py-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{loading ? 'Saving & Logging in...' : 'Save & Login'}</span>
                <FaCheckCircle />
              </button>
            </form>
          )}

          {/* STEP 3B: NEW USER GOOGLE REGISTRATION (ASK ONLY FOR MISSING INFO) */}
          {step === 'register_google' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="text-center mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full mb-2">
                  GOOGLE ACCOUNT CONNECTED
                </span>
                <p className="text-sm text-gray-600">
                  We retrieved your name (<b>{formData.firstName} {formData.lastName}</b>) and email.
                  Please provide your contact number and village.
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <FaPhoneAlt />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-semibold"
                    autoFocus
                  />
                </div>
              </div>

              {/* Village / Place */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Village / Place <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Your Village or Town"
                    className="w-full pl-9 pr-3 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="6-digit postal pincode"
                    className="w-full pl-9 pr-3 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || formData.phone.length < 10}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{loading ? 'Creating Account...' : 'Save & Login'}</span>
                <FaCheckCircle />
              </button>
            </form>
          )}

        </div>
      </div>

      {/* DEMO GOOGLE SIGN-IN MODAL FOR EASY TESTING */}
      {showDemoGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-emerald-100 text-center relative">
            <button
              type="button"
              onClick={() => setShowDemoGoogleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-lg" />
            </button>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaGoogle className="text-red-600 text-3xl" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">Google Farmer Sign-In</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Simulating Google OAuth verification (pre-fills Name, Email & Photo automatically)
            </p>

            <div className="text-left space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  value={demoGoogleName}
                  onChange={(e) => setDemoGoogleName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Google Email Address</label>
                <input
                  type="email"
                  value={demoGoogleEmail}
                  onChange={(e) => setDemoGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDemoGoogleModal(false);
                handleGoogleAuth({
                  email: demoGoogleEmail,
                  name: demoGoogleName,
                  picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                  googleId: 'google_farmer_' + demoGoogleEmail.replace(/\W/g, '_')
                });
              }}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all text-base"
            >
              Confirm & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
