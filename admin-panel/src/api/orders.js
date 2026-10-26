import { api } from './client'

/**
 * GET /list_all_orders.php?cursor=&limit=
 * Admin only, cursor-paginated.
 */
export function listOrders({ cursor, limit = 20 } = {}) {
  return api.get('admin_routes/list_all_orders.php', { params: { cursor, limit } }).then((res) => res.data)
}

/**
 * GET /get_order_details.php?id=
 * Admin-only version — note the param is `id` here, NOT `order_id` like the
 * customer-facing get_order_details.php uses. Easy to mix up since both
 * files share a name; this is the admin one (lives under /admin/ on the backend).
 */
export function getOrderDetails(id) {
  return api.get('admin_routes/get_order_details.php', { params: { id } }).then((res) => res.data)
}

/**
 * POST /update_order_status.php
 * Body: { order_id, status }
 * status must be one of: CONFIRMED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
 * Admin only.
 */
export function updateOrderStatus({ orderId, status }) {
  return api
    .post('admin_routes/update_order_status.php', { order_id: orderId, status })
    .then((res) => res.data)
}
