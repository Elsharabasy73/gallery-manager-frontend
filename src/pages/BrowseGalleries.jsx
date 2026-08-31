import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { galleries as mockGalleries } from '../data/mockData'
import { useRole } from '../context/RoleContext'
import { getGalleries, unwrapGalleries } from '../api/galleries'
import { getGalleryLogoUrl, getGalleryBannerUrl } from '../utils/image'

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'GA'
}

export default function BrowseGalleries() {
  const { role } = useRole()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialKeyword = searchParams.get('keyword') || ''
  const [input, setInput] = useState(initialKeyword)
  const [keyword, setKeyword] = useState(initialKeyword)
  const doSearch = () => setKeyword(input.trim())

  const [city, setCity] = useState(searchParams.get('city') || 'All')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)

  // sync url
  useEffect(() => {
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (city && city !== 'All') params.set('city', city)
    if (page !== 1) params.set('page', String(page))
    setSearchParams(params, { replace: true })
  }, [keyword, city, page, setSearchParams])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const params = {
          limit: 12,
          page,
          sort: '-createdAt',
          fields: 'id,name,slug,description,city,country,logo,banner,phone,storageFolder,images',
        }
        if (keyword) params.keyword = keyword
        if (city && city !== 'All') params.city = city
        const res = await getGalleries(params)
        if (cancelled) return
        const data = unwrapGalleries(res)
        setGalleries(data.length ? data : mockGalleries)
        setPagination(res?.paginationResult || null)
        // if API returned empty results, keep mock fallback silent? Show empty if explicit search
        if (data.length === 0 && (keyword || city !== 'All')) setGalleries([])
      } catch {
        if (!cancelled) setGalleries(mockGalleries)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [keyword, city, page])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2.5 min-w-0">
          <span className="material-symbols-outlined text-[#8A8078]">search</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { doSearch(); setPage(1) } }}
            placeholder="Search galleries..."
            className="bg-transparent outline-none flex-1 text-sm min-w-0"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => { doSearch(); setPage(1) }} className="bg-[#4B3621] text-white px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap">Search</button>
          <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1) }} className="border rounded-full px-3 py-2 text-sm bg-white min-w-[130px]">
            <option>All Cities</option>
            <option>New York</option>
            <option>Stockholm</option>
            <option>Milan</option>
            <option>Kyoto</option>
            <option>Cairo</option>
            <option>Paris</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-4 text-sm text-[#8A8078]">Loading…</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {(loading ? Array.from({ length: 4 }).map((_, i) => ({ id: `skeleton-${i}`, skeleton: true })) : galleries).map((g) => {
          if (g.skeleton) {
            return (
              <div key={g.id} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden animate-pulse">
                <div className="h-28 bg-[#E7DFD3]/60" />
                <div className="p-4"><div className="h-4 bg-[#E7DFD3]/60 rounded w-1/2 mb-2" /><div className="h-3 bg-[#E7DFD3]/40 rounded w-1/3" /></div>
              </div>
            )
          }
          const bannerSrc = getGalleryBannerUrl(g) || g.banner
          const logoSrc = getGalleryLogoUrl(g)
          const initials = getInitials(g.name)
          // gallery api does not return products count; use images.length as hint or mock
          const productsCount = g.products ?? g._count?.products ?? (Array.isArray(g.images) ? g.images.length : null)
          return (
            <div key={g.id} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
              <div className="h-28 bg-cover bg-center" style={{ backgroundImage: bannerSrc ? `url(${bannerSrc})` : `url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80)` }} />
              <div className="p-4">
                <div className="flex gap-3 -mt-8">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-white flex items-center justify-center font-serif shadow overflow-hidden">
                    {logoSrc ? (
                      <img src={logoSrc} alt={`${g.name} logo`} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.nextSibling; if (fb) fb.style.display = 'flex' }} />
                    ) : null}
                    <span style={{ display: logoSrc ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">{logoSrc ? initials : (g.logo || initials)}</span>
                  </div>
                  <div className="pt-6 min-w-0">
                    <div className="font-medium text-sm truncate">{g.name}</div>
                    <div className="text-xs text-[#8A8078] truncate">{g.city}{g.country ? `, ${g.country}` : ''}{productsCount != null ? ` • ${productsCount} products` : ''}</div>
                  </div>
                </div>
                <p className="text-xs text-[#8A8078] mt-3 line-clamp-2">{g.description || 'Curated showroom featuring handcrafted furniture and timeless design pieces.'}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigate(`/galleries/${g.id}`)} className="flex-1 bg-[#4B3621] text-white py-1.5 rounded-lg text-xs">View Showroom</button>
                  {role === 'admin' && <><button className="px-3 border rounded-lg text-xs">Edit</button><button className="px-3 bg-[#B3402E] text-white rounded-lg text-xs">Delete</button></>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && galleries.length === 0 && (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">No galleries — <button onClick={() => { setInput(''); setKeyword(''); setCity('All'); setPage(1) }} className="text-[#C19A6B] underline">Clear filters</button></div>
      )}

      {pagination && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <button disabled={!pagination.prev} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm text-[#8A8078]">Page {pagination.currentPage} / {pagination.numberOfPages || 1}</span>
          <button disabled={!pagination.next} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
