import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { galleries as mockGalleries } from '../data/mockData'
import { getProducts, unwrapProducts } from '../api/products'
import { getGalleries, unwrapGalleries } from '../api/galleries'
import { getCategories, unwrapCategories } from '../api/categories'
import { getGalleryBannerUrl, getGalleryLogoUrl } from '../utils/image'
import ProductCard from '../components/ProductCard'
import { useLanguage } from '../i18n/LanguageContext'

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

export default function Home() {
  const navigate = useNavigate()
  const { t, categoryLabel } = useLanguage()
  const [wishError, setWishError] = useState('')
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
          fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,gallery[id,name,slug],category[id,name,slug]',
          sort: '-createdAt',
        })
        if (cancelled) return
        const data = unwrapProducts(res)
        setProducts(data)
      } catch (err) {
        if (cancelled) return
        setErrorProducts(err.message || 'Failed to load products')
        setProducts([])
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
        setGalleries(data)
      } catch (err) {
        if (cancelled) return
        setErrorGalleries(err.message || 'Failed to load galleries')
        setGalleries([])
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
    <div className="space-y-16 sm:space-y-20 lg:space-y-28">
      <section className="relative min-h-[520px] overflow-hidden rounded-2xl shadow-sm sm:min-h-[580px] lg:min-h-[640px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-[#201a17]/80 via-[#4B3621]/35 to-[#4B3621]/10 p-6 text-start sm:p-10 md:justify-center md:p-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-sm">
            {t('home.heroEyebrow')}
          </p>
          <h1 className="mb-4 max-w-3xl font-serif text-4xl leading-tight text-white drop-shadow sm:text-5xl md:mb-5 md:text-6xl lg:text-7xl">
            {t('home.heroTitle')}
          </h1>
          <p className="mb-7 max-w-xl text-sm leading-6 text-white/90 sm:text-base sm:leading-7">
            {t('home.heroIntro')}
          </p>
          <div className="mb-4 flex w-full max-w-2xl items-center gap-2 rounded-xl bg-white/95 p-1.5 shadow-lg backdrop-blur sm:p-2">
            <span className="material-symbols-outlined ms-2 text-[#8A8078]" aria-hidden="true">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8A8078]"
              placeholder={t('home.searchPh')}
              aria-label={t('home.searchPh')}
            />
            <button
              onClick={handleSearch}
              className="shrink-0 whitespace-nowrap rounded-lg bg-[#4B3621] px-3 py-2.5 text-xs font-medium text-white transition hover:bg-[#33210d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:text-sm"
            >
              {t('home.browseProducts')}
            </button>
          </div>
          <a
            href="#home-categories"
            className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t('home.browseCategories')}
            <span className="material-symbols-outlined text-[18px] rtl:rotate-180" aria-hidden="true">arrow_forward</span>
          </a>
        </div>
      </section>

      <section id="home-categories" className="scroll-mt-24">
        <div className="mb-5 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A754B]">{t('home.categoryEyebrow')}</p>
            <h2 className="font-serif text-2xl text-[#4B3621] sm:text-3xl">{t('home.categoryTitle')}</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#8A8078]">{t('home.categorySub')}</p>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar scroll-fade-mask py-2 pe-10">
            {loadingCategories
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-28 h-9 rounded-full bg-[#E7DFD3]/60 animate-pulse" />
                ))
              : categories.map((c) => {
                  const label = categoryLabel(c)
                  return (
                    <button
                      key={c.id || c.slug || c.name}
                      onClick={() => handleCategoryClick(c)}
                      className="shrink-0 rounded-full border border-[#E7DFD3] bg-white px-5 py-2 text-sm shadow-xs transition hover:bg-[#FAF7F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
                      title={c.slug}
                    >
                      {label}
                    </button>
                  )
                })}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A754B]">{t('home.productsEyebrow')}</p>
            <h2 className="font-serif text-2xl text-[#4B3621] sm:text-3xl">{t('home.curated')}</h2>
            <p className="mt-1 text-sm text-[#8A8078]">{t('home.curatedSub')}</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-sm text-[#78582f] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#78582f]"
          >
            {t('home.viewAll')} <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
          </button>
        </div>

        {wishError && <div className="mb-3 bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{wishError}</div>}

        {loadingProducts ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#E7DFD3] bg-white py-12" role="status" aria-label={t('products.loading')}>
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E7DFD3] border-t-[#C19A6B]" aria-hidden="true" />
            <span className="text-sm text-[#8A8078]">{t('products.loading')}</span>
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id || p._id} product={p} variant="home" onWishlistError={setWishError} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#E7DFD3] bg-white py-12 text-center text-sm text-[#8A8078]">
            {errorProducts ? t('products.loadError') : t('products.empty')}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A754B]">{t('home.galleriesEyebrow')}</p>
            <h2 className="font-serif text-2xl text-[#4B3621] sm:text-3xl">{t('home.galleries')}</h2>
            <p className="mt-1 text-sm text-[#8A8078]">{t('home.galleriesSub')}</p>
          </div>
          <button
            onClick={() => navigate('/galleries')}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-sm text-[#78582f] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#78582f]"
          >
            {t('home.viewAll')} <span className="material-symbols-outlined text-[18px] rtl:rotate-180" aria-hidden="true">arrow_forward</span>
          </button>
        </div>

        {loadingGalleries ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3" role="status" aria-label={t('galleries.loading')}>
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E7DFD3] border-t-[#C19A6B]" aria-hidden="true" />
            <span className="text-sm text-[#8A8078]">{t('galleries.loading')}</span>
          </div>
        ) : galleries.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
            {galleries.map((g) => {
                const gid = g.id || g._id
                const city = g.city ? `${g.city}${g.country ? `, ${g.country}` : ''}` : g.country || mockGalleries.find((m) => m.id === gid)?.city || ''
                const logoSrc = getGalleryLogoUrl(g)
                const bannerSrc = getGalleryBannerUrl(g)
                const initials = getInitials(g.name)
                return (
                  <button
                    key={gid}
                    onClick={() => navigate(`/galleries/${gid}`)}
                    className="group w-full overflow-hidden rounded-2xl border border-[#E7DFD3] bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
                  >
                    <div className="relative h-32 overflow-hidden bg-[#E7DFD3] sm:h-40">
                      <img
                        src={bannerSrc || g.banner || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#201a17]/45 to-transparent" />
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#FAF7F2] font-serif text-[#4B3621] shadow-sm">
                        {logoSrc ? (
                          <img src={logoSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#4B3621] sm:text-base">{g.name}</span>
                        <span className="mt-1 flex items-center gap-1 truncate text-xs text-[#8A8078]">
                          {city && <><span className="material-symbols-outlined text-[14px]" aria-hidden="true">location_on</span>{city}</>}
                        </span>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#78582f]">
                        {t('home.visitGallery')}
                        <span className="material-symbols-outlined text-[16px] rtl:rotate-180" aria-hidden="true">arrow_forward</span>
                      </span>
                    </div>
                  </button>
                )
            })}
          </div>
        ) : (
          <p className="py-8 text-sm text-[#8A8078]">{errorGalleries || t('galleries.empty')}</p>
        )}
      </section>
    </div>
  )
}
