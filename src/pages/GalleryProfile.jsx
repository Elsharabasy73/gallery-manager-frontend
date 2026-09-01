import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGallery, unwrapGallery } from '../api/galleries'
import { apiFetch } from '../api/client'
import { unwrapProducts } from '../api/products'
import { getGalleryLogoUrl, getGalleryBannerUrl, STORAGE_BASE } from '../utils/image'
import ProductCard from '../components/ProductCard'

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'GA'
}

async function getGalleryProducts(galleryId, params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  // nested route: /galleries/:galleryId/products handles galleryIdFilter
  return apiFetch(`/galleries/${galleryId}/products${qs}&galleryId=${galleryId}`)
}
// {{LURL}}/api/v1/employees?galleryId=412c1b0f-82a0-4bbc-9b6a-c351d1246df1
export default function GalleryProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [gallery, setGallery] = useState(null)
  const [loadingGallery, setLoadingGallery] = useState(true)
  const [galleryError, setGalleryError] = useState('')

  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [pagination, setPagination] = useState(null)

  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const doSearch = () => setKeyword(input.trim())

  const [page, setPage] = useState(1)
  const [view, setView] = useState('grid')
  const [wishError, setWishError] = useState('')

  // fetch gallery via router .route("/:id").get(getGalleryValidator, getGallery) — id only
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoadingGallery(true)
      setGalleryError('')
      try {
        const res = await getGallery(id, { fields: 'id,name,slug,description,city,country,street,phone,banner,logo,images,storageFolder,isActive,createdAt,ownerId' })
        if (cancelled) return
        const g = unwrapGallery(res)
        if (!g) throw new Error('Gallery not found')
        setGallery(g)
      } catch (err) {
        if (!cancelled) setGalleryError(err.message || 'Failed to load gallery')
      } finally {
        if (!cancelled) setLoadingGallery(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [id])

  // fetch products for gallery
  useEffect(() => {
    if (!gallery?.id) return
    let cancelled = false
    async function run() {
      setLoadingProducts(true)
      setProductsError('')
      try {
        const params = {
          limit: 12,
          page,
          sort: '-createdAt',
          fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,gallery[id,name,slug],category[id,name,slug]',
        }
        if (keyword) params.keyword = keyword
        const res = await getGalleryProducts(gallery.id, params)
        if (cancelled) return
        const data = unwrapProducts(res)
        setProducts(data)
        setPagination(res?.paginationResult || null)
      } catch (err) {
        if (!cancelled) {
          setProductsError(err.message || 'Failed to load products')
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [gallery?.id, keyword, page])

  if (loadingGallery) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
          <div className="h-[280px] bg-[#E7DFD3]/60" />
          <div className="p-6"><div className="h-6 bg-[#E7DFD3]/60 rounded w-1/3 mb-2" /><div className="h-3 bg-[#E7DFD3]/40 rounded w-1/2" /></div>
        </div>
      </div>
    )
  }

  if (galleryError || !gallery) {
    return <div className="text-center py-16 bg-white border rounded-xl"><h2 className="font-serif text-2xl">Gallery not found</h2><p className="text-sm text-[#8A8078]">{galleryError}</p><button onClick={() => navigate('/galleries')} className="text-[#C19A6B] text-sm underline mt-2">Back to galleries</button></div>
  }

  const bannerSrc = getGalleryBannerUrl(gallery)
  const logoSrc = getGalleryLogoUrl(gallery)
  const memberYear = gallery.createdAt ? new Date(gallery.createdAt).getFullYear() : null

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <div className="h-[280px] bg-cover bg-center relative" style={{ backgroundImage: bannerSrc ? `url(${bannerSrc})` : `url('https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?auto=format&fit=crop&w=1400&q=80')` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex gap-4 -mt-12 relative">
            <div className="w-[100px] h-[100px] rounded-full bg-white border-4 border-white flex items-center justify-center font-serif text-xl shadow overflow-hidden shrink-0">
              {logoSrc ? <img src={logoSrc} alt={`${gallery.name} logo`} className="w-full h-full object-cover" loading="lazy" onError={(e)=>{e.currentTarget.style.display='none'; const fb=e.currentTarget.nextSibling; if(fb) fb.style.display='flex'}} /> : null}
              <span style={{ display: logoSrc ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">{getInitials(gallery.name)}</span>
            </div>
            <div className="pt-10 min-w-0">
              <h1 className="font-serif text-2xl flex items-center gap-2 truncate">{gallery.name} <span className="w-2 h-2 rounded-full bg-[#4C7A4C] shrink-0"></span></h1>
              <div className="text-xs text-[#8A8078] flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[14px]">location_on</span> {gallery.street ? `${gallery.street} · ` : ''}{gallery.city}{gallery.country ? ` · ${gallery.country}` : ''}</div>
              <p className="text-xs text-[#8A8078] mt-1 line-clamp-2">{gallery.description || 'Curated showroom featuring handcrafted furniture and timeless design pieces.'}</p>
              <div className="text-xs text-[#8A8078] mt-2">{pagination ? `${pagination.currentPage ? '' : ''}` : ''}{products.length} products{memberYear ? ` • member since ${memberYear}` : ''}</div>
            </div>
            <div className="ml-auto hidden md:flex gap-2 pt-10 shrink-0">
              {gallery.mapAddressUrl && <a href={gallery.mapAddressUrl} target="_blank" rel="noreferrer" className="border px-4 py-1.5 rounded-full text-xs">View on Map</a>}
              {gallery.phone && <a href={`tel:${gallery.phone}`} className="border px-4 py-1.5 rounded-full text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> Call</a>}
              <button onClick={() => navigator.share ? navigator.share({ title: gallery.name, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)} className="w-8 h-8 border rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">share</span></button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E7DFD3] rounded-full p-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] rounded-full px-4 py-2 min-w-0">
          <span className="material-symbols-outlined text-[#8A8078]">search</span>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { doSearch(); setPage(1) } }} placeholder="Search in this gallery..." className="bg-transparent outline-none flex-1 text-sm min-w-0" />
        </div>
        <button onClick={() => { doSearch(); setPage(1) }} className="hidden sm:block bg-[#4B3621] text-white px-5 py-2 rounded-full text-xs">Search</button>
        <button className="w-9 h-9 border rounded-full flex items-center justify-center shrink-0"><span className="material-symbols-outlined">tune</span></button>
        <div className="hidden md:flex gap-1 shrink-0">
          <button onClick={() => setView('grid')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view === 'grid' ? 'bg-[#4B3621] text-white' : 'border'}`}><span className="material-symbols-outlined text-[18px]">grid_view</span></button>
          <button onClick={() => setView('list')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view === 'list' ? 'bg-[#4B3621] text-white' : 'border'}`}><span className="material-symbols-outlined text-[18px]">view_list</span></button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-[#8A8078]">{loadingProducts ? 'Loading…' : `${products.length} products${pagination ? ` • page ${pagination.currentPage}/${pagination.numberOfPages || 1}` : ''}`}</div>
        {(keyword || page !== 1) && <button onClick={() => { setInput(''); setKeyword(''); setPage(1) }} className="text-xs text-[#C19A6B] underline">Clear search</button>}
      </div>

      {productsError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{productsError}</div>}
      {wishError && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{wishError}</div>}

      {loadingProducts ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden animate-pulse"><div className="aspect-[4/3] bg-[#E7DFD3]/60" /><div className="p-3"><div className="h-4 bg-[#E7DFD3]/60 rounded w-3/4" /></div></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">No products in this gallery — {keyword ? <button onClick={() => { setInput(''); setKeyword('') }} className="text-[#C19A6B] underline">Clear search</button> : 'check back later'}</div>
      ) : (
        <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-4'}>
          {products.map((p) => (
            <ProductCard
              key={p.id || p._id}
              product={p}
              aspect={view === 'grid' ? 'aspect-[4/3]' : 'aspect-[16/9]'}
              onWishlistError={setWishError}
            />
          ))}
        </div>
      )}

      {pagination && (
        <div className="flex justify-center items-center gap-2">
          <button disabled={!pagination.prev} onClick={() => setPage((x) => Math.max(1, x - 1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm text-[#8A8078]">Page {pagination.currentPage} / {pagination.numberOfPages || 1}</span>
          <button disabled={!pagination.next} onClick={() => setPage((x) => x + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {gallery.images?.length > 0 && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
          <h3 className="font-medium text-sm mb-3">Gallery images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.images.map((f, i) => {
              const src = f.startsWith('http') ? f : `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${f}`
              return <img key={i} src={src} alt="" className="h-32 object-cover rounded-lg border" loading="lazy" />
            })}
          </div>
        </div>
      )}
    </div>
  )
}
