import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiCheckCircle, FiAlertCircle, FiMessageSquare, FiPhone } from 'react-icons/fi';

const AdminSettings = () => {
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('9739230638');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/settings`);
      if (res.data && res.data.success && res.data.settings) {
        if (res.data.settings.owner_whatsapp) {
          setOwnerWhatsApp(res.data.settings.owner_whatsapp);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await axios.put(`${apiUrl}/settings`, {
        owner_whatsapp: ownerWhatsApp
      });

      if (res.data && res.data.success) {
        setSuccessMsg('Owner WhatsApp number saved successfully! New orders will be notified to this number.');
      } else {
        setErrorMsg('Failed to save settings.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMsg('Error saving WhatsApp settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-gray-500">Manage order notification channels and shop owner preferences.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <FiMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">WhatsApp Notifications</h2>
            <p className="text-xs text-gray-500">Configure the primary WhatsApp number where new order receipts are delivered.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Owner WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-bold">
                +91
              </div>
              <input
                type="text"
                value={ownerWhatsApp}
                onChange={(e) => setOwnerWhatsApp(e.target.value)}
                placeholder="9739230638"
                className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              All new orders will instantly trigger an automatic WhatsApp receipt sent to this phone number.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <FiSave />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
