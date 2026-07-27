const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsappService = require('../services/whatsappService');

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

    // Optional user ID if the user is authenticated later
    const userId = req.user ? req.user.id : null;

    // Create the order and items in a transaction
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
        whatsapp_status: 'pending',
        items: {
          create: items.map(item => ({
            product_id: parseInt(item.id),
            product_name: item.name,
            package_size: item.packageSize || null,
            quantity: item.quantity,
            price: parseFloat(item.price.replace(/[^0-9.]/g, ''))
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Automatically send WhatsApp notification to Owner
    let whatsappResult = { status: 'pending' };
    try {
      whatsappResult = await whatsappService.notifyOwnerNewOrder(newOrder);
    } catch (waErr) {
      console.error('WhatsApp notification error on order creation:', waErr.message);
      whatsappResult = { status: 'failed', error: waErr.message };
    }

    // Fetch final order state with whatsapp status
    const savedOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: { items: true }
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder || newOrder,
      whatsapp: whatsappResult
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
    
    const ownerPhone = await whatsappService.getOwnerWhatsAppNumber();
    const ordersWithUrl = orders.map(order => ({
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { items: true }
    });

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

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus
};
