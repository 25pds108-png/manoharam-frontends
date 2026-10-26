import { api } from './client'

/**
 * GET /user_routes/get_my_orders.php
 * Auth required. Returns the logged-in customer's orders, no pagination on backend.
 */
export function getMyOrders() {
  return api.get('/user_routes/get_my_orders.php').then((res) => res.data)
}

/**
 * GET /user_routes/get_order_details.php?order_id=
 * Auth required. Backend verifies the order belongs to the requesting user.
 */
export function getOrderDetails(orderId) {
  return api
    .get('/user_routes/get_order_details.php', {
      params: { order_id: orderId, id: orderId },
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/cancel_order.php
 * Body: { order_id, reason? }
 * Auth required. Restores deducted inventory batches.
 */
export function cancelOrder({ orderId, reason }) {
  return api
    .post('/user_routes/cancel_order.php', {
      order_id: orderId,
      reason,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/create_razorpay_order.php
 * Body: { order_id?, subscription_id? }
 * Auth required.
 */
export function createRazorpayOrder({ orderId, subscriptionId } = {}) {
  return api
    .post('/user_routes/create_razorpay_order.php', {
      order_id: orderId,
      subscription_id: subscriptionId,
    })
    .then((res) => res.data)
}

/**
 * GET /user_routes/track_order.php?order_id=
 * Auth required. Returns timeline steps and current fulfillment stage.
 */
export function trackOrder(orderId) {
  return api
    .get('user_routes/track_order.php', {
      params: { id: orderId, order_id: orderId },
    })
    .then((res) => res.data)
}

/**
 * GET /user_routes/download_invoice.php?order_id=&format=json
 * Auth required. Returns invoice details in JSON format.
 */
export function getInvoiceJson(orderId) {
  return api
    .get('user_routes/download_invoice.php', {
      params: { id: orderId, order_id: orderId, format: 'json' },
    })
    .then((res) => res.data)
}

/**
 * Helper to get the full direct URL for printable HTML tax invoice
 */
export function getInvoiceHtmlUrl(orderId) {
  const base = api.defaults.baseURL || 'http://localhost/Manoharam-Real-Foods'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${normalizedBase}/user_routes/download_invoice.php?order_id=${orderId}`
}


