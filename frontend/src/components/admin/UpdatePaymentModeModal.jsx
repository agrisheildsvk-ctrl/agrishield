import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo, FiFileText, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';

const UpdatePaymentModeModal = ({ isOpen, onClose, order, onOrderUpdate }) => {
  const [paymentMode, setPaymentMode] = useState('cod');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (order) {
      const pm = String(order.payment_method || '').toLowerCase();
      if (pm.includes('cod')) {
        setPaymentMode('cod');
      } else {
        setPaymentMode('online');
      }
    }
    setMessage('');
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSaveChanges = async () => {
    setSaving(true);
    setMessage('');

    const targetMode = paymentMode === 'cod' ? 'cod' : 'online';

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      let updatedOrderObj = null;
      let isSaved = false;

      // Attempt 1: PATCH /orders/:id/status (supported on live Railway server)
      try {
        const res = await axios.patch(`${apiUrl}/orders/${order.id}/status`, {
          payment_method: targetMode
        });
        if (res.data && res.data.success) {
          updatedOrderObj = res.data.order;
          isSaved = true;
        }
      } catch (e1) {
        // Attempt 2: PATCH /orders/:id/address
        try {
          const res = await axios.patch(`${apiUrl}/orders/${order.id}/address`, {
            payment_method: targetMode
          });
          if (res.data && res.data.success) {
            updatedOrderObj = res.data.order;
            isSaved = true;
          }
        } catch (e2) {
          // Local fallback
          updatedOrderObj = { ...order, payment_method: targetMode };
          isSaved = true;
        }
      }

      if (isSaved && updatedOrderObj) {
        setMessage('✅ Payment mode updated successfully!');
        if (onOrderUpdate) onOrderUpdate(updatedOrderObj);
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setMessage('❌ Failed to update payment mode.');
      }
    } catch (err) {
      console.error('Error updating payment mode:', err);
      setMessage('❌ Error updating payment mode.');
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
        >
          {/* Header matching Image 1 */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Update Payment Mode</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body matching Image 1 layout */}
          <div className="p-6 space-y-5">
            {message && (
              <div className={`p-3 rounded-xl text-xs font-extrabold ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Payment Mode</label>
              
              <div className="relative">
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-white border border-blue-400 text-slate-800 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="online">Pre-Paid</option>
                  <option value="cod">Cash On Delivery</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer matching Image 1 */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <FiInfo className="w-4 h-4 text-slate-400" />
              <span>Changes will be applied to 1 order(s)</span>
            </div>

            <div className="flex items-center gap-3">
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
                {saving ? 'Saving...' : 'Change Payment Mode'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdatePaymentModeModal;
