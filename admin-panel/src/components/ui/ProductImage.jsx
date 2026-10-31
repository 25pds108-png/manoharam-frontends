import { useState, useEffect } from 'react'
import { UtensilsCrossed, Package, Salad } from 'lucide-react'
import { resolveImageUrl } from '../../lib/imageHelper'

/**
 * Clean, branded placeholder for missing or broken product/plan images in Admin Panel.
 * Consistent with storefront palette (chili / cream warm styling).
 */
export function ProductPlaceholder({
  alt = 'Product Image',
  category = '',
  className = '',
  iconClassName = '',
}) {
  const isPlanOrBox = /(plan|meal|box|package|combo|subscription)/i.test(category || alt)
  const isSalad = /(salad|green|bowl)/i.test(category || alt)
  const Icon = isPlanOrBox ? Package : isSalad ? Salad : UtensilsCrossed

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#FAF6EC] via-[#F3ECDB] to-[#FAD2D2]/30 text-[#A6968F] border border-[#E9DEC4]/70 overflow-hidden select-none ${className}`}
      title={alt}
      aria-label={alt}
      role="img"
    >
      <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
        <Icon
          className={`h-2/5 w-2/5 max-h-12 max-w-12 min-h-5 min-w-5 text-[#C1272D]/60 transition-transform duration-200 ${iconClassName}`}
          strokeWidth={1.5}
        />
        <span className="sr-only">{alt}</span>
      </div>
    </div>
  )
}

/**
 * Reusable dynamic product & plan image component for Admin Panel.
 *
 * Rules:
 * - Uses backend image paths / URLs exclusively.
 * - Resolves relative backend paths against the configured base URL.
 * - Handles live local file upload preview (blob/data URLs).
 * - Shows branded icon placeholder on missing, null, empty or failed images.
 */
export default function ProductImage({
  product,
  src,
  alt = '',
  category = '',
  className = '',
  loading = 'lazy',
  ...rest
}) {
  const rawSrc = product ? product.image_url || product.image || '' : src
  const effectiveAlt = (product ? product.name : alt) || 'Product Image'
  const effectiveCategory = (product ? product.category : category) || ''
  const resolvedUrl = resolveImageUrl(rawSrc)

  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [rawSrc])

  if (!resolvedUrl || failed) {
    return (
      <ProductPlaceholder
        alt={effectiveAlt}
        category={effectiveCategory}
        className={className}
      />
    )
  }

  return (
    <img
      src={resolvedUrl}
      alt={effectiveAlt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      {...rest}
    />
  )
}
