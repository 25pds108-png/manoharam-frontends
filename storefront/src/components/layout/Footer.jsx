import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-[#E6D9C5] bg-[#FAF6EF] text-[#44403C]">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info & Official Logo */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src={logo}
                alt="Manoharam Real Foods"
                className="h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[#1C1917] leading-none group-hover:text-[#9B2C2C] transition-colors">
                  Manoharam
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B2C2C] mt-0.5">
                  Real Foods
                </span>
              </div>
            </Link>

            <p className="font-serif text-xs italic text-[#9B2C2C]">
              “Safe, as your mother's home.”
            </p>

            <p className="text-xs text-[#78716C] leading-relaxed">
              Traditional South Indian homemade pickles and scheduled weekly meal deliveries.
            </p>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-2.5">
            <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              Shop
            </p>
            <ul className="space-y-1.5 text-xs text-[#78716C]">
              <li>
                <Link to="/" className="hover:text-[#9B2C2C] transition-colors">
                  Pickles & Delicacies
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-[#9B2C2C] transition-colors">
                  Weekly Meal Plans
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#9B2C2C] transition-colors">
                  Search Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#9B2C2C] transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-2.5">
            <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              Account
            </p>
            <ul className="space-y-1.5 text-xs text-[#78716C]">
              <li>
                <Link to="/orders" className="hover:text-[#9B2C2C] transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-[#9B2C2C] transition-colors">
                  Subscription Deliveries
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#9B2C2C] transition-colors">
                  Profile & Addresses
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-[#9B2C2C] transition-colors">
                  Delivery Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Kitchen */}
          <div className="space-y-2.5 text-xs text-[#78716C]">
            <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              Our Kitchen Standards
            </p>
            <ul className="space-y-1">
              <li>• 100% Cold-Pressed Gingelly & Groundnut Oils</li>
              <li>• Zero Chemical Preservatives or Colors</li>
              <li>• Prepared in Small Artisanal Batches</li>
              <li>• Hygienic Home-Style Packaging</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-[#E6D9C5] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A8A29E]">
          <p>© {new Date().getFullYear()} Manoharam Real Foods. All rights reserved.</p>
          <p className="font-serif italic text-[#78716C]">“Safe, as your mother's home.”</p>
        </div>
      </div>
    </footer>
  )
}
