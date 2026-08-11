const axios = require('axios');

/**
 * Structured logger for Delhivery integration events
 */
const logDelhiveryEvent = (eventType, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[DELHIVERY LOG] [${timestamp}] ${eventType}:`, JSON.stringify(data, null, 2));
};

class DelhiveryService {
  constructor() {
    this.apiToken = process.env.DELHIVERY_API_TOKEN || '';
    this.pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION || 'Shri Veerabhadreshwara Krishi Kendra';
    this.baseUrl = process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com';
  }

  /**
   * Helper to get request headers for Delhivery API
   */
  getHeaders() {
    const token = process.env.DELHIVERY_API_TOKEN || this.apiToken;
    return {
      'Authorization': `Token ${token.trim()}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  /**
   * Helper to format shipping address into standard fields
   */
  formatAddress(shippingAddress) {
    if (!shippingAddress) return {};
    if (typeof shippingAddress === 'string') {
      try {
        return JSON.parse(shippingAddress);
      } catch (e) {
        return { address: shippingAddress };
      }
    }
    return shippingAddress;
  }

  /**
   * Create a shipment in Delhivery One (/api/cmu/create.json)
   * Idempotent: Returns existing shipment info if order already has an AWB.
   * @param {object} order - The Order model object from Prisma (with items included)
   */
  async createShipment(order) {
    try {
      // IDEMPOTENCY GUARD: Check if shipment already created for this order
      if (order.delhivery_awb) {
        logDelhiveryEvent('Duplicate Shipment Prevented', {
          orderId: order.order_id,
          existingAwb: order.delhivery_awb
        });
        return {
          success: true,
          awb: order.delhivery_awb,
          status: order.shipping_status || 'shipment_created',
          delhivery_status: order.delhivery_status || 'Manifested',
          tracking_url: order.tracking_url || `https://www.delhivery.com/track/package/${order.delhivery_awb}`,
          is_existing: true
        };
      }

      const token = process.env.DELHIVERY_API_TOKEN || this.apiToken;
      const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION || this.pickupLocation;

      if (!token) {
        logDelhiveryEvent('Shipment Creation Error', {
          orderId: order.order_id,
          reason: 'DELHIVERY_API_TOKEN is not configured in Railway environment variables.'
        });
        return {
          success: false,
          error: 'DELHIVERY_API_TOKEN missing in environment variables',
          shipping_status: 'shipping_pending'
        };
      }

      const addr = this.formatAddress(order.shipping_address);

      // Customer Info
      const customerName = `${addr.firstName || ''} ${addr.lastName || addr.name || ''}`.trim() || 'Customer';
      const phone = String(addr.phone || '').replace(/[^0-9]/g, '');
      const pin = String(addr.pin || addr.pincode || addr.pinCode || '').replace(/[^0-9]/g, '');
      const addressLine = [addr.address, addr.apartment, addr.village].filter(Boolean).join(', ') || 'Address Not Provided';
      const city = addr.city || 'City';
      const state = addr.state || 'State';
      const email = addr.email || '';

      // Order Items summary
      const items = order.items || [];
      const productsDesc = items.length > 0
        ? items.map(i => `${i.product_name || 'Product'} (Qty: ${i.quantity})`).join(', ')
        : 'Agricultural Products';

      const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const isCod = String(order.payment_method || '').toLowerCase() === 'cod';
      const paymentMode = isCod ? 'COD' : 'Prepaid';
      const totalAmount = parseFloat(order.total_amount) || 0;
      const codAmount = isCod ? totalAmount : 0;

      // Construct Delhivery Payload
      const shipmentPayload = {
        name: customerName,
        add: addressLine,
        pin: pin,
        city: city,
        state: state,
        country: 'India',
        phone: phone,
        email: email,
        order: order.order_id,
        payment_mode: paymentMode,
        cod_amount: codAmount,
        products_desc: productsDesc.substring(0, 250),
        order_date: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString(),
        total_amount: totalAmount,
        quantity: String(totalQty),
        weight: '0.5', // standard default weight in kg
        pickup_location: pickupLocation
      };

      const payload = {
        shipments: [shipmentPayload],
        pickup_location: {
          name: pickupLocation
        }
      };

      logDelhiveryEvent('Sending Shipment Request', {
        orderId: order.order_id,
        paymentMode,
        pickupLocation,
        consignee: customerName
      });

      const params = new URLSearchParams();
      params.append('format', 'json');
      params.append('data', JSON.stringify(payload));

      const endpoint = `${this.baseUrl}/api/cmu/create.json`;

      const response = await axios.post(endpoint, params.toString(), {
        headers: this.getHeaders(),
        timeout: 15000
      });

      logDelhiveryEvent('Shipment API Response', {
        orderId: order.order_id,
        status: response.status,
        data: response.data
      });

      const resData = response.data || {};
      const pkg = resData.packages && resData.packages[0];

      if (pkg && (pkg.status === 'Success' || pkg.waybill)) {
        const awb = pkg.waybill;
        const trackingUrl = `https://www.delhivery.com/track/package/${awb}`;
        const labelUrl = `https://track.delhivery.com/api/p/packing_slip?wbns=${awb}`;

        logDelhiveryEvent('Shipment Created Successfully', {
          orderId: order.order_id,
          awb,
          trackingUrl
        });

        return {
          success: true,
          awb: awb,
          tracking_id: awb,
          shipment_id: pkg.refnum || order.order_id,
          status: 'shipment_created',
          delhivery_status: pkg.status || 'Manifested',
          tracking_url: trackingUrl,
          label_url: labelUrl,
          raw_response: resData
        };
      } else {
        const errorMsg = pkg?.remarks?.[0] || pkg?.remarks || resData.rmk || 'Shipment creation failed on Delhivery';
        logDelhiveryEvent('Shipment Creation Rejected', {
          orderId: order.order_id,
          errorMsg
        });

        return {
          success: false,
          error: errorMsg,
          shipping_status: 'shipping_pending',
          raw_response: resData
        };
      }
    } catch (error) {
      logDelhiveryEvent('Shipment Creation Request Error', {
        orderId: order.order_id,
        error: error.response?.data || error.message
      });

      return {
        success: false,
        error: error.response?.data?.rmk || error.message,
        shipping_status: 'shipping_pending'
      };
    }
  }

  /**
   * Fetch real-time tracking information from Delhivery (/api/v1/packages/json/)
   * @param {string} awb - Delhivery Waybill / AWB Number or Order ID
   */
  async getTracking(awb) {
    try {
      const token = process.env.DELHIVERY_API_TOKEN || this.apiToken;
      if (!token || !awb) {
        return {
          success: false,
          message: 'Missing API Token or AWB number'
        };
      }

      const isAwbNumeric = /^[0-9]+$/.test(awb);
      const queryParam = isAwbNumeric ? `waybill=${awb}` : `ref_ids=${awb}`;
      const endpoint = `${this.baseUrl}/api/v1/packages/json/?${queryParam}`;

      logDelhiveryEvent('Fetching Tracking Info', { awb, endpoint });

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Token ${token.trim()}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      logDelhiveryEvent('Tracking API Response Received', { awb, status: response.status });

      const shipmentData = response.data?.ShipmentData?.[0]?.Shipment;
      if (!shipmentData) {
        return {
          success: false,
          message: 'Tracking data not available for this AWB yet',
          raw: response.data
        };
      }

      const statusObj = shipmentData.Status || {};
      const statusText = statusObj.Status || 'Manifested';
      const scans = (shipmentData.Scans || []).map(s => s.ScanDetail || s);

      // Map Delhivery status to Agrishield shipping_status enum
      let shippingStatus = 'shipment_created';
      const lowerStatus = statusText.toLowerCase();

      if (lowerStatus.includes('delivered')) {
        shippingStatus = 'delivered';
      } else if (lowerStatus.includes('out for delivery') || lowerStatus.includes('outfordelivery')) {
        shippingStatus = 'out_for_delivery';
      } else if (lowerStatus.includes('in transit') || lowerStatus.includes('intransit') || lowerStatus.includes('dispatched')) {
        shippingStatus = 'in_transit';
      } else if (lowerStatus.includes('pickup') || lowerStatus.includes('picked up')) {
        shippingStatus = 'pickup_scheduled';
      } else if (lowerStatus.includes('cancel')) {
        shippingStatus = 'cancelled';
      } else if (lowerStatus.includes('rto') || lowerStatus.includes('return')) {
        shippingStatus = 'rto';
      }

      return {
        success: true,
        awb: shipmentData.AWB || awb,
        current_status: statusText,
        shipping_status: shippingStatus,
        origin: shipmentData.Origin,
        destination: shipmentData.Destination,
        expected_delivery: shipmentData.ExpectedDeliveryDate,
        scans: scans,
        raw: shipmentData
      };
    } catch (error) {
      logDelhiveryEvent('Tracking API Error', {
        awb,
        error: error.response?.data || error.message
      });

      return {
        success: false,
        message: 'Failed to retrieve tracking details from Delhivery',
        error: error.message
      };
    }
  }

  /**
   * Request pickup from Delhivery (/fm/request/new/)
   * @param {object} options - { pickup_date, pickup_time, expected_package_count }
   */
  async requestPickup(options = {}) {
    try {
      const token = process.env.DELHIVERY_API_TOKEN || this.apiToken;
      const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION || this.pickupLocation;

      if (!token) {
        throw new Error('DELHIVERY_API_TOKEN is not configured');
      }

      const payload = {
        pickup_location: pickupLocation,
        pickup_date: options.pickup_date || new Date().toISOString().split('T')[0],
        pickup_time: options.pickup_time || '14:00:00',
        expected_package_count: Number(options.expected_package_count || 1)
      };

      logDelhiveryEvent('Sending Pickup Request', payload);

      const endpoint = `${this.baseUrl}/fm/request/new/`;
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Token ${token.trim()}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      logDelhiveryEvent('Pickup Request Response', response.data);

      return {
        success: true,
        pickup_id: response.data?.pr_id || response.data?.id || 'PR-' + Date.now(),
        message: 'Pickup requested successfully',
        raw: response.data
      };
    } catch (error) {
      logDelhiveryEvent('Pickup Request Error', { error: error.response?.data || error.message });
      return {
        success: false,
        error: error.response?.data?.pr_id || error.message
      };
    }
  }
}

module.exports = new DelhiveryService();
module.exports.logDelhiveryEvent = logDelhiveryEvent;
