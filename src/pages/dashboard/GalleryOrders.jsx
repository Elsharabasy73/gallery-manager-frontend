import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGalleryOrders, acceptOrder, unwrapOrders, ORDER_STATUSES } from '../../api/orders';
import { useGallery } from '../../context/GalleryContext';
import { useRole } from '../../context/RoleContext';
import { useLanguage } from '../../i18n/LanguageContext';
import StatusBadge from '../../components/StatusBadge';
import { getStatusLabel } from '../../utils/orderStatus';

export function GalleryOrders(){
  const navigate = useNavigate()
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
  const statusLabel = (s) => getStatusLabel(t, s)
  const { galleryId: ctxGalleryId } = useGallery()
  const { role } = useRole()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionId, setActionId] = useState(null)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!ctxGalleryId) {
      setLoading(false)
      return
    }

    let cancelled = false
    async function fetchOrders() {
      setLoading(true)
      setError('')
      try {
        const res = await getGalleryOrders(ctxGalleryId)
        if (cancelled) return
        const data = unwrapOrders(res)
        setOrders(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || t('galleryOrders.loading'))
        setOrders([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [ctxGalleryId])

  // Refresh orders list
  const refreshOrders = async () => {
    if (!ctxGalleryId) return
    try {
      const res = await getGalleryOrders(ctxGalleryId)
      const data = unwrapOrders(res)
      setOrders(data)
    } catch (err) {
      console.error('Failed to refresh orders:', err)
    }
  }

  // Accept a pending order
  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm(t('galleryOrders.acceptConfirm'))) return
    setActionId(orderId)
    setSuccess('')
    setLocalError('')
    try {
      await acceptOrder(orderId)
      await refreshOrders()
      setSuccess(t('galleryOrders.acceptOk'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || t('galleryOrders.acceptFail'))
    } finally {
      setActionId(null)
    }
  }

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const orderId = o.id?.toLowerCase() || ''
      const customerName = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.toLowerCase()
      const customerEmail = o.user?.email?.toLowerCase() || ''
      return orderId.includes(q) || customerName.includes(q) || customerEmail.includes(q)
    }
    return true
  })

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, { all: orders.length })

  if (!ctxGalleryId && !loading) {
    return (
      <div className="text-center py-16 bg-white border rounded-xl">
        <p className="text-sm text-[#8A8078]">{t('galleryOrders.noGallery')}</p>
        <button onClick={()=>navigate('/dashboard/create-gallery')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">{t('galleryOrders.createGallery')}</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">{t('galleryOrders.title')}</h2>
      <div className="flex gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('galleryOrders.searchPh')}
          className="border rounded-full px-3 py-1.5 text-sm flex-1"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-full px-3 py-1.5 text-sm bg-white"
        >
          <option value="all">{t('galleryOrders.all')} ({formatNumber(statusCounts.all || 0)})</option>
          {Object.keys(ORDER_STATUSES).map(status => (
            <option key={status} value={status}>
              {statusLabel(status)} ({formatNumber(statusCounts[status] || 0)})
            </option>
          ))}
        </select>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{success}</div>}
      {localError && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{localError}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">{t('galleryOrders.loading')}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">
          {t('galleryOrders.empty')} {search ? t('galleryOrders.forSearch', { q: search }) : ''}
        </div>
      ) : (
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]">
                <tr>
                  <th className="p-3 text-start">{t('galleryOrders.thOrder')}</th>
                  <th>{t('galleryOrders.thCustomer')}</th>
                  <th>{t('galleryOrders.thItems')}</th>
                  <th>{t('galleryOrders.thTotal')}</th>
                  <th>{t('galleryOrders.thStatus')}</th>
                  <th>{t('galleryOrders.thAction')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const totalItems = o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
                  const totalPrice = Number(o.totalPrice || 0)
                  const customerName = `${o.user?.firstName || 'Unknown'} ${o.user?.lastName || ''}`.trim()
                  const orderDate = o.createdAt ? formatDate(o.createdAt) : ''
                  const statusConfig = ORDER_STATUSES[o.status] || ORDER_STATUSES.cancelled

                  return (
                    <tr key={o.id} className="border-t">
                      <td className="p-3 font-mono text-xs">
                        {o.id?.substring(0, 8)}...
                        <div className="text-[11px] text-[#8A8078]">{orderDate}</div>
                      </td>
                      <td className="text-xs">
                        {customerName}
                        <div className="text-[11px] text-[#8A8078]">{o.user?.email || ''}</div>
                      </td>
                      <td className="text-center">{totalItems}</td>
                      <td className="text-center">{formatPrice(totalPrice)}</td>
                      <td>
                        <StatusBadge status={o.status} className="px-2 py-0.5 rounded-full text-[11px] font-medium">
                          {statusLabel(o.status)}
                        </StatusBadge>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => navigate(`/dashboard/orders/${o.id}`)}
                          className="text-xs border px-2 py-1 rounded me-1 hover:bg-[#FAF7F2]"
                        >
                          {t('common.view')}
                        </button>
                        {o.status === 'pending' && (role === 'gallery_owner' || role === 'employee' || role === 'admin') && (
                          <button
                            onClick={() => handleAcceptOrder(o.id)}
                            disabled={actionId === o.id}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-60"
                          >
                            {actionId === o.id ? t('galleryOrders.accepting') : t('galleryOrders.accept')}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryOrders;
