import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiDownload, FiArrowRight, FiFileText, FiTruck, FiRefreshCw, FiExternalLink, FiPackage } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { trackPurchase } from '../utils/analytics';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!location.state || !location.state.orderData) {
      navigate('/shop');
    } else {
      const data = location.state.orderData;
      setOrderData(data);
      const orderId = data.orderId || data.order_id || data.id;
      if (orderId) {
        const trackedKey = `agrishield_tracked_${orderId}`;
        if (!sessionStorage.getItem(trackedKey)) {
          sessionStorage.setItem(trackedKey, 'true');
          trackPurchase(data);
        }
        fetchLiveTracking(orderId);
      } else {
        trackPurchase(data);
      }
    }
  }, [location, navigate]);

  const fetchLiveTracking = async (idToQuery) => {
    const targetId = idToQuery || orderData?.orderId || orderData?.order_id || orderData?.id;
    if (!targetId) return;

    setLoadingTracking(true);
    setTrackingError('');
    try {
      const res = await axios.get(`${apiUrl}/orders/${targetId}/tracking`);
      if (res.data.success) {
        setTrackingInfo(res.data);
      } else {
        setTrackingError(res.data.message || 'Tracking information not available yet.');
      }
    } catch (err) {
      console.log('Live tracking fetch notice:', err.message);
      // Fail silently for newly placed orders before tracking updates
    } finally {
      setLoadingTracking(false);
    }
  };

  if (!orderData) {
    return null;
  }

  const orderId = orderData.orderId || orderData.order_id || 'N/A';
  const date = orderData.date || (orderData.created_at ? new Date(orderData.created_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));
  const items = orderData.items || [];
  
  // Safe extraction of totals
  const subtotal = orderData.totals?.subtotal ?? (parseFloat(orderData.subtotal) || 0);
  const discount = orderData.totals?.discount ?? (parseFloat(orderData.discount) || 0);
  const codFee = orderData.totals?.codFee ?? (parseFloat(orderData.cod_fee) || 0);
  const total = orderData.totals?.total ?? (parseFloat(orderData.total_amount) || 0);

  const shippingAddress = orderData.shippingAddress || orderData.shipping_address || {};
  const paymentMethod = orderData.paymentMethod || orderData.payment_method || 'online';
  const paymentId = orderData.paymentId || orderData.payment_id || orderData.razorpay_payment_id || null;
  const paymentStatus = orderData.payment_status || (paymentMethod === 'online' ? 'Captured' : 'Pending');

  // Delhivery shipping details
  const awbNumber = trackingInfo?.order?.delhiveryAwb || orderData.delhivery_awb || trackingInfo?.tracking?.awb || null;
  const rawShippingStatus = trackingInfo?.order?.shippingStatus || orderData.shipping_status || 'shipment_created';
  const delhiveryStatus = trackingInfo?.order?.delhiveryStatus || orderData.delhivery_status || 'Manifested';
  const trackingUrl = trackingInfo?.order?.trackingUrl || orderData.tracking_url || (awbNumber ? `https://www.delhivery.com/track/package/${awbNumber}` : null);

  // Determine current active step index in visual tracking timeline
  // Steps: Order Confirmed (0) -> Payment Confirmed (1) -> Shipment Created (2) -> Picked Up (3) -> In Transit (4) -> Out for Delivery (5) -> Delivered (6)
  let activeStep = 0; // Order Confirmed
  if (paymentMethod === 'online' || String(paymentStatus).toLowerCase() === 'captured' || String(paymentStatus).toLowerCase() === 'paid') {
    activeStep = 1; // Payment Confirmed
  }
  if (awbNumber || ['shipment_created', 'pickup_scheduled', 'in_transit', 'out_for_delivery', 'delivered'].includes(rawShippingStatus)) {
    activeStep = Math.max(activeStep, 2); // Shipment Created
  }
  if (['pickup_scheduled', 'in_transit', 'out_for_delivery', 'delivered'].includes(rawShippingStatus)) {
    activeStep = Math.max(activeStep, 3); // Picked Up
  }
  if (['in_transit', 'out_for_delivery', 'delivered'].includes(rawShippingStatus)) {
    activeStep = Math.max(activeStep, 4); // In Transit
  }
  if (['out_for_delivery', 'delivered'].includes(rawShippingStatus)) {
    activeStep = Math.max(activeStep, 5); // Out for Delivery
  }
  if (rawShippingStatus === 'delivered') {
    activeStep = 6; // Delivered
  }

  const trackingSteps = [
    { label: 'Order Confirmed', step: 0 },
    { label: 'Payment Confirmed', step: 1 },
    { label: 'Shipment Created', step: 2 },
    { label: 'Picked Up', step: 3 },
    { label: 'In Transit', step: 4 },
    { label: 'Out for Delivery', step: 5 },
    { label: 'Delivered', step: 6 }
  ];

  const generateInvoice = () => {
    const doc = new jsPDF();
    const primaryColor = [22, 163, 74];

    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('Agrishield', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Tax Invoice / Receipt', 14, 30);

    doc.setFontSize(10);
    doc.text('Agrishield Private Limited', 196, 22, { align: 'right' });
    doc.text('123 Farming Avenue', 196, 28, { align: 'right' });
    doc.text('contact@agrishield.com', 196, 34, { align: 'right' });

    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text('Order Details', 14, 50);
    
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderId}`, 14, 58);
    doc.text(`Date: ${date}`, 14, 64);
    doc.text(`Payment Method: ${paymentMethod === 'online' ? 'Online Payment (Captured)' : 'Cash on Delivery'}`, 14, 70);
    if (paymentMethod === 'online' && paymentId) {
      doc.text(`Transaction ID: ${paymentId}`, 14, 76);
    }
    if (awbNumber) {
      doc.text(`Delhivery AWB: ${awbNumber}`, 14, 82);
    }

    doc.setFontSize(12);
    doc.text('Bill To / Ship To:', 120, 50);
    doc.setFontSize(10);
    doc.text(`${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Customer', 120, 58);
    doc.text(shippingAddress.address || '', 120, 64);
    doc.text(`${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pin || shippingAddress.pincode || ''}`, 120, 70);
    doc.text(`Phone: ${shippingAddress.phone || ''}`, 120, 76);
    doc.text(`Email: ${shippingAddress.email || ''}`, 120, 82);

    const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
    const tableRows = [];

    items.forEach(item => {
      const priceVal = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
      const unitPrice = priceVal;
      const qty = item.quantity || 1;
      const itemTotal = unitPrice * qty;
      const sizeStr = item.packageSize || item.package_size || '1 kg';
      const itemData = [
        `${item.name || item.product_name} (${sizeStr})`,
        `Rs. ${unitPrice.toFixed(2)}`,
        qty.toString(),
        `Rs. ${itemTotal.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      startY: 95,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'right' },
      }
    });

    const finalY = doc.lastAutoTable.finalY || 95;

    doc.setFontSize(10);
    doc.setTextColor(50);
    const textX = 140;
    const valueX = 196;
    let currentY = finalY + 15;

    doc.text('Subtotal:', textX, currentY);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, valueX, currentY, { align: 'right' });
    currentY += 8;

    if (discount > 0) {
      doc.text('Discount:', textX, currentY);
      doc.text(`-Rs. ${discount.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 8;
    }

    if (paymentMethod === 'cod' && codFee > 0) {
      doc.text('COD Fee:', textX, currentY);
      doc.text(`Rs. ${codFee.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 8;
    }

    doc.setDrawColor(200);
    doc.line(textX, currentY - 4, valueX, currentY - 4);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Grand Total:', textX, currentY + 4);
    doc.text(`Rs. ${total.toFixed(2)}`, valueX, currentY + 4, { align: 'right' });

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Thank you for choosing Agrishield!', 14, currentY + 30);
    
    if (paymentMethod === 'cod') {
      doc.setTextColor(220, 38, 38);
      doc.text('Payment Status: PENDING (Cash on Delivery)', 14, currentY + 38);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text('Payment Status: CAPTURED (Paid Online)', 14, currentY + 38);
    }

    doc.save(`Invoice_${orderId}.pdf`);
  };

  return (
    <motion.div 
      className="min-h-screen bg-bg-shop font-sans py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-primary/5 p-8 sm:p-12 text-center border-b border-gray-100">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <FiCheckCircle className="w-10 h-10 text-primary" />
          </motion.div>
          {paymentMethod === 'online' && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 font-extrabold px-5 py-2 rounded-full text-sm mb-3 shadow-sm border border-green-200">
              ✅ Payment Successful & Verified
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Order Confirmed</h1>
          <p className="text-gray-600 font-medium">Thank you for your purchase. Your order has been registered.</p>
        </div>

        {/* Order Info Section */}
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-base font-extrabold text-gray-900">{orderId}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Date</p>
              <p className="text-base font-extrabold text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delhivery AWB</p>
              <p className="text-base font-extrabold text-primary flex items-center gap-1">
                {awbNumber ? (
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono text-sm">
                    {awbNumber}
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium text-sm">Generating AWB...</span>
                )}
              </p>
            </div>
          </div>

          {/* VISUAL SHIPMENT TRACKING STEPPER */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <FiTruck className="text-primary text-xl" /> Live Shipment Tracking
              </h3>
              <button
                onClick={() => fetchLiveTracking()}
                disabled={loadingTracking}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary bg-gray-50 hover:bg-emerald-50 border border-gray-200 px-3 py-1.5 rounded-lg transition"
              >
                <FiRefreshCw className={loadingTracking ? 'animate-spin' : ''} />
                <span>{loadingTracking ? 'Refreshing...' : 'Refresh Status'}</span>
              </button>
            </div>

            {/* Stepper Timeline */}
            <div className="relative my-6">
              {/* Connector Bar */}
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
              
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 relative z-10">
                {trackingSteps.map((s, idx) => {
                  const isCompleted = activeStep >= s.step;
                  const isCurrent = activeStep === s.step;

                  return (
                    <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${
                        isCurrent ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Status Card */}
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Current Shipping Status</p>
                <p className="text-base font-extrabold text-emerald-950 mt-0.5">
                  {delhiveryStatus || 'Shipment Manifested / Processing'}
                </p>
              </div>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
                >
                  Track on Delhivery <FiExternalLink />
                </a>
              )}
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiFileText className="text-primary" /> Payment & Order Summary
            </h3>
            
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Payment Method</span>
                <span className="font-bold text-gray-900">{paymentMethod === 'online' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Payment Status</span>
                <span className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                  String(paymentStatus).toLowerCase() === 'captured' || String(paymentStatus).toLowerCase() === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {String(paymentStatus).toUpperCase()}
                </span>
              </div>
              {paymentId && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Transaction ID</span>
                  <span className="font-mono text-xs text-gray-500 break-all">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 mt-1">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-extrabold text-primary text-xl">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={generateInvoice}
              className="flex-1 bg-white border-2 border-gray-200 hover:border-primary text-gray-800 hover:text-primary font-bold py-4 px-6 rounded-2xl shadow-sm transition-all flex justify-center items-center gap-2 group cursor-pointer"
            >
              <FiDownload className="text-gray-400 group-hover:text-primary transition-colors" /> Download Tax Invoice
            </button>
            <Link 
              to="/shop"
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
            >
              Continue Shopping <FiArrowRight />
            </Link>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default OrderSuccess;
