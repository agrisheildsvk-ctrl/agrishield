import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiDownload, FiArrowRight, FiFileText } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { trackPurchase } from '../utils/analytics';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!location.state || !location.state.orderData) {
      navigate('/shop');
    } else {
      const data = location.state.orderData;
      setOrderData(data);
      const orderId = data.orderId || data.id;
      if (orderId) {
        const trackedKey = `agrishield_tracked_${orderId}`;
        if (!sessionStorage.getItem(trackedKey)) {
          sessionStorage.setItem(trackedKey, 'true');
          trackPurchase(data);
        }
      } else {
        trackPurchase(data);
      }
    }
  }, [location, navigate]);

  if (!orderData) {
    return null;
  }

  const {
    orderId,
    date,
    items,
    totals: { subtotal, discount, codFee, total },
    shippingAddress,
    paymentMethod,
    paymentId
  } = orderData;

  const generateInvoice = () => {
    const doc = new jsPDF();
    
    // Brand Colors
    const primaryColor = [22, 163, 74]; // #16a34a (green-600)
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('Agrishield', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Tax Invoice / Receipt', 14, 30);

    // Company Info (Right Aligned)
    doc.setFontSize(10);
    doc.text('Agrishield Private Limited', 196, 22, { align: 'right' });
    doc.text('123 Farming Avenue', 196, 28, { align: 'right' });
    doc.text('contact@agrishield.com', 196, 34, { align: 'right' });

    // Line separator
    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    // Order Info
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text('Order Details', 14, 50);
    
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderId}`, 14, 58);
    doc.text(`Date: ${date}`, 14, 64);
    doc.text(`Payment Method: ${paymentMethod === 'online' ? 'Online Payment (Captured)' : 'Cash on Delivery'}`, 14, 70);
    if (paymentMethod === 'online') {
      doc.text(`Transaction ID: ${paymentId || orderData.razorpay_payment_id || 'N/A'}`, 14, 76);
      if (orderData.razorpay_order_id) {
        doc.text(`Razorpay Order ID: ${orderData.razorpay_order_id}`, 14, 82);
      }
    }

    // Bill To
    doc.setFontSize(12);
    doc.text('Bill To / Ship To:', 120, 50);
    doc.setFontSize(10);
    doc.text(`${shippingAddress.firstName} ${shippingAddress.lastName}`, 120, 58);
    doc.text(shippingAddress.address, 120, 64);
    doc.text(`${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pin}`, 120, 70);
    doc.text(`Phone: ${shippingAddress.phone}`, 120, 76);
    doc.text(`Email: ${shippingAddress.email}`, 120, 82);

    // Items Table
    const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
    const tableRows = [];

    items.forEach(item => {
      const unitPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      const itemTotal = unitPrice * item.quantity;
      const sizeStr = item.packageSize || '1 kg';
      const itemData = [
        `${item.name} (${sizeStr})`,
        `Rs. ${unitPrice.toFixed(2)}`,
        item.quantity.toString(),
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

    // Totals Section
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

    if (paymentMethod === 'cod') {
      doc.text('COD Fee:', textX, currentY);
      doc.text(`Rs. ${codFee.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 8;
    }

    // Grand Total Line
    doc.setDrawColor(200);
    doc.line(textX, currentY - 4, valueX, currentY - 4);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Grand Total:', textX, currentY + 4);
    doc.text(`Rs. ${total.toFixed(2)}`, valueX, currentY + 4, { align: 'right' });

    // Footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Thank you for choosing Agrishield!', 14, currentY + 30);
    
    if (paymentMethod === 'cod') {
      doc.setTextColor(220, 38, 38); // red
      doc.text('Payment Status: PENDING (Cash on Delivery)', 14, currentY + 38);
    } else {
      doc.setTextColor(22, 163, 74); // green
      doc.text('Payment Status: CAPTURED (Paid Online)', 14, currentY + 38);
    }

    // Save PDF
    doc.save(`Invoice_${orderId}.pdf`);
  };

  return (
    <motion.div 
      className="min-h-screen bg-bg-shop font-sans py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-primary/5 p-8 sm:p-12 text-center border-b border-gray-100">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheckCircle className="w-12 h-12 text-primary" />
          </motion.div>
          {paymentMethod === 'online' && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 font-extrabold px-5 py-2 rounded-full text-sm mb-3 shadow-sm border border-green-200">
              ✅ Payment Successful
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Order Confirmed</h1>
          <p className="text-gray-600 font-medium">Thank you for your purchase. Your order has been placed successfully.</p>
        </div>

        {/* Order Info Section */}
        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Order ID</p>
              <p className="text-lg font-bold text-gray-900">{orderId}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Date</p>
              <p className="text-lg font-bold text-gray-900">{date}</p>
            </div>
          </div>

          <div className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiFileText className="text-primary" /> Payment Summary
            </h3>
            
            <div className="flex flex-col gap-3 text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Method</span>
                <span className="font-bold">{paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
              </div>
              {paymentMethod === 'online' && paymentId && (
                <div className="flex justify-between">
                  <span className="font-medium">Transaction ID</span>
                  <span className="font-bold text-sm text-gray-500 break-all">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 mt-1">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-extrabold text-primary text-xl">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Specific Message */}
            <div className={`mt-6 p-4 rounded-xl text-sm font-bold flex items-start gap-3 ${paymentMethod === 'cod' ? 'bg-orange-50 text-orange-800 border border-orange-100' : 'bg-green-50 text-green-800 border border-green-100'}`}>
              <div className="mt-0.5">ℹ️</div>
              {paymentMethod === 'cod' 
                ? `Please keep exactly ₹${total.toFixed(2)} ready in cash to pay the delivery agent upon arrival.` 
                : 'Payment received successfully. You will receive tracking details on your email shortly.'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button 
              onClick={generateInvoice}
              className="flex-1 bg-white border-2 border-gray-200 hover:border-primary text-gray-800 hover:text-primary font-bold py-4 px-6 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 group"
            >
              <FiDownload className="text-gray-400 group-hover:text-primary transition-colors" /> Download Invoice
            </button>
            <Link 
              to="/shop"
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
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
