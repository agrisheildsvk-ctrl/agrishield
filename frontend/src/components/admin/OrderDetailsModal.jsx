import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiPackage, FiCreditCard, FiActivity, FiTruck } from 'react-icons/fi';

const OrderDetailsModal = ({ isOpen, onClose, order, onStatusChange }) => {
  if (!isOpen || !order) return null;

  const addr = order.shipping_address || {};
  const items = order.items || [];

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
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiPackage className="text-primary" />
                Order Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">ID: {order.order_id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="space-y-8">
                {/* Status Update Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiActivity className="text-blue-500" /> Current Status
                  </h3>
                  <div className="flex items-center gap-4">
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiMapPin className="text-orange-500" /> Shipping Details
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p className="font-bold text-gray-900 text-lg">{addr.firstName} {addr.lastName}</p>
                    <p>{addr.address}</p>
                    {addr.apartment && <p>{addr.apartment}</p>}
                    <p>{addr.city}, {addr.state} - {addr.pinCode}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1">
                      <p><span className="font-semibold text-gray-900">Phone:</span> {addr.phone}</p>
                      <p><span className="font-semibold text-gray-900">Email:</span> {addr.email}</p>
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
                    {order.payment_id && (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-sm text-gray-900">{order.payment_id}</span>
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
