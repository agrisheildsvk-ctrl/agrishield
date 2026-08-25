const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const razorpayService = require('../services/razorpayService');
const whatsappService = require('../services/whatsappService');
const delhiveryService = require('../services/delhiveryService');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

/**
 * Create a Razorpay order on the backend (/api/payments/create-order)
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount'
      });
    }

    const order = await razorpayService.createRazorpayOrder({
      amount,
      currency,
      receipt: receipt || 'ORD-' + Date.now(),
      notes: notes || {}
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_THeLChW5klDXa0'
    });
  } catch (error) {
    console.error('Error in createPaymentOrder:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify Razorpay payment signature and automatically capture if needed,
 * then save the order to database without duplicates (/api/payments/verify)
 */
const verifyAndSavePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required verification parameters'
      });
    }

    // Step 1: Verify HMAC SHA256 Signature
    const isSignatureValid = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    // Step 2: Verify Payment ID & Order ID with Razorpay API
    const expectedAmount = orderData.totals ? orderData.totals.total : null;
    await razorpayService.verifyPaymentDetails(razorpay_payment_id, razorpay_order_id, expectedAmount);

    // Step 3: Ensure Automatic Payment Capture (retry automatically if needed)
    const payment = await razorpayService.ensurePaymentCaptured(
      razorpay_payment_id,
      expectedAmount,
      'INR'
    );

    const paymentStatus = payment.status === 'captured' ? 'Captured' : 'Authorized';

    // Step 4: Prevent duplicate orders (do not charge or create twice)
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { order_id: orderData.orderId },
          { razorpay_payment_id: razorpay_payment_id }
        ]
      },
      include: { items: true }
    });

    if (existingOrder) {
      razorpayService.logPaymentEvent('Duplicate Order Prevention', {
        orderId: existingOrder.order_id,
        paymentId: razorpay_payment_id
      });

      // If existing order missing shipment and payment captured, attempt Delhivery creation
      if (!existingOrder.delhivery_awb && existingOrder.payment_status === 'Captured') {
        try {
          const delhiveryResult = await delhiveryService.createShipment(existingOrder);
          if (delhiveryResult && delhiveryResult.success && delhiveryResult.awb) {
            const updated = await prisma.order.update({
              where: { id: existingOrder.id },
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
              message: 'Order already saved, shipment created',
              order: updated
            });
          }
        } catch (err) {
          console.error('Error creating Delhivery shipment for existing order:', err.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Order already saved and verified',
        order: existingOrder
      });
    }

    // Step 5: Save new Order to database
    const userId = req.user ? req.user.id : null;
    const { items, totals, shippingAddress } = orderData;

    const newOrder = await prisma.order.create({
      data: {
        order_id: orderData.orderId,
        user_id: userId,
        shipping_address: shippingAddress,
        subtotal: totals.subtotal,
        discount: totals.discount,
        cod_fee: totals.codFee,
        total_amount: totals.total,
        payment_method: 'online',
        payment_status: paymentStatus,
        payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        capture_timestamp: paymentStatus === 'Captured' ? new Date() : null,
        transaction_id: razorpay_payment_id,
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

    // Step 6: Trigger Delhivery Shipment Creation for Captured Payment
    let delhiveryResult = null;
    if (paymentStatus === 'Captured') {
      try {
        delhiveryResult = await delhiveryService.createShipment(newOrder);
        if (delhiveryResult && delhiveryResult.success && delhiveryResult.awb) {
          await prisma.order.update({
            where: { id: newOrder.id },
            data: {
              shipping_status: 'shipment_created',
              delhivery_awb: delhiveryResult.awb,
              delhivery_status: delhiveryResult.delhivery_status || 'Manifested',
              tracking_url: delhiveryResult.tracking_url,
              shipment_created_at: new Date()
            }
          });
        } else {
          await prisma.order.update({
            where: { id: newOrder.id },
            data: {
              shipping_status: 'shipping_pending',
              delhivery_status: delhiveryResult?.error || 'Pending'
            }
          });
        }
      } catch (dErr) {
        console.error('Delhivery shipment creation error for online order:', dErr.message);
        await prisma.order.update({
          where: { id: newOrder.id },
          data: {
            shipping_status: 'shipping_pending',
            delhivery_status: dErr.message
          }
        });
      }
    }

    // Step 7: Automatically send WhatsApp, Email & SMS notifications
    let whatsappResult = { status: 'pending' };
    try {
      whatsappResult = await whatsappService.notifyOwnerNewOrder(newOrder);
    } catch (waErr) {
      console.error('WhatsApp notification error on order creation:', waErr.message);
      whatsappResult = { status: 'failed', error: waErr.message };
    }

    emailService.sendOrderEmail(newOrder).catch(e => console.error('Email error:', e.message));
    smsService.sendOrderSMS(newOrder).catch(e => console.error('SMS error:', e.message));

    const savedOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: { items: true }
    });

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order: savedOrder || newOrder,
      whatsapp: whatsappResult,
      delhivery: delhiveryResult
    });
  } catch (error) {
    razorpayService.logPaymentEvent('Payment Verification & Save Failed', {
      error: error.message || error
    });
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment and save order',
      error: error.message
    });
  }
};

/**
 * Handle Razorpay Webhooks (/api/payments/webhook)
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isVerified = razorpayService.verifyWebhookSignature(rawBody, signature);

    if (!isVerified) {
      razorpayService.logPaymentEvent('Webhook Signature Rejected', {
        headers: req.headers
      });
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    razorpayService.logPaymentEvent(`Webhook Received: ${event}`, {
      event,
      paymentId: payload?.payment?.entity?.id,
      orderId: payload?.payment?.entity?.order_id
    });

    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;
    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const rzpPaymentId = paymentEntity?.id;

    if (!rzpOrderId && !rzpPaymentId) {
      return res.status(200).json({ success: true, message: 'Webhook received (no entity ID)' });
    }

    // Find the corresponding order in database
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          rzpOrderId ? { razorpay_order_id: rzpOrderId } : undefined,
          rzpPaymentId ? { razorpay_payment_id: rzpPaymentId } : undefined
        ].filter(Boolean)
      },
      include: { items: true }
    });

    if (!order) {
      razorpayService.logPaymentEvent('Webhook Order Not Found', {
        rzpOrderId,
        rzpPaymentId
      });
      return res.status(200).json({ success: true, message: 'Order not found for webhook event' });
    }

    switch (event) {
      case 'payment.authorized':
        razorpayService.logPaymentEvent('Payment Authorized (Webhook)', { orderId: order.order_id });
        await prisma.order.update({
          where: { id: order.id },
          data: {
            payment_status: 'Authorized',
            razorpay_payment_id: rzpPaymentId || order.razorpay_payment_id
          }
        });
        if (rzpPaymentId) {
          razorpayService.ensurePaymentCaptured(rzpPaymentId, Number(order.total_amount), 'INR').catch(e => {
            console.error('Background auto-capture from webhook failed:', e.message);
          });
        }
        break;

      case 'payment.captured':
        razorpayService.logPaymentEvent('Payment Captured (Webhook)', { orderId: order.order_id });
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            payment_status: 'Captured',
            razorpay_payment_id: rzpPaymentId || order.razorpay_payment_id,
            transaction_id: rzpPaymentId || order.transaction_id,
            capture_timestamp: new Date()
          },
          include: { items: true }
        });

        // Trigger Delhivery Shipment creation if not created yet
        if (!updatedOrder.delhivery_awb) {
          try {
            const delhiveryResult = await delhiveryService.createShipment(updatedOrder);
            if (delhiveryResult && delhiveryResult.success && delhiveryResult.awb) {
              await prisma.order.update({
                where: { id: updatedOrder.id },
                data: {
                  shipping_status: 'shipment_created',
                  delhivery_awb: delhiveryResult.awb,
                  delhivery_status: delhiveryResult.delhivery_status || 'Manifested',
                  tracking_url: delhiveryResult.tracking_url,
                  shipment_created_at: new Date()
                }
              });
            }
          } catch (dErr) {
            console.error('Webhook shipment creation error:', dErr.message);
          }
        }
        break;

      case 'payment.failed':
        razorpayService.logPaymentEvent('Payment Failed (Webhook)', { orderId: order.order_id });
        await prisma.order.update({
          where: { id: order.id },
          data: {
            payment_status: 'Failed'
          }
        });
        break;

      case 'refund.created':
      case 'refund.processed':
        razorpayService.logPaymentEvent('Payment Refunded (Webhook)', { orderId: order.order_id, event });
        await prisma.order.update({
          where: { id: order.id },
          data: {
            payment_status: 'Refunded'
          }
        });
        break;

      default:
        razorpayService.logPaymentEvent(`Unhandled Webhook Event: ${event}`);
        break;
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    razorpayService.logPaymentEvent('Webhook Handling Error', { error: error.message });
    console.error('Webhook error:', error);
    return res.status(200).json({ success: false, message: 'Webhook error handled' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyAndSavePayment,
  handleWebhook
};
