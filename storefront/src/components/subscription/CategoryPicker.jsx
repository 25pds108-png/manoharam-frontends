import { Check, Leaf, Drumstick } from 'lucide-react'
import { DIETARY_CATEGORIES } from '../../lib/planDietaryType'

const ICONS = {
  VEG: Leaf,
  NON_VEG: Drumstick,
}

export default function CategoryPicker({ selected, onSelect, counts }) {
  return (
    <div role="radiogroup" aria-label="Dietary category" className="grid grid-cols-2 gap-3 sm:gap-4">
      {DIETARY_CATEGORIES.map((cat) => {
        const Icon = ICONS[cat.id] ?? Leaf
        const isSelected = selected === cat.id
        const count = counts?.[cat.id]

        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(cat.id)}
            className={[
              'group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B2C2C]',
              isSelected
                ? 'border-[#9B2C2C] bg-[#FCE4E4]/40 shadow-xs ring-1 ring-[#9B2C2C]/20'
                : 'border-[#E6D9C5] bg-[#FFFEFC] hover:border-[#9B2C2C]/30 hover:bg-[#FAF6EF]',
            ].join(' ')}
          >
            {isSelected ? (
              <span className="absolute right-2.5 top-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#9B2C2C]">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            ) : null}

            <span
              className={[
                'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150',
                isSelected ? 'bg-[#9B2C2C] text-white shadow-xs' : 'bg-[#FAF6EF] text-[#9B2C2C] border border-[#E6D9C5]',
              ].join(' ')}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>

            <div>
              <span className="flex items-center justify-center gap-1.5">
                <span className="font-serif text-sm font-bold text-[#1C1917] sm:text-base">{cat.label}</span>
                {typeof count === 'number' ? (
                  <span className="rounded-full bg-[#FAF6EF] border border-[#E6D9C5] px-1.5 py-0.2 text-[10px] font-bold text-[#78716C]">
                    {count}
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-[#78716C]">{cat.description}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}