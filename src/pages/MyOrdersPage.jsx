import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'
import { getMyOrders, unwrapOrders, cancelOrder, getStatusStyles, ORDER_STATUSES } from '../api/orders'

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { t, formatDate, formatNumber, formatPrice } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')

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
        setError(err.message || t('orders.loadFail'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [isAuthenticated, role, t])

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('orders.cancelConfirm'))) return
    setCancellingId(orderId)
    setSuccess('')
    setLocalError('')
    try {
      await cancelOrder(orderId)
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ))
      setSuccess(t('orders.cancelledOk'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || t('orders.cancelFail'))
    } finally {
      setCancellingId(null)
    }
  }

  const statusCounts = orders.reduce((acc, o) => {
    acc.all = (acc.all || 0) + 1
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const statusLabel = (s) => t(`status.${s}`, null) === `status.${s}` ? (ORDER_STATUSES[s]?.label || s) : t(`status.${s}`)

  const statusFilters = [
    { key: 'all', label: `${t('orders.all')} (${formatNumber(statusCounts.all || 0)})` },
    ...Object.keys(ORDER_STATUSES).map(status => ({
      key: status,
      label: `${statusLabel(status)} (${formatNumber(statusCounts[status] || 0)})`
    }))
  ]

  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">{t('orders.onlyCustomer')}</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm"
        >
          {t('common.goLogin')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">{t('orders.title')}</h2>

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

      {loading ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">{t('orders.loading')}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">
          <p className="text-sm text-[#8A8078]">
            {filter === 'all' ? t('orders.noOrders') : t('orders.noStatusOrders', { label: statusLabel(filter) })}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-3 text-[#C19A6B] text-sm underline"
          >
            {t('orders.browse')}
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

function OrderCard({ order, isCancelling, onCancel, onViewDetails }) {
  const { t, formatDate, formatNumber, formatPrice } = useLanguage()
  const totalItems = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
  const totalPrice = Number(order.totalPrice || 0)
  const galleryName = order.gallery?.name || t('orders.unknownGallery')
  const orderDate = order.createdAt ? formatDate(order.createdAt) : t('orders.na')
  const label = t(`status.${order.status}`, null) === `status.${order.status}` ? order.status : t(`status.${order.status}`)

  const canCancel = ['pending', 'accepted'].includes(order.status)

  return (
    <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
      <div className="flex justify-between items-start text-xs">
        <div>
          <span className="font-mono">{order.id?.substring(0, 8)}...</span>
          <span className="text-[#8A8078] ms-2">• {orderDate}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusStyles(order.status)}`}>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3 text-sm">
        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px] font-medium">
          {galleryName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-medium">{galleryName}</div>
          <div className="text-xs text-[#8A8078]">{t('orders.items', { n: formatNumber(totalItems) })} • {formatPrice(totalPrice)}</div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onViewDetails(order.id)}
          className="flex-1 text-xs border px-3 py-1.5 rounded-lg hover:bg-[#FAF7F2]"
        >
          {t('orders.viewDetails')}
        </button>
        {canCancel && (
          <button
            onClick={() => onCancel(order.id)}
            disabled={isCancelling}
            className="text-xs border border-[#B3402E] text-[#B3402E] px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-60"
          >
            {isCancelling ? t('orders.cancelling') : t('orders.cancel')}
          </button>
        )}
      </div>
    </div>
  )
}

export const MyOrders = MyOrdersPage
