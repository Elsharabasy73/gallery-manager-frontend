import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import { getMyOrders, unwrapOrders, cancelOrder } from '../api/orders'

/**
 * MyOrdersPage - Customer's order history
 * Single Responsibility: Display and manage customer orders
 */
export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')

  // Fetch orders on mount
  useEffect(() => {
    if (!isAuthenticated || role !== 'customer') return

    let cancelled = false
    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const res = await getMyOrders()
        if (cancelled) return
        const data = unwrapOrders(res)
        setOrders(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to load orders')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [isAuthenticated, role])

  // Cancel order handler
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancellingId(orderId)
    setSuccess('')
    setLocalError('')
    try {
      await cancelOrder(orderId)
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ))
      setSuccess('Order cancelled')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || 'Failed to cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  // Calculate status counts
  const statusCounts = orders.reduce((acc, o) => {
    acc.all = (acc.all || 0) + 1
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const statusFilters = [
    { key: 'all', label: `All (${statusCounts.all || 0})` },
    { key: 'pending', label: `Pending (${statusCounts.pending || 0})` },
    { key: 'accepted', label: `Accepted (${statusCounts.accepted || 0})` },
    { key: 'rejected', label: `Rejected (${statusCounts.rejected || 0})` },
    { key: 'cancelled', label: `Cancelled (${statusCounts.cancelled || 0})` },
  ]

  // Auth guard - only customers can access
  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">Orders are available for customers only. Please log in as a customer.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm"
        >
          Go to login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">My Orders</h2>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {statusFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs border ${
              filter === f.key 
                ? 'bg-[#4B3621] text-white border-[#4B3621]' 
                : 'bg-white hover:bg-[#FAF7F2]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {localError && (
        <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-sm px-4 py-3 rounded-lg">
          {localError}
        </div>
      )}
      {error && (
        <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">
          <p className="text-sm text-[#8A8078]">
            {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          </p>
          <button 
            onClick={() => navigate('/products')} 
            className="mt-3 text-[#C19A6B] text-sm underline"
          >
            Browse products
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isCancelling={cancellingId === order.id}
              onCancel={handleCancelOrder}
              onViewDetails={(id) => navigate(`/dashboard/orders/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * OrderCard - Single order display
 * Single Responsibility: Display one order with actions
 */
function OrderCard({ order, isCancelling, onCancel, onViewDetails }) {
  const totalItems = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
  const totalPrice = Number(order.totalPrice || 0)
  const galleryName = order.gallery?.name || 'Unknown Gallery'
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'

  const statusStyles = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-zinc-100 text-zinc-800',
  }

  return (
    <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
      {/* Order Header */}
      <div className="flex justify-between text-xs">
        <span className="font-mono">{order.id?.substring(0, 8)}... • {orderDate}</span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] ${statusStyles[order.status] || statusStyles.cancelled}`}>
          {order.status}
        </span>
      </div>

      {/* Order Details */}
      <div className="flex items-center gap-2 mt-2 text-sm">
        <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px]">
          {galleryName.substring(0, 2).toUpperCase()}
        </div>
        {galleryName} • {totalItems} items • {totalPrice.toLocaleString()} EGP
      </div>

      {/* Actions */}
      {order.status === 'pending' && (
        <button
          onClick={() => onCancel(order.id)}
          disabled={isCancelling}
          className="mt-3 text-xs border border-[#B3402E] text-[#B3402E] px-3 py-1 rounded-full hover:bg-red-50 disabled:opacity-60"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel order'}
        </button>
      )}
      {order.status === 'accepted' && (
        <button
          onClick={() => onViewDetails(order.id)}
          className="mt-3 text-xs border px-3 py-1 rounded-full hover:bg-[#FAF7F2]"
        >
          View details
        </button>
      )}
    </div>
  )
}

// Backward compatibility alias
export const MyOrders = MyOrdersPage
