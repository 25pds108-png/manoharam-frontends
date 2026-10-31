import { Check } from 'lucide-react'

export function HorizontalStepper({ steps = [], currentStep = 0, className = '' }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep
          const isCurrent = idx === currentStep

          return (
            <div key={step.title || idx} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-chili-600 text-cream-50 shadow-2xs'
                      : isCurrent
                      ? 'border-2 border-chili-600 bg-cream-50 text-chili-600 shadow-xs ring-4 ring-chili-500/10'
                      : 'border border-cream-300 bg-cream-100 text-ink-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : idx + 1}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-bold tracking-tight text-center ${
                    isCurrent ? 'text-chili-600' : isCompleted ? 'text-ink-900' : 'text-ink-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {idx < steps.length - 1 ? (
                <div
                  className={`h-0.5 flex-1 mb-5 transition-colors ${
                    idx < currentStep ? 'bg-chili-600' : 'bg-cream-300'
                  }`}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function VerticalTimeline({ steps = [], className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = Boolean(step.completed)
        const isCurrent = Boolean(step.current)

        return (
          <div key={step.step || step.name || idx} className="flex items-start gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-success-500 text-cream-50 shadow-2xs'
                    : isCurrent
                    ? 'bg-chili-600 text-cream-50 ring-4 ring-chili-500/20 animate-pulse'
                    : 'border border-cream-300 bg-cream-100 text-ink-400'
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : idx + 1}
              </span>
              {idx < steps.length - 1 ? (
                <span
                  className={`w-0.5 h-8 my-1 transition-colors ${
                    isCompleted ? 'bg-success-500' : 'bg-cream-300'
                  }`}
                />
              ) : null}
            </div>

            <div className="flex-1 pb-1">
              <p
                className={`text-xs sm:text-sm font-bold leading-tight ${
                  isCurrent
                    ? 'text-chili-600'
                    : isCompleted
                    ? 'text-ink-900'
                    : 'text-ink-400'
                }`}
              >
                {step.name || step.step}
              </p>
              {step.description ? (
                <p className="mt-0.5 text-xs text-ink-500 leading-relaxed">
                  {step.description}
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
