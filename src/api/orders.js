import { apiFetch } from './client'

/**
 * Orders API
 * Base path: /orders
 *
 * Role-based access:
 * - GET /orders: Any authenticated user (their own orders)
 * - POST /orders: user role only
 * - GET /orders/:id: Order owner, gallery member (owner/employee), or admin
 * - PATCH /orders/:id: gallery_owner, employee, admin (confirm pending orders)
 */

/**
 * Get all orders for the current user
 * @returns {Promise<{ results: number, data: Order[] }>}
 */
export function getMyOrders() {
  return apiFetch('/orders')
}

/**
 * Get orders for a specific gallery (for gallery owners/employees)
 * Note: This might need a different endpoint depending on backend implementation
 * @param {string} galleryId - UUID of the gallery
 * @returns {Promise<{ results: number, data: Order[] }>}
 */
export function getGalleryOrders(galleryId) {
  // If backend has a specific endpoint for gallery orders, use it
  // Otherwise, we'll filter from the user's orders or use a query param
  return apiFetch(`/galleries/${galleryId}/orders`)
}

/**
 * Get a single order by ID
 * @param {string} orderId - UUID of the order
 * @returns {Promise<{ data: Order }>}
 */
export function getOrder(orderId) {
  return apiFetch(`/orders/${orderId}`)
}

/**
 * Create a new order (checkout items from cart for a specific gallery)
 * @param {Object} params
 * @param {string} params.galleryId - UUID of the gallery to checkout from
 * @param {Object} [params.shippingAddress] - Optional shipping address
 * @param {string} [params.note] - Optional order note (max 500 chars)
 * @returns {Promise<{ message: string, data: Order }>}
 */
export function createOrder({ galleryId, shippingAddress, note }) {
  const body = { galleryId }
  if (shippingAddress) body.shippingAddress = shippingAddress
  if (note) body.note = note

  return apiFetch('/orders', {
    method: 'POST',
    body
  })
}

/**
 * Confirm an order (change status from pending to accepted)
 * Only gallery_owner, employee, or admin can do this
 * @param {string} orderId - UUID of the order to confirm
 * @returns {Promise<{ message: string, data: Order }>}
 */
export function confirmOrder(orderId) {
  return apiFetch(`/orders/${orderId}`, {
    method: 'PATCH'
  })
}

/**
 * Cancel an order
 * Note: Backend does not have a cancel endpoint yet. This is a placeholder.
 * To implement cancellation, the backend needs to add a cancel route.
 * @param {string} orderId - UUID of the order to cancel
 * @returns {Promise<{ message: string, data: Order }>}
 */
export function cancelOrder(orderId) {
  // TODO: Backend needs to implement cancel endpoint
  // For now, throw an error indicating this feature is not available
  throw new Error('Order cancellation is not yet implemented. Please contact the gallery to cancel your order.')
}

/**
 * Unwrap helper for orders data
 */
export function unwrapOrders(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

/**
 * Unwrap helper for a single order
 */
export function unwrapOrder(res) {
  if (!res) return null
  if (res?.data && !Array.isArray(res.data) && typeof res.data === 'object' && !res.results) return res.data
  if (res?.data?.data) return res.data.data
  return res
}
