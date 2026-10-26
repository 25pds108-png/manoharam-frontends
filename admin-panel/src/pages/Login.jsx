import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await login(email, password)
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
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chili-500 font-display text-xl font-semibold text-cream-50 shadow-md shadow-chili-500/30">
            M
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">
              Manoharam Real Foods
            </p>
            <p className="text-xs text-ink-300">Admin panel</p>
          </div>
        </div>

        <h1 className="mt-8 font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in with your admin account to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm outline-none focus:border-chili-400"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm outline-none focus:border-chili-400"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
