import { api } from './client'

/**
 * POST /user_routes/apply_coupon.php
 * Auth required.
 * Body: { code, order_amount? }
 */
export function applyCoupon({ code, orderAmount }) {
  return api
    .post('user_routes/apply_coupon.php', {
      code,
      order_amount: orderAmount !== undefined ? orderAmount : undefined,
    })
    .then((res) => res.data)
}
