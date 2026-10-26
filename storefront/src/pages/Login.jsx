import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-cream-100 px-6">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Welcome back</h1>
      <p className="mt-2 text-ink-500">Log in to continue to Manoharam Real Foods.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm outline-none focus:border-chili-400"
            placeholder="you@example.com"
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
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-chili-500">
          Create an account
        </Link>
      </p>
    </div>
  )
}
