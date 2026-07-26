import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaSignOutAlt, 
  FaCheckCircle, 
  FaSave, 
  FaSeedling,
  FaCamera
} from 'react-icons/fa';

const Profile = () => {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    village: '',
    pincode: '',
    profileImage: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
      phone: user.phone || '',
      email: user.email || '',
      village: user.village || '',
      pincode: user.pincode || '',
      profileImage: user.profileImage || ''
    });
  }, [user, token, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.put(`${apiUrl}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess('Your farmer profile was updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-emerald-50 via-white to-emerald-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md p-1 shadow-inner overflow-hidden border-2 border-white">
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt={formData.name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-800 rounded-full flex items-center justify-center text-3xl font-bold">
                    {formData.name.charAt(0) || 'F'}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-md text-xs">
                <FaCamera />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-2">
                <FaSeedling /> Verified Farmer Account
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{formData.name || 'Farmer Profile'}</h1>
              <p className="text-emerald-100 text-sm mt-0.5">
                {formData.phone ? `+91 ${formData.phone}` : formData.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 font-medium">
              <FaCheckCircle className="text-emerald-600 text-lg flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Farmer Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Farmer Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
                  <FaUser className="text-lg" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3.5 text-base font-semibold text-gray-800 border-2 border-emerald-200 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
                  <FaPhoneAlt className="text-lg" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10-digit mobile number"
                  className="w-full pl-12 pr-4 py-3.5 text-base font-semibold text-gray-800 border-2 border-emerald-200 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
                  <FaEnvelope className="text-lg" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="farmer@example.com"
                  className="w-full pl-12 pr-4 py-3.5 text-base font-semibold text-gray-800 border-2 border-emerald-200 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Village / Place */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Village / Place
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="Your Village or Town name"
                  className="w-full pl-12 pr-4 py-3.5 text-base font-semibold text-gray-800 border-2 border-emerald-200 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pincode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="6-digit postal pincode"
                  className="w-full pl-12 pr-4 py-3.5 text-base font-semibold text-gray-800 border-2 border-emerald-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <FaSave />
              <span>{loading ? 'Saving Profile...' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto py-4 px-6 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-lg rounded-2xl border border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
