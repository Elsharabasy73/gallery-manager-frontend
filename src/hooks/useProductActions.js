import { useState } from 'react'

export function useProductActions({
  getProductId,
  isAuthenticated,
  role,
  canAccessCart,
  toggleWishlist,
  addToCart,
  quantity = 1,
  navigate,
  onWishlistStart,
  onWishlistError,
  onCartStart,
  onCartSuccess,
  onCartError,
  stopPropagation = false,
  requireWishlistId = true,
  requireCartId = true,
}) {
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  const handleWishlist = async (e) => {
    if (stopPropagation) e?.stopPropagation()
    onWishlistStart?.()
    if (!isAuthenticated || role !== 'customer') {
      navigate('/login')
      return
    }
    const pid = getProductId()
    if (requireWishlistId && !pid) return
    setWishlistLoading(true)
    try {
      await toggleWishlist(String(pid))
    } catch (err) {
      onWishlistError?.(err)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleAddToCart = async (e) => {
    if (stopPropagation) e?.stopPropagation()
    onCartStart?.()
    if (!canAccessCart) {
      navigate('/login')
      return
    }
    const pid = getProductId()
    if (requireCartId && !pid) return
    setCartLoading(true)
    try {
      await addToCart(String(pid), quantity)
      onCartSuccess?.()
    } catch (err) {
      onCartError?.(err)
    } finally {
      setCartLoading(false)
    }
  }

  return { handleWishlist, handleAddToCart, wishlistLoading, cartLoading }
}
