import { api } from './client'

/**
 * GET /user_routes/list_my_subscriptions.php
 * Auth required. Lists every subscription the customer currently has in
 * PENDING or ACTIVE status (most-recent-first): { id, plan_id, start_date,
 * end_date, status, plan_name } per entry — no price, description, or
 * product info, which live on getSubscriptionDetails() below.
 *
 * This — plus getSubscriptionDetails() — replaces the old
 * getMySubscription(), which hit a user_routes/get_my_subscription.php
 * that isn't a real endpoint. Unlike that call, this one returns the full
 * set of live subscriptions rather than just the most recent, which also
 * fixes SubscriptionSection's "only the most recent subscription is
 * excluded from the picker" limitation.
 */
export function listMySubscriptions() {
  return api.get('user_routes/list_my_subscriptions.php').then((res) => res.data)
}

/**
 * GET /user_routes/get_my_subscription_details.php?subscription_id=
 * Auth required. Full detail for one subscription: { subscription: {...,
 * price_per_week, description, total_amount, ...}, products: [...],
 * delivery_schedule: [...] }. No skip-history field is returned here or
 * anywhere else in the API — there's currently no endpoint that exposes
 * past skips/refunds for a subscription.
 */
export function getSubscriptionDetails(subscriptionId) {
  return api
    .get('user_routes/get_my_subscription_details.php', {
      params: { subscription_id: subscriptionId },
    })
    .then((res) => res.data)
}

/**
 * GET /list_all_subscription_plans.php?cursor=&limit=
 * Public — no auth required (same access level as list_all_products.php).
 *
 * NOTE: not touched in this pass — flagged in an earlier review as
 * returning only { id, name, category, price_per_week }, no `products`,
 * so PlanCard's hero image/preview text and the home category picker's
 * dietary-type detection still won't have real data. Still open.
 */
export function listSubscribableSalads({ cursor, limit = 50 } = {}) {
  return api
    .get('list_all_subscription_plans.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * GET /get_subscription_details.php?plan_id=
 * Public — no auth required. Returns the plan itself (id, name, category,
 * description, price_per_week) plus every product on that plan in
 * delivery order, each carrying name, quantity, unit, image_url, and
 * nutrition. This is what backs the plan-details view a customer lands on
 * after tapping a PlanCard — it's the one place that actually has real
 * product/nutrition data for a plan, unlike listSubscribableSalads()
 * above. Distinct from getSubscriptionDetails() (an existing customer's
 * live subscription instance, auth required) and previewSubscription()
 * below (a computed day-by-day calendar for a chosen date range).
 */
export function getPlanDetails(planId) {
  return api
    .get('get_subscription_details.php', { params: { plan_id: planId } })
    .then((res) => res.data)
}

/**
 * POST /subscription_preview.php
 * Body: { plan_id, weeks, start_date, exclude_saturday, exclude_sunday }
 * Public — no auth required.
 *
 * Returns the plan (id, name, category, description, price_per_week) plus
 * a real day-by-day delivery_schedule, each entry carrying the actual
 * product for that day (name, quantity, unit, image_url, nutrition) —
 * pulled from subscription_plan_products, the same join
 * get_my_subscription_details.php uses. Unlike list_all_subscription_plans.php,
 * this is where real per-day meal data actually comes from, so
 * SubscriptionReview builds its schedule from this response instead of
 * guessing client-side off plan.products (which doesn't exist).
 */
export function previewSubscription({ planId, weeks, startDate, excludeSaturday, excludeSunday }) {
  return api
    .post('subscription_preview.php', {
      plan_id: planId,
      weeks,
      start_date: startDate,
      exclude_saturday: excludeSaturday,
      exclude_sunday: excludeSunday,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/subscribe_plan.php
 * Body: { plan_id, weeks, start_date, exclude_saturday, exclude_sunday, skip_dates }
 * Auth required. Creates the subscription in PENDING status.
 *
 * `skip_dates` (ISO date strings) is validated against the computed
 * schedule and folded straight into total_amount via
 * calculateSubscriptionPricing() server-side, in the same transaction as
 * the insert — there's no separate call needed (or wanted) to record
 * pre-activation skips after the fact. The response's `subscription`
 * object already reflects the discounted total_amount.
 */
export function subscribeToPlan({
  planId,
  weeks,
  startDate,
  excludeSaturday,
  excludeSunday,
  skipDates = [],
}) {
  return api
    .post('user_routes/subscribe_plan.php', {
      plan_id: planId,
      weeks,
      start_date: startDate,
      exclude_saturday: excludeSaturday,
      exclude_sunday: excludeSunday,
      skip_dates: skipDates,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/skip_subscription.php
 * Body: { subscription_id, skip_date, reason? }
 * Auth required.
 *
 * Only used now by the live "Skip today" action on an already-ACTIVE
 * subscription (Subscription.jsx). The pre-activation skip flow in
 * SubscriptionReview.jsx no longer calls this — subscribe_plan.php takes
 * skip_dates directly (see subscribeToPlan above). This endpoint's PHP
 * file wasn't part of this review, so it's still unverified; flag to your
 * backend dev if "Skip today" doesn't behave as expected.
 */
export function skipSubscriptionDay({ subscriptionId, skipDate, reason }) {
  return api
    .post('user_routes/skip_subscription.php', {
      subscription_id: subscriptionId,
      skip_date: skipDate,
      reason,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/unskip_subscription.php
 * Body: { subscription_id, skip_date }
 * Auth required. Resumes delivery on a previously skipped date.
 */
export function unskipSubscriptionDay({ subscriptionId, skipDate }) {
  return api
    .post('user_routes/unskip_subscription.php', {
      subscription_id: subscriptionId,
      skip_date: skipDate,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/pause_subscription.php
 * Body: { subscription_id, reason? }
 * Auth required. Pauses an active subscription.
 */
export function pauseSubscription({ subscriptionId, reason }) {
  return api
    .post('user_routes/pause_subscription.php', {
      subscription_id: subscriptionId,
      reason,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/resume_subscription.php
 * Body: { subscription_id }
 * Auth required. Resumes a paused subscription.
 */
export function resumeSubscription({ subscriptionId }) {
  return api
    .post('user_routes/resume_subscription.php', {
      subscription_id: subscriptionId,
    })
    .then((res) => res.data)
}

/**
 * POST /user_routes/cancel_subscription.php
 * Body: { subscription_id, reason? }
 * Auth required. Cancels a subscription.
 */
export function cancelSubscription({ subscriptionId, reason }) {
  return api
    .post('user_routes/cancel_subscription.php', {
      subscription_id: subscriptionId,
      reason,
    })
    .then((res) => res.data)
}

/**
 * GET /list_subscribable_salads.php
 * Auth required. Returns plans the logged-in customer is not currently subscribed to.
 */
export function listCustomerSubscribableSalads() {
  return api.get('list_subscribable_salads.php').then((res) => res.data)
}

/**
 * GET /user_routes/get_today_delivery.php
 * Auth required. Returns today's scheduled product, delivery status, and address.
 */
export function getTodayDelivery(date) {
  return api
    .get('user_routes/get_today_delivery.php', {
      params: date ? { date } : {},
    })
    .then((res) => res.data)
}

/**
 * GET /list_service_holidays.php
 * Public. Returns upcoming kitchen/delivery holidays.
 */
export function listServiceHolidays({ month, year } = {}) {
  const params = {}
  if (month) params.month = month
  if (year) params.year = year
  return api.get('list_service_holidays.php', { params }).then((res) => res.data)
}