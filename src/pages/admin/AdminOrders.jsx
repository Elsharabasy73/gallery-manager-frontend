import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, unwrapOrders, updateOrderStatus, cancelOrder, acceptOrder, ORDER_STATUSES } from '../../api/orders';
import { useLanguage } from '../../i18n/LanguageContext';
import StatusBadge from '../../components/StatusBadge';
import { getStatusLabel } from '../../utils/orderStatus';

export function AdminOrders(){
  const navigate = useNavigate()
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [galleryFilter, setGalleryFilter] = useState('All')
  const [view, setView] = useState('table')
  const [actionId, setActionId] = useState(null)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchOrders() {
      setLoading(true)
      setError('')
      try {
        const res = await getMyOrders() // Admin sees all orders
        if (cancelled) return
        const data = unwrapOrders(res)
        setOrdersList(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || t('admin.loadOrdersFail'))
        setOrdersList([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [])

  const refreshOrders = async () => {
    try {
      const res = await getMyOrders()
      const data = unwrapOrders(res)
      setOrdersList(data)
    } catch (err) {
      console.error('Failed to refresh orders:', err)
    }
  }

  const statusLabel = (s) => getStatusLabel(t, s)

  const handleStatusChange = async (orderId, newStatus) => {
    const label = statusLabel(newStatus)
    if (!window.confirm(t('orderDetails.statusConfirm', { label }))) return
    setActionId(orderId)
    setSuccess('')
    setLocalError('')
    try {
      if (newStatus === 'cancelled') {
        await cancelOrder(orderId)
      } else if (newStatus === 'accepted') {
        await acceptOrder(orderId)
      } else {
        await updateOrderStatus(orderId, newStatus)
      }
      await refreshOrders()
      setSuccess(t('orderDetails.statusOk', { label }))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || t('orderDetails.statusFail'))
    } finally {
      setActionId(null)
    }
  }

  // Get unique galleries for filter
  const galleries = [...new Set(ordersList.map(o => o.gallery?.name).filter(Boolean))]

  // Filter orders
  const filteredOrders = ordersList.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (galleryFilter !== 'All' && o.gallery?.name !== galleryFilter) return false
    return true
  })

  // Status counts
  const statusCounts = ordersList.reduce((acc, o) => {
    acc.all = (acc.all || 0) + 1
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="font-serif text-xl">{t('admin.allOrders')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={galleryFilter} 
            onChange={e => setGalleryFilter(e.target.value)} 
            className="min-h-10 max-w-full border border-[#E7DFD3] rounded-full px-3 text-xs bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
          >
            <option value="All">{t('common.all')}</option>
            {galleries.map(g => <option key={g}>{g}</option>)}
          </select>
          <div className="flex border border-[#E7DFD3] rounded-full overflow-hidden text-xs">
            <button onClick={() => setView('table')} aria-pressed={view === 'table'} className={`min-h-10 px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C19A6B] ${view === 'table' ? 'bg-[#4B3621] text-white' : 'hover:bg-[#FAF7F2]'}`}>{t('admin.table')}</button>
            <button onClick={() => setView('board')} aria-pressed={view === 'board'} className={`min-h-10 px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C19A6B] ${view === 'board' ? 'bg-[#4B3621] text-white' : 'hover:bg-[#FAF7F2]'}`}>{t('admin.board')}</button>
          </div>
        </div>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{success}</div>}
      {localError && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{localError}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}

      <div className="flex gap-2 text-xs overflow-x-auto pb-1" role="group">
        <button 
          onClick={() => setStatusFilter('all')} 
          aria-pressed={statusFilter === 'all'}
          className={`min-h-10 px-3 rounded-full border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 ${statusFilter === 'all' ? 'bg-[#4B3621] text-white' : 'bg-white hover:bg-[#FAF7F2]'}`}
        >
          {t('common.all')} ({formatNumber(statusCounts.all || 0)})
        </button>
        {Object.keys(ORDER_STATUSES).map(status => (
          <button 
            key={status}
            onClick={() => setStatusFilter(status)} 
            aria-pressed={statusFilter === status}
            className={`min-h-10 px-3 rounded-full border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 ${statusFilter === status ? 'bg-[#4B3621] text-white' : 'bg-white hover:bg-[#FAF7F2]'}`}
          >
            {statusLabel(status)} ({formatNumber(statusCounts[status] || 0)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingOrders')}</div>
      ) : view === 'table' ? (
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]">
                <tr>
                  <th className="p-3 text-start">{t('admin.thOrder')}</th>
                  <th>{t('admin.thCustomer')}</th>
                  <th>{t('admin.thGallery')}</th>
                  <th>{t('admin.thItems')}</th>
                  <th>{t('admin.thTotal')}</th>
                  <th>{t('admin.thStatus')}</th>
                  <th>{t('galleryOrders.thAction')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const totalItems = o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
                  const totalPrice = Number(o.totalPrice || 0)
                  const customerName = `${o.user?.firstName || 'Unknown'} ${o.user?.lastName || ''}`.trim()
                  const galleryName = o.gallery?.name || t('orders.unknownGallery')
                  const availableTransitions = ORDER_STATUSES[o.status]?.canTransitionTo || []

                  return (
                    <tr key={o.id} className="border-t">
                      <td className="p-3 font-mono text-xs">
                        {o.id?.substring(0, 8)}...
                        <div className="text-[11px] text-[#8A8078]">{o.createdAt ? formatDate(o.createdAt) : ''}</div>
                      </td>
                      <td className="text-xs">
                        {customerName}
                        <div className="text-[11px] text-[#8A8078]">{o.user?.email || ''}</div>
                      </td>
                      <td className="text-xs">
                        <div className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px]">
                            {galleryName.substring(0, 2).toUpperCase()}
                          </span>
                          {galleryName}
                        </div>
                      </td>
                      <td className="text-center">{formatNumber(totalItems)}</td>
                      <td className="text-center text-xs">{formatPrice(totalPrice)}</td>
                      <td>
                        <StatusBadge status={o.status} className="px-2 py-0.5 rounded-full text-[11px] font-medium">
                          {statusLabel(o.status)}
                        </StatusBadge>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => navigate(`/admin/orders/${o.id}`)}
                          className="text-xs border px-2 py-1 rounded me-1 hover:bg-[#FAF7F2]"
                        >
                          {t('common.view')}
                        </button>
                        {availableTransitions.length > 0 && (
                          <select 
                            defaultValue=""
                            onChange={e => e.target.value && handleStatusChange(o.id, e.target.value)}
                            disabled={actionId === o.id}
                            className="border rounded px-2 py-1 text-xs disabled:opacity-60"
                          >
                            <option value="" disabled>{t('status.changeStatus')}</option>
                            {availableTransitions.map(s => (
                              <option key={s} value={s}>{statusLabel(s)}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['pending', 'accepted', 'paid', 'delivered'].map(status => (
            <div key={status} className="bg-white border border-[#E7DFD3] rounded-xl p-3">
              <div className="text-xs font-semibold mb-2 flex justify-between items-center">
                <StatusBadge status={status} className="px-2 py-0.5 rounded-full">
                  {statusLabel(status)}
                </StatusBadge>
                <span className="bg-[#FAF7F2] px-2 rounded-full text-[#8A8078]">
                  {formatNumber(ordersList.filter(o => o.status === status).length)}
                </span>
              </div>
              <div className="space-y-2">
                {ordersList.filter(o => o.status === status).map(o => (
                  <div 
                    key={o.id} 
                    onClick={() => navigate(`/admin/orders/${o.id}`)}
                    className="border rounded-lg p-3 text-xs cursor-pointer hover:bg-[#FAF7F2]"
                  >
                    <div className="font-mono">{o.id?.substring(0, 8)}...</div>
                    <div className="text-[#8A8078]">{o.gallery?.name || t('orders.unknownGallery')} • {formatPrice(Number(o.totalPrice || 0))}</div>
                  </div>
                ))}
                {ordersList.filter(o => o.status === status).length === 0 && (
                  <div className="text-[11px] text-[#8A8078] text-center py-4">{t('admin.noOrders')}</div>
                )}
              </div>
            </div>
          ))}
          <div className="bg-white border border-[#E7DFD3] rounded-xl p-3">
            <div className="text-xs font-semibold mb-2 flex justify-between items-center">
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800">{t('status.terminal')}</span>
              <span className="bg-[#FAF7F2] px-2 rounded-full text-[#8A8078]">
                {formatNumber(ordersList.filter(o => ['completed', 'cancelled'].includes(o.status)).length)}
              </span>
            </div>
            <div className="space-y-2">
              {ordersList.filter(o => ['completed', 'cancelled'].includes(o.status)).map(o => (
                <div 
                  key={o.id} 
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="border rounded-lg p-3 text-xs cursor-pointer hover:bg-[#FAF7F2] opacity-60"
                >
                  <div className="font-mono">{o.id?.substring(0, 8)}...</div>
                  <div className="text-[#8A8078]">{statusLabel(o.status)} • {formatPrice(Number(o.totalPrice || 0))}</div>
                </div>
              ))}
              {ordersList.filter(o => ['completed', 'cancelled'].includes(o.status)).length === 0 && (
                <div className="text-[11px] text-[#8A8078] text-center py-4">{t('admin.noOrders')}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders;
