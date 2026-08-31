import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { products as mockProducts, galleries as mockGalleries } from '../data/mockData'
import { getProducts, unwrapProducts } from '../api/products'
import { getGalleries, unwrapGalleries } from '../api/galleries'
import { getCategories, unwrapCategories } from '../api/categories'
import { BASE_URL } from '../api/client'

const FALLBACK_CATEGORIES = [
  { id: 'sofas', name: 'Sofas', arabicName: 'صوفا', slug: 'sofas' },
  { id: 'tables', name: 'Tables', arabicName: 'طاولات', slug: 'tables' },
  { id: 'seating', name: 'Seating', arabicName: 'مقاعد', slug: 'seating' },
  { id: 'lighting', name: 'Lighting', arabicName: 'إضاءة', slug: 'lighting' },
  { id: 'decor', name: 'Decor', arabicName: 'ديكور', slug: 'decor' },
]

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'GA'
}

function formatPrice(price) {
  const n = Number(price)
  if (Number.isNaN(n)) return price
  return n.toLocaleString()
}

const STORAGE_BASE = BASE_URL.replace(/\/api\/v1\/?$/, '')

function getProductImageUrl(product) {
  if (!product) return null
  const raw = product.mainImageUrl || product.image || product.images?.[0]
  if (!raw) return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/storage/')) return `${STORAGE_BASE}${raw}`
  if (raw.startsWith('storage/')) return `${STORAGE_BASE}/${raw}`
  // raw like "folder/file.jpeg" (seed stores as "storageFolder/fileName") or "products/folder/file.jpeg"
  if (raw.includes('/')) {
    if (raw.startsWith('products/')) return `${STORAGE_BASE}/storage/uploads/${raw}`
    return `${STORAGE_BASE}/storage/uploads/products/${raw}`
  }
  // bare filename + separate folder field (user described as product.folderName)
  const folder = product.storageFolder || product.folderName || product.folder || product.storage_folder
  if (folder) return `${STORAGE_BASE}/storage/uploads/products/${folder}/${raw}`
  return `${STORAGE_BASE}/storage/uploads/products/${raw}`
}

/**
 * Gallery storage: served at /storage (app.js:20)
 * working URL: http://localhost:3000/storage/uploads/galleries/<storageFolder>/<file>
 * e.g. http://localhost:3000/storage/uploads/galleries/nordic-timber-and-living-11563464-6ba5-4a39-892d-daa9512e7377/banner-2026-08-31T14-39-48-220Z-1542f955-0d21-48e2-9c72-f3b3ff593a85.jpeg
 * DB: gallery.storageFolder + gallery.logo/banner/images[] (filenames only)
 */
function getGalleryLogoUrl(gallery) {
  if (!gallery?.logo || !gallery?.storageFolder) return null
  const raw = gallery.logo
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/storage/')) return `${STORAGE_BASE}${raw}`
  return `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${raw}`
}

function getGalleryBannerUrl(gallery) {
  if (!gallery?.banner || !gallery?.storageFolder) return null
  const raw = gallery.banner
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/storage/')) return `${STORAGE_BASE}${raw}`
  return `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${raw}`
}

function getGalleryImageUrl(gallery, fileName) {
  if (!fileName || !gallery?.storageFolder) return null
  if (fileName.startsWith('http')) return fileName
  return `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${fileName}`
}

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const [products, setProducts] = useState([])
  const [galleries, setGalleries] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingGalleries, setLoadingGalleries] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [errorProducts, setErrorProducts] = useState('')
  const [errorGalleries, setErrorGalleries] = useState('')
  const [errorCategories, setErrorCategories] = useState('')

  const handleSearch = () => {
    const q = search.trim()
    if (q) navigate(`/products?keyword=${encodeURIComponent(q)}`)
    else navigate('/products')
  }

  const handleCategoryClick = (category) => {
    // backend expects categoryId or category filter via product.categoryId
    // navigate with both id and slug for future Products page to consume
    const id = category.id || category._id
    const slug = category.slug
    if (id) navigate(`/products?categoryId=${encodeURIComponent(id)}&category=${encodeURIComponent(slug || category.name)}`)
    else navigate(`/products?category=${encodeURIComponent(category.name)}`)
  }

  useEffect(() => {
    let cancelled = false

    // ── Products: home curated selection
    // per request: must include limit param + fields/sort/filter as UI needs
    // example from Postman: /api/v1/products?fields=id,name,mainImageUrl,gallery[id,name,slug,phone]&sort=price,-stock&price=250&page=1&limit=12
    // home uses: limit=4, minimal fields for card, sorted by newest/featured
    async function fetchProducts() {
      setLoadingProducts(true)
      setErrorProducts('')
      try {
        const res = await getProducts({
          limit: 4,
          page: 1,
          fields: 'id,name,mainImageUrl,images,price,stock,gallery[id,name,slug,phone]',
          sort: '-createdAt',
          // optional UI filters: only active & featured could be added if backend supports e.g. status=active / isFeatured=true
          // status: 'active',
        })
        if (cancelled) return
        const data = unwrapProducts(res)
        // fallback to mock if empty (keeps UI populated in dev)
        setProducts(data.length ? data : mockProducts.slice(0, 4))
        if (!data.length && !res?.results) {
          // if backend returned empty but no error, still show mock
        }
      } catch (err) {
        if (cancelled) return
        setErrorProducts(err.message || 'Failed to load products')
        setProducts(mockProducts.slice(0, 4))
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }

    async function fetchGalleries() {
      setLoadingGalleries(true)
      setErrorGalleries('')
      try {
        const res = await getGalleries({
          limit: 4,
          page: 1,
          fields: 'id,name,slug,city,country,logo,banner,phone,storageFolder,images',
          sort: '-createdAt',
        })
        if (cancelled) return
        const data = unwrapGalleries(res)
        setGalleries(data.length ? data : mockGalleries.slice(0, 4))
      } catch (err) {
        if (cancelled) return
        setErrorGalleries(err.message || 'Failed to load galleries')
        setGalleries(mockGalleries.slice(0, 4))
      } finally {
        if (!cancelled) setLoadingGalleries(false)
      }
    }

    async function fetchCategories() {
      setLoadingCategories(true)
      setErrorCategories('')
      try {
        const res = await getCategories({
          limit: 8,
          page: 1,
          fields: 'id,name,arabicName,slug',
          sort: 'name',
        })
        if (cancelled) return
        const data = unwrapCategories(res)
        setCategories(data.length ? data : FALLBACK_CATEGORIES)
      } catch (err) {
        if (cancelled) return
        setErrorCategories(err.message || 'Failed to load categories')
        setCategories(FALLBACK_CATEGORIES)
      } finally {
        if (!cancelled) setLoadingCategories(false)
      }
    }

    fetchProducts()
    fetchGalleries()
    fetchCategories()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-12">
      <section className="relative w-full h-[58vh] min-h-[420px] rounded-xl overflow-hidden shadow-sm">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4B3621]/60 via-[#4B3621]/20 to-transparent flex flex-col items-center justify-end md:justify-center text-center p-8">
          <h1 className="font-serif text-3xl md:text-5xl text-white mb-6 max-w-3xl drop-shadow">
            Furniture crafted for living
          </h1>
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur rounded-lg p-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8A8078] ml-2">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent outline-none text-sm placeholder:text-[#8A8078]"
              placeholder="Search products, styles, or galleries..."
            />
            <button
              onClick={handleSearch}
              className="bg-[#4B3621] text-white px-6 py-2.5 rounded text-sm font-medium whitespace-nowrap"
            >
              Browse Products
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2">
          {loadingCategories
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-28 h-9 rounded-full bg-[#E7DFD3]/60 animate-pulse" />
              ))
            : categories.map((c) => {
                const label = c.arabicName ? `${c.name} • ${c.arabicName}` : c.name
                return (
                  <button
                    key={c.id || c.slug || c.name}
                    onClick={() => handleCategoryClick(c)}
                    className="shrink-0 border border-[#E7DFD3] bg-white px-5 py-2 rounded-full text-sm hover:bg-[#FAF7F2] transition"
                    title={c.slug}
                  >
                    {label}
                  </button>
                )
              })}
        </div>
        {errorCategories && !loadingCategories && (
          <div className="text-[11px] text-amber-700 mt-1">Categories fallback — {errorCategories}</div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-serif text-2xl text-[#4B3621]">Curated Selections</h2>
            <p className="text-sm text-[#8A8078]">Handpicked pieces from premium galleries</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="hidden md:flex items-center gap-1 text-sm text-[#78582f]"
          >
            View all <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {errorProducts && !loadingProducts && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Showing cached products — live load failed: {errorProducts}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingProducts
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] rounded-xl bg-[#E7DFD3]/60 mb-3" />
                  <div className="h-4 bg-[#E7DFD3]/60 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#E7DFD3]/40 rounded w-1/2" />
                </div>
              ))
            : products.map((p) => {
                const pid = p.id || p._id
                const img =
                  getProductImageUrl(p) ||
                  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
                const galleryName = p.gallery?.name || p.gallery || p.galleryName || 'Gallery'
                const price = p.price
                return (
                  <div key={pid} className="group cursor-pointer" onClick={() => navigate(`/products/${pid}`)}>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white mb-3 border border-[#E7DFD3]">
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // todo: wishlist
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
                        aria-label="favorite"
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                      </button>
                      {Number(p.stock) === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="bg-[#4B3621] text-white text-xs px-3 py-1 rounded-full">Out of stock</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-sm gap-2">
                      <span className="font-medium truncate">{p.name}</span>
                      <span className="font-semibold whitespace-nowrap">{formatPrice(price)} EGP</span>
                    </div>
                    <div className="text-xs text-[#8A8078] flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[14px]">storefront</span>
                      {galleryName}
                    </div>
                  </div>
                )
              })}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#E7DFD3] p-8 text-center">
        <h3 className="font-serif text-xl mb-6">Represented Galleries</h3>

        {errorGalleries && !loadingGalleries && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 inline-block">
            Showing cached galleries — live load failed: {errorGalleries}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-10">
          {loadingGalleries
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-[#E7DFD3]/60" />
                  <div className="h-3 w-20 bg-[#E7DFD3]/60 rounded" />
                  <div className="h-2 w-16 bg-[#E7DFD3]/40 rounded" />
                </div>
              ))
            : galleries.map((g) => {
                const gid = g.id || g._id
                const slug = g.slug || gid
                const city = g.city ? `${g.city}${g.country ? `, ${g.country}` : ''}` : g.country || mockGalleries.find((m) => m.id === gid)?.city || ''
                const logoSrc = getGalleryLogoUrl(g)
                const initials = getInitials(g.name)
                return (
                  <button
                    key={gid}
                    onClick={() => navigate(`/galleries/${slug}`)}
                    className="flex flex-col items-center gap-2 hover:opacity-80 transition"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border flex items-center justify-center font-serif overflow-hidden">
                      {logoSrc ? (
                        <img src={logoSrc} alt={g.name} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="text-sm font-medium">{g.name}</span>
                    <span className="text-xs text-[#8A8078]">{city}</span>
                  </button>
                )
              })}
        </div>
      </section>
    </div>
  )
}
