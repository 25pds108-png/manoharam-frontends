import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/layout/RequireAuth'
import ErrorBoundary from './components/ErrorBoundary'
import { Skeleton } from './components/ui/Skeleton'

// Route-level code splitting for production performance & zero CLS
const Home = lazy(() => import('./pages/Home'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Subscription = lazy(() => import('./pages/Subscription'))
const PlanDetails = lazy(() => import('./pages/PlanDetails'))
const SubscriptionSetup = lazy(() => import('./pages/SubscriptionSetup'))
const SubscriptionReview = lazy(() => import('./pages/SubscriptionReview'))
const SubscriptionDetails = lazy(() => import('./pages/SubscriptionDetails'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageFallback() {
  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-8 sm:px-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 pt-6">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="aspect-square w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
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

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}