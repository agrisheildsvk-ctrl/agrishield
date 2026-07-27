const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Structured logger for Razorpay payment lifecycle events
 * @param {string} eventType - Event name (e.g., "Order Created", "Payment Authorized", etc.)
 * @param {object} data - Detailed payload to log
 */
const logPaymentEvent = (eventType, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[RAZORPAY LOG] [${timestamp}] ${eventType}:`, JSON.stringify(data, null, 2));
};

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_THeLChW5klDXa0';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'M0WINvOAcNlVolWc6J58NA4i';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'agrishield_webhook_secret_2026';

    this.instance = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret
    });
  }

  /**
   * Helper sleep function for retry and polling backoff
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create an Order using official Razorpay Orders API (/v1/orders)
   * @param {number} amount - Amount in INR (will be converted to paise)
   * @param {string} currency - Currency code (e.g., 'INR')
   * @param {string} receipt - Receipt ID / Internal Order ID
   * @param {object} notes - Custom metadata notes
   */
  async createRazorpayOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    try {
      const amountInPaise = Math.round(Number(amount) * 100);

      const options = {
        amount: amountInPaise,
        currency,
        receipt: String(receipt),
        notes
      };

      const order = await this.instance.orders.create(options);

      logPaymentEvent('Order Created', {
        razorpayOrderId: order.id,
        receipt: order.receipt,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      });

      return order;
    } catch (error) {
      logPaymentEvent('Order Creation Failed', {
        error: error.message || error,
        receipt,
        amount
      });
      throw new Error(`Razorpay Order Creation Error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Verify Razorpay Payment Signature using HMAC SHA256
   */
  verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    try {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        logPaymentEvent('Signature Verification Failed', {
          reason: 'Missing parameters',
          razorpay_order_id,
          razorpay_payment_id
        });
        return false;
      }

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body.toString())
        .digest('hex');

      const isValid = expectedSignature === razorpay_signature;

      if (isValid) {
        logPaymentEvent('Signature Verified', {
          razorpay_order_id,
          razorpay_payment_id,
          verified: true
        });
      } else {
        logPaymentEvent('Signature Verification Failed', {
          reason: 'HMAC signature mismatch',
          razorpay_order_id,
          razorpay_payment_id
        });
      }

      return isValid;
    } catch (error) {
      logPaymentEvent('Signature Verification Error', {
        error: error.message || error
      });
      return false;
    }
  }

  /**
   * Verify payment details with Razorpay server
   */
  async verifyPaymentDetails(paymentId, expectedOrderId, expectedAmountInINR) {
    try {
      const payment = await this.instance.payments.fetch(paymentId);

      if (!payment) {
        throw new Error('Payment not found on Razorpay');
      }

      // Check order ID match if payment is tied to an order
      if (expectedOrderId && payment.order_id && payment.order_id !== expectedOrderId) {
        throw new Error(`Order ID mismatch: expected ${expectedOrderId}, got ${payment.order_id}`);
      }

      // Check amount match (in paise)
      if (expectedAmountInINR !== undefined && expectedAmountInINR !== null) {
        const expectedPaise = Math.round(Number(expectedAmountInINR) * 100);
        if (payment.amount !== expectedPaise) {
          throw new Error(`Amount mismatch: expected ${expectedPaise} paise, got ${payment.amount} paise`);
        }
      }

      logPaymentEvent('Payment Details Verified', {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        status: payment.status
      });

      return payment;
    } catch (error) {
      logPaymentEvent('Payment Details Verification Error', {
        paymentId,
        error: error.message || error
      });
      throw error;
    }
  }

  /**
   * Ensure payment is automatically captured.
   * If authorized, attempt immediate capture with automatic retry.
   * If auto-capture is pending, poll briefly to confirm capture completion.
   */
  async ensurePaymentCaptured(paymentId, amountInINR, currency = 'INR') {
    const amountInPaise = Math.round(Number(amountInINR) * 100);
    let payment = await this.instance.payments.fetch(paymentId);

    logPaymentEvent(`Payment Status Checked`, {
      paymentId,
      status: payment.status
    });

    if (payment.status === 'captured') {
      logPaymentEvent('Payment Captured', {
        paymentId,
        status: payment.status,
        method: payment.method
      });
      return payment;
    }

    if (payment.status === 'authorized') {
      logPaymentEvent('Payment Authorized', {
        paymentId,
        status: payment.status,
        note: 'Attempting automatic capture...'
      });

      // Attempt capture with up to 3 retries
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          payment = await this.instance.payments.capture(paymentId, amountInPaise, currency);
          logPaymentEvent('Payment Captured', {
            paymentId,
            status: payment.status,
            attempt
          });
          return payment;
        } catch (captureErr) {
          logPaymentEvent('Automatic Capture Attempt Failed', {
            paymentId,
            attempt,
            error: captureErr.message || captureErr
          });

          // If Razorpay error says already captured, fetch and verify
          if (String(captureErr.message || '').toLowerCase().includes('already captured')) {
            payment = await this.instance.payments.fetch(paymentId);
            if (payment.status === 'captured') {
              logPaymentEvent('Payment Captured', { paymentId, status: payment.status });
              return payment;
            }
          }

          if (attempt < maxRetries) {
            await this.sleep(1500 * attempt);
          }
        }
      }
    }

    // Polling fallback: check up to 3 times in case Razorpay auto-capture process is finishing asynchronously
    for (let poll = 1; poll <= 3; poll++) {
      await this.sleep(1500);
      payment = await this.instance.payments.fetch(paymentId);
      if (payment.status === 'captured') {
        logPaymentEvent('Payment Captured', {
          paymentId,
          status: payment.status,
          pollAttempt: poll
        });
        return payment;
      }
    }

    return payment;
  }

  /**
   * Verify Razorpay Webhook signature
   */
  verifyWebhookSignature(rawBody, signature, secret) {
    try {
      const webhookSecret = secret || this.webhookSecret;
      if (!rawBody || !signature || !webhookSecret) {
        logPaymentEvent('Webhook Signature Verification Failed', {
          reason: 'Missing arguments'
        });
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
        .digest('hex');

      const isValid = expectedSignature === signature;
      if (isValid) {
        logPaymentEvent('Signature Verified', { context: 'webhook' });
      } else {
        logPaymentEvent('Webhook Signature Verification Failed', {
          reason: 'HMAC signature mismatch'
        });
      }
      return isValid;
    } catch (error) {
      logPaymentEvent('Webhook Signature Verification Error', {
        error: error.message || error
      });
      return false;
    }
  }

  /**
   * Refund a payment (helper for error handling / future use)
   */
  async refundPayment(paymentId, amountInINR, notes = {}) {
    try {
      const options = { notes };
      if (amountInINR) {
        options.amount = Math.round(Number(amountInINR) * 100);
      }
      const refund = await this.instance.payments.refund(paymentId, options);
      logPaymentEvent('Payment Refunded', {
        paymentId,
        refundId: refund.id,
        amount: refund.amount
      });
      return refund;
    } catch (error) {
      logPaymentEvent('Refund Error', { paymentId, error: error.message || error });
      throw error;
    }
  }
}

module.exports = new RazorpayService();
module.exports.logPaymentEvent = logPaymentEvent;
