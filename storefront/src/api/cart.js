import { api } from './client'

/**
 * GET /get_cart.php
 * Auth required.
 */
export function getCart() {
  return api.get('user_routes/get_cart.php').then((res) => res.data)
}

/**
 * POST /add_to_cart.php
 * Body: { product_id, quantity }
 * Auth required.
 */
export function addToCart({ productId, quantity = 1 }) {
  return api
    .post('user_routes/add_to_cart.php', { product_id: productId, quantity })
    .then((res) => res.data)
}

/**
 * POST /user_routes/update_cart_quantity.php
 * Body: { product_id, quantity } or { cart_item_id, quantity }
 * Auth required. Setting quantity: 0 removes the item.
 */
export function updateCartQuantity({ productId, cartItemId, quantity }) {
  return api
    .post('user_routes/update_cart_quantity.php', {
      product_id: productId,
      cart_item_id: cartItemId,
      quantity,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/remove_from_cart.php
 * Body: { product_id } or { cart_item_id }
 * Auth required.
 */
export function removeFromCart({ productId, cartItemId }) {
  return api
    .post('user_routes/remove_from_cart.php', {
      product_id: productId,
      cart_item_id: cartItemId,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/clear_cart.php
 * Auth required. Empties the customer's cart.
 */
export function clearCart() {
  return api.post('user_routes/clear_cart.php', {}).then((res) => res.data)
}

/**
 * POST /user_routes/checkout.php
 * Body: { delivery_address?, payment_method?: 'COD' | 'ONLINE' }
 * Auth required.
 */
export function checkout({ deliveryAddress, paymentMethod = 'COD' } = {}) {
  return api
    .post('user_routes/checkout.php', {
      delivery_address: deliveryAddress,
      payment_method: paymentMethod,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/verify_payment.php
 * Body: { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Auth required.
 */
export function verifyPayment(payload) {
  return api.post('user_routes/verify_payment.php', payload).then((res) => res.data)
}

/**
 * POST /user_routes/create_razorpay_order.php
 * Body: { order_id?, subscription_id? }
 * Auth required.
 */
export function createRazorpayOrder({ orderId, subscriptionId } = {}) {
  return api
    .post('user_routes/create_razorpay_order.php', {
      order_id: orderId,
      subscription_id: subscriptionId,
    })
    .then((res) => res.data)
}
