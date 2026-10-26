import { api } from './client'

/**
 * GET /get_product_reviews.php?product_id=:id
 * Public. Returns average rating and list of approved customer reviews.
 */
export function getProductReviews(productId) {
  return api
    .get('get_product_reviews.php', { params: { product_id: productId } })
    .then((res) => res.data)
}

/**
 * POST /user_routes/add_review.php
 * Auth required. Submits a new customer product review.
 */
export function addReview({ productId, rating, reviewTitle, reviewText }) {
  return api
    .post('user_routes/add_review.php', {
      product_id: productId,
      rating,
      review_title: reviewTitle,
      review_text: reviewText,
    })
    .then((res) => res.data)
}
