import { api } from './client'

/**
 * GET /list_all_ingredients.php?cursor=&limit=
 * Admin only.
 */
export function listIngredients({ cursor, limit = 20 } = {}) {
  return api
    .get('admin_routes/list_all_ingredients.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * POST /create_ingredient.php
 * Body: { name, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g }
 * Admin only.
 */
export function createIngredient(payload) {
  return api.post('admin_routes/create_ingredient.php', payload).then((res) => res.data)
}

/**
 * POST /admin_routes/update_ingredient.php
 * Admin only. Body: { id, name, unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g }
 */
export function updateIngredient(payload) {
  return api.post('admin_routes/update_ingredient.php', payload).then((res) => res.data)
}

/**
 * POST /admin_routes/delete_ingredient.php
 * Admin only. Body: { id }
 */
export function deleteIngredient(id) {
  return api.post('admin_routes/delete_ingredient.php', { id, ingredient_id: id }).then((res) => res.data)
}

