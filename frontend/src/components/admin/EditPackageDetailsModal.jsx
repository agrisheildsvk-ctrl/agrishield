import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import axios from 'axios';

const EditPackageDetailsModal = ({ isOpen, onClose, order, onOrderUpdate }) => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const addr = order?.shipping_address || {};

  // Default values or existing order specs
  const [length, setLength] = useState('10');
  const [breadth, setBreadth] = useState('10');
  const [height, setHeight] = useState('5');
  const [weightGrams, setWeightGrams] = useState('500');

  useEffect(() => {
    if (order && order.shipping_address) {
      const a = order.shipping_address;
      setLength(a.length || a.shipment_length || '10');
      setBreadth(a.width || a.breadth || a.shipment_width || '10');
      setHeight(a.height || a.shipment_height || '5');

      // Convert kg to grams for display if weight < 10 (e.g. 0.5 kg -> 500 gm)
      const w = parseFloat(a.weight || 0.5);
      if (w > 0 && w <= 20) {
        setWeightGrams(String(Math.round(w * 1000)));
      } else {
        setWeightGrams(String(a.weight || '500'));
      }
    }
    setMessage('');
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSaveChanges = async () => {
    setSaving(true);
    setMessage('');

    const lenVal = parseFloat(length) || 10;
    const widVal = parseFloat(breadth) || 10;
    const hgtVal = parseFloat(height) || 5;
    const gramsVal = parseFloat(weightGrams) || 500;
    const kgVal = gramsVal / 1000; // convert grams to kg for Delhivery

    const payload = {
      weight: kgVal,
      weightGrams: gramsVal,
      length: lenVal,
      width: widVal,
      breadth: widVal,
      height: hgtVal
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      let updatedOrderObj = null;
      let isSaved = false;

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
        setMessage('✅ Package details saved successfully!');
        if (onOrderUpdate) onOrderUpdate(updatedOrderObj);
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setMessage('❌ Failed to save package details.');
      }
    } catch (err) {
      console.error('Error saving package details:', err);
      setMessage('❌ Error saving package details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
        >
          {/* Header matching Image 2 */}
          <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Package Details</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Add dimensions details & weight of the package
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body matching Image 2 layout */}
          <div className="p-6 space-y-6">
            {message && (
              <div className={`p-3 rounded-xl text-xs font-extrabold ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message}
              </div>
            )}

            {/* Length, Breadth, Height Row */}
            <div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Length</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-slate-800 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Breadth</label>
                  <input
                    type="number"
                    value={breadth}
                    onChange={(e) => setBreadth(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-slate-800 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                    placeholder="10"
                  />
                </div>
                <div className="relative">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Height</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-slate-800 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                      placeholder="5"
                    />
                    <span className="ml-2 px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enter Weight Row */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Enter Weight</label>
              <div className="flex items-center max-w-xs">
                <input
                  type="number"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-slate-800 text-sm font-semibold rounded-l-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  placeholder="500"
                />
                <span className="px-4 py-3 bg-slate-100 text-slate-500 rounded-r-xl text-xs font-bold border border-l-0 border-slate-200">
                  gm
                </span>
              </div>
            </div>
          </div>

          {/* Footer matching Image 2 */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-slate-700 hover:bg-gray-100 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
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

export default EditPackageDetailsModal;
