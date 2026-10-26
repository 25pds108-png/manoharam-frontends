import { api } from './client'

/**
 * GET /admin_routes/list_coupons.php
 * Auth required (ADMIN).
 */
export function listCoupons() {
  return api.get('admin_routes/list_coupons.php').then((res) => res.data)
}

/**
 * POST /admin_routes/create_coupon.php
 * Auth required (ADMIN).
 */
export function createCoupon(payload) {
  return api.post('admin_routes/create_coupon.php', payload).then((res) => res.data)
}

/**
 * POST /admin_routes/update_coupon.php
 * Auth required (ADMIN).
 */
export function updateCoupon(payload) {
  return api.post('admin_routes/update_coupon.php', payload).then((res) => res.data)
}

/**
 * POST /admin_routes/delete_coupon.php
 * Auth required (ADMIN).
 */
export function deleteCoupon(couponId) {
  return api
    .post('admin_routes/delete_coupon.php', { id: couponId, coupon_id: couponId })
    .then((res) => res.data)
}
