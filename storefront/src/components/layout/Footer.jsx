import { Link } from 'react-router-dom'
import { HeritageDivider } from '../ui/HeritagePattern'
import logo from '../../assets/logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-cream-300 bg-cream-100 text-ink-700">
      {/* Heritage Divider Ribbon */}
      <div className="py-2 flex justify-center opacity-60">
        <HeritageDivider className="text-cream-300 max-w-xs" />
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info & Official Logo */}
          <div className="space-y-3.5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src={logo}
                alt="Manoharam Real Foods"
                className="h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-ink-900 leading-none group-hover:text-chili-600 transition-colors">
                  Manoharam
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-chili-600 mt-1">
                  Real Foods
                </span>
              </div>
            </Link>

            <p className="font-serif text-xs italic text-chili-600">
              “Safe, as your mother's home.”
            </p>

            <p className="text-xs text-ink-500 leading-relaxed">
              Pure handcrafted traditional South Indian food and scheduled weekly meal deliveries, prepared with reverence to age-old heritage recipes.
            </p>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <p className="font-serif text-xs font-bold uppercase tracking-wider text-ink-900">
              Shop
            </p>
            <ul className="space-y-2 text-xs text-ink-500">
              <li>
                <Link to="/" className="hover:text-chili-600 transition-colors">
                  All Food Products
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-chili-600 transition-colors">
                  Weekly Meal Plans
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-chili-600 transition-colors">
                  Search Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-chili-600 transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <p className="font-serif text-xs font-bold uppercase tracking-wider text-ink-900">
              Account
            </p>
            <ul className="space-y-2 text-xs text-ink-500">
              <li>
                <Link to="/orders" className="hover:text-chili-600 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-chili-600 transition-colors">
                  Subscription Deliveries
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-chili-600 transition-colors">
                  Profile & Addresses
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-chili-600 transition-colors">
                  Delivery Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Kitchen */}
          <div className="space-y-3 text-xs text-ink-500">
            <p className="font-serif text-xs font-bold uppercase tracking-wider text-ink-900">
              Our Kitchen Standards
            </p>
            <ul className="space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>100% Cold-Pressed Gingelly & Groundnut Oils</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>Zero Chemical Preservatives or Added Colors</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>Prepared in Small Artisanal Batches</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>Hygienic Home-Style Packaging</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-cream-300/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} Manoharam Real Foods. Handcrafted in Tamil Nadu.</p>
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-chili-600 font-semibold">“Safe, as your mother's home.”</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
