import { apiFetch } from './client'

/**
 * Cart API - All routes require authentication (user role only)
 * Base path: /cart
 */

/**
 * Get the current user's cart with all items
 * @returns {Promise<{ results: number, data: { id, items: CartItem[], totalPrice: number } }>}
 */
export function getCart() {
  return apiFetch('/cart')
}

/**
 * Add a product to the cart
 * @param {Object} params
 * @param {string} params.productId - UUID of the product
 * @param {number} [params.quantity=1] - Quantity to add (min 1)
 * @returns {Promise<{ message: string, data: Cart }>}
 */
export function addToCart({ productId, quantity = 1 }) {
  return apiFetch('/cart', {
    method: 'POST',
    body: { productId, quantity }
  })
}

/**
 * Update the quantity of an item in the cart
 * @param {string} productId - UUID of the product to update
 * @param {number} quantity - New quantity (min 1)
 * @returns {Promise<{ message: string, data: Cart }>}
 */
export function updateCartItem(productId, quantity) {
  return apiFetch(`/cart/${productId}`, {
    method: 'PATCH',
    body: { quantity }
  })
}

/**
 * Remove a product from the cart
 * @param {string} productId - UUID of the product to remove
 * @returns {Promise<void>} - Returns 204 No Content on success
 */
export function removeFromCart(productId) {
  return apiFetch(`/cart/${productId}`, {
    method: 'DELETE'
  })
}

/**
 * Clear all items from the cart
 * @returns {Promise<void>} - Returns 204 No Content on success
 */
export function clearCart() {
  return apiFetch('/cart', {
    method: 'DELETE'
  })
}

/**
 * Unwrap helper for cart data
 * Handles { data: { id, items, totalPrice } } or { data: { data: {...} } }
 */
export function unwrapCart(res) {
  if (!res) return null
  if (res?.data?.data) return res.data.data
  if (res?.data && !Array.isArray(res.data)) return res.data
  return res
}

/**
 * Unwrap cart items array
 */
export function unwrapCartItems(res) {
  const cart = unwrapCart(res)
  if (!cart) return []
  return cart.items || []
}
