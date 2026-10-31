import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import ProductImage from './ProductImage'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/**
 * Strips development prefixes like [Test] or [Verify] in customer-facing display.
 */
export function formatProductName(name) {
  if (!name) return 'Artisanal Delicacy'
  return name.replace(/^\[(Test|Verify)\]\s*/i, '').trim()
}

/**
 * Standard Indian vegetarian / non-vegetarian dietary mark.
 */
function DietaryBadge({ isVeg = true }) {
  return (
    <span
      title={isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border-[1.5px] bg-cream-50 ${
        isVeg ? 'border-success-500' : 'border-chili-600'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isVeg ? 'bg-success-500' : 'bg-chili-600'
        }`}
      />
    </span>
  )
}

/**
 * Returns a single authentic craft tag based on category.
 */
function getCraftBadge(category) {
  const cat = (category || '').toLowerCase()
  if (cat.includes('pickle')) {
    return 'Sun-cured'
  }
  if (cat.includes('thokku')) {
    return 'Cold-pressed'
  }
  if (cat.includes('powder') || cat.includes('podi')) {
    return 'Stone-ground'
  }
  return 'Small batch'
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, items } = useCart()
  const { showToast } = useToast()
  const [justAdded, setJustAdded] = useState(false)
  const [isAddingLocal, setIsAddingLocal] = useState(false)

  // Check if this product is already in the cart
  const cartItem = items?.find((item) => Number(item.product_id) === Number(product.id))
  const quantityInCart = cartItem ? Number(cartItem.quantity) : 0
  const isSubscriptionOnly = Boolean(product.is_subscription_only || product.subscription_only)
  const isVeg = product.is_veg !== 0 && product.is_veg !== '0' && product.is_veg !== false

  const cleanName = formatProductName(product.name)
  const craftTag = getCraftBadge(product.category)

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSubscriptionOnly) {
      navigate('/subscription')
      return
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } })
      return
    }

    setIsAddingLocal(true)
    try {
      await addToCart({ productId: Number(product.id), quantity: 1 })
      setJustAdded(true)
      showToast(`Added ${cleanName} to cart`)
      setTimeout(() => setJustAdded(false), 1500)
    } catch (err) {
      console.error('Failed to add to cart:', err)
      showToast('Could not add item to cart', { type: 'error' })
    } finally {
      setIsAddingLocal(false)
    }
  }

  const price = Number(product.selling_price || 0)
  const unitText = product.quantity && product.unit ? `${product.quantity} ${product.unit}` : product.unit || '250 g'

  return (
    <Link
      to={`/product/${product.id}`}
      className="card-hover-effect group flex flex-col justify-between overflow-hidden rounded-2xl border border-cream-300/80 bg-cream-50 shadow-xs hover:border-chili-400 hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500 select-none"
    >
      {/* 4:5 Photographic Canvas with Slow Hover Zoom */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-200/50">
        <ProductImage
          src={product.image_url}
          alt={cleanName}
          category={product.category}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Subtle warm overlay on hover */}
        <div className="absolute inset-0 bg-amber-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top-Left: Dietary mark & Cream Weight Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <div className="rounded-md bg-cream-50/95 p-1 shadow-2xs backdrop-blur-xs">
            <DietaryBadge isVeg={isVeg} />
          </div>
          {unitText ? (
            <span className="rounded-md bg-cream-50/95 border border-cream-300/80 px-2 py-0.5 text-[10px] font-bold text-ink-800 shadow-2xs backdrop-blur-xs">
              {unitText}
            </span>
          ) : null}
        </div>

        {/* Bottom-Left: Authentic Craft Tag */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="rounded-md bg-ink-950/75 border border-cream-100/20 px-2 py-0.5 text-[10px] font-semibold text-cream-100 backdrop-blur-xs">
            {craftTag}
          </span>
        </div>

        {/* Subscription only indicator */}
        {isSubscriptionOnly ? (
          <span className="absolute top-2.5 right-2.5 z-10 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-cream-50 shadow-xs">
            Subscription
          </span>
        ) : null}

        {quantityInCart > 0 ? (
          <span className="absolute top-2.5 right-2.5 z-10 rounded-full bg-success-600 px-2.5 py-0.5 text-[10px] font-bold text-cream-50 shadow-xs">
            {quantityInCart} in cart
          </span>
        ) : null}
      </div>

      {/* Product Information Area */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* Category in small caps */}
          <span className="text-[10px] uppercase font-bold tracking-widest text-ink-400 block mb-1">
            {product.category || 'Traditional'}
          </span>

          {/* Product Name in Serif (stripped of [Test] / [Verify]) */}
          <h3 className="line-clamp-2 font-serif text-base sm:text-lg font-bold text-ink-900 group-hover:text-chili-600 transition-colors leading-snug">
            {cleanName}
          </h3>

          {/* One-line tasting note / ingredients */}
          <p className="mt-1 text-xs text-ink-500 line-clamp-1 leading-relaxed">
            {product.description || 'Artisanal small-batch preparation in pure cold-pressed oil.'}
          </p>
        </div>

        {/* Price & Refined Add Action */}
        <div className="mt-3.5 pt-3 border-t border-cream-200/80 flex items-center justify-between gap-2">
          <div>
            <span className="font-serif text-base sm:text-lg font-bold text-chili-600 tabular-nums">
              {price > 0 ? `₹${price.toFixed(0)}` : 'In Plan'}
            </span>
            <span className="text-[10px] text-ink-500 font-medium ml-1">
              / {unitText}
            </span>
          </div>

          {isSubscriptionOnly ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate('/subscription')
              }}
              aria-label={`View subscription plans for ${cleanName}`}
              className="button-press inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-ink-950 transition-all hover:bg-amber-400 shadow-2xs"
            >
              <span>View Plans</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAddingLocal}
              aria-label={`Add ${cleanName} to cart`}
              className={`button-press spring-bounce inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500 cursor-pointer ${
                justAdded
                  ? 'bg-success-600 text-cream-50 shadow-xs scale-105'
                  : 'bg-chili-600 text-cream-50 hover:bg-chili-500 shadow-xs'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}