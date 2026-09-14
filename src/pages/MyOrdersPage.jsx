import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import { getMyOrders, unwrapOrders, cancelOrder, getStatusStyles, ORDER_STATUSES } from '../api/orders'

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
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return
    setCancellingId(orderId)
    setSuccess('')
    setLocalError('')
    try {
      await cancelOrder(orderId)
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ))
      setSuccess('Order cancelled successfully')
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

  // Build status filters dynamically based on available statuses
  const statusFilters = [
    { key: 'all', label: `All (${statusCounts.all || 0})` },
    ...Object.keys(ORDER_STATUSES).map(status => ({
      key: status,
      label: `${ORDER_STATUSES[status].label} (${statusCounts[status] || 0})`
    }))
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
      <div className="flex gap-2 overflow-x-auto pb-1">
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
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">×</button>
        </div>
      )}
      {localError && (
        <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-sm px-4 py-3 rounded-lg flex items-center justify-between">
          {localError}
          <button onClick={() => setLocalError('')} className="text-[#B3402E] hover:text-[#93000a]">×</button>
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
            {filter === 'all' ? 'No orders yet' : `No ${ORDER_STATUSES[filter]?.label || filter} orders`}
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
              onViewDetails={(id) => navigate(`/orders/${id}`)}
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
  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.cancelled

  // Customer can cancel pending or accepted orders
  const canCancel = ['pending', 'accepted'].includes(order.status)

  return (
    <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
      {/* Order Header */}
      <div className="flex justify-between items-start text-xs">
        <div>
          <span className="font-mono">{order.id?.substring(0, 8)}...</span>
          <span className="text-[#8A8078] ml-2">• {orderDate}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusStyles(order.status)}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Order Details */}
      <div className="flex items-center gap-2 mt-3 text-sm">
        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px] font-medium">
          {galleryName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-medium">{galleryName}</div>
          <div className="text-xs text-[#8A8078]">{totalItems} items • {totalPrice.toLocaleString()} EGP</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onViewDetails(order.id)}
          className="flex-1 text-xs border px-3 py-1.5 rounded-lg hover:bg-[#FAF7F2]"
        >
          View Details
        </button>
        {canCancel && (
          <button
            onClick={() => onCancel(order.id)}
            disabled={isCancelling}
            className="text-xs border border-[#B3402E] text-[#B3402E] px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-60"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  )
}

// Backward compatibility alias
export const MyOrders = MyOrdersPage
