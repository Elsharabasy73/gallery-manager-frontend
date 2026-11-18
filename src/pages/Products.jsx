import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, unwrapProducts } from '../api/products'
import { getCategories, unwrapCategories } from '../api/categories'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import Pagination from '../components/Pagination'
import useHideOnScroll from '../hooks/useHideOnScroll'
import { useLanguage } from '../i18n/LanguageContext'
import { FALLBACK_PRODUCT_CATEGORIES } from '../data/productCategories'
import Spinner from '../components/Spinner'

export default function Products() {
  const { t, formatNumber } = useLanguage()
  const [wishError, setWishError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  const [apiCategories, setApiCategories] = useState([])
  const displayCategories = apiCategories.length ? apiCategories : FALLBACK_PRODUCT_CATEGORIES

  const [activeCats, setActiveCats] = useState(['All'])
  const [input, setInput] = useState(searchParams.get('keyword') || '')
  const [q, setQ] = useState(searchParams.get('keyword') || '')
  const doSearch = () => { setQ(input.trim()); setPage(1) }

  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [appliedMin, setAppliedMin] = useState('')
  const [appliedMax, setAppliedMax] = useState('')
  const applyPrice = () => { setAppliedMin(priceMin.trim()); setAppliedMax(priceMax.trim()); setPage(1) }

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reload, setReload] = useState(0)
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1', 10))
  const [pagination, setPagination] = useState(null)
  const productListRef = useRef(null)
  const { visible: filtersVisible } = useHideOnScroll({ threshold: 8, topBuffer: 160 })

  const handlePageChange = (newPage) => {
    setPage(newPage)
    requestAnimationFrame(() => {
      productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const toggle = (c) => {
    let next
    if (c === 'All') next = ['All']
    else {
      next = activeCats.includes(c) ? activeCats.filter((x) => x !== c) : [...activeCats.filter((x) => x !== 'All'), c]
      if (next.length === 0) next = ['All']
    }
    setActiveCats(next)
    setPage(1)
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('page')
    if (next.length === 1 && next[0] !== 'All') {
      const catObj = displayCategories.find((cat) => cat.name === next[0])
      if (catObj) {
        const id = catObj.id || catObj._id
        newParams.delete('categoryId[in]')
        if (id) newParams.set('categoryId', String(id))
        if (catObj.slug) newParams.set('category', catObj.slug)
        else newParams.delete('category')
      }
    } else if (next.length > 1) {
      const categoryIds = next
        .map((name) => displayCategories.find((cat) => cat.name === name))
        .map((cat) => cat?.id || cat?._id)
        .filter(Boolean)
      newParams.delete('categoryId')
      newParams.delete('category')
      if (categoryIds.length === next.length) {
        newParams.set('categoryId[in]', categoryIds.join(','))
      } else {
        newParams.delete('categoryId[in]')
      }
    } else {
      newParams.delete('categoryId')
      newParams.delete('categoryId[in]')
      newParams.delete('category')
    }
    setSearchParams(newParams, { replace: true })
  }

  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10)
    if (urlPage !== page) setPage(urlPage)
  }, [searchParams])

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (page !== 1) newParams.set('page', String(page))
    else newParams.delete('page')
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true })
    }
  }, [page])

  // sync category from URL (homepage navigation: /products?categoryId=...&category=slug) -> select pill
  useEffect(() => {
    const categoryId = searchParams.get('categoryId')
    const categoryIds = searchParams.get('categoryId[in]')?.split(',').filter(Boolean) || []
    const categorySlug = searchParams.get('category')
    if (!categoryId && !categoryIds.length && !categorySlug) return
    if (!(activeCats.length === 1 && activeCats[0] === 'All')) return
    const cats = apiCategories.length ? apiCategories : FALLBACK_PRODUCT_CATEGORIES
    let found = null
    if (categoryId) found = cats.find((c) => String(c.id) === String(categoryId) || String(c._id) === String(categoryId))
    if (!found && categorySlug) found = cats.find((c) => c.slug === categorySlug || c.name === categorySlug || c.name?.toLowerCase() === categorySlug?.toLowerCase())
    if (found) setActiveCats([found.name])
    else if (categoryIds.length) {
      const selected = cats.filter((cat) => categoryIds.includes(String(cat.id || cat._id)))
      if (selected.length) setActiveCats(selected.map((cat) => cat.name))
    }
  }, [apiCategories, searchParams, activeCats])

  useEffect(() => {
    let cancelled = false
    getCategories({ limit: 20, fields: 'id,name,arabicName,slug', sort: 'name' })
      .then((res) => { if (!cancelled) { const d = unwrapCategories(res); if (d.length) setApiCategories(d) } })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setLoadError('')
      try {
        const params = {
          limit: 20,
          page,
          sort,
          fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,galleryId,gallery[id,name,slug],category[id,name,slug,arabicName]',
        }
        if (q) params.keyword = q
        if (appliedMin) params['price[gte]'] = appliedMin
        if (appliedMax) params['price[lte]'] = appliedMax
        if (activeCats.length === 1 && activeCats[0] !== 'All') {
          const cat = apiCategories.find((c) => c.name === activeCats[0]) || displayCategories.find((c) => c.name === activeCats[0])
          const cid = cat?.id || cat?._id
          if (cid) params.categoryId = cid
          else if (cat?.slug) params.category = cat.slug
        } else if (activeCats.length > 1) {
          const categoryIds = activeCats
            .map((name) => displayCategories.find((cat) => cat.name === name))
            .map((cat) => cat?.id || cat?._id)
            .filter(Boolean)
          if (categoryIds.length === activeCats.length) {
            params['categoryId[in]'] = categoryIds.join(',')
          }
        } else {
          const urlCatId = searchParams.get('categoryId')
          if (urlCatId) params.categoryId = urlCatId
          else {
            const urlCatIds = searchParams.get('categoryId[in]')
            if (urlCatIds) params['categoryId[in]'] = urlCatIds
            const urlCat = searchParams.get('category')
            if (!urlCatIds && urlCat) params.category = urlCat
          }
        }
        const res = await getProducts(params)
        if (cancelled) return
        const data = unwrapProducts(res)
        setItems(data)
        setPagination(res?.paginationResult || res?.pagination || null)
      } catch (err) {
        if (!cancelled) {
          setItems([])
          setPagination(null)
          setLoadError(err?.message || '')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [q, sort, appliedMin, appliedMax, activeCats, apiCategories, displayCategories, searchParams, page, reload])

  const filtered = items.filter((p) => {
    const catName = p.category?.name || (typeof p.category === 'string' ? p.category : '') || ''
    const catSlug = p.category?.slug || ''
    const catOk =
      activeCats.includes('All') ||
      activeCats.includes(catName) ||
      activeCats.some((a) => a.toLowerCase() === String(catName).toLowerCase() || a.toLowerCase() === String(catSlug).toLowerCase())
    const qOk = !q || p.name.toLowerCase().includes(q.toLowerCase())
    return catOk && qOk
  })

  return (
    <div className="space-y-6">
      <ProductFilters
        categories={displayCategories}
        activeCategories={activeCats}
        onToggleCategory={toggle}
        input={input}
        onInputChange={setInput}
        onSearch={doSearch}
        sort={sort}
        onSortChange={(value) => { setSort(value); setPage(1) }}
        priceMin={priceMin}
        onPriceMinChange={setPriceMin}
        priceMax={priceMax}
        onPriceMaxChange={setPriceMax}
        onApplyPrice={applyPrice}
        onClear={() => { setPriceMin(''); setPriceMax(''); setAppliedMin(''); setAppliedMax(''); setInput(''); setQ(''); setActiveCats(['All']); setSort('-createdAt'); setPage(1); const np = new URLSearchParams(searchParams); np.delete('categoryId'); np.delete('categoryId[in]'); np.delete('category'); np.delete('keyword'); np.delete('page'); setSearchParams(np, { replace: true }) }}
        visible={filtersVisible}
      />

      {wishError && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{wishError}</div>}

      <div ref={productListRef} className="scroll-mt-28">
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#E7DFD3] bg-white py-12" role="status" aria-label={t('products.loading')}>
            <Spinner />
            <span className="text-sm text-[#8A8078]">{t('products.loading')}</span>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-[#E7DFD3] bg-white py-12 text-center">
            <p className="text-sm text-[#8A8078]">{loadError || t('products.loadError')}</p>
            <button onClick={() => setReload((value) => value + 1)} className="mt-3 text-sm text-[#C19A6B] underline">{t('products.retry')}</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-[#8A8078]">
              <span>{`${t('products.count', { n: formatNumber(filtered.length) })}${pagination ? ` ${t('products.pageOf', { cur: formatNumber(pagination.currentPage || page), total: formatNumber(pagination.numberOfPages || 1) })}` : ''}`}</span>
              {(q || appliedMin || appliedMax || activeCats[0] !== 'All' || page !== 1) && (
                <button onClick={() => { setActiveCats(['All']); setInput(''); setQ(''); setAppliedMin(''); setAppliedMax(''); setPriceMin(''); setPriceMax(''); setPage(1); const np = new URLSearchParams(); setSearchParams(np, { replace: true }) }} className="text-[#C19A6B] underline">{t('products.clearFilters')}</button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={String(p._id || p.id)} product={p} onWishlistError={setWishError} />
              ))}
            </div>
            {filtered.length === 0 && <div className="text-center py-12 bg-white border border-dashed rounded-xl">{t('products.empty')} <button onClick={() => { setActiveCats(['All']); setInput(''); setQ(''); setAppliedMin(''); setAppliedMax(''); setPage(1); const np = new URLSearchParams(searchParams); np.delete('categoryId'); np.delete('categoryId[in]'); np.delete('category'); np.delete('page'); setSearchParams(np, { replace: true }) }} className="text-[#C19A6B] underline">{t('products.clearFilters')}</button></div>}
          </>
        )}
      </div>

      {pagination && (
        <Pagination
          pagination={pagination}
          page={page}
          onPageChange={handlePageChange}
          showFirstLast={true}
        />
      )}
    </div>
  )
}
