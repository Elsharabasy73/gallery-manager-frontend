import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useRole } from './RoleContext'
import { getMyWishlist, addToWishlist, removeFromWishlist, unwrapWishlist, normalizeWishlistItem } from '../api/wishlist'

const WishlistContext = createContext(null)
export const useWishlist = () => useContext(WishlistContext)

function getId(p) {
  if (!p) return null
  return String(p._id || p.id || p.productId || '')
}

export function WishlistProvider({ children }) {
  const { role, isAuthenticated } = useRole()
  const isCustomer = role === 'customer'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const canUseWishlist = isAuthenticated && isCustomer

  const refresh = useCallback(async () => {
    if (!canUseWishlist) {
      setItems([])
      setInitialized(true)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await getMyWishlist()
      const raw = unwrapWishlist(res)
      const normalized = raw.map(normalizeWishlistItem).filter(Boolean)
      setItems(normalized)
    } catch (e) {
      // 401/403 -> not logged or not customer, keep empty
      if (e?.status === 401 || e?.status === 403) setError(null)
      else setError(e.message || 'Failed to load wishlist')
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [canUseWishlist])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isWishlisted = useCallback((productId) => {
    if (!productId) return false
    const id = String(productId)
    return items.some(p => getId(p) === id)
  }, [items])

  const add = useCallback(async (productId) => {
    if (!canUseWishlist) throw new Error('Please log in as customer to use wishlist')
    const res = await addToWishlist(productId)
    // optimistically refresh rather than trusting shape
    // try to unwrap returned wishlist if provided, else refetch
    const maybe = unwrapWishlist(res)
    if (maybe.length) {
      setItems(maybe.map(normalizeWishlistItem).filter(Boolean))
    } else {
      // if backend returns updated doc, refetch
      await refresh()
    }
    return res
  }, [canUseWishlist, refresh])

  const remove = useCallback(async (productId) => {
    if (!canUseWishlist) throw new Error('Please log in as customer to use wishlist')
    // optimistic update
    const prev = items
    setItems(prev.filter(p => getId(p) !== String(productId)))
    try {
      const res = await removeFromWishlist(productId)
      const maybe = unwrapWishlist(res)
      if (maybe.length || res?.data) {
        // if backend returns new wishlist, reconcile
        // but optimistic already done; refetch if we can't tell
        if (res?.data?.wishlist || res?.data?.products || Array.isArray(res?.data)) {
          const normalized = maybe.map(normalizeWishlistItem).filter(Boolean)
          if (normalized.length || maybe.length === 0) setItems(normalized)
        }
      }
      return res
    } catch (e) {
      setItems(prev)
      throw e
    }
  }, [canUseWishlist, items])

  const toggle = useCallback(async (productId) => {
    if (isWishlisted(productId)) return remove(productId)
    return add(productId)
  }, [isWishlisted, add, remove])

  const count = items.length

  const value = useMemo(() => ({
    items, loading, error, initialized, count,
    isWishlisted, add, remove, toggle, refresh,
    setItems,
  }), [items, loading, error, initialized, count, isWishlisted, add, remove, toggle, refresh])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
