import { Link } from 'react-router-dom'
import { ShieldCheck, Heart, Sparkles } from 'lucide-react'
import logo from '../../assets/logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-[#E6D9C5] bg-[#FAF6EF] text-[#44403C] transition-colors">
      {/* Brand Trust Bar */}
      <div className="border-b border-[#E6D9C5] bg-[#F3EBDD]/60 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 sm:grid-cols-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FCE4E4] text-[#9B2C2C]">
              <Heart className="h-5 w-5 fill-[#9B2C2C]" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#1C1917]">Safe, as your mother's home.</p>
              <p className="text-xs text-[#78716C]">Prepared with maternal care, purity, and wholesome hygiene.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FEF7DA] text-[#D97706]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#1C1917]">Small-Batch Craftsmanship</p>
              <p className="text-xs text-[#78716C]">Slow-cured in ceramic martabans with 100% cold-pressed oils.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#1C1917]">Zero Chemical Preservatives</p>
              <p className="text-xs text-[#78716C]">Naturally preserved with rock salt, turmeric, and cold-pressed oil.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info & Official Logo */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src={logo}
                alt="Manoharam Real Foods"
                className="h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1917] leading-none group-hover:text-[#9B2C2C] transition-colors">
                  Manoharam
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9B2C2C] mt-1">
                  Real Foods
                </span>
              </div>
            </Link>

            <blockquote className="border-l-2 border-[#9B2C2C] pl-3.5 font-serif text-base italic text-[#9B2C2C]">
              “Safe, as your mother's home.”
            </blockquote>

            <p className="max-w-sm text-xs leading-relaxed text-[#78716C]">
              Traditional South Indian recipes, authentic pickles, aromatic podis, and daily meal subscriptions prepared with pure ingredients, authentic culinary heritage, and heartfelt warmth.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="font-serif text-sm font-bold uppercase tracking-wider text-[#1C1917]">
              Explore
            </p>
            <ul className="space-y-2 text-xs text-[#78716C]">
              <li>
                <Link to="/" className="hover:text-[#9B2C2C] transition-colors">
                  Our Menu & À La Carte
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-[#9B2C2C] transition-colors">
                  Weekly Meal Plans
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#9B2C2C] transition-colors">
                  Search Dishes
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#9B2C2C] transition-colors">
                  View Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Account */}
          <div className="space-y-3">
            <p className="font-serif text-sm font-bold uppercase tracking-wider text-[#1C1917]">
              My Account
            </p>
            <ul className="space-y-2 text-xs text-[#78716C]">
              <li>
                <Link to="/orders" className="hover:text-[#9B2C2C] transition-colors">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#9B2C2C] transition-colors">
                  Profile & Address Book
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-[#9B2C2C] transition-colors">
                  Manage Subscriptions
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-[#9B2C2C] transition-colors">
                  Order Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Kitchen Standards & Safety */}
          <div className="space-y-3">
            <p className="font-serif text-sm font-bold uppercase tracking-wider text-[#1C1917]">
              Heritage Standards
            </p>
            <div className="rounded-lg border border-[#E6D9C5] bg-[#FFFEFC] p-3 text-xs text-[#78716C] space-y-1.5 shadow-xs">
              <p className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#15803D]" />
                Pure Quality Promise
              </p>
              <p className="text-[11px] leading-relaxed">
                Handcrafted in small batches without artificial food colorings, synthetic flavoring, or chemical preservatives.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal strip */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E6D9C5] pt-8 text-center text-xs text-[#78716C] sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Manoharam Real Foods. All rights reserved.</p>
          <p className="font-serif text-xs italic text-[#9B2C2C]">
            “Safe, as your mother's home.”
          </p>
        </div>
      </div>
    </footer>
  )
}
