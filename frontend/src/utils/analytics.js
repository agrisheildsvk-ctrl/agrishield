/**
 * Analytics Utility for GA4 and Meta Pixel
 * Google Analytics 4 (GA4): G-ZYM1XTKZC4
 * Meta Pixel: 1347925883949604
 *
 * Implements eCommerce events:
 * 1. Page View (page_view / PageView)
 * 2. View Content (view_item / ViewContent)
 * 3. Add to Cart (add_to_cart / AddToCart)
 * 4. Checkout (begin_checkout / InitiateCheckout)
 * 5. Purchase (purchase / Purchase)
 */

export const GA4_ID = 'G-ZYM1XTKZC4';
export const FB_PIXEL_ID = '1347925883949604';

/**
 * Safely parses price string or number into float (e.g. "₹1,499.00" -> 1499)
 */
export const parsePrice = (priceStr) => {
  if (priceStr === undefined || priceStr === null) return 0;
  if (typeof priceStr === 'number') return priceStr;
  const numericStr = String(priceStr).replace(/[^0-9.]/g, '');
  return parseFloat(numericStr) || 0;
};

/**
 * 1. Track Page View
 * Fired on initial page load and on every SPA route change.
 */
export const trackPageView = (url = window.location.pathname + window.location.search) => {
  if (typeof window === 'undefined') return;

  // Google Analytics 4 (page_view)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA4_ID
    });
  }

  // Meta Pixel (PageView)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

/**
 * 2. Track View Content (Product Detail Page View)
 */
export const trackViewContent = (product) => {
  if (typeof window === 'undefined' || !product) return;

  const numericPrice = parsePrice(product.price);
  const itemId = String(product.id || product.slug || '');
  const itemName = product.name || product.title || '';
  const itemCategory = product.category || 'Agriculture';

  // Google Analytics 4 (view_item)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'INR',
      value: numericPrice,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          price: numericPrice,
          item_category: itemCategory
        }
      ]
    });
  }

  // Meta Pixel (ViewContent)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_ids: [itemId],
      content_name: itemName,
      content_type: 'product',
      content_category: itemCategory,
      value: numericPrice,
      currency: 'INR'
    });
  }
};

/**
 * 3. Track Add to Cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (typeof window === 'undefined' || !product) return;

  const qty = Number(quantity) || 1;
  const numericPrice = parsePrice(product.price);
  const totalValue = numericPrice * qty;
  const itemId = String(product.id || product.slug || '');
  const itemName = product.name || product.title || '';
  const itemCategory = product.category || 'Agriculture';

  // Google Analytics 4 (add_to_cart)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: totalValue,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          price: numericPrice,
          quantity: qty,
          item_category: itemCategory
        }
      ]
    });
  }

  // Meta Pixel (AddToCart)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_ids: [itemId],
      content_name: itemName,
      content_type: 'product',
      value: totalValue,
      currency: 'INR'
    });
  }
};

/**
 * 4. Track Checkout (begin_checkout / InitiateCheckout)
 */
export const trackBeginCheckout = (items = [], totalValue = 0) => {
  if (typeof window === 'undefined' || !items || items.length === 0) return;

  const numericTotal = parsePrice(totalValue);
  const formattedItems = items.map(item => ({
    item_id: String(item.id || item.slug || ''),
    item_name: item.name || item.title || '',
    price: parsePrice(item.price),
    quantity: item.quantity || 1,
    item_category: item.category || 'Agriculture'
  }));

  // Google Analytics 4 (begin_checkout)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: numericTotal,
      items: formattedItems
    });
  }

  // Meta Pixel (InitiateCheckout)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: formattedItems.map(i => i.item_id),
      content_type: 'product',
      num_items: formattedItems.reduce((acc, i) => acc + i.quantity, 0),
      value: numericTotal,
      currency: 'INR'
    });
  }
};

/**
 * 5. Track Purchase (purchase / Purchase)
 */
export const trackPurchase = (orderData) => {
  if (typeof window === 'undefined' || !orderData) return;

  const transactionId = String(orderData.orderId || orderData.id || Date.now());
  const items = orderData.items || [];
  const totalValue = parsePrice(
    orderData.totals?.total || orderData.amount || orderData.total || 0
  );
  const shippingFee = parsePrice(orderData.totals?.codFee || 0);

  const formattedItems = items.map(item => ({
    item_id: String(item.id || item.slug || ''),
    item_name: item.name || item.title || '',
    price: parsePrice(item.price),
    quantity: item.quantity || 1,
    item_category: item.category || 'Agriculture'
  }));

  // Google Analytics 4 (purchase)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: totalValue,
      currency: 'INR',
      tax: 0,
      shipping: shippingFee,
      items: formattedItems
    });
  }

  // Meta Pixel (Purchase)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_ids: formattedItems.map(i => i.item_id),
      content_type: 'product',
      num_items: formattedItems.reduce((acc, i) => acc + i.quantity, 0),
      value: totalValue,
      currency: 'INR'
    });
  }
};
