import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate and download PDF Invoice for an Agrishield order
 */
export const generateInvoicePDF = (order) => {
  if (!order) return;

  const doc = new jsPDF();
  const primaryColor = [22, 163, 74]; // Emerald green #16a34a

  const orderId = order.order_id || order.orderId || `ORD-${order.id || Date.now()}`;
  const dateStr = order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('en-IN'));

  const items = order.items || [];
  const shippingAddress = order.shipping_address || order.shippingAddress || {};
  const paymentMethod = order.payment_method || order.paymentMethod || 'online';
  const paymentId = order.payment_id || order.paymentId || order.razorpay_payment_id || null;
  const paymentStatus = order.payment_status || (paymentMethod === 'online' ? 'Captured / Paid' : 'Pending');

  // Total calculations
  const itemsTotal = items.reduce((sum, item) => {
    const p = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0;
    return sum + (p * (item.quantity || 1));
  }, 0);

  const subtotal = parseFloat(order.subtotal || order.totals?.subtotal || itemsTotal || 0);
  const discount = parseFloat(order.discount || order.totals?.discount || 0);
  const codFee = parseFloat(order.cod_fee || order.totals?.codFee || 0);
  const total = parseFloat(order.total_amount || order.totals?.total || (subtotal - discount + codFee));

  // Header Banner
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('Agrishield', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Certified Crop Protection Tax Invoice / Receipt', 14, 25);

  doc.setFontSize(9);
  doc.setTextColor(50);
  doc.text('SRI VEERABHADRESHWARA KRUSHI KENDRA', 196, 16, { align: 'right' });
  doc.setFont(undefined, 'bold');
  doc.text('GSTIN: 29APSPA0505K1ZV', 196, 21, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.text('1, Opp. Forest Dept, Alkola Circle, Sagara Road', 196, 26, { align: 'right' });
  doc.text('Shivamogga, Karnataka - 577204', 196, 31, { align: 'right' });
  doc.text('Ph: 7892815965 / 9739230638 | agrishield@gmail.com', 196, 36, { align: 'right' });

  doc.setDrawColor(220);
  doc.line(14, 40, 196, 40);

  // Order Details Left Column
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text('Order Information', 14, 50);

  doc.setFontSize(10);
  doc.text(`Order ID: ${orderId}`, 14, 58);
  doc.text(`Invoice Date: ${dateStr}`, 14, 64);
  doc.text(`Payment Method: ${paymentMethod === 'online' ? 'Online Payment (UPI / Card)' : 'Cash on Delivery (COD)'}`, 14, 70);
  doc.text(`Payment Status: ${paymentStatus}`, 14, 76);
  if (paymentId) {
    doc.text(`Transaction Ref: ${paymentId}`, 14, 82);
  }

  // Customer Shipping Address Right Column
  doc.setFontSize(12);
  doc.text('Billed To / Shipping Address:', 115, 50);
  doc.setFontSize(10);
  const custName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || shippingAddress.name || 'Valued Farmer';
  doc.text(custName, 115, 58);
  if (shippingAddress.address || shippingAddress.village) {
    doc.text(shippingAddress.address || shippingAddress.village || '', 115, 64);
  }
  const locationLine = [shippingAddress.city, shippingAddress.state, shippingAddress.pin || shippingAddress.pincode].filter(Boolean).join(', ');
  if (locationLine) {
    doc.text(locationLine, 115, 70);
  }
  if (shippingAddress.phone) {
    doc.text(`Mobile: ${shippingAddress.phone}`, 115, 76);
  }
  if (shippingAddress.email) {
    doc.text(`Email: ${shippingAddress.email}`, 115, 82);
  }

  // Items Table
  const tableColumn = ["Product Name", "Package Size", "Unit Price (Rs)", "Qty", "Total (Rs)"];
  const tableRows = [];

  items.forEach(item => {
    const name = item.product_name || item.name || 'Agricultural Item';
    const pkg = item.package_size || item.packageSize || '';
    const priceVal = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0;
    const qty = item.quantity || 1;
    const itemTotal = priceVal * qty;

    // Format Qty as e.g. "3 Kg (Pack of 3)" or "500 gm (Pack of 2)"
    let qtyDisplay = qty.toString();
    if (pkg) {
      const match = String(pkg).trim().match(/^([\d.]+)\s*(kg|g|gm|grams|liter|litres|l|ml)?$/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = (match[2] || '').toLowerCase();
        let mult = 1;
        let sizeUnit = 'Kg';
        let totalVal = val * qty;

        if (unit === 'kg') {
          mult = Math.round(val);
          sizeUnit = 'Kg';
          totalVal = val * qty;
        } else if (unit === 'l' || unit === 'liter' || unit === 'litres') {
          mult = Math.round(val * 2);
          sizeUnit = 'L';
          totalVal = val * qty;
        } else if (unit === 'g' || unit === 'gm' || unit === 'grams') {
          let base = 250;
          if (val === 50) base = 50;
          else if (val === 100) base = 100;
          else if (val === 200) base = 200;
          else if (val === 250) base = 250;
          else if (val === 500) base = 500;
          else if (val < 100) base = 50;
          else if (val < 250) base = 100;
          mult = Math.max(1, Math.round(val / base));

          const totG = val * qty;
          if (totG >= 1000) {
            totalVal = totG / 1000;
            sizeUnit = 'Kg';
          } else {
            totalVal = totG;
            sizeUnit = 'gm';
          }
        } else if (unit === 'ml') {
          let base = 500;
          if (val === 50) base = 50;
          else if (val === 100) base = 100;
          else if (val === 200) base = 200;
          else if (val === 250) base = 250;
          else if (val === 500) base = 500;
          else if (val < 100) base = 50;
          else if (val < 200) base = 100;
          else if (val < 500) base = 250;
          mult = Math.max(1, Math.round(val / base));

          const totMl = val * qty;
          if (totMl >= 1000) {
            totalVal = totMl / 1000;
            sizeUnit = 'L';
          } else {
            totalVal = totMl;
            sizeUnit = 'ml';
          }
        } else {
          mult = Math.round(val) || 1;
        }

        const effectiveQty = qty * mult;
        qtyDisplay = `${totalVal} ${sizeUnit} (Pack of ${effectiveQty})`;
      } else {
        qtyDisplay = `${qty} (${pkg})`;
      }
    }

    tableRows.push([
      name,
      pkg || 'Standard',
      priceVal.toFixed(2),
      qtyDisplay,
      itemTotal.toFixed(2)
    ]);
  });

  autoTable(doc, {
    startY: 92,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 32 }
    }
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 120;

  let currentY = finalY + 12;
  doc.setFontSize(10);
  doc.setTextColor(50);
  const textX = 135;

  doc.text(`Subtotal:`, textX, currentY);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, 196, currentY, { align: 'right' });
  currentY += 6;

  if (discount > 0) {
    doc.text(`Discount:`, textX, currentY);
    doc.text(`- Rs. ${discount.toFixed(2)}`, 196, currentY, { align: 'right' });
    currentY += 6;
  }

  if (codFee > 0) {
    doc.text(`COD Fee:`, textX, currentY);
    doc.text(`+ Rs. ${codFee.toFixed(2)}`, 196, currentY, { align: 'right' });
    currentY += 6;
  }

  doc.setLineWidth(0.5);
  doc.setDrawColor(...primaryColor);
  doc.line(textX, currentY, 196, currentY);
  currentY += 7;

  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`Grand Total:`, textX, currentY);
  doc.text(`Rs. ${total.toFixed(2)}`, 196, currentY, { align: 'right' });

  // Footer Note
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Thank you for purchasing certified Agrishield crop protection products!', 14, 280);
  doc.text('Sri Veerabhadreshwara Krushi Kendra | Support: +91 7892815965 / 9739230638 | agrishield@gmail.com', 14, 285);

  doc.save(`Agrishield_Invoice_${orderId}.pdf`);
};
