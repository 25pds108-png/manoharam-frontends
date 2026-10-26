import { api } from './client'

/**
 * GET /list_all_products.php?cursor=&limit=
 * Public endpoint, but works fine for the admin product list too.
 * NOTE: there is no admin-specific "list all products including INACTIVE"
 * endpoint — this one filters to status = 'ACTIVE' only inside the PHP,
 * so inactive products won't show here either. Flag for backend: a real
 * admin product list should show every status.
 */
export function listProducts({ cursor, limit = 20 } = {}) {
  return api
    .get('/list_all_products.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * POST /create_product.php
 * Body: multipart/form-data — name, category, quantity, unit,
 * selling_price, description, status, and an optional `image` file.
 * Admin only.
 *
 * create_product.php reads everything from $_POST / $_FILES, so this must
 * go as multipart/form-data, not a JSON body — a JSON body leaves $_POST
 * empty server-side and every "required field" check fails. The backend
 * also only accepts an uploaded file for the image (it builds image_url
 * itself from $_FILES["image"]); there's no field for passing an
 * image_url string directly.
 *
 * @param {object} payload
 * @param {File} [payload.image] - optional image file to upload
 */
export function createProduct({ image, ...fields }) {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  if (image) {
    formData.append('image', image)
  }

  // Don't set Content-Type manually — the browser needs to add the
  // multipart boundary itself. Axios does this automatically when the
  // body is a FormData instance.
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
 * Fields: id, name, category, quantity, unit, selling_price, description, status, image
 */
export function updateProduct({ image, ...fields }) {
  if (image) {
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
    formData.append('image', image)
    return api.post('admin_routes/update_product.php', formData).then((res) => res.data)
  }
  return api.post('admin_routes/update_product.php', fields).then((res) => res.data)
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