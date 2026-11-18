import { users } from '../../data/mockData';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { getVisitors } from '../../api/analytics';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLanguage } from '../../i18n/LanguageContext';

const TRAFFIC_RANGES = [
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: '90d', label: '90d', days: 90 },
]

export function AdminOverview(){
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
  const [counts, setCounts] = useState({ users: null, galleries: null, products: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('30d')
  const [traffic, setTraffic] = useState(null)
  const [trafficLoading, setTrafficLoading] = useState(true)
  const [trafficError, setTrafficError] = useState('')
  useEffect(()=>{
    let cancelled=false
    async function fetchCounts(){
      setLoading(true)
      setError('')
      try{
        const [uRes, gRes, pRes] = await Promise.all([
          apiFetch('/users/count').catch(e=>{ throw new Error(e.message || 'users count failed') }),
          apiFetch('/galleries/count').catch(()=>({ data:{count:null} })),
          apiFetch('/products/count').catch(e=>{ throw new Error(e.message || 'products count failed') }),
        ])
        if(cancelled) return
        const usersCount = uRes?.data?.count ?? uRes?.count ?? null
        const galleriesCount = gRes?.data?.count ?? gRes?.count ?? null
        const productsCount = pRes?.data?.count ?? pRes?.count ?? null
        setCounts({ users: usersCount, galleries: galleriesCount, products: productsCount })
      }catch(err){
        if(!cancelled) setError(err.message || 'Failed to load counts')
      }finally{ if(!cancelled) setLoading(false)}
    }
    fetchCounts()
    return ()=>{cancelled=true}
  },[])
  useEffect(()=>{
    let cancelled=false
    async function fetchTraffic(){
      setTrafficLoading(true)
      setTrafficError('')
      try{
        const days = TRAFFIC_RANGES.find(r=>r.id===range)?.days || 30
        const to = new Date()
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
        const res = await getVisitors({ from: from.toISOString(), to: to.toISOString(), groupBy: 'day' })
        if(cancelled) return
        setTraffic(res?.data || res)
      }catch(err){
        if(!cancelled){
          setTrafficError(err.message || 'Failed to load traffic')
          setTraffic(null)
        }
      }finally{ if(!cancelled) setTrafficLoading(false)}
    }
    fetchTraffic()
    return ()=>{cancelled=true}
  },[range])
  const items = [
    {k: t('admin.usersCount'), v: counts.users},
    {k: t('admin.galleriesCount'), v: counts.galleries},
    {k: t('admin.productsCount'), v: counts.products},
  ]
  const totals = traffic?.totals || {}
  const trafficItems = [
    {k: t('admin.uniqueVisitors'), v: totals.visitors, hint: t('admin.uniqueHint')},
    {k: t('admin.visits'), v: totals.visits, hint: t('admin.visitsHint')},
    {k: t('admin.pageViews'), v: totals.pageViews, hint: t('admin.viewsHint')},
  ]
  const series = Array.isArray(traffic?.series) ? traffic.series : []
  const topPages = Array.isArray(traffic?.topPages) ? traffic.topPages : []
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">{t('admin.overview')}</h2>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map(s=>(
          <div key={s.k} className="bg-white border border-[#E7DFD3] rounded-xl p-4 text-center">
            <div className="text-xs text-[#8A8078]">{s.k}</div>
            <div className="text-xl font-semibold">{loading ? '…' : (s.v != null ? formatNumber(s.v) : '—')}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="font-serif text-lg">{t('admin.traffic')}</h3>
        <div className="flex gap-1 text-xs">
          {TRAFFIC_RANGES.map(r=>(
            <button key={r.id} onClick={()=>setRange(r.id)} className={`px-3 py-1 rounded-full border ${range===r.id?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white'}`}>{r.label}</button>
          ))}
        </div>
      </div>
      {trafficError && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{trafficError}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trafficItems.map(s=>(
          <div key={s.k} className="bg-white border border-[#E7DFD3] rounded-xl p-4 text-center">
            <div className="text-xs text-[#8A8078]">{s.k}</div>
            <div className="text-xl font-semibold">{trafficLoading ? '…' : (s.v != null ? formatNumber(s.v) : '—')}</div>
            <div className="text-[11px] text-[#8A8078]">{s.hint}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
          <div className="text-sm font-medium mb-2">{t('admin.chartTitle')}</div>
          {trafficLoading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingTraffic')}</div>
          : series.length===0 ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.noTraffic')}</div>
          : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d)=>String(d).slice(5)} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" name={t('admin.uniqueVisitors')} stroke="#4B3621" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="views" name={t('admin.pageViews')} stroke="#C19A6B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
          <div className="text-sm font-medium mb-2">{t('admin.topPages')}</div>
          {trafficLoading ? <div className="text-center py-8 text-sm text-[#8A8078]">…</div>
          : topPages.length===0 ? <div className="text-center py-8 text-xs text-[#8A8078]">{t('common.noResults')}</div>
          : (
          <div className="space-y-2">
            {topPages.map(p=>(
              <div key={p.path} className="flex justify-between items-center text-xs border-b border-[#E7DFD3]/60 pb-2">
                <span className="font-mono truncate max-w-[140px]" title={p.path}>{p.path}</span>
                <span className="text-[#8A8078] whitespace-nowrap">{formatNumber(p.visitors)} {t('admin.uniqueVisitors')} • {formatNumber(p.views)} {t('admin.pageViews')}</span>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOverview;
