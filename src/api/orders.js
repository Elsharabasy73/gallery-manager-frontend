import { apiFetch } from './client'

/**
 * Orders API
 * Base path: /orders
 *
 * Order Status Lifecycle:
 * - pending -> accepted or cancelled
 * - accepted -> paid or cancelled
 * - paid -> delivered or cancelled
 * - delivered -> completed or cancelled
 * - completed and cancelled are terminal states
 *
 * Role-based access:
 * - GET /orders: user (own orders), gallery_owner/employee (gallery orders), admin (all orders)
 * - POST /orders: user role only
 * - GET /orders/:id: Order owner, gallery member (owner/employee), or admin
 * - PATCH /orders/:id: Accept pending order (gallery_owner, employee, admin)
 * - PATCH /orders/:id/status: Update status (gallery_owner, admin)
 * - PATCH /orders/:id/cancel: Cancel order (order owner, gallery_owner, admin)
 */

/**
 * Get all orders for the current user
 * Role behavior:
 * - user: only their own orders
 * - gallery_owner: all orders belonging to their gallery
 * - employee: all orders belonging to their gallery
 * - admin: all orders in the database
 * @returns {Promise<{ results: number, data: Order[] }>}
 */
export function getMyOrders() {
  return apiFetch('/orders')
}

/**
 * Get orders for a specific gallery (for gallery owners/employees)
 * @param {string} galleryId - UUID of the gallery
 * @returns {Promise<{ results: number, data: Order[] }>}
 */
export function getGalleryOrders(galleryId) {
  return apiFetch(`/orders?galleryId=${galleryId}`)
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
 * Accept a pending order (change status from pending to accepted)
 * Only gallery_owner, employee, or admin can do this
 * @param {string} orderId - UUID of the order to accept
 * @returns {Promise<{ message: string, data: Order }>}
 */
export function acceptOrder(orderId) {
  return apiFetch(`/orders/${orderId}`, {
    method: 'PATCH'
  })
}

/**
 * Update order status
 * Only gallery_owner or admin can do this
 * Valid status values: accepted, paid, delivered, completed, cancelled
 * @param {string} orderId - UUID of the order
 * @param {string} status - New status value
 * @returns {Promise<{ message: string, data: Order }>}
 */
export function updateOrderStatus(orderId, status) {
  return apiFetch(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status }
  })
}

/**
 * Cancel an order
 * Access: order owner, gallery_owner, or admin
 * Cancellation is unavailable for completed or already cancelled orders
 * @param {string} orderId - UUID of the order to cancel
 * @returns {Promise<{ message: string, data: Order }>}
 */
export function cancelOrder(orderId) {
  return apiFetch(`/orders/${orderId}/cancel`, {
    method: 'PATCH'
  })
}

// Legacy alias for backward compatibility
export const confirmOrder = acceptOrder

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

/**
 * Order status configuration for UI display
 */
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'amber', canTransitionTo: ['accepted', 'cancelled'] },
  accepted: { label: 'Accepted', color: 'green', canTransitionTo: ['paid', 'cancelled'] },
  paid: { label: 'Paid', color: 'blue', canTransitionTo: ['delivered', 'cancelled'] },
  delivered: { label: 'Delivered', color: 'purple', canTransitionTo: ['completed', 'cancelled'] },
  completed: { label: 'Completed', color: 'green', canTransitionTo: [] },
  cancelled: { label: 'Cancelled', color: 'zinc', canTransitionTo: [] }
}

/**
 * Get status style classes for UI
 * @param {string} status - Order status
 * @returns {string} Tailwind CSS classes
 */
export function getStatusStyles(status) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    paid: 'bg-blue-100 text-blue-800 border-blue-200',
    delivered: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-zinc-100 text-zinc-800 border-zinc-200'
  }
  return styles[status] || 'bg-zinc-100 text-zinc-800 border-zinc-200'
}

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Target status
 * @returns {boolean}
 */
export function isValidTransition(currentStatus, newStatus) {
  const status = ORDER_STATUSES[currentStatus]
  if (!status) return false
  return status.canTransitionTo.includes(newStatus)
}
