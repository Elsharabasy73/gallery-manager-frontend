import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart, clearCart as apiClearCart, unwrapCart } from '../api/cart'
import { useRole } from './RoleContext'

const CartContext = createContext(null)

/**
 * Cart Provider - Manages cart state for authenticated users
 * Only customers (user role) have access to cart
 */
export function CartProvider({ children }) {
  const { role, isAuthenticated } = useRole()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Only fetch cart for authenticated customers
  const canAccessCart = isAuthenticated && role === 'customer'

  // Fetch cart on mount and when auth changes
  useEffect(() => {
    if (!canAccessCart) {
      setCart(null)
      return
    }

    let cancelled = false
    async function fetchCart() {
      setLoading(true)
      setError(null)
      try {
        const res = await getCart()
        if (cancelled) return
        const cartData = unwrapCart(res)
        setCart(cartData)
      } catch (err) {
        if (cancelled) return
        // 404 means empty cart, not an error
        if (err?.status === 404) {
          setCart({ items: [], totalPrice: 0 })
        } else {
          setError(err.message || 'Failed to load cart')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCart()
    return () => { cancelled = true }
  }, [canAccessCart])

  // Add item to cart
  const addItem = useCallback(async (productId, quantity = 1) => {
    if (!canAccessCart) {
      throw new Error('Please login as a customer to add items to cart')
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiAddToCart({ productId, quantity })
      const cartData = unwrapCart(res)
      setCart(cartData)
      return cartData
    } catch (err) {
      setError(err.message || 'Failed to add item to cart')
      throw err
    } finally {
      setLoading(false)
    }
  }, [canAccessCart])

  // Update item quantity
  const updateItem = useCallback(async (productId, quantity) => {
    if (!canAccessCart) {
      throw new Error('Please login as a customer to update cart')
    }
    setLoading(true)
    setError(null)
    try {
      const res = await updateCartItem(productId, quantity)
      const cartData = unwrapCart(res)
      setCart(cartData)
      return cartData
    } catch (err) {
      setError(err.message || 'Failed to update item')
      throw err
    } finally {
      setLoading(false)
    }
  }, [canAccessCart])

  // Remove item from cart
  const removeItem = useCallback(async (productId) => {
    if (!canAccessCart) {
      throw new Error('Please login as a customer to remove items')
    }
    setLoading(true)
    setError(null)
    try {
      await removeFromCart(productId)
      // Update local cart state
      setCart(prev => {
        if (!prev || !prev.items) return prev
        const newItems = prev.items.filter(item => item.productId !== productId)
        const totalPrice = newItems.reduce((sum, item) => {
          const price = Number(item.product?.price || 0)
          return sum + (price * item.quantity)
        }, 0)
        return { ...prev, items: newItems, totalPrice }
      })
    } catch (err) {
      setError(err.message || 'Failed to remove item')
      throw err
    } finally {
      setLoading(false)
    }
  }, [canAccessCart])

  // Clear entire cart
  const clear = useCallback(async () => {
    if (!canAccessCart) {
      throw new Error('Please login as a customer to clear cart')
    }
    setLoading(true)
    setError(null)
    try {
      await apiClearCart()
      setCart({ items: [], totalPrice: 0 })
    } catch (err) {
      setError(err.message || 'Failed to clear cart')
      throw err
    } finally {
      setLoading(false)
    }
  }, [canAccessCart])

  // Refresh cart data
  const refresh = useCallback(async () => {
    if (!canAccessCart) return
    setLoading(true)
    setError(null)
    try {
      const res = await getCart()
      const cartData = unwrapCart(res)
      setCart(cartData)
    } catch (err) {
      if (err?.status === 404) {
        setCart({ items: [], totalPrice: 0 })
      } else {
        setError(err.message || 'Failed to refresh cart')
      }
    } finally {
      setLoading(false)
    }
  }, [canAccessCart])

  // Group items by gallery for checkout
  const groupedByGallery = useMemo(() => {
    if (!cart?.items) return []

    const groups = {}
    cart.items.forEach(item => {
      const galleryId = item.product?.galleryId || item.product?.gallery?.id || 'unknown'
      const galleryName = item.product?.gallery?.name || 'Unknown Gallery'
      const gallerySlug = item.product?.gallery?.slug || ''

      if (!groups[galleryId]) {
        groups[galleryId] = {
          galleryId,
          galleryName,
          gallerySlug,
          items: [],
          subtotal: 0
        }
      }

      const price = Number(item.product?.price || 0)
      groups[galleryId].items.push(item)
      groups[galleryId].subtotal += price * item.quantity
    })

    return Object.values(groups)
  }, [cart])

  // Total items count
  const itemCount = useMemo(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const value = useMemo(() => ({
    cart,
    items: cart?.items || [],
    itemCount,
    totalPrice: cart?.totalPrice || 0,
    groupedByGallery,
    loading,
    error,
    canAccessCart,
    addItem,
    updateItem,
    removeItem,
    clear,
    refresh
  }), [cart, itemCount, loading, error, canAccessCart, addItem, updateItem, removeItem, clear, refresh, groupedByGallery])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
