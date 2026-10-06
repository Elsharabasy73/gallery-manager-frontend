import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGallery, unwrapGallery } from '../api/galleries'
import { apiFetch } from '../api/client'
import { unwrapProducts } from '../api/products'
import { getGalleryLogoUrl, getGalleryBannerUrl, STORAGE_BASE } from '../utils/image'
import ProductCard from '../components/ProductCard'
import ShareGalleryModal from '../components/ShareGalleryModal'
import ImageLightboxModal from '../components/ImageLightboxModal'
import useHideOnScroll from '../hooks/useHideOnScroll'
import { useLanguage } from '../i18n/LanguageContext'

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
  const { t, formatNumber } = useLanguage()
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
  const [shareOpen, setShareOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxImages, setLightboxImages] = useState([])
  const { visible: searchVisible } = useHideOnScroll({ threshold: 8, topBuffer: 320 })

  // fetch gallery via router .route("/:id").get(getGalleryValidator, getGallery) — id only
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoadingGallery(true)
      setGalleryError('')
      try {
        const res = await getGallery(id, { fields: 'id,name,slug,description,city,country,street,mapAddressUrl,phone,banner,logo,images,storageFolder,isActive,createdAt,ownerId' })
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
    return <div className="text-center py-16 bg-white border rounded-xl"><h2 className="font-serif text-2xl">{t('galleryProfile.notFound')}</h2><p className="text-sm text-[#8A8078]">{galleryError}</p><button onClick={() => navigate('/galleries')} className="text-[#C19A6B] text-sm underline mt-2">{t('galleryProfile.back')}</button></div>
  }

  const bannerSrc = getGalleryBannerUrl(gallery)
  const logoSrc = getGalleryLogoUrl(gallery)
  const memberYear = gallery.createdAt ? new Date(gallery.createdAt).getFullYear() : null

  const showcaseImages = (gallery.images || [])
    .map((f) => (f.startsWith('http') ? f : `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${f}`))
    .filter(Boolean)

  const openShowcaseLightbox = (idx = 0) => {
    setLightboxImages(showcaseImages)
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  const openBannerLightbox = () => {
    if (!bannerSrc) return
    const list = [bannerSrc, ...showcaseImages.filter((s) => s !== bannerSrc)]
    setLightboxImages(list)
    setLightboxIndex(0)
    setLightboxOpen(true)
  }

  const openLogoLightbox = () => {
    if (!logoSrc) return
    setLightboxImages([logoSrc])
    setLightboxIndex(0)
    setLightboxOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E7DFD3] rounded-2xl overflow-hidden shadow-sm">
        <div
          className={`h-[280px] bg-cover bg-center relative group ${bannerSrc ? 'cursor-pointer' : ''}`}
          style={{ backgroundImage: bannerSrc ? `url(${bannerSrc})` : `url('https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?auto=format&fit=crop&w=1400&q=80')` }}
          onClick={bannerSrc ? openBannerLightbox : undefined}
          title={bannerSrc ? t('galleryProfile.viewCover') : undefined}
          role={bannerSrc ? 'button' : undefined}
          tabIndex={bannerSrc ? 0 : undefined}
          onKeyDown={(e) => {
            if (bannerSrc && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              openBannerLightbox()
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          {bannerSrc && (
            <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="inline-flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                <span className="material-symbols-outlined text-[16px] text-[#C19A6B]">zoom_in</span>
                {t('galleryProfile.viewCover')}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex gap-4 -mt-12 relative">
            <div
              className={`w-[100px] h-[100px] rounded-full bg-white border-4 border-white flex items-center justify-center font-serif text-xl shadow-md overflow-hidden shrink-0 group relative ${
                logoSrc ? 'cursor-pointer' : ''
              }`}
              onClick={logoSrc ? openLogoLightbox : undefined}
              title={logoSrc ? t('galleryProfile.viewLogo') : undefined}
              role={logoSrc ? 'button' : undefined}
              tabIndex={logoSrc ? 0 : undefined}
              onKeyDown={(e) => {
                if (logoSrc && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  openLogoLightbox()
                }
              }}
            >
              {logoSrc ? (
                <>
                  <img
                    src={logoSrc}
                    alt={`${gallery.name} logo`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fb = e.currentTarget.nextSibling
                      if (fb) fb.style.display = 'flex'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                  </div>
                </>
              ) : null}
              <span style={{ display: logoSrc ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                {getInitials(gallery.name)}
              </span>
            </div>
            <div className="pt-10 min-w-0">
              <h1 className="font-serif text-2xl flex items-center gap-2 truncate text-[#4B3621]">
                {gallery.name} <span className="w-2 h-2 rounded-full bg-[#4C7A4C] shrink-0"></span>
              </h1>
              <div className="text-xs text-[#8A8078] flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[14px]">location_on</span> {gallery.street ? `${gallery.street} · ` : ''}
                {gallery.city}
                {gallery.country ? ` · ${gallery.country}` : ''}
              </div>
              <p className="text-xs text-[#8A8078] mt-1 line-clamp-2">{gallery.description || t('galleries.fallbackDesc')}</p>
              <div className="text-xs text-[#8A8078] mt-2">
                {pagination ? `${pagination.currentPage ? '' : ''}` : ''}
                {t('galleryProfile.products', { n: formatNumber(products.length) })}
                {memberYear ? ` ${t('galleryProfile.memberSince', { year: formatNumber(memberYear) })}` : ''}
              </div>
            </div>
            <div className="ms-auto hidden md:flex gap-2 pt-10 shrink-0 items-center">
              {gallery.mapAddressUrl && (
                <a
                  href={gallery.mapAddressUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open location in Google Maps"
                  aria-label="Open gallery location in Google Maps"
                  className="w-10 h-10 bg-[#4B3621] text-white hover:bg-[#33210d] rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </a>
              )}
              {gallery.phone && (
                <a
                  href={`tel:${gallery.phone}`}
                  className="border border-[#E7DFD3] hover:border-[#4B3621] px-4 py-1.5 rounded-full text-xs flex items-center gap-1 text-[#4B3621] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span> {t('galleryProfile.call')}
                </a>
              )}
              <button
                onClick={() => setShareOpen(true)}
                aria-label="Share gallery"
                title="Share gallery"
                className="w-10 h-10 border border-[#E7DFD3] rounded-full flex items-center justify-center hover:bg-[#FAF7F2] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            </div>
          </div>
          <div className="md:hidden flex gap-2 mt-4 items-center">
            {gallery.mapAddressUrl && (
              <a
                href={gallery.mapAddressUrl}
                target="_blank"
                rel="noreferrer"
                title="Open location in Google Maps"
                aria-label="Open gallery location in Google Maps"
                className="w-11 h-11 bg-[#4B3621] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm"
              >
                <span className="material-symbols-outlined text-[22px]">location_on</span>
              </a>
            )}
            {gallery.phone && (
              <a
                href={`tel:${gallery.phone}`}
                className="flex-1 border border-[#E7DFD3] px-4 py-2 rounded-full text-xs flex items-center justify-center gap-1 text-[#4B3621]"
              >
                <span className="material-symbols-outlined text-[16px]">call</span> {t('galleryProfile.call')}
              </a>
            )}
            <button
              onClick={() => setShareOpen(true)}
              aria-label="Share gallery"
              className="w-11 h-11 border border-[#E7DFD3] rounded-full flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
          </div>
        </div>
      </div>

      {showcaseImages.length > 0 && (
        <div className="bg-white border border-[#E7DFD3] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {showcaseImages.map((src, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => openShowcaseLightbox(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openShowcaseLightbox(i)
                  }
                }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E7DFD3] hover:border-[#C19A6B] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
                aria-label={`${gallery.name} photo ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`${gallery.name} photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <span className="bg-black/60 text-white/95 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                      {formatNumber(i + 1)} / {formatNumber(showcaseImages.length)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white text-xs font-medium self-center bg-[#4B3621]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[16px] text-[#C19A6B]">zoom_in</span>
                    <span>{t('galleryProfile.clickToExpand')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`bg-white border border-[#E7DFD3] rounded-full p-2 flex items-center gap-2 sticky top-[72px] z-30 transition-all duration-300 motion-reduce:transition-none ${searchVisible ? 'translate-y-0 opacity-100' : '-translate-y-[120%] opacity-0 pointer-events-none'}`}>
        <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] rounded-full px-4 py-2 min-w-0">
          <span className="material-symbols-outlined text-[#8A8078]">search</span>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { doSearch(); setPage(1) } }} placeholder={t('galleryProfile.searchPh')} className="bg-transparent outline-none flex-1 text-sm min-w-0" />
        </div>
        <button onClick={() => { doSearch(); setPage(1) }} className="hidden sm:block bg-[#4B3621] text-white px-5 py-2 rounded-full text-xs">{t('galleryProfile.searchBtn')}</button>
        <button className="w-9 h-9 border rounded-full flex items-center justify-center shrink-0"><span className="material-symbols-outlined">tune</span></button>
        <div className="hidden md:flex gap-1 shrink-0">
          <button onClick={() => setView('grid')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view === 'grid' ? 'bg-[#4B3621] text-white' : 'border'}`}><span className="material-symbols-outlined text-[18px]">grid_view</span></button>
          <button onClick={() => setView('list')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view === 'list' ? 'bg-[#4B3621] text-white' : 'border'}`}><span className="material-symbols-outlined text-[18px]">view_list</span></button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-[#8A8078]">{loadingProducts ? t('galleryProfile.loading') : `${t('galleryProfile.products', { n: formatNumber(products.length) })}${pagination ? ` ${t('galleryProfile.pageOf', { cur: formatNumber(pagination.currentPage), total: formatNumber(pagination.numberOfPages || 1) })}` : ''}`}</div>
        {(keyword || page !== 1) && <button onClick={() => { setInput(''); setKeyword(''); setPage(1) }} className="text-xs text-[#C19A6B] underline">{t('galleryProfile.clearSearch')}</button>}
      </div>

      {productsError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{productsError}</div>}
      {wishError && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{wishError}</div>}

      {loadingProducts ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden animate-pulse"><div className="aspect-[4/3] bg-[#E7DFD3]/60" /><div className="p-3"><div className="h-4 bg-[#E7DFD3]/60 rounded w-3/4" /></div></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">{t('galleryProfile.noProducts')} {keyword ? <button onClick={() => { setInput(''); setKeyword('') }} className="text-[#C19A6B] underline">{t('galleryProfile.clearSearch')}</button> : t('galleryProfile.checkLater')}</div>
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
          <button disabled={!pagination.prev} onClick={() => setPage((x) => Math.max(1, x - 1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">{t('common.prev')}</button>
          <span className="text-sm text-[#8A8078]">{t('common.page')} {formatNumber(pagination.currentPage)} / {formatNumber(pagination.numberOfPages || 1)}</span>
          <button disabled={!pagination.next} onClick={() => setPage((x) => x + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">{t('common.next')}</button>
        </div>
      )}

      <ShareGalleryModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={gallery.name}
      />

      <ImageLightboxModal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        galleryName={gallery.name}
      />
    </div>
  )
}
