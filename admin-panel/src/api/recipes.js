import { api } from './client'

/**
 * GET /list_all_recipes.php?cursor=&limit=
 * Admin only.
 */
export function listRecipes({ cursor, limit = 20 } = {}) {
  return api
    .get('admin_routes/list_all_recipes.php', { params: { cursor, limit } })
    .then((res) => res.data)
}

/**
 * POST /create_recipe_for_product.php
 * Body: { product_id, name, total_weight_g, ingredients: [{ ingredient_id, quantity_g }] }
 * Admin only. Backend computes and stores total nutrition automatically.
 */
export function createRecipe(payload) {
  return api.post('admin_routes/create_recipe_for_product.php', payload).then((res) => res.data)
}

/**
 * POST /calculate_recipe.php
 * Body: { recipe_id, required_quantity_kg }
 * Admin only. Scales a recipe's ingredient list up/down for batch production planning.
 */
export function calculateRecipe(payload) {
  return api.post('admin_routes/calculate_recipe.php', payload).then((res) => res.data)
}

/**
 * GET /admin_routes/get_recipe_details.php?recipe_id=
 * Admin only. Returns recipe info, nutrition breakdown, and full ingredients list with quantities.
 */
export function getRecipeDetails(recipeId) {
  return api
    .get('admin_routes/get_recipe_details.php', { params: { recipe_id: recipeId } })
    .then((res) => res.data)
}

/**
 * POST /admin_routes/update_recipe.php
 * Admin only. Body: { id, name, total_weight_g, ingredients: [{ ingredient_id, quantity_g }] }
 */
export function updateRecipe(payload) {
  return api.post('admin_routes/update_recipe.php', payload).then((res) => res.data)
}

/**
 * POST /admin_routes/delete_recipe.php
 * Admin only. Body: { recipe_id }
 */
export function deleteRecipe(recipeId) {
  return api
    .post('admin_routes/delete_recipe.php', { recipe_id: recipeId, id: recipeId })
    .then((res) => res.data)
}

