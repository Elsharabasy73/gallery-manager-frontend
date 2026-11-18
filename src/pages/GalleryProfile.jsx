import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGallery, unwrapGallery } from '../api/galleries'
import { unwrapProducts } from '../api/products'
import { getCategories, unwrapCategories } from '../api/categories'
import { getGalleryLogoUrl, getGalleryBannerUrl, STORAGE_BASE } from '../utils/image'
import GalleryHeader from './galleryProfile/GalleryHeader'
import ShareGalleryModal from '../components/ShareGalleryModal'
import ImageLightboxModal from '../components/ImageLightboxModal'
import useHideOnScroll from '../hooks/useHideOnScroll'
import { useLanguage } from '../i18n/LanguageContext'
import { FALLBACK_PRODUCT_CATEGORIES } from '../data/productCategories'

import { getGalleryProducts } from './galleryProfile/helpers'
import ShowcaseGallery from './galleryProfile/ShowcaseGallery'
import GalleryProductFilters from './galleryProfile/GalleryProductFilters'
import ProductListing from './galleryProfile/ProductListing'
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

  const [apiCategories, setApiCategories] = useState([])
  const displayCategories = apiCategories.length ? apiCategories : FALLBACK_PRODUCT_CATEGORIES
  const [activeCats, setActiveCats] = useState(['All'])
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const doSearch = () => { setKeyword(input.trim()); setPage(1) }
  const [sort, setSort] = useState('-createdAt')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [appliedMin, setAppliedMin] = useState('')
  const [appliedMax, setAppliedMax] = useState('')

  const [page, setPage] = useState(1)
  const productListRef = useRef(null)
  const [view, setView] = useState('grid')
  const [wishError, setWishError] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxImages, setLightboxImages] = useState([])
  const { visible: filtersVisible } = useHideOnScroll({ threshold: 8, topBuffer: 320 })
  const hasProductFilters = Boolean(
    keyword || appliedMin || appliedMax || activeCats[0] !== 'All' || page !== 1
  )

  const handlePageChange = (newPage) => {
    setPage(newPage)
    requestAnimationFrame(() => {
      productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const toggleCategory = (categoryName) => {
    setActiveCats((current) => {
      if (categoryName === 'All') return ['All']
      const next = current.includes(categoryName)
        ? current.filter((name) => name !== categoryName)
        : [...current.filter((name) => name !== 'All'), categoryName]
      return next.length ? next : ['All']
    })
    setPage(1)
  }

  const clearFilters = () => {
    setInput('')
    setKeyword('')
    setActiveCats(['All'])
    setSort('-createdAt')
    setPriceMin('')
    setPriceMax('')
    setAppliedMin('')
    setAppliedMax('')
    setPage(1)
  }

  useEffect(() => {
    let cancelled = false
    getCategories({ limit: 20, fields: 'id,name,arabicName,slug', sort: 'name' })
      .then((res) => {
        if (!cancelled) {
          const categories = unwrapCategories(res)
          if (categories.length) setApiCategories(categories)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

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
          limit: 20,
          page,
          sort,
          fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,gallery[id,name,slug],category[id,name,slug]',
        }
        if (keyword) params.keyword = keyword
        if (appliedMin) params['price[gte]'] = appliedMin
        if (appliedMax) params['price[lte]'] = appliedMax
        if (activeCats.length === 1 && activeCats[0] !== 'All') {
          const category = displayCategories.find((item) => item.name === activeCats[0])
          const categoryId = category?.id || category?._id
          if (categoryId) params.categoryId = categoryId
          else if (category?.slug) params.category = category.slug
        } else if (activeCats.length > 1) {
          const categoryIds = activeCats
            .map((name) => displayCategories.find((item) => item.name === name))
            .map((category) => category?.id || category?._id)
            .filter(Boolean)
          if (categoryIds.length === activeCats.length) {
            params['categoryId[in]'] = categoryIds.join(',')
          }
        }
        const res = await getGalleryProducts(gallery.id, params)
        if (cancelled) return
        const data = unwrapProducts(res)
        setProducts(data)
        setPagination(res?.paginationResult || res?.pagination || null)
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
  }, [gallery?.id, keyword, sort, appliedMin, appliedMax, activeCats, apiCategories, displayCategories, page])

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
      <GalleryHeader bannerSrc={bannerSrc} openBannerLightbox={openBannerLightbox} t={t} logoSrc={logoSrc} openLogoLightbox={openLogoLightbox} gallery={gallery} setShareOpen={setShareOpen} pagination={pagination} formatNumber={formatNumber} products={products} memberYear={memberYear} />

      <ShowcaseGallery showcaseImages={showcaseImages} openShowcaseLightbox={openShowcaseLightbox} gallery={gallery} formatNumber={formatNumber} t={t} />

      <GalleryProductFilters displayCategories={displayCategories} activeCats={activeCats} toggleCategory={toggleCategory} input={input} setInput={setInput} doSearch={doSearch} sort={sort} setSort={setSort} setPage={setPage} priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax} setAppliedMin={setAppliedMin} setAppliedMax={setAppliedMax} clearFilters={clearFilters} filtersVisible={filtersVisible} view={view} setView={setView} />

      <div className="flex items-center justify-between">
        <div className="text-xs text-[#8A8078]">{loadingProducts ? t('galleryProfile.loading') : `${t('galleryProfile.products', { n: formatNumber(products.length) })}${pagination ? ` ${t('galleryProfile.pageOf', { cur: formatNumber(pagination.currentPage), total: formatNumber(pagination.numberOfPages || 1) })}` : ''}`}</div>
        {hasProductFilters && <button onClick={clearFilters} className="text-xs text-[#C19A6B] underline">{t('products.clearFilters')}</button>}
      </div>

      <ProductListing productsError={productsError} wishError={wishError} productListRef={productListRef} loadingProducts={loadingProducts} products={products} view={view} setWishError={setWishError} t={t} hasProductFilters={hasProductFilters} clearFilters={clearFilters} pagination={pagination} page={page} handlePageChange={handlePageChange} />

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
