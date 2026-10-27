import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../api/client'
import logo from '../assets/logo.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const justRegistered = location.state?.justRegistered

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
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF6EF] px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex flex-col items-center group">
          <img
            src={logo}
            alt="Manoharam Real Foods"
            className="h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
            Manoharam Real Foods
          </span>
          <span className="font-serif text-xs italic text-[#9B2C2C] mt-0.5">
            “Safe, as your mother's home.”
          </span>
        </Link>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-[#E6D9C5] bg-[#FFFEFC] px-6 py-8 shadow-sm sm:px-8">
          <h1 className="font-serif text-xl font-bold text-[#1C1917] text-center">
            Sign In to Your Account
          </h1>
          <p className="mt-1 text-center text-xs text-[#78716C]">
            Access your orders, saved addresses, and subscriptions.
          </p>

          {justRegistered ? (
            <p className="mt-4 rounded-md bg-[#DCFCE7] p-2.5 text-center text-xs font-semibold text-[#15803D]">
              Account created successfully! Please sign in.
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#44403C]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] px-3.5 py-2.5 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C] focus:bg-white"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44403C]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] px-3.5 py-2.5 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C] focus:bg-white"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="rounded-md bg-[#FDF2F2] p-2.5 text-center text-xs font-semibold text-[#9B2C2C]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-md bg-[#9B2C2C] py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#E6D9C5] pt-4 text-center">
            <p className="text-xs text-[#78716C]">
              New to Manoharam Real Foods?{' '}
              <Link to="/register" className="font-bold text-[#9B2C2C] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
