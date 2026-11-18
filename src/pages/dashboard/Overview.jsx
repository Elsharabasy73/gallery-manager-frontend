import { useEffect, useState } from 'react';
import { getGalleryOrders, unwrapOrders } from '../../api/orders';
import { useGallery } from '../../context/GalleryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import StatusBadge from '../../components/StatusBadge';
import { getStatusLabel } from '../../utils/orderStatus';

export function Overview(){
  const { t, formatNumber, formatPrice } = useLanguage()
  const statusLabel = (s) => getStatusLabel(t, s)
  const { gallery, galleryId, loading, error } = useGallery()
  const [recentOrders, setRecentOrders] = useState([])
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true)
  const [recentOrdersError, setRecentOrdersError] = useState('')
  const productCount = gallery?.productCount
  const employeeCount = gallery?.employeeCount

  useEffect(() => {
    if (!galleryId) {
      setRecentOrders([])
      setRecentOrdersLoading(false)
      setRecentOrdersError('')
      return
    }

    let cancelled = false
    async function fetchRecentOrders() {
      setRecentOrdersLoading(true)
      setRecentOrdersError('')
      try {
        const res = await getGalleryOrders(galleryId)
        if (cancelled) return
        const data = unwrapOrders(res)
        data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        setRecentOrders(data.slice(0, 3))
      } catch (err) {
        if (cancelled) return
        setRecentOrders([])
        setRecentOrdersError(err.message || t('dashboard.recentOrdersFail'))
      } finally {
        if (!cancelled) setRecentOrdersLoading(false)
      }
    }

    fetchRecentOrders()
    return () => { cancelled = true }
  }, [galleryId, t])

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">{t('dashboard.overview')}</h2>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {k: t('dashboard.totalProducts'), v: loading ? '…' : (productCount ?? '—'), c:'bg-white', sub: gallery ? `${gallery.name}` : t('dashboard.fromGallery')},
          {k: t('dashboard.pendingOrders'), v: formatNumber(7), c:'bg-amber-50', sub: t('dashboard.mock')},
          {k: t('dashboard.employees'), v: loading ? '…' : (employeeCount ?? '—'), c:'bg-white', sub: gallery ? t('dashboard.inGallery') : t('dashboard.fromGallery')},
          {k: t('dashboard.revenue'), v: formatPrice(48200), c:'bg-green-50', sub: t('dashboard.mock')},
        ].map(s=>(
          <div key={s.k} className={`border border-[#E7DFD3] rounded-xl p-4 ${s.c}`}><div className="text-xs text-[#8A8078]">{s.k}</div><div className="text-xl font-semibold">{s.v}</div>{s.sub && <div className="text-[11px] text-[#8A8078]">{s.sub}</div>}</div>
        ))}
      </div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
        <h3 className="font-medium mb-3">{t('dashboard.recentOrders')}</h3>
        <div className="space-y-2">
          {recentOrdersLoading ? (
            <p className="text-sm text-[#8A8078] py-2">{t('common.loading')}</p>
          ) : recentOrdersError ? (
            <p role="alert" className="text-sm text-[#B3402E] py-2">{recentOrdersError}</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-[#8A8078] py-2">{t('dashboard.noRecentOrders')}</p>
          ) : recentOrders.map((o) => {
            const orderRef = o.orderNumber || (o.id ? o.id.slice(0, 8) : t('orders.na'))
            const galleryName = o.gallery?.name || gallery?.name || t('orders.unknownGallery')
            const status = statusLabel(o.status)
            return (
              <div key={o.id} className="flex justify-between items-center gap-3 text-sm border-b py-2">
                <span className="truncate">{orderRef} • {galleryName}</span>
                <StatusBadge status={o.status} className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium">{status}</StatusBadge>
                <span className="shrink-0">{formatPrice(o.totalPrice)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Overview;
