import { useState } from 'react'

/**
 * Traditional South Indian ceramic pickle jar (Martaban / Bharani)
 * fallback illustration for authentic homemade foods.
 */
function BharaniJarIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background warm circle */}
      <circle cx="50" cy="50" r="46" fill="#FCE4E4" opacity="0.6" />
      {/* Jar lid / neck */}
      <ellipse cx="50" cy="24" rx="14" ry="4" fill="#C1272D" />
      <path d="M40 24 C40 28, 60 28, 60 24" stroke="#9B2C2C" strokeWidth="2" />
      <path d="M42 24 L40 32 L60 32 L58 24 Z" fill="#9B2C2C" />
      {/* Cloth tied on lid string */}
      <path d="M37 27 Q50 30 63 27" stroke="#FEF7DA" strokeWidth="2" strokeLinecap="round" />
      <circle cx="63" cy="28" r="1.5" fill="#D97706" />
      {/* Jar shoulder and body (classic glazed Martaban: top mustard/ochre, bottom cream/terracotta) */}
      <path
        d="M40 32 C30 36 24 45 24 58 C24 74 34 82 50 82 C66 82 76 74 76 58 C76 45 70 36 60 32 Z"
        fill="#FAF6EF"
        stroke="#9B2C2C"
        strokeWidth="2.5"
      />
      {/* Glazed mustard top section */}
      <path
        d="M40 32 C30 36 24 45 24 54 C32 56 42 54 50 54 C58 54 68 56 76 54 C76 45 70 36 60 32 Z"
        fill="#D97706"
      />
      {/* Chili accent mark on jar */}
      <path
        d="M45 62 Q50 68 56 63"
        stroke="#C1272D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="45" cy="62" r="1.5" fill="#15803D" />
    </svg>
  )
}

/**
 * Renders a product image with object-cover, or a bespoke traditional
 * food jar illustration when an image is missing or 404s.
 */
export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  if (showPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-b from-[#FFFDF5] to-[#FCE4E4]/40 p-4 ${className}`}
      >
        <BharaniJarIllustration className="h-4/5 w-4/5 max-h-32 drop-shadow-xs transition-transform duration-300 hover:scale-105" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || 'Manoharam Real Foods product'}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

