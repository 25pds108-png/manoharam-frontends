import { api } from './client'

/**
 * GET /admin_routes/list_all_inventories.php?cursor=&limit=
 * One row per product with stock totals across its batches.
 * Response: { success, inventory: [...], pagination: { limit, has_more, next_cursor } }
 */
export function listInventories({ cursor, limit = 20 } = {}) {
  return api
    .get('admin_routes/list_all_inventories.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * GET /admin_routes/get_product_inventory.php?product_id=
 * (get_batch.php is an identical endpoint — one wrapper is enough.)
 * Response: { success, product, summary: { total_quantity, remaining_quantity, batch_count }, batches: [...] }
 */
export function getProductInventory(productId) {
  return api
    .get('admin_routes/get_product_inventory.php', { params: { product_id: productId } })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/create_batch.php
 * Body: { product_id, batch_no, manufactured_date, expiry_date, quantity }
 */
export function createBatch(payload) {
  return api.post('admin_routes/create_batch.php', payload).then((res) => res.data)
}

/**
 * PUT /admin_routes/update_batch.php
 * Body: { id, batch_no, manufactured_date, expiry_date }
 * Quantity is NOT editable — the backend only updates these three fields.
 */
export function updateBatch(payload) {
  return api.put('admin_routes/update_batch.php', payload).then((res) => res.data)
}

/**
 * GET /admin_routes/inventory_expiring.php?days=
 * Batches with remaining stock that expire within `days` days (or already expired).
 * Response: { success, days, batches: [...] }
 */
export function listExpiringBatches({ days = 3 } = {}) {
  return api
    .get('admin_routes/inventory_expiring.php', { params: { days } })
    .then((res) => res.data)
}

/**
 * GET /admin_routes/low_stock.php?threshold=
 * NOTE: every call that finds low-stock products also EMAILS the admin
 * (MailHelper::sendAdminLowStockNotification). Don't call this on a timer
 * or on every page render — only on an explicit user action.
 * Response: { success, threshold, products: [...], mail_sent }
 */
export function listLowStock({ threshold = 10 } = {}) {
  return api
    .get('admin_routes/low_stock.php', { params: { threshold } })
    .then((res) => res.data)
}