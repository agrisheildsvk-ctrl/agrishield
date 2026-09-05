import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiDownload, FiTable, FiCopy, FiCheck, FiPhone, FiMapPin, FiPackage, FiDollarSign } from 'react-icons/fi';
import { exportOrdersToExcel } from '../../utils/excelExport';

const ExcelDataViewerModal = ({ isOpen, onClose, orders = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const formattedRows = useMemo(() => {
    return orders.map((order, idx) => {
      const addr = order.shipping_address || {};
      const items = order.items || [];

      const custName = (
        addr.fullName || 
        addr.name || 
        `${addr.firstName || ''} ${addr.lastName || ''}`.trim()
      ) || 'Valued Customer';

      const phone = addr.phone || addr.mobile || 'N/A';
      const email = addr.email || 'N/A';

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

      const dateStr = order.created_at 
        ? new Date(order.created_at).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '';

      return {
        sNo: idx + 1,
        id: order.id,
        orderId: order.order_id || order.id || '',
        date: dateStr,
        custName,
        phone,
        email,
        address: fullAddress || 'Address Incomplete',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pin || addr.pincode || addr.pinCode || '',
        status: (order.status || 'pending').toUpperCase(),
        paymentMethod: (order.payment_method || 'COD').toUpperCase(),
        paymentStatus: (order.payment_status || 'Pending').toUpperCase(),
        totalAmount: parseFloat(order.total_amount || 0).toFixed(2),
        itemsCount: items.length,
        products: productSummary || 'N/A',
        awb: order.delhivery_awb || 'Pending',
        shippingStatus: order.shipping_status || 'Pending',
        transportMode: addr.transport_mode || addr.shipping_mode || 'Surface',
        weight: addr.weight || '0.5',
        dimensions: `${addr.length || 10}x${addr.width || addr.breadth || 10}x${addr.height || 5}`,
        rawOrder: order
      };
    });
  }, [orders]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return formattedRows;
    const term = searchTerm.toLowerCase();
    return formattedRows.filter(row => (
      row.orderId.toLowerCase().includes(term) ||
      row.custName.toLowerCase().includes(term) ||
      row.phone.toLowerCase().includes(term) ||
      row.address.toLowerCase().includes(term) ||
      row.pincode.toLowerCase().includes(term) ||
      row.products.toLowerCase().includes(term) ||
      row.awb.toLowerCase().includes(term) ||
      row.status.toLowerCase().includes(term)
    ));
  }, [formattedRows, searchTerm]);

  if (!isOpen) return null;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-[96vw] h-[92vh] flex flex-col overflow-hidden border border-gray-100"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-900 via-emerald-800 to-gray-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center text-emerald-400">
                <FiTable className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  Excel Data Sheet View
                </h2>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Live spreadsheet view of {filteredRows.length} customer orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => exportOrdersToExcel(orders)}
                className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2 rounded-xl transition flex items-center gap-2 text-xs shadow-md cursor-pointer"
              >
                <FiDownload className="text-base" /> Download Excel (.xlsx)
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                title="Close Viewer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search Bar & Controls */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiSearch />
              </div>
              <input
                type="text"
                placeholder="Search Excel data (Name, Phone, ID, Product, Pincode)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm"
              />
            </div>
            <div className="text-xs font-extrabold text-gray-500 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                Total Rows: {filteredRows.length}
              </span>
            </div>
          </div>

          {/* Excel Spreadsheet Grid Container with Full Horizontal and Vertical Scroll support */}
          <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-inner border border-gray-200 overflow-x-auto overflow-y-auto max-h-full">
              <table className="w-full min-w-[1600px] text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-emerald-800 text-white font-extrabold text-[11px] uppercase tracking-wider sticky top-0 z-20 shadow-sm">
                    <th className="p-3 border-b border-r border-emerald-700 w-12 text-center">#</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Order ID</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Date & Time</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Customer Name</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Phone Number</th>
                    <th className="p-3 border-b border-r border-emerald-700 min-w-[240px]">Products Ordered</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap text-right">Amount (₹)</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Payment Mode</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Status</th>
                    <th className="p-3 border-b border-r border-emerald-700 min-w-[240px]">Delivery Address</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Pincode</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Delhivery AWB</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">Email</th>
                    <th className="p-3 border-b border-r border-emerald-700 whitespace-nowrap">City</th>
                    <th className="p-3 border-b border-emerald-700 whitespace-nowrap">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="p-12 text-center text-gray-500 font-bold">
                        No orders match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr 
                        key={row.id || idx}
                        className={`transition ${idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/20'} hover:bg-emerald-100/40`}
                      >
                        <td className="p-2.5 border-r border-gray-200 font-mono text-center font-bold text-gray-400">
                          {row.sNo}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 font-extrabold text-blue-600 whitespace-nowrap">
                          {row.orderId}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 whitespace-nowrap text-gray-600 font-medium">
                          {row.date}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 font-bold text-gray-900 whitespace-nowrap">
                          {row.custName}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-extrabold text-emerald-700">
                            <FiPhone className="text-emerald-600 text-xs" />
                            <span>{row.phone}</span>
                            {row.phone !== 'N/A' && (
                              <button
                                onClick={() => copyToClipboard(row.phone, `phone-${idx}`)}
                                className="text-gray-400 hover:text-emerald-700 p-0.5 cursor-pointer ml-1"
                                title="Copy Phone Number"
                              >
                                {copiedIndex === `phone-${idx}` ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-gray-200 text-gray-900 font-semibold max-w-[260px]">
                          <div className="line-clamp-2" title={row.products}>
                            {row.products}
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-gray-200 font-black text-gray-900 whitespace-nowrap text-right text-sm">
                          ₹{row.totalAmount}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 whitespace-nowrap font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-black tracking-wide ${
                              row.paymentMethod.includes('COD') 
                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {row.paymentMethod.includes('COD') ? 'COD' : 'ONLINE'}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">
                              ({row.paymentStatus})
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-gray-200 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            row.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            row.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            row.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-gray-200 text-gray-700 max-w-[280px]">
                          <div className="line-clamp-2" title={row.address}>
                            {row.address}
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-gray-200 font-mono font-bold text-gray-800 whitespace-nowrap">
                          {row.pincode}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 font-mono font-bold text-emerald-800 whitespace-nowrap">
                          {row.awb}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 text-gray-600 whitespace-nowrap">
                          {row.email}
                        </td>
                        <td className="p-2.5 border-r border-gray-200 text-gray-700 whitespace-nowrap font-medium">
                          {row.city}
                        </td>
                        <td className="p-2.5 text-gray-700 whitespace-nowrap font-semibold">
                          {row.transportMode}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer bar */}
          <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong className="text-gray-900">{filteredRows.length}</strong> of <strong className="text-gray-900">{orders.length}</strong> total orders
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExcelDataViewerModal;
