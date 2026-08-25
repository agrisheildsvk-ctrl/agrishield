const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || 'PM63HFpC20XKDJqohgEKTZGPAjura35rtwKaHCpxEsaxyQkm6aUxPZNtZV5Q';

/**
 * Send SMS Order Confirmation to Customer's Mobile Number via Fast2SMS
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

    const customerName = `${addr.firstName || ''}`.trim() || 'Farmer';
    const amountStr = parseFloat(order.total_amount || 0).toFixed(0);
    const awbStr = order.delhivery_awb ? ` AWB:${order.delhivery_awb}` : '';
    
    const smsMessage = `Hi ${customerName}, your Agrishield order #${order.order_id} of Rs.${amountStr} is confirmed.${awbStr} Thank you for choosing Agrishield!`;

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
          return { success: true, provider: 'Fast2SMS', data };
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
        return { success: true, provider: 'Twilio', data: response.data };
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
      message: 'SMS notification logged'
    };
  } catch (error) {
    console.error('[SMSService] Error in sendOrderSMS:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderSMS
};
