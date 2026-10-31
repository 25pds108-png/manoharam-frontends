import { useState, useEffect } from 'react'
import { UtensilsCrossed, Package, Salad } from 'lucide-react'
import { resolveImageUrl } from '../lib/imageHelper'

/**
 * Clean, branded placeholder for missing or broken product/plan images.
 * Adheres strictly to Manoharam Real Foods heritage palette (warm cream/amber
 * parchment with subtle chili accent). Never attempts to substitute an unrelated
 * real photograph for a missing product image.
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
      className={`relative flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-200/80 to-amber-100/50 text-ink-400 border border-cream-300/60 overflow-hidden select-none ${className}`}
      title={alt}
      aria-label={alt}
      role="img"
    >
      {/* Subtle traditional parchment texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent pointer-events-none" />
      <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center relative z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-50/90 border border-cream-300/80 shadow-2xs text-chili-600">
          <Icon
            className={`h-5 w-5 ${iconClassName}`}
            strokeWidth={1.75}
          />
        </div>
        <span className="font-serif text-[10px] italic text-chili-700/80 font-medium tracking-wide">
          Manoharam Kitchen
        </span>
        <span className="sr-only">{alt}</span>
      </div>
    </div>
  )
}

/**
 * Reusable dynamic product & plan image component.
 *
 * Rules:
 * - The backend is the ONLY source for real product and plan images.
 * - Resolves relative paths (uploads/foods_profiles/...) against the backend base URL.
 * - Handles data/blob URLs during live admin file previews.
 * - Handles null, undefined, empty, or placeholder domains (example.com).
 * - On image failure or absence, renders a clean branded icon placeholder.
 * - Never imports or substitutes fake/random food photography.
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
  const effectiveAlt = (product ? product.name : alt) || 'Manoharam Delicacy'
  const effectiveCategory = (product ? product.category : category) || ''

  const resolvedBackendUrl = resolveImageUrl(rawSrc)
  const [failed, setFailed] = useState(false)

  // Reset error state whenever the image source changes
  useEffect(() => {
    setFailed(false)
  }, [rawSrc])

  if (!resolvedBackendUrl || failed) {
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
      src={resolvedBackendUrl}
      alt={effectiveAlt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      {...rest}
    />
  )
}
