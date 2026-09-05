import * as XLSX from 'xlsx';

export const exportOrdersToExcel = (orders, filenamePrefix = 'Agrishield_Orders') => {
  if (!orders || orders.length === 0) {
    alert('No orders available to export.');
    return;
  }

  const exportData = orders.map((order, index) => {
    const addr = order.shipping_address || {};
    const items = order.items || [];

    const custName = (
      addr.fullName || 
      addr.name || 
      `${addr.firstName || ''} ${addr.lastName || ''}`.trim()
    ) || 'Valued Customer';

    const fullAddress = [
      addr.address,
      addr.apartment,
      addr.city,
      addr.state,
      addr.pin || addr.pincode || addr.pinCode
    ].filter(Boolean).join(', ');

    const productSummary = items.map(item => {
      const sizeStr = item.package_size ? ` (${item.package_size})` : '';
      return `${item.product_name || 'Item'}${sizeStr} x${item.quantity || 1} [₹${item.price || 0}]`;
    }).join('; ');

    const createdDate = order.created_at 
      ? new Date(order.created_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    return {
      'S.No': index + 1,
      'Order ID': order.order_id || order.id || '',
      'Date & Time': createdDate,
      'Customer Name': custName,
      'Phone Number': addr.phone || addr.mobile || 'N/A',
      'Ordered Products': productSummary || 'N/A',
      'Total Amount (₹)': parseFloat(order.total_amount || 0).toFixed(2),
      'Payment Method': (order.payment_method || 'COD').toUpperCase(),
      'Payment Status': (order.payment_status || 'Pending').toUpperCase(),
      'Order Status': (order.status || 'pending').toUpperCase(),
      'Delivery Address': fullAddress || 'Address Incomplete',
      'Pincode': addr.pin || addr.pincode || addr.pinCode || '',
      'Delhivery AWB': order.delhivery_awb || 'Pending',
      'Email': addr.email || 'N/A',
      'City': addr.city || '',
      'State': addr.state || '',
      'Items Count': items.length,
      'Shipping Status': order.shipping_status || 'Pending',
      'Transport Mode': addr.transport_mode || addr.shipping_mode || 'Surface',
      'Package Weight (kg)': addr.weight || '0.5',
      'Dimensions (LxWxH cm)': `${addr.length || 10}x${addr.width || addr.breadth || 10}x${addr.height || 5}`
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths for clean readability in Excel
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 18 }, // Order ID
    { wch: 20 }, // Date & Time
    { wch: 22 }, // Customer Name
    { wch: 16 }, // Phone Number
    { wch: 45 }, // Ordered Products
    { wch: 16 }, // Total Amount
    { wch: 16 }, // Payment Method
    { wch: 16 }, // Payment Status
    { wch: 14 }, // Order Status
    { wch: 45 }, // Delivery Address
    { wch: 10 }, // Pincode
    { wch: 18 }, // Delhivery AWB
    { wch: 25 }, // Email
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 12 }, // Items Count
    { wch: 18 }, // Shipping Status
    { wch: 16 }, // Transport Mode
    { wch: 18 }, // Package Weight
    { wch: 22 }  // Dimensions
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Format date for filename
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, filename);
};
