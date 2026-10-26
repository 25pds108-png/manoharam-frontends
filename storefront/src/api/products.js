import { api } from './client'

/**
 * GET /list_categories.php
 * Public. Returns categories with product counts.
 */
export function listCategories() {
  return api.get('/list_categories.php').then((res) => res.data)
}

/**
 * GET /list_all_products.php?cursor=&limit=
 * Public, cursor-paginated, ACTIVE products only.
 */
export function listProducts({ cursor, limit = 12 } = {}) {
  return api
    .get('/list_all_products.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * GET /search_products.php?search=&category=&status=&min_price=&max_price=&cursor=&limit=
 * Public.
 */
export function searchProducts({
  search,
  category,
  status = 'ACTIVE',
  minPrice,
  maxPrice,
  cursor,
  limit = 12,
} = {}) {
  return api
    .get('/search_products.php', {
      params: {
        search,
        category,
        status,
        min_price: minPrice,
        max_price: maxPrice,
        cursor,
        limit,
      },
    })
    .then((res) => res.data)
}

/**
 * GET /product_details.php?id=
 * Public. Includes nutrition (scaled) + ingredient names.
 */
export function getProductDetails(id) {
  return api.get('/product_details.php', { params: { id } }).then((res) => res.data)
}
