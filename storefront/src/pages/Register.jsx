import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../api/client'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await register(form)
      if (data.success) {
        // register.php doesn't issue a token, so we route to login rather
        // than pretending the user is already signed in.
        navigate('/login', { state: { justRegistered: true } })
      } else {
        setError(data.message || 'Could not create account')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create account'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-cream-100 px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Create your account</h1>
      <p className="mt-2 text-ink-500">Join Manoharam Real Foods for fresh meals, daily.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Full name" value={form.name} onChange={update('name')} required />
        <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
        <Field label="Phone" type="tel" value={form.phone} onChange={update('phone')} />
        <Field label="Address" value={form.address} onChange={update('address')} />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={update('password')}
          required
          hint="At least 6 characters"
        />

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-chili-500">
          Log in
        </Link>
      </p>
    </div>
  )
}

function Field({ label, hint, ...inputProps }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <input
        {...inputProps}
        className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm outline-none focus:border-chili-400"
      />
      {hint ? <p className="mt-1 text-xs text-ink-300">{hint}</p> : null}
    </div>
  )
}
