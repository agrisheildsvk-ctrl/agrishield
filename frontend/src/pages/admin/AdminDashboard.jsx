import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLogOut, FiShoppingBag, FiDollarSign, FiClock, FiActivity, FiRefreshCw, FiSearch, FiFilter, FiEye, FiUsers, FiSettings, FiSend, FiMessageSquare, FiTruck, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import AdminUsers from './AdminUsers';
import AdminSettings from '../../components/admin/AdminSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setOrders(response.data.orders);
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
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const resendWhatsApp = async (orderId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';
      const response = await axios.post(`${apiUrl}/notifications/whatsapp`, { orderId });
      if (response.data.success) {
        alert('✅ WhatsApp notification sent successfully!');
        setOrders(orders.map(o => o.id === orderId ? { ...o, whatsapp_status: 'sent' } : o));
      } else {
        alert('❌ Failed to resend WhatsApp notification: ' + (response.data.message || 'Error'));
      }
    } catch (err) {
      console.error('Error resending WhatsApp:', err);
      alert('❌ Error resending WhatsApp notification.');
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
    if (selectedOrder && selectedOrder.id === updatedOrder.id) {
      setSelectedOrder({ ...selectedOrder, ...updatedOrder });
    }
  };

  // Memoized Filtering and Sorting
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchId = (order.order_id || '').toLowerCase().includes(query);
          const matchAwb = (order.delhivery_awb || '').toLowerCase().includes(query);
          const addr = order.shipping_address || {};
          const matchName = `${addr.firstName || ''} ${addr.lastName || ''}`.toLowerCase().includes(query);
          return matchId || matchAwb || matchName;
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
  }, [orders, searchQuery, statusFilter, sortBy]);

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending' || o.shipping_status === 'shipping_pending').length;

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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Orders Overview</h1>
              <button 
                onClick={() => fetchOrders(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary px-4 py-2 rounded-lg shadow-sm transition"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
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
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiClock className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Pending Actions</p>
                  <h3 className="text-2xl font-extrabold text-gray-900">{pendingOrders}</h3>
                </div>
              </motion.div>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by Order ID, AWB, or Customer Name..." 
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
                    <option value="all">All Statuses</option>
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
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                <span className="text-xs font-bold text-gray-400">Showing {filteredOrders.length} orders</span>
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
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Delhivery AWB</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredOrders.map((order) => {
                        const addr = order.shipping_address || {};
                        const awb = order.delhivery_awb;
                        const trackingUrl = order.tracking_url || (awb ? `https://www.delhivery.com/track/package/${awb}` : null);

                        return (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-5 font-bold text-gray-900">{order.order_id}</td>
                            <td className="px-6 py-5 text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-bold text-gray-900">{addr.firstName} {addr.lastName}</div>
                              <div className="text-xs text-gray-500">{addr.phone}</div>
                            </td>
                            <td className="px-6 py-5 font-bold text-primary">₹{order.total_amount}</td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                  order.payment_method === 'online' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {order.payment_method === 'online' ? 'ONLINE' : 'COD'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold ${
                                  String(order.payment_status || '').toLowerCase() === 'captured' || String(order.payment_status || '').toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  String(order.payment_status || '').toLowerCase() === 'authorized' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  String(order.payment_status || '').toLowerCase() === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {String(order.payment_status || '').toLowerCase() === 'captured' || String(order.payment_status || '').toLowerCase() === 'paid' ? '✅ Captured' :
                                   String(order.payment_status || '').toLowerCase() === 'authorized' ? '⏳ Authorized' :
                                   String(order.payment_status || '').toLowerCase() === 'failed' ? '❌ Failed' : '⏳ Pending'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              {awb ? (
                                <div className="flex flex-col items-start gap-1">
                                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold text-xs border border-emerald-200">
                                    {awb}
                                  </span>
                                  {trackingUrl && (
                                    <a
                                      href={trackingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                    >
                                      Track <FiExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-start gap-1">
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-amber-200">
                                    <FiTruck /> Pending AWB
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsModalOpen(true);
                                    }}
                                    className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer mt-0.5"
                                  >
                                    Get AWB →
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <select 
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className={`text-xs font-bold uppercase rounded-full px-3 py-1 outline-none cursor-pointer border-2 transition ${
                                  order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                  order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-orange-50 text-orange-700 border-orange-200'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                              {order.whatsapp_url && (
                                <a
                                  href={order.whatsapp_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open in WhatsApp"
                                  className="inline-flex items-center justify-center gap-1 bg-green-500 text-white hover:bg-green-600 px-2.5 py-1.5 rounded-lg shadow-sm transition text-xs font-bold"
                                >
                                  <FiMessageSquare /> WhatsApp
                                </a>
                              )}
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary px-3 py-1.5 rounded-lg shadow-sm transition text-sm font-semibold cursor-pointer"
                              >
                                <FiEye /> View
                              </button>
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
    </div>
  );
};

export default AdminDashboard;
