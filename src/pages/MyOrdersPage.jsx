import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'
import { getMyOrders, unwrapOrders, cancelOrder, ORDER_STATUSES } from '../api/orders'
import { getGallery, unwrapGallery } from '../api/galleries'
import { createOrderWhatsAppUrl } from '../utils/orderWhatsApp'
import StatusBadge from '../components/StatusBadge'
import { getStatusLabel } from '../utils/orderStatus'

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { t, formatDate, formatNumber, formatPrice } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)
  const [whatsappLoadingId, setWhatsappLoadingId] = useState(null)
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

  const handleResendWhatsApp = async (order) => {
    const whatsappWindow = window.open('about:blank', '_blank')
    if (whatsappWindow) whatsappWindow.opener = null
    setLocalError('')

    if (!whatsappWindow) {
      setLocalError(t('orders.whatsappPopupBlocked'))
      return
    }

    setWhatsappLoadingId(order.id)
    try {
      let gallery = order.gallery
      if (!gallery?.phone) {
        const galleryId = order.galleryId || gallery?.id || gallery?._id
        if (galleryId) {
          const response = await getGallery(galleryId, { fields: 'id,name,phone' })
          gallery = unwrapGallery(response)
        }
      }

      const whatsappUrl = createOrderWhatsAppUrl({
        gallery,
        order,
        items: order.items || [],
        subtotal: order.totalPrice,
        origin: window.location.origin,
      })
      if (!whatsappUrl) throw new Error(t('cart.whatsappUnavailable'))

      whatsappWindow.location.replace(whatsappUrl)
    } catch (err) {
      whatsappWindow.close()
      setLocalError(err.message || t('cart.whatsappUnavailable'))
    } finally {
      setWhatsappLoadingId(null)
    }
  }

  const statusCounts = orders.reduce((acc, o) => {
    acc.all = (acc.all || 0) + 1
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const statusLabel = (s) => getStatusLabel(t, s)

  const statusFilters = [
    { key: 'all', label: `${t('orders.all')} (${formatNumber(statusCounts.all || 0)})` },
    ...Object.keys(ORDER_STATUSES).map(status => ({
      key: status,
      label: `${statusLabel(status)} (${formatNumber(statusCounts[status] || 0)})`
    }))
  ]

  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-2xl shadow-sm">
        <p className="text-sm text-[#8A8078]">{t('orders.onlyCustomer')}</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 min-h-10 bg-[#4B3621] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#382818] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C19A6B]"
        >
          {t('common.goLogin')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-[#4B3621]">{t('orders.title')}</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" role="group" aria-label={t('orders.title')}>
        {statusFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`shrink-0 min-h-10 px-4 rounded-full text-xs font-medium border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C19A6B] ${
              filter === f.key
                ? 'bg-[#4B3621] text-white border-[#4B3621]'
                : 'bg-white text-[#5C5147] border-[#E7DFD3] hover:bg-[#FAF7F2]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {success && (
        <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between gap-3">
          {success}
          <button onClick={() => setSuccess('')} aria-label={t('common.close')} className="shrink-0 min-w-10 min-h-10 text-green-700 hover:text-green-900 rounded-lg hover:bg-green-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">×</button>
        </div>
      )}
      {localError && (
        <div role="alert" className="bg-[#fff1f0] border border-[#ffdad6] text-[#8f3024] text-sm px-4 py-3 rounded-xl flex items-center justify-between gap-3">
          {localError}
          <button onClick={() => setLocalError('')} aria-label={t('common.close')} className="shrink-0 min-w-10 min-h-10 text-[#8f3024] hover:text-[#70251c] rounded-lg hover:bg-[#ffe3df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B3402E]">×</button>
        </div>
      )}
      {error && (
        <div role="alert" className="bg-[#fff1f0] border border-[#ffdad6] text-[#8f3024] text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div role="status" aria-live="polite" className="text-center py-14 text-sm text-[#6D6258] bg-white border border-[#E7DFD3] rounded-2xl">{t('orders.loading')}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 px-5 bg-white border border-dashed border-[#D8C9B5] rounded-2xl">
          <p className="text-base font-medium text-[#4B3621]">
            {filter === 'all' ? t('orders.noOrders') : t('orders.noStatusOrders', { label: statusLabel(filter) })}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 inline-flex min-h-10 items-center justify-center px-4 text-[#795A37] text-sm font-medium underline underline-offset-4 rounded-lg hover:bg-[#FAF7F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C19A6B]"
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
              isResendingWhatsApp={whatsappLoadingId === order.id}
              onCancel={handleCancelOrder}
              onResendWhatsApp={handleResendWhatsApp}
              onViewDetails={(id) => navigate(`/orders/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, isCancelling, isResendingWhatsApp, onCancel, onResendWhatsApp, onViewDetails }) {
  const { t, formatDate, formatNumber, formatPrice } = useLanguage()
  const totalItems = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
  const totalPrice = Number(order.totalPrice || 0)
  const galleryName = order.gallery?.name || t('orders.unknownGallery')
  const orderDate = order.createdAt ? formatDate(order.createdAt) : t('orders.na')
  const label = t(`status.${order.status}`, null) === `status.${order.status}` ? order.status : t(`status.${order.status}`)

  const canCancel = ['pending', 'accepted'].includes(order.status)

  return (
    <article className="bg-white border border-[#E7DFD3] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 text-xs">
        <div className="min-w-0">
          <span className="font-mono text-[#4B3621]">{order.id?.substring(0, 8)}...</span>
          <span className="text-[#6D6258] ms-2">• {orderDate}</span>
        </div>
        <StatusBadge status={order.status} className="px-2 py-0.5 rounded-full text-[11px] font-medium">
          {label}
        </StatusBadge>
      </div>

      <div className="flex items-center gap-3 mt-4 text-sm">
        <div aria-hidden="true" className="shrink-0 w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E7DFD3] flex items-center justify-center text-xs font-semibold text-[#795A37]">
          {galleryName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[#34291F] break-words">{galleryName}</div>
          <div className="mt-1 text-xs text-[#6D6258]">{t('orders.items', { n: formatNumber(totalItems) })} • <span className="font-semibold text-[#4B3621]">{formatPrice(totalPrice)}</span></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={() => onResendWhatsApp(order)}
          disabled={isResendingWhatsApp}
          className="flex-1 min-h-10 text-xs font-medium border border-green-700 text-green-800 px-3 py-2 rounded-lg hover:bg-green-50 disabled:opacity-60 disabled:cursor-wait focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          {isResendingWhatsApp ? t('orders.resendingWhatsApp') : t('orders.resendWhatsApp')}
        </button>
        <button
          onClick={() => onViewDetails(order.id)}
          className="flex-1 min-h-10 text-xs font-medium text-[#4B3621] border border-[#D8C9B5] px-3 py-2 rounded-lg hover:bg-[#FAF7F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C19A6B]"
        >
          {t('orders.viewDetails')}
        </button>
        {canCancel && (
          <button
            onClick={() => onCancel(order.id)}
            disabled={isCancelling}
            className="min-h-10 text-xs font-medium border border-[#B3402E] text-[#9A3023] px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-60 disabled:cursor-wait focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B3402E]"
          >
            {isCancelling ? t('orders.cancelling') : t('orders.cancel')}
          </button>
        )}
      </div>
    </article>
  )
}

export const MyOrders = MyOrdersPage
