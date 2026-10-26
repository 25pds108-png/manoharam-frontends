import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/layout/RequireAuth'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Recipes from './pages/Recipes'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Subscriptions from './pages/Subscriptions'
import SubscriptionDetail from './pages/SubscriptionDetail'
import DetailSubscription from './pages/DetailSubscription'
import Inventory from './pages/Inventory'
import InventoryDetail from './pages/InventoryDetail'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Coupons from './pages/Coupons'
import Reviews from './pages/Reviews'
import ServiceHolidays from './pages/ServiceHolidays'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/products"
        element={
          <RequireAuth>
            <Products />
          </RequireAuth>
        }
      />
      <Route
        path="/products/:id"
        element={
          <RequireAuth>
            <ProductDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/recipes"
        element={
          <RequireAuth>
            <Recipes />
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
      <Route
        path="/subscriptions"
        element={
          <RequireAuth>
            <Subscriptions />
          </RequireAuth>
        }
      />
      <Route
        path="/subscriptions/:id"
        element={
          <RequireAuth>
            <SubscriptionDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/subscriptions/plans/:planId"
        element={
          <RequireAuth>
            <DetailSubscription />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory"
        element={
          <RequireAuth>
            <Inventory />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory/:productId"
        element={
          <RequireAuth>
            <InventoryDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/customers"
        element={
          <RequireAuth>
            <Customers />
          </RequireAuth>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <RequireAuth>
            <CustomerDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/coupons"
        element={
          <RequireAuth>
            <Coupons />
          </RequireAuth>
        }
      />
      <Route
        path="/reviews"
        element={
          <RequireAuth>
            <Reviews />
          </RequireAuth>
        }
      />
      <Route
        path="/holidays"
        element={
          <RequireAuth>
            <ServiceHolidays />
          </RequireAuth>
        }
      />
    </Routes>
  )
}