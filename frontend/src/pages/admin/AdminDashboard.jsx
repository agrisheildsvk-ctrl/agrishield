import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLogOut, FiShoppingBag, FiDollarSign, FiClock, FiActivity, FiRefreshCw, FiSearch, FiFilter, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError('Failed to load orders.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agrishield_admin_auth');
    navigate('/admin/login');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        // Update local state
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        // Also update selected order if modal is open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Memoized Filtering and Sorting
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchId = order.order_id.toLowerCase().includes(query);
          const addr = order.shipping_address || {};
          const matchName = `${addr.firstName} ${addr.lastName}`.toLowerCase().includes(query);
          return matchId || matchName;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort filter
        if (sortBy === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        return 0;
      });
  }, [orders, searchQuery, statusFilter, sortBy]);

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;

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
            <a href="#" className="flex items-center gap-3 bg-primary/20 text-primary border-r-4 border-primary px-4 py-3 rounded-l-lg font-bold">
              <FiShoppingBag /> Orders
            </a>
            {/* Add more nav links here later */}
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Overview</h1>
          <button 
            onClick={fetchOrders}
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
              placeholder="Search by Order ID or Customer Name..." 
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
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
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
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const addr = order.shipping_address || {};
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            order.payment_method === 'online' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {order.payment_method === 'online' ? 'ONLINE' : 'COD'}
                          </span>
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
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary px-3 py-1.5 rounded-lg shadow-sm transition text-sm font-semibold"
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
      </div>

      <OrderDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder}
        onStatusChange={updateOrderStatus}
      />
    </div>
  );
};

export default AdminDashboard;
