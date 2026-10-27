import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import ProductImage from './ProductImage'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

/**
 * Standard Indian vegetarian dietary badge (green dot in green border square).
 */
function VegBadge() {
  return (
    <span
      title="100% Vegetarian"
      aria-label="Vegetarian"
      className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border-[1.5px] border-[#15803D] bg-white"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
    </span>
  )
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, items } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const [isAddingLocal, setIsAddingLocal] = useState(false)

  // Check if this product is already in the cart
  const cartItem = items?.find((item) => Number(item.product_id) === Number(product.id))
  const quantityInCart = cartItem ? Number(cartItem.quantity) : 0

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } })
      return
    }

    setIsAddingLocal(true)
    try {
      await addToCart({ productId: Number(product.id), quantity: 1 })
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1500)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    } finally {
      setIsAddingLocal(false)
    }
  }

  const price = Number(product.selling_price || 0)
  const unitText = product.quantity && product.unit ? `${product.quantity} ${product.unit}` : product.unit || ''

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9B2C2C]/30 hover:shadow-md"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F3EBDD]/40">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Dietary veg mark & Unit Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="rounded-md bg-white/90 p-1 shadow-xs backdrop-blur-xs">
            <VegBadge />
          </div>
          {unitText ? (
            <span className="rounded-md bg-[#1C1917]/75 px-1.5 py-0.5 text-[10px] font-semibold text-[#FAF6EF] backdrop-blur-xs">
              {unitText}
            </span>
          ) : null}
        </div>

        {quantityInCart > 0 ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-[#15803D] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            {quantityInCart} in cart
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3.5">
        <div>
          <h3 className="line-clamp-2 font-serif text-xs sm:text-sm font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors leading-snug">
            {product.name}
          </h3>
          {unitText ? (
            <p className="mt-0.5 text-[11px] font-medium text-[#78716C]">
              {unitText}
            </p>
          ) : null}
        </div>

        {/* Price & Add Action */}
        <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-[#E6D9C5]/60 pt-2">
          <div>
            <span className="font-serif text-sm sm:text-base font-bold text-[#9B2C2C]">
              ₹{price.toFixed(0)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAddingLocal}
            aria-label={`Add ${product.name} to cart`}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-150 ${
              justAdded
                ? 'bg-[#15803D] text-white'
                : 'border border-[#9B2C2C]/30 bg-[#FCE4E4]/60 text-[#9B2C2C] hover:bg-[#9B2C2C] hover:text-white active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3 w-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}