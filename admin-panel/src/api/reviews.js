import { api } from './client'

/**
 * GET /get_product_reviews.php?id=
 * Public/Admin. Fetches reviews for a product.
 */
export function getProductReviews(productId) {
  return api
    .get('get_product_reviews.php', {
      params: { id: productId, product_id: productId },
    })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/moderate_review.php
 * Auth required (ADMIN).
 * Body: { id, review_id, status: 'APPROVED' | 'REJECTED' | 'PENDING' }
 */
export function moderateReview({ reviewId, status }) {
  return api
    .post('admin_routes/moderate_review.php', {
      id: reviewId,
      review_id: reviewId,
      status,
    })
    .then((res) => res.data)
}
