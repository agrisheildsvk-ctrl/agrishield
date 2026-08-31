const nodemailer = require('nodemailer');

/**
 * Send HTML Order Confirmation Email to Customer & Owner
 */
const sendOrderEmail = async (order) => {
  try {
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!smtpUser || !smtpPass) {
      console.log('[EmailService] SMTP credentials not set. Set SMTP_USER and SMTP_PASS in environment to send emails.');
      return { success: false, message: 'SMTP credentials not configured' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: (process.env.SMTP_PORT || '465') === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const addr = order.shipping_address || {};
    const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim() || 'Valued Farmer';
    const customerEmail = addr.email;
    const ownerEmail = process.env.OWNER_EMAIL || 'agrishield@gmail.com';

    const itemsHtml = (order.items || []).map(item => {
      const priceVal = parseFloat(item.price) || 0;
      const qty = item.quantity || 1;
      const lineTotal = priceVal * qty;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1f2937;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #4b5563;">${item.package_size || '1 kg'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #1f2937;">${qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #16a34a;">₹${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #16a34a; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: bold;">Agrishield</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Certified Crop Protection Tax Invoice / Receipt</p>
        </div>
        
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; color: #374151;">
            <div><strong>Order ID:</strong> ${order.order_id}</div>
            <div><strong>Date:</strong> ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</div>
          </div>

          <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Order Confirmation</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
            Hello <strong>${customerName}</strong>, thank you for purchasing from <strong>Sri Veerabhadreshwara Krushi Kendra</strong>. Your order details are below:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
            <thead>
              <tr style="background-color: #f3f4f6; color: #374151;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Size</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; font-size: 14px;">
            <p style="margin: 4px 0; color: #166534; font-weight: bold; font-size: 16px;">Total Paid: ₹${parseFloat(order.total_amount).toFixed(2)}</p>
            <p style="margin: 4px 0; color: #374151;">Payment Method: <strong>${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment (Paid)'}</strong></p>
            ${order.delhivery_awb ? `<p style="margin: 4px 0; color: #166534;">Delhivery AWB: <strong>${order.delhivery_awb}</strong></p>` : ''}
          </div>

          <div style="margin-top: 20px; font-size: 13px; color: #4b5563;">
            <p style="margin: 2px 0;"><strong>Shipping To:</strong> ${addr.address || ''}, ${addr.village || addr.city || ''}, ${addr.state || ''} - ${addr.pin || addr.pincode || ''}</p>
            <p style="margin: 2px 0;"><strong>Mobile:</strong> ${addr.phone || 'N/A'}</p>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6;">
          <strong>Sri Veerabhadreshwara Krushi Kendra</strong><br>
          Opp. Forest Dept, Alkola Circle, Sagara Road, Shivamogga - 577204<br>
          Support: +91 7892815965 / 9739230638 | agrishield@gmail.com
        </div>
      </div>
    `;

    const recipients = [customerEmail, ownerEmail].filter(Boolean).join(', ');

    const info = await transporter.sendMail({
      from: `"Agrishield India" <${smtpUser}>`,
      to: recipients,
      subject: `🌾 Order Confirmed #${order.order_id} - Agrishield`,
      html: htmlContent
    });

    console.log('[EmailService] Confirmation email sent to:', recipients, 'ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Error sending order email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderEmail
};
