import { api } from './client'

/**
 * GET /admin_routes/list_customers.php
 * Auth required (ADMIN).
 * Params: { search?, page?, limit? }
 */
export function listCustomers({ search, page = 1, limit = 20 } = {}) {
  const params = { page, limit }
  if (search) params.search = search
  return api.get('admin_routes/list_customers.php', { params }).then((res) => res.data)
}

/**
 * GET /admin_routes/get_customer_details.php?id=
 * Auth required (ADMIN). Returns full profile, orders, active subscriptions, and addresses.
 */
export function getCustomerDetails(customerId) {
  return api
    .get('admin_routes/get_customer_details.php', {
      params: { id: customerId, customer_id: customerId },
    })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/update_customer_status.php
 * Auth required (ADMIN).
 * Body: { id, status: 'active' | 'inactive' | 'blocked' }
 */
export function updateCustomerStatus({ customerId, status }) {
  return api
    .post('admin_routes/update_customer_status.php', {
      id: customerId,
      customer_id: customerId,
      status,
    })
    .then((res) => res.data)
}
