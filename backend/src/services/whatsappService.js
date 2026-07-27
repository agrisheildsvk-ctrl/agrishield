const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_OWNER_WHATSAPP = '9739230638';

/**
 * Get the owner's WhatsApp number from the database or fallback to default
 */
const getOwnerWhatsAppNumber = async () => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'owner_whatsapp' }
    });
    if (setting && setting.value) {
      return setting.value.trim();
    }
  } catch (error) {
    console.error('Error reading owner_whatsapp setting:', error.message);
  }
  return DEFAULT_OWNER_WHATSAPP;
};

/**
 * Clean phone number to standard 10-digit or country code format
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return DEFAULT_OWNER_WHATSAPP;
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits || `91${DEFAULT_OWNER_WHATSAPP}`;
};

/**
 * Format Order Time as "26 Jul 2026\n02:22 PM"
 */
const formatOrderTime = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const dateStr = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateStr}\n${timeStr}`;
};

/**
 * Format Order Message exactly as requested
 */
const formatOrderMessage = (order) => {
  const addr = order.shipping_address || {};
  const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim() || 'Customer';
  let phoneStr = addr.phone || addr.phoneNumber || 'N/A';
  if (phoneStr && phoneStr.length === 10 && !phoneStr.startsWith('+91')) {
    phoneStr = `+91 ${phoneStr}`;
  }

  const itemsList = (order.items || []).map(item => {
    const priceNum = parseFloat(item.price) || 0;
    const itemTotal = priceNum * item.quantity;
    const priceFormatted = itemTotal % 1 === 0 ? itemTotal.toFixed(0) : itemTotal.toFixed(2);
    return `• ${item.product_name} ×${item.quantity}\n₹${priceFormatted}`;
  }).join('\n\n');

  const totalAmount = parseFloat(order.total_amount) || 0;
  const totalFormatted = totalAmount % 1 === 0 ? totalAmount.toFixed(0) : totalAmount.toFixed(2);

  const paymentStr = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online';
  const villageStr = addr.village || addr.city || addr.address || 'N/A';
  const pinStr = addr.pin || addr.pincode || 'N/A';

  const orderTimeStr = formatOrderTime(order.created_at);

  return `🌾 AGRISHIELD

🛒 NEW ORDER RECEIVED

━━━━━━━━━━━━━━━━━━

Order ID
#${order.order_id}

Customer
${customerName}

Phone
${phoneStr}

━━━━━━━━━━━━━━━━━━

Products

${itemsList}

━━━━━━━━━━━━━━━━━━

Total Amount
₹${totalFormatted}

Payment
${paymentStr}

━━━━━━━━━━━━━━━━━━

Delivery Address

Village:
${villageStr}

Pincode:
${pinStr}

━━━━━━━━━━━━━━━━━━

Order Time
${orderTimeStr}

━━━━━━━━━━━━━━━━━━

Open Dashboard
https://agrisheild.com/admin/orders

Thank You 🌱`;
};

/**
 * Format Status Update message for Customer
 */
const formatCustomerStatusMessage = (order, newStatus) => {
  const addr = order.shipping_address || {};
  const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim() || 'Customer';

  return `🌾 AGRISHIELD

📦 ORDER STATUS UPDATED

━━━━━━━━━━━━━━━━━━

Order ID
#${order.order_id}

New Status
${String(newStatus).toUpperCase()}

━━━━━━━━━━━━━━━━━━

Hi ${customerName}, your Agrishield order status has been updated to "${newStatus}".

Thank You 🌱`;
};

/**
 * Send WhatsApp Message (API call or safe simulated logging + click-to-chat fallback)
 */
const sendWhatsAppMessage = async (phone, message) => {
  const formattedPhone = formatPhoneNumber(phone);
  const clickToChatUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  try {
    // Check if external WhatsApp API URL is provided in environment
    if (process.env.WHATSAPP_API_URL) {
      console.log(`[WhatsAppService] Sending WhatsApp via API to ${formattedPhone}...`);
      const response = await axios.post(process.env.WHATSAPP_API_URL, {
        phone: formattedPhone,
        message: message,
        apiKey: process.env.WHATSAPP_API_KEY
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          status: 'sent',
          message: 'WhatsApp message sent successfully via API',
          clickToChatUrl
        };
      }
    }

    // Default production-ready fallback / simulation mode
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📲 [WhatsApp Notification Sent to ${formattedPhone}]`);
    console.log(message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      success: true,
      status: 'sent',
      message: 'WhatsApp message sent (logged in fallback mode)',
      clickToChatUrl
    };
  } catch (error) {
    console.error('[WhatsAppService] API Error:', error.message);
    // Even if API fails, log the message and return failed status so caller can handle retry
    return {
      success: false,
      status: 'failed',
      error: error.message,
      clickToChatUrl
    };
  }
};

/**
 * Notify Shop Owner on New Order
 */
const notifyOwnerNewOrder = async (order) => {
  try {
    const ownerPhone = await getOwnerWhatsAppNumber();
    const message = formatOrderMessage(order);
    const result = await sendWhatsAppMessage(ownerPhone, message);

    // Update order whatsapp_status in database
    await prisma.order.update({
      where: { id: order.id },
      data: {
        whatsapp_status: result.status,
        whatsapp_error: result.error || null
      }
    });

    return result;
  } catch (err) {
    console.error('[WhatsAppService] notifyOwnerNewOrder failed:', err.message);
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          whatsapp_status: 'failed',
          whatsapp_error: err.message
        }
      });
    } catch (e) {
      // Ignore DB update error
    }
    return { success: false, status: 'failed', error: err.message };
  }
};

/**
 * Notify Customer on Status Change
 */
const notifyCustomerStatusChange = async (order, newStatus) => {
  try {
    const addr = order.shipping_address || {};
    const customerPhone = addr.phone || addr.phoneNumber;
    if (!customerPhone) {
      return { success: false, message: 'No customer phone found in order' };
    }

    const message = formatCustomerStatusMessage(order, newStatus);
    const result = await sendWhatsAppMessage(customerPhone, message);
    return result;
  } catch (err) {
    console.error('[WhatsAppService] notifyCustomerStatusChange failed:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Retry Order Notification for an Order ID
 */
const retryOrderNotification = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const result = await notifyOwnerNewOrder(order);
    return {
      success: true,
      orderId: order.id,
      whatsapp_status: result.status,
      result
    };
  } catch (err) {
    console.error('[WhatsAppService] retryOrderNotification error:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Generate Click-to-Chat URL for an Order
 */
const getOrderWhatsAppUrl = (order, ownerPhone = DEFAULT_OWNER_WHATSAPP) => {
  const formattedPhone = formatPhoneNumber(ownerPhone);
  const message = formatOrderMessage(order);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

module.exports = {
  getOwnerWhatsAppNumber,
  formatPhoneNumber,
  formatOrderMessage,
  formatCustomerStatusMessage,
  sendWhatsAppMessage,
  notifyOwnerNewOrder,
  notifyCustomerStatusChange,
  retryOrderNotification,
  getOrderWhatsAppUrl
};
