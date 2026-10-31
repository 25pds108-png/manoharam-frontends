import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import ProductImage from './ProductImage'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/**
 * Standard Indian vegetarian / non-vegetarian dietary badge.
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
      showToast(`Added ${product.name} to cart`)
      setTimeout(() => setJustAdded(false), 1500)
    } catch (err) {
      console.error('Failed to add to cart:', err)
      showToast('Could not add item to cart', { type: 'error' })
    } finally {
      setIsAddingLocal(false)
    }
  }

  const price = Number(product.selling_price || 0)
  const unitText = product.quantity && product.unit ? `${product.quantity} ${product.unit}` : product.unit || ''

  return (
    <Link
      to={`/product/${product.id}`}
      className="card-hover-effect group flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-200/40">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dietary veg mark & Unit Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <div className="rounded-md bg-cream-50/95 p-1 shadow-xs backdrop-blur-xs">
            <DietaryBadge isVeg={isVeg} />
          </div>
          {unitText ? (
            <span className="rounded-md bg-ink-900/80 px-2 py-0.5 text-[10px] font-semibold text-cream-100 backdrop-blur-xs">
              {unitText}
            </span>
          ) : null}
        </div>

        {/* Subscription only badge */}
        {isSubscriptionOnly ? (
          <span className="absolute top-2.5 right-2.5 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-cream-50 shadow-xs">
            Subscription
          </span>
        ) : null}

        {quantityInCart > 0 ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-success-500 px-2 py-0.5 text-[10px] font-bold text-cream-50 shadow-xs">
            {quantityInCart} in cart
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <h3 className="line-clamp-2 font-serif text-sm sm:text-base font-bold text-ink-900 group-hover:text-chili-600 transition-colors leading-snug">
            {product.name}
          </h3>
          {unitText ? (
            <p className="mt-1 text-[11px] font-medium text-ink-500">
              {unitText}
            </p>
          ) : null}
        </div>

        {/* Price & Add Action */}
        <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-cream-300/60 pt-2.5">
          <div>
            <span className="font-serif text-base sm:text-lg font-bold text-chili-600 tabular-nums">
              {price > 0 ? `₹${price.toFixed(0)}` : 'In Plan'}
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
              aria-label={`View subscription plans for ${product.name}`}
              className="inline-flex items-center gap-1 rounded-lg border border-chili-300 bg-chili-100/60 px-3 py-1.5 text-xs font-bold text-chili-600 transition-all duration-150 hover:bg-chili-600 hover:text-cream-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
            >
              <span>View Plans</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAddingLocal}
              aria-label={`Add ${product.name} to cart`}
              className={`button-press spring-bounce inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500 cursor-pointer ${
                justAdded
                  ? 'bg-success-600 text-cream-50 shadow-xs scale-105'
                  : 'border border-chili-300 bg-chili-100/60 text-chili-600 hover:bg-chili-600 hover:text-cream-50 shadow-2xs'
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