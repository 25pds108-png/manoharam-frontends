import { api } from './client'

/**
 * GET /user_routes/get_addresses.php
 * Auth required. Returns all saved delivery addresses for the customer.
 */
export function getAddresses() {
  return api.get('user_routes/get_addresses.php').then((res) => res.data)
}

/**
 * POST /user_routes/add_address.php
 * Auth required. Adds a new delivery address.
 */
export function addAddress(payload) {
  return api.post('user_routes/add_address.php', payload).then((res) => res.data)
}

/**
 * POST /user_routes/update_address.php
 * Auth required. Updates an existing address.
 */
export function updateAddress(payload) {
  return api.post('user_routes/update_address.php', payload).then((res) => res.data)
}

/**
 * POST /user_routes/set_default_address.php
 * Auth required. Sets an address as the default.
 */
export function setDefaultAddress(addressId) {
  return api
    .post('user_routes/set_default_address.php', { address_id: addressId, id: addressId })
    .then((res) => res.data)
}

/**
 * POST /user_routes/delete_address.php
 * Auth required. Deletes a saved address.
 */
export function deleteAddress(addressId) {
  return api
    .post('user_routes/delete_address.php', { address_id: addressId, id: addressId })
    .then((res) => res.data)
}
