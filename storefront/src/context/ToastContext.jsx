import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

let idCounter = 0

/**
 * Wrap the app with <ToastProvider> once (alongside AuthProvider /
 * CartProvider in main.jsx or App.jsx), then anywhere in the tree:
 *
 *   const { showToast } = useToast()
 *   showToast('Subscribed! Pending admin approval.')
 *   showToast('Could not place order', { type: 'error' })
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const showToast = useCallback(
    (message, { type = 'success', duration = 4000 } = {}) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 md:items-end md:pr-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const isError = toast.type === 'error'

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg shadow-ink-900/10 transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      } ${isError ? 'border-chili-100' : 'border-success-100'}`}
    >
      {isError ? (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-chili-500" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
      )}
      <p className="flex-1 text-sm font-medium leading-snug text-ink-900">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="mt-0.5 shrink-0 text-ink-300 transition-colors hover:text-ink-700"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
