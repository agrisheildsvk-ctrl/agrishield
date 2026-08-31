const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const whatsappService = require('../services/whatsappService');
const delhiveryService = require('../services/delhiveryService');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const razorpayService = require('../services/razorpayService');

/**
 * Create a new Order (COD or fallback)
 */
const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      items,
      totals,
      shippingAddress,
      paymentMethod,
      paymentId
    } = req.body;

    let userId = req.user ? parseInt(req.user.id) : null;
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agrishield_secret_key');
        if (decoded && decoded.id) {
          userId = parseInt(decoded.id);
        }
      } catch (err) {
        // token parse fallback
      }
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: { items: true }
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already exists',
        order: existingOrder
      });
    }

    const newOrder = await prisma.order.create({
      data: {
        order_id: orderId,
        user_id: userId,
        shipping_address: shippingAddress,
        subtotal: totals.subtotal,
        discount: totals.discount,
        cod_fee: totals.codFee,
        total_amount: totals.total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'online' ? 'Captured' : 'Pending',
        payment_id: paymentId || null,
        shipping_status: 'pending',
        whatsapp_status: 'pending',
        items: {
          create: items.map(item => ({
            product_id: parseInt(item.id),
            product_name: item.name,
            package_size: item.packageSize || null,
            quantity: item.quantity,
            price: parseFloat(String(item.price).replace(/[^0-9.]/g, ''))
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Set order status to Pending AWB (manual Get AWB action required by client)
    await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        shipping_status: 'shipping_pending',
        delhivery_status: 'Pending AWB'
      }
    });

    // Fetch final order state (with Delhivery AWB and tracking URL)
    const savedOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: { items: true }
    });

    const orderToNotify = savedOrder || newOrder;

    // Automatically send WhatsApp notification to Owner and Customer
    let whatsappResult = { status: 'pending' };
    try {
      whatsappResult = await whatsappService.notifyOwnerNewOrder(orderToNotify);
      await whatsappService.notifyCustomerNewOrder(orderToNotify);
    } catch (waErr) {
      console.error('WhatsApp notification error on order creation:', waErr.message);
      whatsappResult = { status: 'failed', error: waErr.message };
    }

    // Trigger Email & SMS notifications asynchronously
    emailService.sendOrderEmail(orderToNotify).catch(e => console.error('Email error:', e.message));
    smsService.sendOrderSMS(orderToNotify).catch(e => console.error('SMS error:', e.message));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder || newOrder,
      whatsapp: whatsappResult,
      delhivery: { status: 'Pending AWB' }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

/**
 * Get all orders for Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Auto-sync AWB for any orders missing delhivery_awb by checking Delhivery by order_id
    const ordersWithAwbSync = await Promise.all(orders.map(async (order) => {
      if (!order.delhivery_awb && order.order_id) {
        try {
          const tracking = await delhiveryService.getTracking(order.order_id);
          if (tracking && tracking.success && tracking.awb && tracking.awb !== order.order_id) {
            const updated = await prisma.order.update({
              where: { id: order.id },
              data: {
                delhivery_awb: tracking.awb,
                delhivery_status: tracking.current_status || 'Manifested',
                shipping_status: tracking.shipping_status || 'shipment_created',
                tracking_url: `https://www.delhivery.com/track/package/${tracking.awb}`,
                shipment_created_at: new Date()
              },
              include: { items: true }
            });
            return updated;
          }
        } catch (e) {
          // ignore tracking error during list fetch
        }
      }
      return order;
    }));

    const ownerPhone = await whatsappService.getOwnerWhatsAppNumber();
    const ordersWithUrl = ordersWithAwbSync.map(order => ({
      ...order,
      whatsapp_url: whatsappService.getOrderWhatsAppUrl(order, ownerPhone)
    }));

    res.status(200).json({
      success: true,
      count: ordersWithUrl.length,
      orders: ordersWithUrl
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * Update order status (Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shipping_status } = req.body;

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (shipping_status) dataToUpdate.shipping_status = shipping_status;

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: { items: true }
    });

    // If status is cancelled, also cancel shipment on Delhivery One and issue Razorpay refund if online payment
    if (String(status).toLowerCase() === 'cancelled') {
      if (updatedOrder.delhivery_awb) {
        try {
          await delhiveryService.cancelShipment(updatedOrder.delhivery_awb);
        } catch (dErr) {
          console.error('Delhivery shipment cancellation error:', dErr.message);
        }
      }

      const pId = updatedOrder.payment_id || updatedOrder.razorpay_payment_id || updatedOrder.transaction_id;
      if (updatedOrder.payment_method === 'online' && pId && String(updatedOrder.payment_status).toLowerCase() !== 'refunded') {
        try {
          const refundResult = await razorpayService.refundPayment(pId, updatedOrder.total_amount, {
            reason: 'Order Cancellation by Admin',
            orderId: updatedOrder.order_id
          });
          if (refundResult && refundResult.id) {
            await prisma.order.update({
              where: { id: updatedOrder.id },
              data: { payment_status: 'Refunded' }
            });
            updatedOrder.payment_status = 'Refunded';
          }
        } catch (rErr) {
          console.error('Razorpay auto-refund error on admin status update:', rErr.message);
        }
      }
    }

    // Send customer WhatsApp notification when status changes
    const relevantStatuses = ['accepted', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (status && relevantStatuses.includes(String(status).toLowerCase())) {
      try {
        await whatsappService.notifyCustomerStatusChange(updatedOrder, status);
      } catch (e) {
        console.error('Customer WhatsApp notification error on status update:', e.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * Customer / Admin Order Cancellation (/api/orders/:id/cancel)
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = parseInt(id) || id;

    const order = await prisma.order.findFirst({
      where: typeof targetId === 'number' ? { id: targetId } : { order_id: String(targetId) },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const currentStatus = String(order.status || '').toLowerCase();
    if (currentStatus === 'shipped' || currentStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${currentStatus}. Please contact customer support.`
      });
    }

    // Check if online payment needs automatic Razorpay refund
    let newPaymentStatus = order.payment_status;
    const paymentId = order.payment_id || order.razorpay_payment_id || order.transaction_id;
    if (order.payment_method === 'online' && paymentId && String(order.payment_status).toLowerCase() !== 'refunded') {
      try {
        const refund = await razorpayService.refundPayment(paymentId, order.total_amount, {
          reason: 'Customer Order Cancellation',
          orderId: order.order_id
        });
        if (refund && refund.id) {
          newPaymentStatus = 'Refunded';
        }
      } catch (rErr) {
        console.error('Razorpay auto-refund error on customer cancellation:', rErr.message);
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'cancelled',
        shipping_status: 'cancelled',
        delhivery_status: 'Cancelled by Customer',
        payment_status: newPaymentStatus
      },
      include: { items: true }
    });

    // Cancel shipment on Delhivery One if AWB exists
    if (order.delhivery_awb) {
      try {
        await delhiveryService.cancelShipment(order.delhivery_awb);
      } catch (dErr) {
        console.error('Delhivery shipment cancellation error:', dErr.message);
      }
    }

    // Notify customer & shop owner about cancellation
    try {
      await whatsappService.notifyCustomerStatusChange(updatedOrder, 'cancelled');
    } catch (waErr) {
      console.error('Cancellation WhatsApp notification error:', waErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order: ' + error.message,
      error: error.message
    });
  }
};

/**
 * Issue Razorpay Refund for an order (/api/orders/:id/refund)
 */
const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = parseInt(id) || id;

    const order = await prisma.order.findFirst({
      where: typeof targetId === 'number' ? { id: targetId } : { order_id: String(targetId) },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const paymentId = order.payment_id || order.razorpay_payment_id || order.transaction_id;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'No Razorpay payment ID associated with this order' });
    }

    const refund = await razorpayService.refundPayment(paymentId, order.total_amount, {
      reason: 'Manual Admin Refund',
      orderId: order.order_id
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { payment_status: 'Refunded' }
    });

    res.status(200).json({
      success: true,
      message: 'Razorpay refund issued successfully!',
      refund,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error issuing Razorpay refund:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay refund failed: ' + error.message,
      error: error.message
    });
  }
};

/**
 * Get tracking status for a customer order (/api/orders/:orderId/tracking)
 */
const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const isIdNumeric = /^[0-9]+$/.test(orderId);
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { order_id: orderId },
          ...(isIdNumeric ? [{ id: parseInt(orderId) }] : []),
          { delhivery_awb: orderId }
        ]
      },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    let delhiveryTracking = null;
    const awbToQuery = order.delhivery_awb || order.order_id;
    delhiveryTracking = await delhiveryService.getTracking(awbToQuery);

    const currentShippingStatus = delhiveryTracking?.shipping_status || order.shipping_status || 'pending';

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        orderId: order.order_id,
        date: order.created_at,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        shippingStatus: currentShippingStatus,
        delhiveryAwb: order.delhivery_awb || delhiveryTracking?.awb || null,
        delhiveryStatus: delhiveryTracking?.current_status || order.delhivery_status || 'Pending',
        trackingUrl: order.tracking_url || (order.delhivery_awb ? `https://www.delhivery.com/track/package/${order.delhivery_awb}` : null),
        shippingAddress: order.shipping_address,
        items: order.items
      },
      tracking: delhiveryTracking
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order tracking',
      error: error.message
    });
  }
};

/**
 * Retry shipment creation for an order (/api/orders/:id/retry-shipment)
 */
const retryShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if client has generated AWB inside Delhivery ONE (one.delhivery.com)
    try {
      const tracking = await delhiveryService.getTracking(order.order_id);
      if (tracking && tracking.success && tracking.awb && tracking.awb !== order.order_id) {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            shipping_status: tracking.shipping_status || 'shipment_created',
            delhivery_awb: tracking.awb,
            delhivery_status: tracking.current_status || 'Manifested',
            tracking_url: `https://www.delhivery.com/track/package/${tracking.awb}`,
            shipment_created_at: new Date()
          },
          include: { items: true }
        });

        return res.status(200).json({
          success: true,
          message: 'AWB synced successfully from Delhivery ONE!',
          awb: tracking.awb,
          tracking_url: updatedOrder.tracking_url,
          order: updatedOrder
        });
      }
    } catch (e) {
      // Proceed to shipment creation if not generated on Delhivery ONE yet
    }

    const delhiveryResult = await delhiveryService.createShipment(order);

    if (delhiveryResult && delhiveryResult.success && delhiveryResult.awb) {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          shipping_status: 'shipment_created',
          delhivery_awb: delhiveryResult.awb,
          delhivery_status: delhiveryResult.delhivery_status || 'Manifested',
          tracking_url: delhiveryResult.tracking_url,
          shipment_created_at: new Date()
        },
        include: { items: true }
      });

      return res.status(200).json({
        success: true,
        message: 'Delhivery shipment created successfully',
        order: updatedOrder,
        awb: delhiveryResult.awb,
        tracking_url: delhiveryResult.tracking_url
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shipping_status: 'shipping_pending',
          delhivery_status: delhiveryResult?.error || 'Retry failed'
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Delhivery shipment creation failed: ' + (delhiveryResult?.error || 'Unknown error'),
        error: delhiveryResult?.error
      });
    }
  } catch (error) {
    console.error('Error retrying shipment creation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry shipment creation',
      error: error.message
    });
  }
};

/**
 * Get orders for the logged-in customer (/api/orders/my-orders)
 */
const getUserOrders = async (req, res) => {
  try {
    let userId = req.user ? parseInt(req.user.id) : null;
    let phone = req.user ? req.user.phone : null;
    let email = req.user ? req.user.email : null;

    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agrishield_secret_key');
        if (decoded) {
          userId = decoded.id ? parseInt(decoded.id) : null;
          phone = decoded.phone || phone;
          email = decoded.email || email;
        }
      } catch (err) {
        // invalid token
      }
    }

    if (!userId && !phone && !email) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Please login to view orders.'
      });
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : null;

    // Fetch all orders matching user_id OR phone OR email
    const allOrders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { created_at: 'desc' }
    });

    const userOrders = allOrders.filter(o => {
      if (userId && o.user_id === userId) return true;
      const addr = o.shipping_address || {};
      if (cleanPhone && addr.phone && String(addr.phone).replace(/\D/g, '').slice(-10) === cleanPhone) return true;
      if (email && addr.email && String(addr.email).toLowerCase() === String(email).toLowerCase()) return true;
      return false;
    });

    // Auto-link any matching orders that didn't have user_id set previously
    if (userId) {
      const unlinkedIds = userOrders.filter(o => !o.user_id).map(o => o.id);
      if (unlinkedIds.length > 0) {
        try {
          await prisma.order.updateMany({
            where: { id: { in: unlinkedIds } },
            data: { user_id: userId }
          });
        } catch (e) {
          // ignore linking error
        }
      }
    }

    res.status(200).json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  getOrderTracking,
  retryShipment,
  cancelOrder,
  refundOrder
};
