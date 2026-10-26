import { useState } from 'react'
import { Salad } from 'lucide-react'

/**
 * Renders a product image, or a branded placeholder when:
 *   - the product has no image_url at all, or
 *   - the image_url is set but fails to actually load (broken link, 404, etc.)
 * Used everywhere a product photo appears: product grid, product detail,
 * cart, checkout, and order history — one component, one fallback look.
 */
export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  if (showPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-chili-50 to-cream-200 text-chili-300 ${className}`}
      >
        <Salad className="h-1/3 w-1/3" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}
