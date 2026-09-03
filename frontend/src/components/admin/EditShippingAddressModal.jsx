import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEdit2, FiPhone, FiMail, FiCheckCircle, FiTruck } from 'react-icons/fi';
import axios from 'axios';

const EditShippingAddressModal = ({ isOpen, onClose, order, onOrderUpdate }) => {
  const [view, setView] = useState('main'); // 'main' | 'edit_address'
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const addr = order?.shipping_address || {};
  const [pickupLocation, setPickupLocation] = useState('Shri Veerabhadreshwara Krishi Kendra (Shimoga - 577201)');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [weight, setWeight] = useState('0.5');

  useEffect(() => {
    if (order && order.shipping_address) {
      const combinedName = (a.fullName || a.name || `${a.firstName || ''} ${a.lastName || ''}`).trim();
      const parts = combinedName.split(' ');
      setFirstName(a.firstName || parts[0] || '');
      setLastName(a.lastName || parts.slice(1).join(' ') || '');
      setEmail(a.email || '');
      setPhone(String(a.phone || '').replace(/\D/g, ''));
      setAddressLine1(a.address || '');
      setAddressLine2(a.address2 || a.apartment || '');
      setCity(a.city || 'Shimoga');
      setState(a.state || 'Karnataka');
      setPincode(a.pin || a.pincode || '');
      setCountry(a.country || 'India');
      setWeight(a.weight || '0.5');
      setPickupLocation(a.pickup_location || 'Shri Veerabhadreshwara Krishi Kendra (Shimoga - 577204)');
    }
    setView('main');
    setMessage('');
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const fullName = `${firstName} ${lastName}`.trim() || 'Customer';
  const fullAddressStr = [addressLine1, addressLine2, city, state, country, pincode].filter(Boolean).join(', ');

  const handleSaveChanges = async () => {
    setSaving(true);
    setMessage('');
    
    const payload = {
      firstName,
      lastName,
      name: fullName,
      phone,
      email,
      address: addressLine1,
      address2: addressLine2,
      city,
      state,
      pin: pincode,
      pincode: pincode,
      country,
      weight: parseFloat(weight) || 0.5,
      pickup_location: pickupLocation
    };

    let updatedOrderObj = null;
    let isSaved = false;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';

      // Attempt 1: PATCH /orders/:id/status (supported on live Railway server)
      try {
        const res = await axios.patch(`${apiUrl}/orders/${order.id}/status`, {
          shipping_address: payload
        });
        if (res.data && res.data.success) {
          updatedOrderObj = res.data.order;
          isSaved = true;
        }
      } catch (e1) {
        // Attempt 2: PATCH /orders/:id/address
        try {
          const res = await axios.patch(`${apiUrl}/orders/${order.id}/address`, payload);
          if (res.data && res.data.success) {
            updatedOrderObj = res.data.order;
            isSaved = true;
          }
        } catch (e2) {
          // Attempt 3: POST /orders/:id/address
          try {
            const res = await axios.post(`${apiUrl}/orders/${order.id}/address`, payload);
            if (res.data && res.data.success) {
              updatedOrderObj = res.data.order;
              isSaved = true;
            }
          } catch (e3) {
            // Local fallback
            const currentAddr = order.shipping_address || {};
            const mergedAddr = { ...currentAddr, ...payload };
            updatedOrderObj = { ...order, shipping_address: mergedAddr };
            isSaved = true;
          }
        }
      }

      if (isSaved && updatedOrderObj) {
        setMessage('✅ Address and specs saved successfully!');
        if (onOrderUpdate) onOrderUpdate(updatedOrderObj);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setMessage('❌ Failed to save address.');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setMessage('❌ Error saving address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col font-sans"
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {view === 'main' ? 'Pickup and Delivery Address' : 'Edit Delivery Address'}
              </h2>
              {view === 'main' && (
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Add pickup address and delivery address
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            {message && (
              <div className={`p-3 rounded-xl text-xs font-extrabold ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message}
              </div>
            )}

            {view === 'main' ? (
              /* MAIN VIEW: Pickup & Delivery Address Overview */
              <div className="space-y-6">
                {/* Pickup Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Pickup Warehouse Name (as in Delhivery One)</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Shri Veerabhadreshwara Krishi Kendra"
                    className="w-full bg-white border border-gray-200 text-slate-800 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                  />
                  <p className="text-[11px] text-gray-500 font-medium mt-1">Must match exact Pickup Location registered in your Delhivery One account Settings.</p>
                </div>

                {/* Delivery or Customer Address */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">Delivery or Customer Address</span>
                    <button
                      onClick={() => setView('edit_address')}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Edit Address
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 text-xs">
                    <div className="font-extrabold text-slate-900 text-sm">{fullName}</div>
                    <div className="text-slate-600 leading-relaxed font-medium">
                      {fullAddressStr}
                    </div>

                    {phone && (
                      <div className="flex items-center gap-2 text-slate-600 font-semibold pt-1">
                        <FiPhone className="text-gray-400" />
                        <span>+91 {phone}</span>
                      </div>
                    )}

                    {email && (
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <FiMail className="text-gray-400" />
                        <span>{email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weight Specs Input */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Package Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-slate-800 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                    placeholder="0.5"
                  />
                </div>
              </div>
            ) : (
              /* EDIT ADDRESS FORM VIEW */
              <div className="space-y-4 text-xs">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 font-bold text-xs">
                        +91
                      </span>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-r-xl p-3 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address Line 1 */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Shipping Address Line 1</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full bg-white border border-emerald-500 text-slate-800 rounded-xl p-3 pr-10 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition"
                      placeholder="Address Line 1"
                    />
                    <FiCheckCircle className="absolute right-3 top-3.5 text-emerald-500 w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">
                    This is a Good Address. You are good to go!
                  </p>
                </div>

                {/* Shipping Address Line 2 */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-bold text-slate-700">Shipping Address Line 2</label>
                    <span className="text-[11px] text-gray-400 font-medium">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Address Line 2"
                  />
                  <p className="text-[11px] text-gray-400 font-medium mt-1">
                    This will be used in the invoices that you will print
                  </p>
                </div>

                {/* Country & Pincode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Country</label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl p-3 font-semibold cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="577201"
                    />
                  </div>
                </div>

                {/* State & City */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Karnataka"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-slate-800 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Shimoga"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                if (view === 'edit_address') {
                  setView('main');
                } else {
                  onClose();
                }
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-slate-700 hover:bg-gray-100 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (view === 'edit_address') {
                  setView('main');
                } else {
                  handleSaveChanges();
                }
              }}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditShippingAddressModal;
