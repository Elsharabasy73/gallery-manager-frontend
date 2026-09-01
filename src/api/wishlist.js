import { apiFetch } from './client'

// Backend router (provided):
// GET    /wishlist              -> getMyWishlist  (protect + allowTo ROLES.USER)
// POST   /wishlist {productId}  -> addToWishlist
// DELETE /wishlist/:productId   -> removeFromWishlist
//
// Mount is typically /api/v1/wishlist (some codebases use /wishlists or /wishlist)
// We use /wishlist as per snippet; if your backend uses /wishlists change here.

export function getMyWishlist() {
  return apiFetch('/wishlist')
}

export function addToWishlist(productId) {
  return apiFetch('/wishlist', { method: 'POST', body: { productId } })
}

export function removeFromWishlist(productId) {
  return apiFetch(`/wishlist/${productId}`, { method: 'DELETE' })
}

export function unwrapWishlist(res) {
  if (!res) return []
  // shapes: { data: { wishlist: [...] } } , { data: [...] }, { data: { products: [...] } }, { wishlist: [...] }, raw array
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.wishlist)) return res.data.wishlist
  if (Array.isArray(res?.data?.products)) return res.data.products
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.wishlist)) return res.wishlist
  if (Array.isArray(res?.products)) return res.products
  // sometimes wishlist document { _id, user, products: [...] } but populated products are inside items
  if (res?.data?.wishlist?.products) return res.data.wishlist.products
  return []
}

// normalize item -> product object (wishlist may store product docs or ids)
export function normalizeWishlistItem(item) {
  if (!item) return null
  // if item is product doc directly
  if (item._id || item.id) {
    // if it has product field, it's wrapper: { product: {...} }
    if (item.product && typeof item.product === 'object') return item.product
    // if it has productId field
    if (item.productId && typeof item.productId === 'object') return item.productId
    return item
  }
  return item
}
