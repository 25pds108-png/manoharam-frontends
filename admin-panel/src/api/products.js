import { api } from './client'

/**
 * GET /list_all_products.php?cursor=&limit=&subscription_only=&for_sale_only=
 * Public endpoint, but works for the admin product list.
 */
export function listProducts({ cursor, limit = 20, subscriptionOnly, forSaleOnly } = {}) {
  return api
    .get('list_all_products.php', {
      params: {
        cursor,
        limit,
        subscription_only: subscriptionOnly ? 1 : undefined,
        for_sale_only: forSaleOnly ? 1 : undefined,
      },
    })
    .then((res) => res.data)
}

/**
 * GET /admin_routes/list_subscription_products.php?subscription_only=&search=&category=
 * Admin only. Returns all active products available for subscription plans.
 */
export function listSubscriptionProducts({ subscriptionOnly, search, category } = {}) {
  return api
    .get('admin_routes/list_subscription_products.php', {
      params: {
        subscription_only: subscriptionOnly !== undefined ? (subscriptionOnly ? 1 : 0) : undefined,
        search: search || undefined,
        category: category || undefined,
      },
    })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/create_product.php
 * Body: multipart/form-data or JSON. Supports name, category, quantity, unit,
 * selling_price, description, status, is_subscription_only, and optional image file or image_url.
 * Admin only.
 */
export function createProduct({ image, imageUrl, isSubscriptionOnly, ...fields }) {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  if (isSubscriptionOnly !== undefined) {
    formData.append('is_subscription_only', isSubscriptionOnly ? '1' : '0')
  }

  if (image) {
    formData.append('image', image)
  } else if (imageUrl) {
    formData.append('image_url', imageUrl)
  }

  return api.post('admin_routes/create_product.php', formData).then((res) => res.data)
}

/**
 * GET /list_categories.php
 * Public endpoint.
 */
export function listCategories() {
  return api.get('list_categories.php').then((res) => res.data)
}

/**
 * GET /product_details.php?id=
 * Public endpoint, reused here for the admin product detail view.
 */
export function getProductDetails(id) {
  return api.get('product_details.php', { params: { id } }).then((res) => res.data)
}

/**
 * POST /admin_routes/update_product.php
 * Admin only. Accepts FormData (for image file) or JSON.
 * Fields: id, name, category, quantity, unit, selling_price, description, status, image, is_subscription_only
 */
export function updateProduct({ image, imageUrl, removeImage, isSubscriptionOnly, ...fields }) {
  if (image || removeImage) {
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
    if (isSubscriptionOnly !== undefined) {
      formData.append('is_subscription_only', isSubscriptionOnly ? '1' : '0')
    }
    if (image) {
      formData.append('image', image)
    }
    if (removeImage) {
      formData.append('remove_image', '1')
    }
    return api.post('admin_routes/update_product.php', formData).then((res) => res.data)
  }

  return api
    .post('admin_routes/update_product.php', {
      ...fields,
      image_url: imageUrl,
      remove_image: removeImage ? 1 : undefined,
      is_subscription_only: isSubscriptionOnly !== undefined ? (isSubscriptionOnly ? 1 : 0) : undefined,
    })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/delete_product.php
 * Admin only. Soft deletes product by setting status = 'INACTIVE' (or hard deletes if force: true).
 * Body: { product_id, force? }
 */
export function deleteProduct({ productId, force = false }) {
  return api
    .post('admin_routes/delete_product.php', {
      product_id: productId,
      id: productId,
      force,
    })
    .then((res) => res.data)
}