import { api } from './client'

/**
 * GET /list_all_subscriptions.php?cursor=&limit=
 * Admin only.
 */
export function listSubscriptions({ cursor, limit = 20 } = {}) {
  return api
    .get('admin_routes/list_all_subscriptions.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * GET /get_subscription_details.php?id=
 * Admin only.
 */
export function getSubscriptionDetails(id) {
  return api.get('admin_routes/get_subscription_details.php', { params: { id } }).then((res) => res.data)
}

/**
 * POST /approve_subscription.php
 * Body: { subscription_id }
 * Admin only.
 *
 * NOTE: this endpoint's PHP file currently does
 *   require_once "../auth/admin_middleware";
 * missing the .php extension — it will fatal-error server-side until fixed.
 * Flag to your backend dev; the call below is correct once that's patched.
 */
export function approveSubscription(subscriptionId) {
  return api
    .post('admin_routes/approve_subscription.php', { subscription_id: subscriptionId })
    .then((res) => res.data)
}

/**
 * POST /update_subscription.php
 * Body: { subscription_id, start_date?, end_date?, status? }
 * status must be one of: PENDING, ACTIVE, COMPLETED, CANCELLED
 * Admin only.
 */
export function updateSubscription({ subscriptionId, startDate, endDate, status }) {
  return api
    .post('admin_routes/update_subscription.php', {
      subscription_id: subscriptionId,
      start_date: startDate,
      end_date: endDate,
      status,
    })
    .then((res) => res.data)
}

/**
 * GET /get_subscription_details.php?plan_id=
 *
 * NOTE: despite the filename, this is a DIFFERENT backend file from the
 * one behind getSubscriptionDetails() above — this one lives at the
 * project root (not admin_routes/), has no admin_middleware check, and
 * takes a plan_id rather than a subscription id. It returns a plan's
 * details plus its linked salads (with nutrition), not a customer's
 * subscription. Worth renaming one of the two files on the backend to
 * avoid confusion, but the path below matches where this one actually is.
 */
export function getSubscriptionPlanDetails(planId) {
  return api.get('get_subscription_details.php', { params: { plan_id: planId } }).then((res) => res.data)
}

/**
 * GET /list_subscription_plans.php?cursor=&limit=
 * Admin only. Lists every subscription plan along with its linked salad
 * product, so the admin can see which salads already have an active plan.
 */
export function listSubscriptionPlans({ cursor, limit = 50 } = {}) {
  return api
    .get('admin_routes/list_subscription_plans.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * POST /create_subscription_plan.php
 * Body: multipart/form-data — name, category (VEG | NON_VEG),
 * price_per_week, description?, status, products (JSON-encoded string of
 * [{ product_id, delivery_order }]), and an optional `image` file.
 * Admin only.
 *
 * Two things that used to break this call:
 *  - it was posting to create_subscription.php, but the actual backend
 *    file is create_subscription_plan.php.
 *  - the PHP reads $_POST["products"] and json_decode()s it — it expects
 *    a JSON *string* field inside form data, not a nested array/object in
 *    a JSON body. FormData can't hold nested arrays natively, so we
 *    JSON.stringify it ourselves before appending.
 *
 * @param {object} payload
 * @param {Array<{product_id: number, delivery_order: number}>} payload.products
 * @param {File} [payload.image] - optional plan image to upload
 */
export function createSubscriptionPlan({ products, image, ...fields }) {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  formData.append('products', JSON.stringify(products || []))

  if (image) {
    formData.append('image', image)
  }

  return api.post('admin_routes/create_subscription_plan.php', formData).then((res) => res.data)
}

/**
 * POST /admin_routes/reject_subscription.php
 * Body: { subscription_id, reason? }
 * Admin only.
 */
export function rejectSubscription({ subscriptionId, reason }) {
  return api
    .post('admin_routes/reject_subscription.php', {
      subscription_id: subscriptionId,
      reason,
    })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/update_subscription_plan.php
 * Admin only. Body: multipart/form-data or JSON with id, name, category, price_per_week, description, status, products
 */
export function updateSubscriptionPlan({ id, products, image, ...fields }) {
  const formData = new FormData()
  formData.append('id', id)

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  if (products) {
    formData.append('products', JSON.stringify(products))
  }

  if (image) {
    formData.append('image', image)
  }

  return api.post('admin_routes/update_subscription_plan.php', formData).then((res) => res.data)
}

/**
 * GET /admin_routes/get_daily_dispatch.php?date=YYYY-MM-DD
 * Admin only. Generates kitchen dispatch sheet and delivery roster for a given date.
 */
export function getDailyDispatch(date) {
  const targetDate = date || new Date().toISOString().slice(0, 10)
  return api
    .get('admin_routes/get_daily_dispatch.php', { params: { date: targetDate } })
    .then((res) => res.data)
}