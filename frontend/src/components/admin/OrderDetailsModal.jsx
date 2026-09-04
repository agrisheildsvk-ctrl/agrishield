import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiPackage, FiCreditCard, FiActivity, FiTruck, FiMessageSquare, FiSend, FiExternalLink, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';

const OrderDetailsModal = ({ isOpen, onClose, order, onStatusChange, onResendWhatsApp, onOrderUpdate }) => {
  const [retryingShipment, setRetryingShipment] = useState(false);
  const [cancellingShipment, setCancellingShipment] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [generatingAwb, setGeneratingAwb] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const addr = order?.shipping_address || {};

  // Package Details State
  const [packageWeight, setPackageWeight] = useState(addr.weight || '0.5');
  const [packageLength, setPackageLength] = useState(addr.length || '10');
  const [packageWidth, setPackageWidth] = useState(addr.width || '10');
  const [packageHeight, setPackageHeight] = useState(addr.height || '5');
  const [pickupLocation, setPickupLocation] = useState(addr.pickup_location || 'Shri Veerabhadreshwara Krishi Kendra');

  useEffect(() => {
    if (order && order.shipping_address) {
      const a = order.shipping_address;
      setPackageWeight(String(a.weight || '0.5'));
      setPackageLength(String(a.length || '10'));
      setPackageWidth(String(a.width || a.breadth || '10'));
      setPackageHeight(String(a.height || '5'));
      setPickupLocation(a.pickup_location || 'Shri Veerabhadreshwara Krishi Kendra');
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const items = order.items || [];
  const awb = order.delhivery_awb;
  const shippingStatus = order.shipping_status || (awb ? 'shipment_created' : 'shipping_pending');
  const trackingUrl = order.tracking_url || (awb ? `https://www.delhivery.com/track/package/${awb}` : null);

  const handleGenerateAwb = async () => {
    setValidationError('');
    setRetryMessage('');

    // Validate inputs
    const custName = (addr.fullName || addr.name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim()).trim();
    const phone = String(addr.phone || '').replace(/\D/g, '');
    const pin = String(addr.pin || addr.pincode || '').replace(/\D/g, '');
    const addressStr = addr.address || '';
    const weightVal = parseFloat(packageWeight);
    const lenVal = parseFloat(packageLength);
    const widVal = parseFloat(packageWidth);
    const hgtVal = parseFloat(packageHeight);

    const errors = [];
    if (!custName) errors.push('Customer Name is missing');
    if (!phone || phone.length < 10) errors.push('Valid 10-digit Phone Number is missing');
    if (!addressStr || addressStr.trim().length < 3) errors.push('Delivery Address is missing');
    if (!pin || pin.length !== 6) errors.push('Valid 6-digit Pincode is missing');
    if (isNaN(weightVal) || weightVal <= 0) errors.push('Package Weight must be > 0 kg');
    if (isNaN(lenVal) || lenVal <= 0) errors.push('Package Length must be > 0 cm');
    if (isNaN(widVal) || widVal <= 0) errors.push('Package Width must be > 0 cm');
    if (isNaN(hgtVal) || hgtVal <= 0) errors.push('Package Height must be > 0 cm');
    if (!pickupLocation || pickupLocation.trim() === '') errors.push('Pickup Location is required');

    if (errors.length > 0) {
      setValidationError(errors.join('. '));
      return;
    }

    setGeneratingAwb(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const res = await axios.post(`${apiUrl}/shipping/delhivery/create`, {
        orderId: order.order_id,
        id: order.id,
        weight: weightVal,
        length: lenVal,
        width: widVal,
        height: hgtVal,
        pickup_location: pickupLocation,
        address: addr.address || '',
        address2: addr.address2 || '',
        city: addr.city || '',
        state: addr.state || '',
        pin: addr.pin || addr.pincode || '',
        pincode: addr.pin || addr.pincode || '',
        phone: addr.phone || '',
        firstName: addr.firstName || custName.split(' ')[0] || '',
        lastName: addr.lastName || custName.split(' ').slice(1).join(' ') || '',
        name: custName,
        fullName: custName
      });

      if (res.data.success && res.data.awb) {
        setRetryMessage(`✅ Delhivery Shipment Manifested! AWB: ${res.data.awb}`);
        if (onOrderUpdate) {
          onOrderUpdate(res.data.order || {
            ...order,
            delhivery_awb: res.data.awb,
            shipping_status: 'shipment_created',
            delhivery_status: 'Manifested'
          });
        }
      } else {
        setValidationError('❌ Delhivery Error: ' + (res.data.message || 'Manifestation failed'));
      }
    } catch (err) {
      console.error('Generate AWB error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Server error generating AWB';
      setValidationError('❌ ' + errMsg);
    } finally {
      setGeneratingAwb(false);
    }
  };

  const handleIssueRazorpayRefund = async () => {
    const isConfirmed = window.confirm(`Issue ₹${parseFloat(order.total_amount || 0).toFixed(2)} refund via Razorpay for Order #${order.order_id}?`);
    if (!isConfirmed) return;

    setRefunding(true);
    setRetryMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const res = await axios.post(`${apiUrl}/orders/${order.id}/refund`);
      if (res.data.success) {
        setRetryMessage('✅ Razorpay refund issued successfully!');
        if (onOrderUpdate) onOrderUpdate(res.data.order || { ...order, payment_status: 'Refunded' });
      } else {
        setRetryMessage('❌ Refund failed: ' + (res.data.message || 'Error'));
      }
    } catch (err) {
      console.error('Refund error:', err);
      setRetryMessage('❌ Refund error: ' + (err.response?.data?.message || err.message));
    } finally {
      setRefunding(false);
    }
  };

  const handleCancelDelhiveryShipment = async () => {
    setCancellingShipment(true);
    setRetryMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const res = await axios.post(`${apiUrl}/orders/${order.id}/cancel`);
      if (res.data.success) {
        setRetryMessage('✅ Delhivery cancellation request sent successfully!');
        if (onOrderUpdate) onOrderUpdate(res.data.order || { ...order, status: 'cancelled', shipping_status: 'cancelled', delhivery_status: 'Cancelled by Customer' });
      } else {
        setRetryMessage('❌ Cancellation failed: ' + (res.data.message || 'Error'));
      }
    } catch (err) {
      console.error('Cancel shipment error:', err);
      setRetryMessage('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setCancellingShipment(false);
    }
  };

  const handleRetryShipment = async () => {
    setRetryingShipment(true);
    setRetryMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const res = await axios.post(`${apiUrl}/orders/${order.id}/retry-shipment`);
      if (res.data.success) {
        setRetryMessage('✅ Delhivery shipment created! AWB: ' + res.data.awb);
        if (onOrderUpdate) onOrderUpdate(res.data.order || { ...order, delhivery_awb: res.data.awb, shipping_status: 'shipment_created' });
      } else {
        setRetryMessage('❌ Shipment creation failed: ' + (res.data.message || 'Error'));
      }
    } catch (err) {
      console.error('Retry shipment error:', err);
      setRetryMessage('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setRetryingShipment(false);
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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">Order Details</span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">{order.order_id}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Placed on {new Date(order.created_at).toLocaleString()}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="space-y-8">
                
                {/* Status Update */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiActivity className="text-blue-500" /> Order Status
                  </h3>
                  <div className="flex items-center gap-4">
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* DELHIVERY ONE LOGISTICS SECTION */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-md border border-gray-800">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><FiTruck className="text-emerald-400" /> Delhivery One Logistics</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      awb ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {awb ? 'Ready to Ship' : 'Pending AWB'}
                    </span>
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-700/60">
                      <span className="text-gray-400">AWB Number</span>
                      <span className="font-mono font-extrabold text-emerald-300 text-base">{awb || 'Pending AWB Generation'}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-gray-700/60">
                      <span className="text-gray-400">Shipping Status</span>
                      <span className="font-bold text-gray-200 capitalize">{awb ? 'READY_TO_SHIP' : 'PENDING_AWB'}</span>
                    </div>

                    {order.delhivery_status && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-700/60">
                        <span className="text-gray-400">Delhivery Remark</span>
                        <span className="text-xs text-gray-300 max-w-[200px] text-right truncate">{order.delhivery_status}</span>
                      </div>
                    )}
                  </div>

                  {/* PACKAGE DETAILS FORM (When AWB is NOT generated yet) */}
                  {!awb && (
                    <div className="mt-4 pt-4 border-t border-gray-700/60 space-y-3">
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Package Shipping Specs</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-400 block mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={packageWeight}
                            onChange={(e) => setPackageWeight(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                            placeholder="0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-gray-400 block mb-1">Pickup Warehouse (Delhivery Name)</label>
                          <input
                            type="text"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                            placeholder="Exact Delhivery Warehouse Name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-400 block mb-1">Length (cm)</label>
                          <input
                            type="number"
                            value={packageLength}
                            onChange={(e) => setPackageLength(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs text-center font-semibold focus:outline-none focus:border-emerald-500"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-gray-400 block mb-1">Width (cm)</label>
                          <input
                            type="number"
                            value={packageWidth}
                            onChange={(e) => setPackageWidth(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs text-center font-semibold focus:outline-none focus:border-emerald-500"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-gray-400 block mb-1">Height (cm)</label>
                          <input
                            type="number"
                            value={packageHeight}
                            onChange={(e) => setPackageHeight(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs text-center font-semibold focus:outline-none focus:border-emerald-500"
                            placeholder="5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {validationError && (
                    <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs font-bold text-red-300">
                      {validationError}
                    </div>
                  )}

                  {retryMessage && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-bold text-emerald-300">
                      {retryMessage}
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-2.5">
                    {!awb && (
                      <button
                        onClick={handleGenerateAwb}
                        disabled={generatingAwb}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        <FiRefreshCw className={generatingAwb ? 'animate-spin' : ''} />
                        <span>{generatingAwb ? 'Connecting Delhivery API...' : 'Get AWB'}</span>
                      </button>
                    )}

                    {trackingUrl && (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md"
                      >
                        <FiExternalLink /> Track Shipment on Delhivery
                      </a>
                    )}

                    {awb && (order.status === 'cancelled' || shippingStatus === 'cancelled') && (
                      <button
                        onClick={handleCancelDelhiveryShipment}
                        disabled={cancellingShipment}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md"
                      >
                        <FiX className="text-lg" />
                        <span>{cancellingShipment ? 'Sending Cancellation...' : 'Cancel Shipment on Delhivery One'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* WhatsApp Status */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><FiMessageSquare className="text-green-500" /> WhatsApp Notification</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      order.whatsapp_status === 'sent' ? 'bg-green-100 text-green-800' :
                      order.whatsapp_status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.whatsapp_status === 'sent' ? '✅ Sent' :
                       order.whatsapp_status === 'failed' ? '❌ Failed' : '⏳ Pending'}
                    </span>
                  </h3>
                  {order.whatsapp_error && (
                    <p className="text-xs text-red-600 font-semibold mb-3">Error: {order.whatsapp_error}</p>
                  )}
                  <div className="flex flex-col gap-2.5">
                    {order.whatsapp_url && (
                      <a
                        href={order.whatsapp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                      >
                        <FiMessageSquare /> Open in WhatsApp
                      </a>
                    )}
                    {onResendWhatsApp && (
                      <button
                        onClick={() => onResendWhatsApp(order.id)}
                        className="w-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                      >
                        <FiSend /> Resend WhatsApp Receipt
                      </button>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiMapPin className="text-orange-500" /> Customer Shipping Address
                  </h3>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <p className="font-bold text-gray-900 text-base">
                      {(addr.fullName || addr.name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim()) || 'Valued Customer'}
                    </p>
                    <p>{addr.address}</p>
                    {addr.apartment && <p>{addr.apartment}</p>}
                    <p>{addr.city}, {addr.state} - {addr.pinCode || addr.pin || addr.pincode}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5">
                      <p className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Phone:</span>
                        <a href={`tel:${addr.phone}`} className="text-emerald-700 font-extrabold hover:underline flex items-center gap-1">
                          📞 {addr.phone || 'N/A'}
                        </a>
                      </p>
                      <p><span className="font-semibold text-gray-900">Email:</span> {addr.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Payment Info */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiCreditCard className="text-green-500" /> Payment Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-gray-500">Method</span>
                      <span className={`font-bold px-3 py-1 rounded-full text-xs ${order.payment_method === 'online' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {order.payment_method === 'online' ? 'ONLINE PAYMENT' : 'CASH ON DELIVERY'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-gray-500">Payment Status</span>
                      <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                        String(order.payment_status || '').toLowerCase() === 'captured' || String(order.payment_status || '').toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        String(order.payment_status || '').toLowerCase() === 'authorized' ? 'bg-blue-100 text-blue-800' :
                        String(order.payment_status || '').toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {String(order.payment_status || '').toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    {(order.transaction_id || order.payment_id) && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-xs text-gray-900 break-all">{order.transaction_id || order.payment_id}</span>
                      </div>
                    )}
                    {order.payment_method === 'online' && (order.payment_id || order.razorpay_payment_id || order.transaction_id) && String(order.payment_status).toLowerCase() !== 'refunded' && (
                      <div className="pt-2 pb-3 border-b border-gray-100">
                        <button
                          onClick={handleIssueRazorpayRefund}
                          disabled={refunding}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <FiDollarSign className="text-sm" />
                          <span>{refunding ? 'Processing Refund...' : 'Issue Razorpay Refund'}</span>
                        </button>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-900">₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-semibold text-green-600">-₹{order.discount}</span>
                    </div>
                    {parseFloat(order.cod_fee) > 0 && (
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-gray-500">COD Fee</span>
                        <span className="font-semibold text-gray-900">+₹{order.cod_fee}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900 text-lg">Total</span>
                      <span className="font-extrabold text-primary text-2xl">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiPackage className="text-purple-500" /> Items Ordered ({items.length})
                  </h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{item.product_name}</h4>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>Qty: <span className="font-bold text-gray-900">{item.quantity}</span></span>
                            {item.package_size && (
                              <>
                                <span>•</span>
                                <span>Size: <span className="font-bold text-gray-900">{item.package_size}</span></span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-gray-900">
                          ₹{item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
