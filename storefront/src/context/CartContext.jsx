import { createContext, useContext, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCart,
  addToCart as addToCartRequest,
  updateCartQuantity as updateCartQuantityRequest,
  removeFromCart as removeFromCartRequest,
  clearCart as clearCartRequest,
} from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 0,
  })

  const addMutation = useMutation({
    mutationFn: addToCartRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: updateCartQuantityRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFromCartRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearCartRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const rawItems = cartQuery.data?.cart_items
  const items = useMemo(() => rawItems ?? [], [rawItems])
  const totalAmount = cartQuery.data?.total_amount ?? 0
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      totalAmount,
      itemCount,
      isLoading: cartQuery.isLoading,
      isError: cartQuery.isError,
      refetch: cartQuery.refetch,
      addToCart: addMutation.mutateAsync,
      isAdding: addMutation.isPending,
      updateQuantity: (productId, quantity, cartItemId) =>
        updateQuantityMutation.mutateAsync({ productId, quantity, cartItemId }),
      isUpdating: updateQuantityMutation.isPending,
      removeItem: (productId, cartItemId) =>
        removeMutation.mutateAsync({ productId, cartItemId }),
      isRemoving: removeMutation.isPending,
      clearCart: clearMutation.mutateAsync,
      isClearing: clearMutation.isPending,
    }),
    [
      items,
      totalAmount,
      itemCount,
      cartQuery,
      addMutation,
      updateQuantityMutation,
      removeMutation,
      clearMutation,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
