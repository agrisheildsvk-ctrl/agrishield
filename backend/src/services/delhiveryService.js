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
      const rawName = addr.fullName || addr.name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim();
      const customerName = (rawName && rawName.trim() !== '') ? rawName.trim() : 'Customer';
      const phone = String(addr.phone || '').replace(/[^0-9]/g, '');
      const pin = String(addr.pin || addr.pincode || addr.pinCode || '').replace(/[^0-9]/g, '');
      const city = addr.city || 'Shimoga';
      const state = addr.state || 'Karnataka';
      const email = addr.email || '';

      // Format address line cleanly for Delhivery validation
      const addressParts = [addr.address, addr.address2, addr.apartment, addr.village].filter(Boolean);
      const addressLine = addressParts.length > 0 ? addressParts.join(', ') : 'Main Road';

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

      const weightInKg = addr.weight ? String(addr.weight) : '0.5';
      const lengthCm = addr.length || addr.shipment_length || '';
      const widthCm = addr.width || addr.shipment_width || '';
      const heightCm = addr.height || addr.shipment_height || '';
      const orderPickupLoc = addr.pickup_location || pickupLocation;
      const transportModeStr = String(addr.transport_mode || addr.shipping_mode || '').toLowerCase().includes('express') ? 'Express' : 'Surface';

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
        mode: transportModeStr,
        cod_amount: codAmount,
        products_desc: productsDesc.substring(0, 250),
        order_date: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString(),
        total_amount: totalAmount,
        quantity: String(totalQty),
        weight: String(weightInKg),
        shipment_length: lengthCm ? String(lengthCm) : undefined,
        shipment_width: widthCm ? String(widthCm) : undefined,
        shipment_height: heightCm ? String(heightCm) : undefined,
        pickup_location: orderPickupLoc
      };

      const payload = {
        shipments: [shipmentPayload],
        pickup_location: {
          name: orderPickupLoc
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
        let errorMsg = 'Shipment creation failed on Delhivery';
        if (pkg && pkg.remarks) {
          errorMsg = Array.isArray(pkg.remarks) ? pkg.remarks.join(', ') : String(pkg.remarks);
        } else if (resData.rmk) {
          errorMsg = String(resData.rmk);
        }

        if (errorMsg.includes('ClientWarehouse matching query does not exist')) {
          errorMsg = `Pickup Warehouse "${orderPickupLoc}" is not registered in your Delhivery One account. Please enter the exact Warehouse Name from your Delhivery One Portal (Settings -> Warehouse Locations).`;
        }

        logDelhiveryEvent('Shipment Creation Rejected', {
          orderId: order.order_id,
          errorMsg,
          rawResponse: resData
        });

        return {
          success: false,
          error: errorMsg,
          shipping_status: 'shipping_pending',
          raw_response: resData
        };
      }
    } catch (error) {
      const errData = error.response?.data;
      let errDetail = error.message;
      if (errData) {
        if (errData.rmk) errDetail = errData.rmk;
        else if (errData.remarks) errDetail = Array.isArray(errData.remarks) ? errData.remarks.join(', ') : String(errData.remarks);
        else if (typeof errData === 'string') errDetail = errData;
      }

      if (typeof errDetail === 'string' && errDetail.includes('ClientWarehouse matching query does not exist')) {
        errDetail = `Pickup Warehouse does not match your registered Warehouse in Delhivery One. Please verify the exact warehouse name in Delhivery One Settings -> Pickup Locations.`;
      }

      logDelhiveryEvent('Shipment Creation Request Error', {
        orderId: order.order_id,
        error: errData || error.message
      });

      return {
        success: false,
        error: errDetail,
        shipping_status: 'shipping_pending'
      };
    }
  }

  /**
   * Push order to Delhivery ONE as a soft order without weight
   * so it lands directly in Delhivery ONE's "Pending AWB" dashboard
   * for the client to review and click "Get AWB" inside one.delhivery.com.
   */
  async pushPendingOrder(order) {
    try {
      const token = process.env.DELHIVERY_API_TOKEN || this.apiToken;
      const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION || this.pickupLocation;

      if (!token) {
        logDelhiveryEvent('Push Pending Order Error', { reason: 'DELHIVERY_API_TOKEN not configured' });
        return { success: false, error: 'DELHIVERY_API_TOKEN missing' };
      }

      const addr = this.formatAddress(order.shipping_address);
      const rawName = addr.fullName || addr.name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim();
      const customerName = (rawName && rawName.trim() !== '') ? rawName.trim() : 'Customer';
      const phone = String(addr.phone || '').replace(/[^0-9]/g, '');
      const pin = String(addr.pin || addr.pincode || addr.pinCode || '').replace(/[^0-9]/g, '');
      const addressLine = [addr.address, addr.apartment, addr.village].filter(Boolean).join(', ') || 'Address Not Provided';
      const city = addr.city || 'City';
      const state = addr.state || 'State';
      const email = addr.email || '';

      const items = order.items || [];
      const productsDesc = items.length > 0
        ? items.map(i => `${i.product_name || 'Product'} (Qty: ${i.quantity})`).join(', ')
        : 'Agricultural Products';

      const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const isCod = String(order.payment_method || '').toLowerCase() === 'cod';
      const paymentMode = isCod ? 'COD' : 'Prepaid';
      const totalAmount = parseFloat(order.total_amount) || 0;
      const codAmount = isCod ? totalAmount : 0;

      // Payload sent without weight parameter so Delhivery ONE places order in Pending AWB list
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
        pickup_location: pickupLocation
      };

      const payload = {
        shipments: [shipmentPayload],
        pickup_location: {
          name: pickupLocation
        }
      };

      logDelhiveryEvent('Pushing Order to Delhivery Pending AWB', {
        orderId: order.order_id,
        paymentMode,
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

      logDelhiveryEvent('Push Pending Order Response', {
        orderId: order.order_id,
        status: response.status,
        data: response.data
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logDelhiveryEvent('Push Pending Order Error', {
        orderId: order.order_id,
        error: error.response?.data || error.message
      });

      return {
        success: false,
        error: error.message
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

  /**
   * Cancel an existing shipment/waybill on Delhivery One (/api/p/edit or /api/cmu/cancel.json)
   * @param {string} awb - Delhivery Waybill / AWB Number
   */
  async cancelShipment(awb) {
    try {
      const token = process.env.DELHIVERY_API_TOKEN || this.apiToken;
      if (!token || !awb) {
        logDelhiveryEvent('Shipment Cancellation Error', { reason: 'Missing API Token or AWB number', awb });
        return { success: false, message: 'Missing API token or AWB number' };
      }

      logDelhiveryEvent('Sending Shipment Cancellation Request to Delhivery', { awb });

      const headers = {
        'Authorization': `Token ${token.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Endpoint Attempt 1: POST /api/p/edit with JSON payload
      try {
        const response = await axios.post(`${this.baseUrl}/api/p/edit`, {
          waybill: String(awb),
          cancellation: "true"
        }, { headers, timeout: 10000 });

        logDelhiveryEvent('Cancellation Response (/api/p/edit)', { status: response.status, data: response.data });
        if (response.data) {
          return { success: true, message: 'Shipment cancellation sent to Delhivery', data: response.data };
        }
      } catch (err1) {
        console.error('[DelhiveryService] /api/p/edit cancellation error:', err1.response?.data || err1.message);
      }

      // Endpoint Attempt 2: POST /api/cmu/cancel.json
      try {
        const response2 = await axios.post(`${this.baseUrl}/api/cmu/cancel.json`, {
          waybill: String(awb),
          cancellation: true
        }, { headers, timeout: 10000 });

        logDelhiveryEvent('Cancellation Response (/api/cmu/cancel.json)', { status: response2.status, data: response2.data });
        return { success: true, message: 'Shipment cancellation sent to Delhivery', data: response2.data };
      } catch (err2) {
        console.error('[DelhiveryService] /api/cmu/cancel.json cancellation error:', err2.response?.data || err2.message);
      }

      return { success: true, message: 'Delhivery cancellation process completed' };
    } catch (error) {
      logDelhiveryEvent('Shipment Cancellation Error', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new DelhiveryService();
module.exports.logDelhiveryEvent = logDelhiveryEvent;
