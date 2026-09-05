import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLogOut, FiShoppingBag, FiDollarSign, FiClock, FiActivity, FiRefreshCw, FiSearch, FiFilter, FiEye, FiUsers, FiSettings, FiSend, FiMessageSquare, FiTruck, FiExternalLink, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import EditShippingAddressModal from '../../components/admin/EditShippingAddressModal';
import EditPackageDetailsModal from '../../components/admin/EditPackageDetailsModal';
import UpdatePaymentModeModal from '../../components/admin/UpdatePaymentModeModal';
import ChangeTransportModeModal from '../../components/admin/ChangeTransportModeModal';
import AdminUsers from './AdminUsers';
import AdminSettings from '../../components/admin/AdminSettings';
import { exportOrdersToExcel } from '../../utils/excelExport';
import ExcelDataViewerModal from '../../components/admin/ExcelDataViewerModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shippingFilter, setShippingFilter] = useState('all'); // 'all', 'pending_awb', 'ready_to_ship'
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [isExcelViewerOpen, setIsExcelViewerOpen] = useState(false);
  const [openMenuOrderId, setOpenMenuOrderId] = useState(null);

  useEffect(() => {
    // Basic Auth Check
    if (localStorage.getItem('agrishield_admin_auth') !== 'true') {
      navigate('/admin/login');
      return;
    }
    fetchOrders(true);

    // Auto-refresh payment status every 10 seconds (no manual refresh needed)
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const response = await axios.get(`${apiUrl}/orders`);
      if (response.data.success) {
        let savedOverrides = {};
        try {
          savedOverrides = JSON.parse(localStorage.getItem('agrishield_order_overrides') || '{}');
        } catch (e) {}

        const mergedOrders = response.data.orders.map(o => {
          if (savedOverrides[o.id]) {
            const override = savedOverrides[o.id];
            return {
              ...o,
              ...override,
              shipping_address: {
                ...(typeof o.shipping_address === 'object' ? o.shipping_address : {}),
                ...(typeof override.shipping_address === 'object' ? override.shipping_address : {})
              }
            };
          }
          return o;
        });

        setOrders(mergedOrders);
      } else {
        setError('Failed to load orders.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the backend running?');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agrishield_admin_auth');
    navigate('/admin/login');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const response = await axios.patch(`${apiUrl}/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        handleOrderUpdate({ id: orderId, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleCancelOrder = async (order) => {
    if (!order) return;
    const confirmCancel = window.confirm(`Are you sure you want to cancel Order #${order.order_id || order.id}?`);
    if (!confirmCancel) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      let success = false;
      try {
        const res = await axios.post(`${apiUrl}/orders/${order.id}/cancel`);
        if (res.data && res.data.success) success = true;
      } catch (e) {
        await updateOrderStatus(order.id, 'cancelled');
        success = true;
      }

      if (success) {
        handleOrderUpdate({ id: order.id, status: 'cancelled', shipping_status: 'cancelled' });
        alert(`✅ Order ${order.order_id} has been cancelled!`);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('❌ Failed to cancel order.');
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!order) return;
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete Order #${order.order_id || order.id}?`);
    if (!confirmDelete) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const res = await axios.delete(`${apiUrl}/orders/${order.id}`);
      if (res.data && res.data.success) {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        try {
          let savedOverrides = JSON.parse(localStorage.getItem('agrishield_order_overrides') || '{}');
          delete savedOverrides[order.id];
          localStorage.setItem('agrishield_order_overrides', JSON.stringify(savedOverrides));
        } catch (e) {}
        alert(`🗑️ Order #${order.order_id || order.id} permanently deleted.`);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('❌ Failed to delete order.');
    }
  };

  const handleDeleteAllCancelledOrders = async () => {
    const cancelledOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'CANCELLED' || o.shipping_status === 'cancelled');
    if (cancelledOrders.length === 0) {
      alert('No cancelled orders found to delete.');
      return;
    }

    const confirmDelete = window.confirm(`⚠️ Are you sure you want to permanently remove all ${cancelledOrders.length} cancelled order(s) from the database? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const res = await axios.delete(`${apiUrl}/orders/cleanup-cancelled`);
      if (res.data && res.data.success) {
        setOrders(prev => prev.filter(o => o.status !== 'cancelled' && o.status !== 'CANCELLED' && o.shipping_status !== 'cancelled'));
        try {
          let savedOverrides = JSON.parse(localStorage.getItem('agrishield_order_overrides') || '{}');
          cancelledOrders.forEach(o => delete savedOverrides[o.id]);
          localStorage.setItem('agrishield_order_overrides', JSON.stringify(savedOverrides));
        } catch (e) {}
        alert(`✅ ${res.data.message || 'All cancelled orders removed successfully!'}`);
      }
    } catch (err) {
      console.error('Error deleting cancelled orders:', err);
      alert('❌ Failed to delete cancelled orders.');
    }
  };

  const resendWhatsApp = async (orderId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const response = await axios.post(`${apiUrl}/notifications/whatsapp`, { orderId });
      if (response.data.success) {
        alert('✅ WhatsApp notification sent successfully!');
        handleOrderUpdate({ id: orderId, whatsapp_status: 'sent' });
      } else {
        alert('❌ Failed to resend WhatsApp notification: ' + (response.data.message || 'Error'));
      }
    } catch (err) {
      console.error('Error resending WhatsApp:', err);
      alert('❌ Error resending WhatsApp notification.');
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    try {
      let savedOverrides = {};
      try {
        savedOverrides = JSON.parse(localStorage.getItem('agrishield_order_overrides') || '{}');
      } catch (e) {}

      const existingOverride = savedOverrides[updatedOrder.id] || {};
      savedOverrides[updatedOrder.id] = {
        ...existingOverride,
        ...updatedOrder,
        shipping_address: {
          ...(existingOverride.shipping_address || {}),
          ...(updatedOrder.shipping_address || {})
        }
      };
      localStorage.setItem('agrishield_order_overrides', JSON.stringify(savedOverrides));
    } catch (e) {
      console.error('Error saving local override:', e);
    }

    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { 
      ...o, 
      ...updatedOrder, 
      shipping_address: { 
        ...(typeof o.shipping_address === 'object' ? o.shipping_address : {}), 
        ...(typeof updatedOrder.shipping_address === 'object' ? updatedOrder.shipping_address : {}) 
      } 
    } : o));
    
    if (selectedOrder && selectedOrder.id === updatedOrder.id) {
      setSelectedOrder(prev => ({ 
        ...prev, 
        ...updatedOrder, 
        shipping_address: { 
          ...(typeof prev?.shipping_address === 'object' ? prev.shipping_address : {}), 
          ...(typeof updatedOrder.shipping_address === 'object' ? updatedOrder.shipping_address : {}) 
        } 
      }));
    }
  };

  // Memoized Filtering and Sorting
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (shippingFilter === 'pending_awb' && order.delhivery_awb) return false;
        if (shippingFilter === 'ready_to_ship' && !order.delhivery_awb) return false;
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchId = (order.order_id || '').toLowerCase().includes(query);
          const matchAwb = (order.delhivery_awb || '').toLowerCase().includes(query);
          const addr = order.shipping_address || {};
          const matchName = `${addr.firstName || ''} ${addr.lastName || addr.name || ''}`.toLowerCase().includes(query);
          const matchPhone = String(addr.phone || '').includes(query);
          return matchId || matchAwb || matchName || matchPhone;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        return 0;
      });
  }, [orders, searchQuery, statusFilter, shippingFilter, sortBy]);

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const pendingAwbCount = orders.filter(o => !o.delhivery_awb).length;
  const readyToShipCount = orders.filter(o => !!o.delhivery_awb).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col shadow-2xl">
        <div className="p-6 pb-2 border-b border-gray-800">
          <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
            <FiActivity /> Admin
          </h2>
          <p className="text-gray-400 text-sm mt-1">Agrishield Dashboard</p>
        </div>
        <div className="flex-1 py-6">
          <nav className="space-y-1 px-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-primary/20 text-primary border-r-4 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FiShoppingBag /> Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-primary/20 text-primary border-r-4 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FiUsers /> Farmers & Users
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-primary/20 text-primary border-r-4 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FiSettings /> Settings
            </button>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition w-full"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {activeTab === 'users' ? (
          <AdminUsers />
        ) : activeTab === 'settings' ? (
          <AdminSettings />
        ) : (
          <>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Orders Overview</h1>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsExcelViewerOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-sm transition cursor-pointer text-sm"
                  title="View Excel Spreadsheet Data"
                >
                  <FiEye className="text-lg" /> View Excel Data
                </button>
                <button 
                  onClick={() => exportOrdersToExcel(filteredOrders)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-sm transition cursor-pointer text-sm"
                  title="Download Excel spreadsheet of orders"
                >
                  <FiDownload className="text-lg" /> Download Excel
                </button>
                <button 
                  onClick={() => fetchOrders(true)}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary px-4 py-2 rounded-xl shadow-sm transition text-sm cursor-pointer"
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiDollarSign className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-extrabold text-gray-900">₹{totalRevenue.toFixed(2)}</h3>
                </div>
              </motion.div>
              
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-extrabold text-gray-900">{totalOrders}</h3>
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FiTruck className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Pending AWB</p>
                  <h3 className="text-2xl font-extrabold text-amber-600">{pendingAwbCount}</h3>
                </div>
              </motion.div>
            </div>

            {/* Shipping Filter Tabs (Delhivery ONE Style) */}
            <div className="flex border-b border-gray-200 mb-6 gap-2">
              <button
                onClick={() => setShippingFilter('all')}
                className={`pb-3 px-4 font-extrabold text-sm border-b-2 transition cursor-pointer ${
                  shippingFilter === 'all'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setShippingFilter('pending_awb')}
                className={`pb-3 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  shippingFilter === 'pending_awb'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Pending AWB
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-extrabold">
                  {pendingAwbCount}
                </span>
              </button>
              <button
                onClick={() => setShippingFilter('ready_to_ship')}
                className={`pb-3 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  shippingFilter === 'ready_to_ship'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Ready To Ship
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-extrabold">
                  {readyToShipCount}
                </span>
              </button>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by Order ID, AWB, Name, or Phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                  <span className="text-xs font-bold text-gray-400">Showing {filteredOrders.length} orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsExcelViewerOpen(true)}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                    title="View Excel Spreadsheet Data Modal"
                  >
                    <FiEye /> View Sheet
                  </button>
                  <button 
                    onClick={() => exportOrdersToExcel(filteredOrders)}
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                    title="Export currently visible orders to Excel (.xlsx)"
                  >
                    <FiDownload /> Export to Excel
                  </button>
                  {orders.some(o => o.status === 'cancelled' || o.status === 'CANCELLED' || o.shipping_status === 'cancelled') && (
                    <button 
                      onClick={handleDeleteAllCancelledOrders}
                      className="flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                      title="Permanently remove all cancelled orders from database"
                    >
                      🗑️ Clean Up Cancelled Orders
                    </button>
                  )}
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-gray-500 font-medium">Loading orders...</div>
              ) : error ? (
                <div className="p-12 text-center text-red-500 font-medium">{error}</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-medium">No orders found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-extrabold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5">Order Details</th>
                        <th className="px-5 py-3.5">Customer Details</th>
                        <th className="px-5 py-3.5">Product Details</th>
                        <th className="px-5 py-3.5">Packaging Details</th>
                        <th className="px-5 py-3.5">Freight & Delivery</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-sans">
                      {filteredOrders.map((order) => {
                        const addr = order.shipping_address || {};
                        const awb = order.delhivery_awb;
                        const items = order.items || [];
                        const firstProduct = items[0]?.product_name || 'Agricultural Product';
                        const totalQty = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
                        const isCod = String(order.payment_method || '').toLowerCase() === 'cod';
                        const rawCustName = addr.fullName || addr.name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim();
                        const custName = (rawCustName && rawCustName.trim() !== '') ? rawCustName.trim() : 'Valued Customer';
                        const cityPin = [addr.city, addr.pin || addr.pincode].filter(Boolean).join(', ') || 'Address Incomplete';
                        
                        const hasWeight = addr.weight && parseFloat(addr.weight) > 0;
                        const hasAddress = addr.address && addr.address.trim().length > 3 && (addr.pin || addr.pincode);
                        const isSpecsComplete = hasWeight && hasAddress;

                        const trackingUrl = order.tracking_url || (awb ? `https://www.delhivery.com/track/package/${awb}` : null);

                        const isCancelled = String(order.status || '').toLowerCase() === 'cancelled' || String(order.shipping_status || '').toLowerCase() === 'cancelled';

                        return (
                          <tr key={order.id} className={`transition border-b border-gray-100 ${isCancelled ? 'bg-red-50/30' : 'hover:bg-blue-50/20'}`}>
                            {/* ORDER DETAILS */}
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-center gap-1.5 font-extrabold text-blue-600 text-sm">
                                <span className={isCancelled ? 'line-through text-gray-400' : ''}>{order.order_id}</span>
                                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">AGRI</span>
                                {isCancelled ? (
                                  <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase">Cancelled</span>
                                ) : (!isSpecsComplete && !awb && (
                                  <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold" title="Action required: Enter weight or address specs">!</span>
                                ))}
                              </div>
                              <div className="text-[11px] text-gray-400 font-medium mt-1">
                                {new Date(order.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>

                            {/* CUSTOMER DETAILS */}
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                                <span className={isCancelled ? 'text-gray-500' : ''}>{custName}</span>
                                {!isCancelled && (
                                  <span onClick={() => { setSelectedOrder(order); setIsAddressModalOpen(true); }} className="text-gray-400 hover:text-blue-600 cursor-pointer text-xs" title="Edit Address">✎</span>
                                )}
                              </div>
                              {addr.phone && (
                                <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                                  <span>📞</span>
                                  <span>{addr.phone}</span>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-0.5">{cityPin}</div>
                              {!hasAddress && !isCancelled && (
                                <div 
                                  onClick={() => { setSelectedOrder(order); setIsAddressModalOpen(true); }}
                                  className="text-red-500 font-bold text-xs mt-1 cursor-pointer flex items-center gap-1 hover:underline"
                                >
                                  ⚠️ Missing Address ✎
                                </div>
                              )}
                            </td>

                            {/* PRODUCT DETAILS */}
                            <td className="px-5 py-4 align-top">
                              <div className="font-bold text-gray-800 text-xs max-w-[200px] truncate" title={firstProduct}>
                                {firstProduct} {totalQty > 1 ? `(+${totalQty - 1} more)` : ''}
                              </div>
                              <div className="text-xs text-gray-500 font-semibold mt-1 flex items-center gap-1">
                                <span>₹{parseFloat(order.total_amount).toFixed(2)} |</span>
                                <span className={isCod ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>{isCod ? 'COD' : 'Prepaid'}</span>
                                {!isCancelled && (
                                  <span onClick={() => { setSelectedOrder(order); setIsPaymentModalOpen(true); }} className="text-gray-400 hover:text-blue-600 cursor-pointer text-xs ml-0.5" title="Update Payment Mode">✎</span>
                                )}
                              </div>
                            </td>

                            {/* PACKAGING DETAILS */}
                            <td className="px-5 py-4 align-top">
                              {hasWeight ? (
                                <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                  <span>{addr.weightGrams ? `${addr.weightGrams} gm` : `${addr.weight} kg`}</span>
                                  <span className="text-gray-400 font-normal">({addr.length || 10}x{addr.width || addr.breadth || 10}x{addr.height || 5} cm)</span>
                                  {!isCancelled && (
                                    <span onClick={() => { setSelectedOrder(order); setIsPackageModalOpen(true); }} className="text-gray-400 hover:text-blue-600 cursor-pointer ml-1" title="Edit Package Specs">✎</span>
                                  )}
                                </div>
                              ) : isCancelled ? (
                                <span className="text-gray-400 text-xs">--</span>
                              ) : (
                                <button
                                  onClick={() => { setSelectedOrder(order); setIsPackageModalOpen(true); }}
                                  className="text-red-500 hover:text-red-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  Enter weight ✎
                                </button>
                              )}
                            </td>

                            {/* FREIGHT & DELIVERY */}
                            <td className="px-5 py-4 align-top">
                              <div className="font-extrabold text-gray-900 text-sm">
                                ₹{parseFloat(order.total_amount).toFixed(2)}
                              </div>
                              <div 
                                onClick={() => { if (!isCancelled) { setSelectedOrder(order); setIsTransportModalOpen(true); } }}
                                className={`text-[11px] font-bold flex items-center gap-1 mt-0.5 ${isCancelled ? 'cursor-default text-gray-400' : 'cursor-pointer hover:underline'}`}
                                title={isCancelled ? '' : "Change Transport Mode"}
                              >
                                {String(addr.transport_mode || addr.shipping_mode || '').toLowerCase().includes('express') || String(addr.shipping_mode || '').toUpperCase() === 'E' ? (
                                  <>
                                    <FiSend className={`w-3.5 h-3.5 ${isCancelled ? 'text-gray-400' : 'text-blue-600'}`} /> <span className={isCancelled ? 'text-gray-400' : 'text-blue-600'}>Express / Delhivery</span>
                                  </>
                                ) : (
                                  <>
                                    <FiTruck className={`w-3.5 h-3.5 ${isCancelled ? 'text-gray-400' : 'text-emerald-600'}`} /> <span className={isCancelled ? 'text-gray-400' : 'text-emerald-600'}>Surface / Delhivery</span>
                                  </>
                                )}
                                {!isCancelled && <span className="text-gray-400 hover:text-blue-600 ml-0.5 text-xs">✎</span>}
                              </div>
                            </td>

                            {/* ACTIONS */}
                            <td className="px-5 py-4 align-top text-right relative">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-blue-200"
                                  title="View Details"
                                >
                                  <FiEye className="text-blue-600" />
                                </button>
                                <div className="relative">
                                  <button 
                                    onClick={() => setOpenMenuOrderId(openMenuOrderId === order.id ? null : order.id)}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer"
                                    title="More Options"
                                  >
                                    ...
                                  </button>

                                  {openMenuOrderId === order.id && (
                                    <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 text-left w-52 font-sans text-xs">
                                      <button
                                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); setOpenMenuOrderId(null); }}
                                        className="w-full px-4 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2 cursor-pointer"
                                      >
                                        <FiEye className="text-blue-500" /> View Details
                                      </button>
                                      {!isCancelled && (
                                        <>
                                          <button
                                            onClick={() => { setSelectedOrder(order); setIsAddressModalOpen(true); setOpenMenuOrderId(null); }}
                                            className="w-full px-4 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2 cursor-pointer"
                                          >
                                            <span>📍</span> Edit Address
                                          </button>
                                          <button
                                            onClick={() => { setSelectedOrder(order); setIsPackageModalOpen(true); setOpenMenuOrderId(null); }}
                                            className="w-full px-4 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2 cursor-pointer"
                                          >
                                            <span>📦</span> Package Specs
                                          </button>
                                          <button
                                            onClick={() => { setSelectedOrder(order); setIsPaymentModalOpen(true); setOpenMenuOrderId(null); }}
                                            className="w-full px-4 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2 cursor-pointer"
                                          >
                                            <span>💳</span> Payment Mode
                                          </button>
                                          <button
                                            onClick={() => { setSelectedOrder(order); setIsTransportModalOpen(true); setOpenMenuOrderId(null); }}
                                            className="w-full px-4 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2 cursor-pointer"
                                          >
                                            <span>🚚</span> Transport Mode
                                          </button>

                                          <div className="my-1 border-t border-gray-100" />

                                          <button
                                            onClick={() => { setOpenMenuOrderId(null); handleCancelOrder(order); }}
                                            className="w-full px-4 py-2 hover:bg-red-50 text-red-600 font-extrabold flex items-center gap-2 cursor-pointer"
                                          >
                                            <span>🚫</span> Cancel Order
                                          </button>
                                        </>
                                      )}

                                      <div className="my-1 border-t border-gray-100" />
                                      <button
                                        onClick={() => { setOpenMenuOrderId(null); handleDeleteOrder(order); }}
                                        className="w-full px-4 py-2 hover:bg-red-100 text-red-700 font-extrabold flex items-center gap-2 cursor-pointer"
                                      >
                                        <span>🗑️</span> Delete Order
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isCancelled ? (
                                  <span className="bg-red-100 text-red-700 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-red-200">
                                    Cancelled
                                  </span>
                                ) : awb ? (
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="bg-emerald-100 text-emerald-800 font-mono font-extrabold px-2 py-0.5 rounded text-xs">
                                      {awb}
                                    </span>
                                    {trackingUrl && (
                                      <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                        Track <FiExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                    className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition flex items-center gap-1 cursor-pointer shadow-sm ${
                                      isSpecsComplete
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <FiTruck /> Get AWB
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <OrderDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder}
        onStatusChange={updateOrderStatus}
        onResendWhatsApp={resendWhatsApp}
        onOrderUpdate={handleOrderUpdate}
      />

      <EditShippingAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
      />

      <EditPackageDetailsModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
      />

      <UpdatePaymentModeModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
      />

      <ChangeTransportModeModal
        isOpen={isTransportModalOpen}
        onClose={() => setIsTransportModalOpen(false)}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
      />

      <ExcelDataViewerModal
        isOpen={isExcelViewerOpen}
        onClose={() => setIsExcelViewerOpen(false)}
        orders={filteredOrders}
      />
    </div>
  );
};

export default AdminDashboard;
