const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const delhiveryService = require('../services/delhiveryService');

/**
 * Explicit route: POST /api/shipping/delhivery/create
 * Manifest a shipment for an order cleanly and idempotently
 */
const createDelhiveryShipment = async (req, res) => {
  try {
    const { orderId, id } = req.body;
    const targetQuery = id ? parseInt(id) : orderId;

    if (!targetQuery) {
      return res.status(400).json({
        success: false,
        message: 'Missing orderId or id in request body'
      });
    }

    const order = await prisma.order.findFirst({
      where: typeof targetQuery === 'number'
        ? { id: targetQuery }
        : { OR: [{ order_id: String(targetQuery) }, { id: parseInt(targetQuery) || -1 }] },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Idempotency check: if AWB exists already, return existing details
    if (order.delhivery_awb) {
      return res.status(200).json({
        success: true,
        message: 'Shipment already exists for this order',
        awb: order.delhivery_awb,
        tracking_url: order.tracking_url,
        label_url: order.delhivery_label_url,
        order
      });
    }

    const result = await delhiveryService.createShipment(order);

    if (result && result.success && result.awb) {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          shipping_status: 'shipment_created',
          delhivery_awb: result.awb,
          delhivery_tracking_id: result.tracking_id || result.awb,
          delhivery_shipment_id: result.shipment_id || order.order_id,
          delhivery_status: result.delhivery_status || 'Manifested',
          delhivery_label_url: result.label_url,
          tracking_url: result.tracking_url,
          shipment_created_at: new Date(),
          delhivery_created_at: new Date()
        },
        include: { items: true }
      });

      return res.status(200).json({
        success: true,
        message: 'Delhivery shipment created successfully',
        awb: result.awb,
        tracking_url: result.tracking_url,
        label_url: result.label_url,
        order: updatedOrder
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shipping_status: 'shipping_pending',
          delhivery_status: result?.error || 'Manifestation failed'
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Delhivery shipment creation failed: ' + (result?.error || 'Unknown error'),
        error: result?.error,
        order
      });
    }
  } catch (error) {
    console.error('Error creating Delhivery shipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

/**
 * Explicit route: GET /api/shipping/delhivery/track/:awb
 * Query Delhivery tracking status by AWB or Order ID
 */
const trackDelhiveryShipment = async (req, res) => {
  try {
    const { awb } = req.params;

    if (!awb) {
      return res.status(400).json({
        success: false,
        message: 'Missing AWB parameter'
      });
    }

    const trackingResult = await delhiveryService.getTracking(awb);

    return res.status(200).json({
      success: true,
      awb,
      tracking: trackingResult
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to track shipment',
      error: error.message
    });
  }
};

/**
 * Explicit route: POST /api/shipping/delhivery/pickup
 * Schedule a pickup request with Delhivery
 */
const scheduleDelhiveryPickup = async (req, res) => {
  try {
    const { pickup_date, pickup_time, expected_package_count } = req.body;

    const result = await delhiveryService.requestPickup({
      pickup_date,
      pickup_time,
      expected_package_count
    });

    if (result && result.success) {
      return res.status(200).json({
        success: true,
        message: 'Pickup request scheduled successfully',
        pickup_id: result.pickup_id,
        data: result
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to schedule pickup: ' + (result?.error || 'Unknown error'),
        error: result?.error
      });
    }
  } catch (error) {
    console.error('Error scheduling pickup:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule pickup',
      error: error.message
    });
  }
};

module.exports = {
  createDelhiveryShipment,
  trackDelhiveryShipment,
  scheduleDelhiveryPickup
};
