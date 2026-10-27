import { useState } from 'react'
import mangoPickle from '../assets/food/mango-pickle.jpg'
import garlicPickle from '../assets/food/garlic-pickle.jpg'
import lemonPickle from '../assets/food/lemon-pickle.jpg'
import tomatoThokku from '../assets/food/tomato-thokku.jpg'
import mixedVegPickle from '../assets/food/mixed-veg-pickle.jpg'
import gingerPickle from '../assets/food/ginger-pickle.jpg'
import amlaPickle from '../assets/food/amla-pickle.jpg'
import traditionalMeals from '../assets/food/traditional-meals.jpg'

const FOOD_ASSETS = [
  { match: /(garlic|poondu)/i, asset: garlicPickle },
  { match: /(mango|manga|avakaya)/i, asset: mangoPickle },
  { match: /(lemon|lime|elumichai)/i, asset: lemonPickle },
  { match: /(tomato|thokku)/i, asset: tomatoThokku },
  { match: /(mixed|vegetable)/i, asset: mixedVegPickle },
  { match: /(ginger|inji|allam)/i, asset: gingerPickle },
  { match: /(amla|gooseberry|nellikai)/i, asset: amlaPickle },
  { match: /(meal|thali|lunch|salad)/i, asset: traditionalMeals },
]

function getLocalFoodAsset(name = '', src = '') {
  const combined = `${name} ${src}`.toLowerCase()
  for (const item of FOOD_ASSETS) {
    if (item.match.test(combined)) {
      return item.asset
    }
  }
  return mangoPickle
}

/**
 * Renders authentic food photography. If a backend URL is an unconfigured
 * example.com placeholder or fails, smoothly presents the genuine matching
 * high-resolution South Indian food asset.
 */
export default function ProductImage({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false)
  const isPlaceholderUrl = !src || src.includes('example.com')

  const fallbackAsset = getLocalFoodAsset(alt, src)
  const effectiveSrc = isPlaceholderUrl || failed ? fallbackAsset : src

  return (
    <img
      src={effectiveSrc}
      alt={alt || 'Manoharam Real Foods'}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}


