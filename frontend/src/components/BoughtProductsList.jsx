import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaRedo, 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaBoxOpen, 
  FaMapMarkerAlt, 
  FaTag, 
  FaCalendarAlt,
  FaReceipt,
  FaExternalLinkAlt,
  FaFileDownload,
  FaDollarSign,
  FaRupeeSign,
  FaBoxes,
  FaShieldAlt,
  FaTimesCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { products as localProducts } from '../data/products';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';

const BoughtProductsList = ({ showTitle = true }) => {
  const { token, user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bought'); // 'bought', 'history', 'prices'
  const [addedToast, setAddedToast] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://agrishield-production-573f.up.railway.app/api';

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
        setError('Could not load order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [token, apiUrl]);

  const handleCancelOrder = async (orderToCancel) => {
    const isConfirmed = window.confirm(`Are you sure you want to cancel Order #${orderToCancel.order_id}?`);
    if (!isConfirmed) return;

    const targetId = orderToCancel.id || orderToCancel.order_id;
    setCancellingId(targetId);
    try {
      const res = await axios.post(`${apiUrl}/orders/${targetId}/cancel`);
      if (res.data && res.data.success) {
        setOrders(prevOrders => prevOrders.map(o => {
          if (o.id === orderToCancel.id || o.order_id === orderToCancel.order_id) {
            return {
              ...o,
              status: 'cancelled',
              shipping_status: 'cancelled',
              delhivery_status: 'Cancelled by Customer'
            };
          }
          return o;
        }));
        setAddedToast(`Order #${orderToCancel.order_id} has been cancelled successfully.`);
        setTimeout(() => setAddedToast(''), 4000);
      } else {
        alert(res.data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Extract all unique items bought by customer across orders
  const boughtProductsMap = new Map();
  let grandTotalSpent = 0;
  let grandTotalUnits = 0;

  orders.forEach(order => {
    const orderTotal = parseFloat(order.total_amount || 0);
    grandTotalSpent += orderTotal;

    const orderItems = order.items || [];
    orderItems.forEach(item => {
      grandTotalUnits += (item.quantity || 1);
      const key = `${item.product_name}-${item.package_size || 'default'}`;
      
      const matchedCatalogProduct = localProducts.find(
        p => p.id === item.product_id || p.name.toLowerCase() === item.product_name.toLowerCase()
      );

      const productImage = item.image || item.image_url || matchedCatalogProduct?.image || matchedCatalogProduct?.images?.[0] || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=300&q=80';

      if (!boughtProductsMap.has(key)) {
        boughtProductsMap.set(key, {
          id: item.product_id || matchedCatalogProduct?.id || Date.now(),
          name: item.product_name,
          packageSize: item.package_size || matchedCatalogProduct?.packageSize || '1 kg',
          price: `₹${parseFloat(item.price || matchedCatalogProduct?.price || 0).toFixed(2)}`,
          rawPrice: parseFloat(item.price || 0),
          image: productImage,
          category: matchedCatalogProduct?.category || 'Crop Protection',
          totalQuantityBought: item.quantity || 1,
          timesOrdered: 1,
          lastOrderedDate: new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          lastOrderId: order.order_id,
          lastOrderDbId: order.id,
          lastOrderStatus: order.status || order.shipping_status || 'processing',
          paymentStatus: order.payment_status || 'Completed',
          catalogProduct: matchedCatalogProduct || null
        });
      } else {
        const existing = boughtProductsMap.get(key);
        existing.totalQuantityBought += (item.quantity || 1);
        existing.timesOrdered += 1;
      }
    });
  });

  const boughtProducts = Array.from(boughtProductsMap.values());

  const handleBuyAgain = (prod) => {
    const itemToCart = prod.catalogProduct ? {
      ...prod.catalogProduct,
      packageSize: prod.packageSize,
      price: prod.price
    } : {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      packageSize: prod.packageSize,
      image: prod.image,
      category: prod.category
    };

    addToCart(itemToCart, 1);
    setAddedToast(`Added "${prod.name}" (${prod.packageSize}) to your cart!`);
    setTimeout(() => setAddedToast(''), 4000);
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-semibold text-sm">Loading your bought products & order invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <FaCheckCircle className="text-xl text-emerald-300" />
          <span>{addedToast}</span>
          <Link to="/cart" className="ml-2 underline text-xs font-extrabold uppercase bg-white/20 px-2.5 py-1 rounded-lg hover:bg-white/30">
            View Cart
          </Link>
        </div>
      )}

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
            <FaBoxes />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Unique Products</div>
            <div className="text-2xl font-extrabold text-gray-900">{boughtProducts.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
            <FaBoxOpen />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Units Bought</div>
            <div className="text-2xl font-extrabold text-gray-900">{grandTotalUnits}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
            <FaReceipt />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Orders</div>
            <div className="text-2xl font-extrabold text-gray-900">{orders.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
            <FaRupeeSign />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Spend</div>
            <div className="text-2xl font-extrabold text-emerald-700">₹{grandTotalSpent.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Header & Navigation Tabs */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          {showTitle && (
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <FaShoppingBag className="text-emerald-600" />
              <span>Already Bought Products & Order Invoices</span>
            </h2>
          )}
          <p className="text-gray-500 text-xs sm:text-sm font-medium mt-0.5">
            View products list, price summaries, and download PDF tax invoices for all orders.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-emerald-50 p-1.5 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-bold w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('bought')}
            className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'bought'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <FaBoxOpen />
            <span>Products List ({boughtProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prices')}
            className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'prices'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <FaRupeeSign />
            <span>Prices & Invoices ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <FaReceipt />
            <span>Order History ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {boughtProducts.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-emerald-100 text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            <FaShoppingBag />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Purchased Products Yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            You haven't placed any orders yet. Explore our certified crop protection, repellents, and organic solutions today!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all transform hover:scale-105"
          >
            Browse Products Shop →
          </Link>
        </div>
      ) : (
        <>
          {/* TAB 1: BOUGHT PRODUCTS LIST */}
          {activeTab === 'bought' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {boughtProducts.map((prod, idx) => (
                <div
                  key={`${prod.id}-${idx}`}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-center gap-5 relative group"
                >
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-emerald-50 rounded-2xl p-2 flex items-center justify-center flex-shrink-0 border border-emerald-100 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-all"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                      {prod.name}
                    </h3>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 font-medium">
                      <span>Size: <strong className="text-gray-800">{prod.packageSize}</strong></span>
                      <span>•</span>
                      <span>Bought <strong className="text-emerald-700">{prod.totalQuantityBought} unit(s)</strong></span>
                    </div>

                    <div className="text-xs text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-2">
                      <span>Last Order: <span className="text-gray-600 font-semibold">{prod.lastOrderedDate}</span> ({prod.lastOrderId})</span>
                      {prod.lastOrderStatus === 'cancelled' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-md">❌ Cancelled</span>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xl font-extrabold text-emerald-700">
                        {prod.price}
                      </div>

                      <div className="flex items-center gap-2">
                        {prod.lastOrderStatus !== 'cancelled' && prod.lastOrderStatus !== 'shipped' && prod.lastOrderStatus !== 'delivered' && (
                          <button
                            onClick={() => handleCancelOrder({ id: prod.lastOrderDbId || prod.lastOrderId, order_id: prod.lastOrderId })}
                            disabled={cancellingId === (prod.lastOrderDbId || prod.lastOrderId)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <FaTimesCircle className="text-xs" />
                            <span>{cancellingId === (prod.lastOrderDbId || prod.lastOrderId) ? '...' : 'Cancel Order'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleBuyAgain(prod)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <FaRedo className="text-xs" />
                          <span>Buy Again</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PRICES & INVOICES LIST */}
          {activeTab === 'prices' && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id || order.order_id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-5"
                >
                  {/* Order Header & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-lg">
                          Order #{order.order_id}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.payment_method === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status === 'cancelled' ? '❌ Cancelled' : (order.payment_method === 'online' ? 'Pay Online (Paid)' : 'Cash on Delivery')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Date: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      {order.status !== 'cancelled' && order.status !== 'shipped' && order.status !== 'delivered' && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingId === (order.id || order.order_id)}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <FaTimesCircle className="text-sm" />
                          <span>{cancellingId === (order.id || order.order_id) ? 'Cancelling...' : 'Cancel Order'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => generateInvoicePDF(order)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <FaFileDownload className="text-sm" />
                        <span>Download Invoice PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Price Breakdown Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-emerald-50 text-emerald-900 border-b border-emerald-100">
                          <th className="py-3 px-4 font-bold rounded-l-xl">Product</th>
                          <th className="py-3 px-4 font-bold">Package Size</th>
                          <th className="py-3 px-4 font-bold text-right">Unit Price</th>
                          <th className="py-3 px-4 font-bold text-center">Qty</th>
                          <th className="py-3 px-4 font-bold text-right rounded-r-xl">Total Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                        {(order.items || []).map((item, i) => {
                          const unitPrice = parseFloat(item.price || 0);
                          const lineTotal = unitPrice * (item.quantity || 1);
                          return (
                            <tr key={i} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-bold text-gray-900">{item.product_name}</td>
                              <td className="py-3 px-4">{item.package_size || '1 kg'}</td>
                              <td className="py-3 px-4 text-right">₹{unitPrice.toFixed(2)}</td>
                              <td className="py-3 px-4 text-center">{item.quantity}</td>
                              <td className="py-3 px-4 text-right font-extrabold text-gray-900">₹{lineTotal.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Financial Summary */}
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      <div>Subtotal: <strong className="text-gray-900">₹{parseFloat(order.subtotal || 0).toFixed(2)}</strong></div>
                      {parseFloat(order.discount || 0) > 0 && (
                        <div>Discount: <strong className="text-emerald-700">- ₹{parseFloat(order.discount).toFixed(2)}</strong></div>
                      )}
                      {parseFloat(order.cod_fee || 0) > 0 && (
                        <div>COD Fee: <strong className="text-amber-700">+ ₹{parseFloat(order.cod_fee).toFixed(2)}</strong></div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-bold uppercase tracking-wider text-[11px]">Final Paid Amount:</span>
                      <span className="text-xl font-extrabold text-emerald-700">₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ORDER HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order.id || order.order_id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4"
                >
                  {/* Order Top Line */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-base sm:text-lg">
                          Order #{order.order_id}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status === 'cancelled' ? '❌ Cancelled' : (order.shipping_status || order.status || 'Processing')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-2">
                        <FaCalendarAlt className="text-emerald-600" />
                        <span>
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <span>Payment: <strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</div>
                        <div className="text-2xl font-extrabold text-emerald-700">₹{parseFloat(order.total_amount || 0).toFixed(2)}</div>
                      </div>

                      {order.status !== 'cancelled' && order.status !== 'shipped' && order.status !== 'delivered' && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingId === (order.id || order.order_id)}
                          className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <FaTimesCircle className="text-sm" />
                          <span>{cancellingId === (order.id || order.order_id) ? '...' : 'Cancel'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => generateInvoicePDF(order)}
                        title="Download Tax Invoice PDF"
                        className="p-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-2xl transition-all cursor-pointer"
                      >
                        <FaFileDownload className="text-lg" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purchased Items</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(order.items || []).map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-12 h-12 bg-white rounded-xl p-1 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                            <FaBoxOpen className="text-emerald-600 text-lg" />
                          </div>
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-gray-900">{item.product_name}</div>
                            <div className="text-gray-500 font-medium">
                              Qty: {item.quantity} {item.package_size ? `(${item.package_size})` : ''}
                            </div>
                          </div>
                          <div className="font-extrabold text-gray-800 text-xs">
                            ₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping & Tracking Info */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-emerald-600 shrink-0" />
                      <span>
                        Deliver to: <strong>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</strong>, {order.shipping_address?.address || order.shipping_address?.city}, {order.shipping_address?.pin}
                      </span>
                    </div>

                    {order.tracking_url || order.delhivery_awb ? (
                      <a
                        href={order.tracking_url || `https://www.delhivery.com/track/package/${order.delhivery_awb}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
                      >
                        <FaTruck />
                        <span>Track Delhivery Package</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                      </a>
                    ) : (
                      <span className="text-gray-400 font-medium">Tracking available once shipped</span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoughtProductsList;
