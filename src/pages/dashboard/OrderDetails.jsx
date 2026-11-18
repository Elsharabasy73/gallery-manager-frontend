import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrder, acceptOrder, updateOrderStatus, cancelOrder, unwrapOrder, getStatusStyles, ORDER_STATUSES } from '../../api/orders';
import { useGallery } from '../../context/GalleryContext';
import { useRole } from '../../context/RoleContext';
import { useLanguage } from '../../i18n/LanguageContext';
import OrderStatusTimeline from './components/OrderStatusTimeline';

export function OrderDetails(){
  const navigate = useNavigate()
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
  const statusLabel = (st) => t(`status.${st}`, null) === `status.${st}` ? (ORDER_STATUSES[st]?.label || st) : t(`status.${st}`)
  const { id: orderId } = useParams()
  const { role, user } = useRole()
  const { galleryId: ctxGalleryId, gallery: ctxGallery } = useGallery()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!orderId) return

    let cancelled = false
    async function fetchOrder() {
      setLoading(true)
      setError('')
      try {
        const res = await getOrder(orderId)
        if (cancelled) return
        const data = unwrapOrder(res)
        setOrder(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || t('orderDetails.loadFail'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrder()
    return () => { cancelled = true }
  }, [orderId])

  // Refresh order data
  const refreshOrder = async () => {
    try {
      const res = await getOrder(orderId)
      const data = unwrapOrder(res)
      setOrder(data)
    } catch (err) {
      console.error('Failed to refresh order:', err)
    }
  }

  // Accept pending order
  const handleAccept = async () => {
    if (!window.confirm(t('orderDetails.acceptConfirm'))) return
    setActionLoading(true)
    setSuccess('')
    setLocalError('')
    try {
      await acceptOrder(orderId)
      await refreshOrder()
      setSuccess(t('orderDetails.acceptOk'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || t('orderDetails.acceptFail'))
    } finally {
      setActionLoading(false)
    }
  }

  // Update order status
  const handleUpdateStatus = async (newStatus) => {
    const _statusLabel = statusLabel(newStatus)
    if (!window.confirm(t('orderDetails.statusConfirm', { label: _statusLabel }))) return
    setActionLoading(true)
    setSuccess('')
    setLocalError('')
    try {
      await updateOrderStatus(orderId, newStatus)
      await refreshOrder()
      setSuccess(t('orderDetails.statusOk', { label: _statusLabel }))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || t('orderDetails.statusFail'))
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel order
  const handleCancel = async () => {
    if (!window.confirm(t('orderDetails.cancelConfirm'))) return
    setActionLoading(true)
    setSuccess('')
    setLocalError('')
    try {
      await cancelOrder(orderId)
      await refreshOrder()
      setSuccess(t('orderDetails.cancelOk'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || t('orderDetails.cancelFail'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-sm text-[#8A8078]">{t('orderDetails.loading')}</div>
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white border rounded-xl">
        <p className="text-sm text-[#B3402E]">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm underline text-[#78582f]">{t('common.goBack')}</button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-white border rounded-xl">
        <p className="text-sm text-[#8A8078]">{t('orderDetails.notFound')}</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm underline text-[#78582f]">{t('common.goBack')}</button>
      </div>
    )
  }

  const galleryName = order.gallery?.name || t('orders.unknownGallery')
  const orderDate = order.createdAt ? formatDate(order.createdAt) : t('orders.na')
  const totalPrice = Number(order.totalPrice || 0)
  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.cancelled

  // Permission checks
  const isGalleryOwner = role === 'gallery_owner'
  const isEmployee = role === 'employee'
  const isAdmin = role === 'admin'
  const isCustomer = role === 'customer'
  const isOrderOwner = isCustomer && user?.id === order.userId

  // Action permissions based on role and status
  const canAccept = order.status === 'pending' && (isGalleryOwner || isEmployee || isAdmin)
  const canUpdateStatus = isGalleryOwner || isAdmin
  const canCancel = !['completed', 'cancelled'].includes(order.status) && (isOrderOwner || isGalleryOwner || isAdmin)

  // Get available status transitions for gallery_owner/admin
  const availableTransitions = canUpdateStatus && order.status !== 'completed' && order.status !== 'cancelled'
    ? ORDER_STATUSES[order.status]?.canTransitionTo?.filter(s => s !== 'cancelled') || []
    : []

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-[#8A8078]">
        <button onClick={() => navigate(-1)} className="hover:text-[#4B3621]">{t('orderDetails.orders')}</button>
        <span className="material-symbols-outlined text-[14px] rtl:rotate-180">chevron_right</span>
        <span className="text-[#4B3621] font-medium">{t('orderDetails.title')} {orderId?.substring(0, 8)}...</span>
      </div>

      <div className="flex justify-between items-start">
        <h2 className="font-serif text-2xl">{t('orderDetails.title')}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(order.status)}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{success}</div>}
      {localError && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{localError}</div>}

      {/* Status Timeline */}
      <OrderStatusTimeline order={order} statusLabel={statusLabel} getStatusStyles={getStatusStyles} t={t} />

      {/* Actions */}
      {(canAccept || availableTransitions.length > 0 || canCancel) && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">{t('orderDetails.actions')}</h3>
          <div className="flex flex-wrap gap-2">
            {canAccept && (
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60"
              >
                {actionLoading ? t('orderDetails.accepting') : t('orderDetails.accept')}
              </button>
            )}
            {availableTransitions.map(s => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(s)}
                disabled={actionLoading}
                className="border px-4 py-2 rounded-lg text-sm hover:bg-[#FAF7F2] disabled:opacity-60"
              >
                {t('orderDetails.markAs', { label: statusLabel(s) })}
              </button>
            ))}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="border border-[#B3402E] text-[#B3402E] px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-60"
              >
                {actionLoading ? t('orderDetails.cancelling') : t('orderDetails.cancelOrder')}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm font-medium">{orderDate}</div>
            <div className="text-xs text-[#8A8078]">{galleryName}</div>
            {order.user && (
              <div className="text-xs text-[#8A8078] mt-1">
                {t('orderDetails.customer')}: {order.user.firstName} {order.user.lastName}
                {order.user.email && <span className="ms-2">({order.user.email})</span>}
              </div>
            )}
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('orderDetails.items')}</h3>
            {order.items.map((item, idx) => {
              const itemPrice = Number(item.unitPrice || 0)
              const itemTotal = itemPrice * item.quantity
              const displayImg = item.imageUrl || 'https://via.placeholder.com/64'

              return (
                <div key={item.id || idx} className="flex gap-3 border-t py-3">
                  <img src={displayImg} className="w-16 h-16 rounded object-cover bg-[#FAF7F2]" alt="" onError={e => e.target.src = 'https://via.placeholder.com/64'} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.productName || 'Product'}</div>
                    <div className="text-xs text-[#8A8078]">{formatNumber(itemPrice)} {t('common.currency')} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â {formatNumber(item.quantity)}</div>
                  </div>
                  <div className="text-sm font-medium">{formatPrice(itemTotal)}</div>
                </div>
              )
            })}
          </div>
        )}

        {(order.shippingAddress || order.note) && (
          <div className="bg-[#FAF7F2] rounded-lg p-3 text-xs space-y-2">
            {order.shippingAddress && (
              <div>
                <div className="font-medium">{t('orderDetails.shipping')}</div>
                <div className="text-[#8A8078]">
                  {[
                    order.shippingAddress.street,
                    order.shippingAddress.city,
                    order.shippingAddress.country
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            )}
            {order.note && (
              <div>
                <div className="font-medium">{t('orderDetails.note')}</div>
                <div className="text-[#8A8078]">{order.note}</div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between font-semibold pt-3 border-t">
          <span>{t('orderDetails.grandTotal')}</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails;
