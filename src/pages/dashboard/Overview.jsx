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
      {error && <div role="alert" className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {k: t('dashboard.totalProducts'), v: loading ? '…' : (productCount ?? '—'), c:'bg-white', sub: gallery ? `${gallery.name}` : t('dashboard.fromGallery')},
          {k: t('dashboard.pendingOrders'), v: formatNumber(7), c:'bg-amber-50', sub: t('dashboard.mock')},
          {k: t('dashboard.employees'), v: loading ? '…' : (employeeCount ?? '—'), c:'bg-white', sub: gallery ? t('dashboard.inGallery') : t('dashboard.fromGallery')},
          {k: t('dashboard.revenue'), v: formatPrice(48200), c:'bg-green-50', sub: t('dashboard.mock')},
        ].map(s=>(
          <div key={s.k} className={`min-w-0 border border-[#E7DFD3] rounded-xl p-4 md:p-5 shadow-[0_2px_10px_rgba(75,54,33,0.04)] ${s.c}`}><div className="text-xs font-medium text-[#6f6257] mb-2">{s.k}</div><div className="text-2xl font-semibold leading-tight text-[#33210d] truncate">{s.v}</div>{s.sub && <div className="text-[11px] text-[#8A8078] mt-2 truncate">{s.sub}</div>}</div>
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
              <div key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm border-b border-[#E7DFD3] py-3 last:border-b-0">
                <span className="min-w-0 truncate">{orderRef} • {galleryName}</span>
                <StatusBadge status={o.status} className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium">{status}</StatusBadge>
                <span className="col-start-1 text-xs text-[#6f6257]">{formatPrice(o.totalPrice)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Overview;
