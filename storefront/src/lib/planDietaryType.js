/**
 * Buckets a subscription plan into 'VEG' or 'NON_VEG' for the home page's
 * category picker.
 *
 * subscription_plans already has a real `category` column and
 * list_all_subscription_plans.php returns it directly on each plan (it
 * even supports filtering by it server-side) — that's checked first. The
 * `dietary_type`/`is_veg` checks and the keyword scan below are dead
 * fallbacks for fields/data this endpoint has never actually returned
 * (the endpoint doesn't include a `products` array either), kept only in
 * case some other plan source someday lacks a `category` value.
 */
const NON_VEG_KEYWORDS = [
  'chicken',
  'mutton',
  'fish',
  'egg',
  'prawn',
  'shrimp',
  'meat',
  'beef',
  'pork',
  'seafood',
]

export function getPlanDietaryType(plan) {
  if (plan.category === 'VEG' || plan.category === 'NON_VEG') {
    return plan.category
  }
  if (plan.dietary_type === 'VEG' || plan.dietary_type === 'NON_VEG') {
    return plan.dietary_type
  }
  if (typeof plan.is_veg === 'boolean') {
    return plan.is_veg ? 'VEG' : 'NON_VEG'
  }

  const haystack = (plan.products ?? [])
    .map((p) => `${p.name ?? ''} ${p.category ?? ''}`.toLowerCase())
    .join(' ')

  const isNonVeg = NON_VEG_KEYWORDS.some((kw) => haystack.includes(kw))
  return isNonVeg ? 'NON_VEG' : 'VEG'
}

export const DIETARY_CATEGORIES = [
  { id: 'VEG', label: 'Veg', description: 'Plant-based bowls, made fresh daily', emoji: '🥗' },
  {
    id: 'NON_VEG',
    label: 'Non-veg',
    description: 'Protein-forward bowls with meat, egg or fish',
    emoji: '🍗',
  },
]