const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || 'PM63HFpC20XKDJqohgEKTZGPAjura35rtwKaHCpxEsaxyQkm6aUxPZNtZV5Q';

// Bestseller catalog for related product recommendations
const FEATURED_PRODUCTS = [
  { name: 'Wild Boar Repellent', price: 'Rs.529' },
  { name: 'Snake Repellent', price: 'Rs.425' },
  { name: 'Rat, Squirrel & Rabbit Repellent', price: 'Rs.380' },
  { name: 'Monkey Deterrent Granules', price: 'Rs.450' }
];

/**
 * Format Purchased Items with product name, quantity, and price
 */
const formatPurchasedItems = (items = []) => {
  if (!items || items.length === 0) {
    return '• Agricultural Crop Protection Product';
  }
  return items.map(item => {
    const qty = item.quantity || 1;
    const priceNum = parseFloat(item.price || 0);
    const itemTotal = priceNum * qty;
    const priceStr = itemTotal > 0 ? `Rs.${itemTotal.toFixed(0)}` : 'Rs.0';
    const name = item.product_name || item.name || 'Agri Product';
    return `• ${name} (x${qty}) - ${priceStr}`;
  }).join('\n');
};

/**
 * Get 3 related/recommended products
 */
const get3RecommendedProducts = (orderItems = []) => {
  const boughtNames = (orderItems || []).map(i => (i.product_name || i.name || '').toLowerCase());
  const filtered = FEATURED_PRODUCTS.filter(p => 
    !boughtNames.some(b => b.includes(p.name.toLowerCase().split(' ')[0]))
  );
  const selected = (filtered.length >= 3 ? filtered : FEATURED_PRODUCTS).slice(0, 3);
  return selected.map((item, idx) => `${idx + 1}. ${item.name} (${item.price})`).join('\n');
};

/**
 * Format Order Time as "28 Aug 2026, 04:17 PM"
 */
const formatOrderTime = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const dateStr = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
  return `${dateStr}, ${timeStr}`;
};

/**
 * Send Professional SMS Order Confirmation to Customer's Mobile Number via Fast2SMS / Twilio
 */
const sendOrderSMS = async (order) => {
  try {
    const addr = order.shipping_address || {};
    const rawPhone = addr.phone || addr.phoneNumber;
    if (!rawPhone) {
      return { success: false, message: 'No phone number provided in order' };
    }

    const phone = String(rawPhone).replace(/[^0-9]/g, '').slice(-10);
    if (phone.length !== 10) {
      return { success: false, message: 'Invalid 10-digit phone number' };
    }

    const customerName = `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || 'Farmer';
    const amountStr = parseFloat(order.total_amount || 0).toFixed(0);
    const orderTime = formatOrderTime(order.created_at || order.createdAt);
    
    // Determine tracking link (Delhivery direct or Agrishield portal)
    let trackingLink = order.tracking_url;
    if (!trackingLink && order.delhivery_awb) {
      trackingLink = `https://www.delhivery.com/track/package/${order.delhivery_awb}`;
    }
    if (!trackingLink) {
      trackingLink = `https://agrishield.in/order-success?orderId=${order.order_id}`;
    }

    const purchasedItemsList = formatPurchasedItems(order.items);

    const smsMessage = `Hi ${customerName}, your Agrishield order #${order.order_id} is confirmed!

Details:
• Order Number: #${order.order_id}
• Price: Rs.${amountStr}
• Tracking Link: ${trackingLink}

📦 Purchased Products:
${purchasedItemsList}

Thank you for purchasing from Agrishield!`;

    // Option 1: Fast2SMS Gateway ('q' route)
    if (FAST2SMS_API_KEY) {
      try {
        const url = new URL('https://www.fast2sms.com/dev/bulkV2');
        url.searchParams.append('authorization', FAST2SMS_API_KEY);
        url.searchParams.append('message', smsMessage);
        url.searchParams.append('route', 'q');
        url.searchParams.append('numbers', phone);

        const response = await fetch(url.toString());
        const data = await response.json();

        console.log(`[SMSService] Fast2SMS Quick SMS response for +91 ${phone}:`, data);
        if (data && (data.return === true || data.status_code === 200)) {
          return { success: true, provider: 'Fast2SMS', data, formattedMessage: smsMessage };
        }
      } catch (fErr) {
        console.error('[SMSService] Fast2SMS fetch error:', fErr.message);
      }
    }

    // Option 2: Twilio SMS Gateway
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', `+91${phone}`);
        params.append('From', process.env.TWILIO_PHONE_NUMBER);
        params.append('Body', smsMessage);

        const response = await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, params.toString(), {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        });

        console.log('[SMSService] Twilio SMS dispatched successfully to +91', phone);
        return { success: true, provider: 'Twilio', data: response.data, formattedMessage: smsMessage };
      } catch (tErr) {
        console.error('[SMSService] Twilio error:', tErr.message);
      }
    }

    // Fallback: Safe Logging
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 [SMS Order Notification Logged for +91 ${phone}]`);
    console.log(smsMessage);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      success: true,
      message: 'SMS notification logged',
      formattedMessage: smsMessage
    };
  } catch (error) {
    console.error('[SMSService] Error in sendOrderSMS:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderSMS,
  formatOrderTime
};
