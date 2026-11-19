import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, unwrapProducts } from '../api/products'
import { getGalleries, unwrapGalleries } from '../api/galleries'
import { getCategories, unwrapCategories } from '../api/categories'
import { useLanguage } from '../i18n/LanguageContext'
import HeroSection from './home/HeroSection'
import CategoriesSection from './home/CategoriesSection'
import ProductsSection from './home/ProductsSection'
import GalleriesSection from './home/GalleriesSection'
import { FALLBACK_CATEGORIES, selectHomeProducts } from './home/helpers'

export default function Home() {
  const navigate = useNavigate()
  const { t, categoryLabel } = useLanguage()
  const [wishError, setWishError] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('curated') // 'curated' | 'new' | 'featured'

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
    const id = category.id || category._id
    const slug = category.slug
    if (id) navigate(`/products?categoryId=${encodeURIComponent(id)}&category=${encodeURIComponent(slug || category.name)}`)
    else navigate(`/products?category=${encodeURIComponent(category.name)}`)
  }

  // Fetch more candidates than the showcase displays so categories stay varied.
  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      setLoadingProducts(true)
      setErrorProducts('')
      try {
        const queryParams = {
          limit: 32,
          page: 1,
          fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,description,materials,gallery[id,name,slug,city,country],category[id,name,slug]',
        }
        if (activeTab === 'new') {
          queryParams.sort = '-createdAt'
        } else if (activeTab === 'featured') {
          queryParams.sort = '-ratingsAverage,-sold,-createdAt'
        } else {
          queryParams.sort = '-createdAt'
        }

        const res = await getProducts(queryParams)
        if (cancelled) return
        const data = unwrapProducts(res)
        setProducts(selectHomeProducts(data, 8))
      } catch (err) {
        if (cancelled) return
        setErrorProducts(err.message || 'Failed to load products')
        setProducts([])
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }

    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  // Fetch galleries and categories once on mount
  useEffect(() => {
    let cancelled = false

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

    fetchGalleries()
    fetchCategories()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20">
      <HeroSection t={t} search={search} setSearch={setSearch} handleSearch={handleSearch} />
      <CategoriesSection t={t} categoryLabel={categoryLabel} loadingCategories={loadingCategories} categories={categories} handleCategoryClick={handleCategoryClick} />
      <ProductsSection t={t} activeTab={activeTab} setActiveTab={setActiveTab} wishError={wishError} loadingProducts={loadingProducts} products={products} setWishError={setWishError} navigate={navigate} errorProducts={errorProducts} />
      <GalleriesSection t={t} navigate={navigate} loadingGalleries={loadingGalleries} galleries={galleries} errorGalleries={errorGalleries} />
    </div>
  )
}
