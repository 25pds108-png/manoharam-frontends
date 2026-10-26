import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Send them to login, remembering where they were trying to go so we
    // can bounce back after a successful login (e.g. came from "Add to cart").
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
