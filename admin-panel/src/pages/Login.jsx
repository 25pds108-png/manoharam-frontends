import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await login(email.trim(), password)
      if (data.success) {
        navigate('/', { replace: true })
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100/80 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-chili-500 font-display text-2xl font-bold text-cream-50 shadow-md shadow-chili-500/20">
            M
          </span>
          <div>
            <p className="font-display text-xl font-bold text-ink-900 leading-tight">
              Manoharam Real Foods
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-chili-600">
              Operations & Admin Console
            </p>
          </div>
        </div>

        <Card className="p-6 sm:p-8 shadow-sm border-cream-300">
          <h1 className="font-display text-2xl font-bold text-ink-900">Sign in</h1>
          <p className="mt-1 text-xs text-ink-500">
            Enter your administrative credentials to manage store operations.
          </p>

          {error ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-chili-200 bg-chili-50 p-3.5 text-xs font-semibold text-chili-700">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-ink-900 outline-none focus:border-chili-500 focus:ring-2 focus:ring-chili-500/10 transition-all placeholder:text-ink-300"
                  placeholder="admin@manoharam.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-white py-2.5 pl-10 pr-10 text-xs font-medium text-ink-900 outline-none focus:border-chili-500 focus:ring-2 focus:ring-chili-500/10 transition-all placeholder:text-ink-300"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={isSubmitting} className="w-full shadow-sm text-sm py-2.5">
                Sign in to Dashboard
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-ink-400">
          Authorized personnel only. Protected by administrative session authentication.
        </p>
      </div>
    </div>
  )
}
