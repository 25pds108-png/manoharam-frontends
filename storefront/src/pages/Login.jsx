import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../api/client'
import logo from '../assets/logo.png'
import Button from '../components/ui/Button'
import { HeritageKolamDivider } from '../components/ui/HeritagePattern'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const justRegistered = location.state?.justRegistered

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
      const data = await login(email, password)
      if (data.success) {
        navigate(from, { replace: true })
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
    <div className="flex min-h-screen flex-col justify-center bg-cream-100 px-4 py-12 sm:px-6 lg:px-8 selection:bg-chili-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex flex-col items-center group">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-50 border border-cream-300 p-2 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <img
              src={logo}
              alt="Manoharam Real Foods"
              className="h-full w-auto object-contain"
            />
          </div>
          <span className="mt-3 font-serif text-2xl font-bold tracking-tight text-ink-900">
            Manoharam Real Foods
          </span>
          <span className="font-serif text-xs italic text-chili-600 mt-0.5">
            “Safe, as your mother&apos;s home.”
          </span>
        </Link>
      </div>

      <div className="animate-fade-in-up mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-cream-300 bg-cream-50 px-6 py-8 shadow-sm sm:px-8">
          <h1 className="font-serif text-xl font-bold text-ink-900 text-center">
            Sign In to Your Account
          </h1>
          <p className="mt-1 text-center text-xs text-ink-500">
            Access your orders, saved addresses, and active subscriptions.
          </p>

          <HeritageKolamDivider className="my-3 text-cream-300 opacity-60" />

          {justRegistered ? (
            <div className="mb-4 rounded-xl bg-success-100 border border-success-200 p-3 text-center text-xs font-semibold text-success-500">
              Account created successfully! Please sign in with your credentials.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-700">Email Address</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-100 pl-9 pr-3.5 py-2.5 text-xs text-ink-900 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700">Password</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-100 pl-9 pr-10 py-2.5 text-xs text-ink-900 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-400 hover:text-ink-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl bg-danger-100 border border-danger-200 p-2.5 text-center text-xs font-semibold text-danger-500">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="w-full justify-center text-xs py-3 mt-2"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 border-t border-cream-300 pt-4 text-center">
            <p className="text-xs text-ink-600">
              New to Manoharam Real Foods?{' '}
              <Link to="/register" className="font-bold text-chili-600 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Heritage Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-ink-500 text-xs">
          <ShieldCheck className="h-4 w-4 text-success-500" />
          <span>Cold-pressed oils · Small batch craft · Zero preservatives</span>
        </div>
      </div>
    </div>
  )
}
