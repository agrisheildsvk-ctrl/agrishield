const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const delhiveryService = require('../services/delhiveryService');

/**
 * Explicit route: POST /api/shipping/delhivery/create
 * Manifest a shipment for an order cleanly and idempotently
 */
const createDelhiveryShipment = async (req, res) => {
  try {
    const {
      orderId,
      id,
      weight,
      length,
      width,
      height,
      pickup_location,
      address,
      pin,
      pincode,
      phone,
      firstName,
      lastName,
      name
    } = req.body;

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

    // IDEMPOTENCY GUARD: If AWB exists already, return existing shipment
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

    // Format current shipping address
    let currentAddr = {};
    if (typeof order.shipping_address === 'string') {
      try { currentAddr = JSON.parse(order.shipping_address); } catch (e) { currentAddr = { address: order.shipping_address }; }
    } else if (order.shipping_address && typeof order.shipping_address === 'object') {
      currentAddr = { ...order.shipping_address };
    }

    // Merge updated shipping fields if provided in request body
    if (weight !== undefined) currentAddr.weight = parseFloat(weight) || currentAddr.weight || 0.5;
    if (length !== undefined) currentAddr.length = parseFloat(length) || currentAddr.length || 10;
    if (width !== undefined) currentAddr.width = parseFloat(width) || currentAddr.width || 10;
    if (height !== undefined) currentAddr.height = parseFloat(height) || currentAddr.height || 5;
    if (pickup_location !== undefined) currentAddr.pickup_location = pickup_location || currentAddr.pickup_location;
    if (address !== undefined) currentAddr.address = address || currentAddr.address;
    if (pin || pincode) currentAddr.pin = String(pin || pincode).replace(/\D/g, '');
    if (phone) currentAddr.phone = String(phone).replace(/\D/g, '');
    if (firstName) currentAddr.firstName = firstName;
    if (lastName) currentAddr.lastName = lastName;
    if (name) currentAddr.name = name;

    // STRICT SERVER-SIDE VALIDATION
    const missingFields = [];
    const custName = (currentAddr.fullName || currentAddr.name || `${currentAddr.firstName || ''} ${currentAddr.lastName || ''}`.trim()).trim();
    if (!custName) missingFields.push('Customer Name');
    if (!currentAddr.phone || String(currentAddr.phone).replace(/\D/g, '').length < 10) missingFields.push('Valid 10-digit Phone Number');
    if (!currentAddr.address || String(currentAddr.address).trim().length < 3) missingFields.push('Delivery Address');
    if (!currentAddr.pin || String(currentAddr.pin).replace(/\D/g, '').length !== 6) missingFields.push('Valid 6-digit Pincode');
    if (!order.items || order.items.length === 0) missingFields.push('Product Items');
    if (!currentAddr.weight || parseFloat(currentAddr.weight) <= 0) missingFields.push('Package Weight (kg)');
    if (!currentAddr.length || parseFloat(currentAddr.length) <= 0) missingFields.push('Package Length (cm)');
    if (!currentAddr.width || parseFloat(currentAddr.width) <= 0) missingFields.push('Package Width (cm)');
    if (!currentAddr.height || parseFloat(currentAddr.height) <= 0) missingFields.push('Package Height (cm)');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot generate AWB. Missing or invalid required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Save updated shipping address in DB before calling Delhivery
    const updatedOrderAddress = await prisma.order.update({
      where: { id: order.id },
      data: { shipping_address: currentAddr },
      include: { items: true }
    });

    // Call Delhivery Shipment Manifestation API
    const result = await delhiveryService.createShipment(updatedOrderAddress);

    if (result && result.success && result.awb) {
      const finalOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          shipping_status: 'shipment_created', // READY_TO_SHIP
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
        message: 'Delhivery shipment manifested successfully!',
        awb: result.awb,
        tracking_url: result.tracking_url,
        label_url: result.label_url,
        order: finalOrder
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shipping_status: 'shipping_pending', // Keep PENDING_AWB
          delhivery_status: result?.error || 'Manifestation failed'
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Delhivery shipment creation failed: ' + (result?.error || 'Unknown Delhivery error'),
        error: result?.error,
        order: updatedOrderAddress
      });
    }
  } catch (error) {
    console.error('Error creating Delhivery shipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create shipment: ' + error.message,
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
