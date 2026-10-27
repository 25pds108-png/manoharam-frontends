import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/layout/RequireAuth'

import Home from './pages/Home'
import SearchPage from './pages/SearchPage'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Subscription from './pages/Subscription'
import PlanDetails from './pages/PlanDetails'
import SubscriptionSetup from './pages/SubscriptionSetup'
import SubscriptionReview from './pages/SubscriptionReview'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import SubscriptionDetails from './pages/SubscriptionDetails'

export default function App() {
  return (
    <Routes>
      {/* Public — browse freely, per the design's login-wall flow */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Plan details & subscription catalog: public so visitors can browse
          all plans, rotation menus, and nutrition before signing in.
          The actual subscribe setup flow (/subscribe/:planId) remains gated. */}
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/plans/:planId" element={<PlanDetails />} />

      {/* Gated behind login */}
      <Route
        path="/cart"
        element={
          <RequireAuth>
            <Cart />
          </RequireAuth>
        }
      />
      <Route
        path="/checkout"
        element={
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireAuth>
            <Orders />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireAuth>
            <OrderDetail />
          </RequireAuth>
        }
      />

      {/* Subscribe flow: from a plan's details page (/plans/:planId,
          public), Continue drops here to choose start date/duration ->
          review the daily schedule and confirm. Both steps need the same
          auth gate as the rest of the subscription area. */}
      <Route
        path="/subscribe/:planId"
        element={
          <RequireAuth>
            <SubscriptionSetup />
          </RequireAuth>
        }
      />
      <Route
        path="/subscribe/:planId/review"
        element={
          <RequireAuth>
            <SubscriptionReview />
          </RequireAuth>
        }
      />
      <Route
        path="/subscriptions/:id"
        element={
          <RequireAuth>
            <SubscriptionDetails />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
    </Routes>
  )
}