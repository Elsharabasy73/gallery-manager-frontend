import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { products as mockProducts } from '../data/mockData'
import { useRole } from '../context/RoleContext'
import { getProducts, unwrapProducts } from '../api/products'
import { getCategories, unwrapCategories } from '../api/categories'
import { getProductImageUrl } from '../utils/image'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price low→high' },
  { value: '-price', label: 'Price high→low' },
]

export default function Products() {
  const navigate = useNavigate()
  const { role } = useRole()
  const [searchParams] = useSearchParams()

  const [apiCategories, setApiCategories] = useState([])
  const categories = apiCategories.length ? ['All', ...apiCategories.map((c) => c.name)] : ['All', 'Sofas', 'Tables', 'Seating', 'Lighting', 'Decor']

  const [activeCats, setActiveCats] = useState(['All'])
  const [input, setInput] = useState(searchParams.get('keyword') || '')
  const [q, setQ] = useState(searchParams.get('keyword') || '')
  const doSearch = () => setQ(input.trim())

  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt')

  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [appliedMin, setAppliedMin] = useState('')
  const [appliedMax, setAppliedMax] = useState('')
  const applyPrice = () => { setAppliedMin(priceMin.trim()); setAppliedMax(priceMax.trim()) }

  const [items, setItems] = useState(mockProducts)
  const [loading, setLoading] = useState(false)

  const toggle = (c) => {
    if (c === 'All') setActiveCats(['All'])
    else {
      let next = activeCats.includes(c) ? activeCats.filter((x) => x !== c) : [...activeCats.filter((x) => x !== 'All'), c]
      if (next.length === 0) next = ['All']
      setActiveCats(next)
    }
  }

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
      try {
        const params = {
          limit: 12,
          page: 1,
          sort,
          fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,gallery[id,name,slug],category[id,name,slug]',
        }
        if (q) params.keyword = q
        if (appliedMin) params['price[gte]'] = appliedMin
        if (appliedMax) params['price[lte]'] = appliedMax
        if (activeCats.length === 1 && activeCats[0] !== 'All') {
          const cat = apiCategories.find((c) => c.name === activeCats[0])
          if (cat?.id) params.categoryId = cat.id
        }
        const res = await getProducts(params)
        if (cancelled) return
        const data = unwrapProducts(res)
        if (data.length) setItems(data)
        else if (res?.results === 0) setItems([])
      } catch {
        if (!cancelled) setItems(mockProducts)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [q, sort, appliedMin, appliedMax, activeCats, apiCategories])

  const filtered = items.filter((p) => {
    const catName = p.category?.name || p.category || ''
    const catOk = activeCats.includes('All') || activeCats.includes(catName) || activeCats.includes(p.category)
    const qOk = !q || p.name.toLowerCase().includes(q.toLowerCase())
    return catOk && qOk
  })

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 sticky top-[88px] z-30">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] border border-[#E7DFD3] rounded-full px-4 py-2 w-full min-w-0">
            <span className="material-symbols-outlined text-[#8A8078]">search</span>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }} placeholder="Search furniture..." className="bg-transparent outline-none flex-1 text-sm min-w-0" />
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button onClick={doSearch} className="flex-1 md:flex-none bg-[#4B3621] text-white px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap">Search</button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="flex-1 md:flex-none border border-[#E7DFD3] rounded-full px-3 py-2 text-sm bg-white min-w-[140px]">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-3 pb-1">
          {categories.map((c) => {
            const active = activeCats.includes(c)
            return (
              <button key={c} onClick={() => toggle(c)} className={`shrink-0 px-4 py-1.5 rounded-full text-sm border ${active ? 'bg-[#4B3621] text-white border-[#4B3621]' : 'bg-white border-[#E7DFD3]'}`}>{c} {c !== 'All' && <span className="text-[11px] opacity-60">· {c === 'Sofas' ? 'صوفا' : c === 'Tables' ? 'طاولات' : ''}</span>}</button>
            )
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="flex gap-2 flex-1 min-w-0">
            <input type="number" inputMode="numeric" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min price" className="flex-1 min-w-0 border border-[#E7DFD3] rounded-full px-4 py-1.5 text-sm bg-[#FAF7F2]" />
            <input type="number" inputMode="numeric" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max price" className="flex-1 min-w-0 border border-[#E7DFD3] rounded-full px-4 py-1.5 text-sm bg-[#FAF7F2]" />
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={applyPrice} className="px-4 py-1.5 rounded-full border text-sm bg-white whitespace-nowrap">Apply</button>
            <button onClick={() => { setPriceMin(''); setPriceMax(''); setAppliedMin(''); setAppliedMax(''); setInput(''); setQ(''); setActiveCats(['All']); setSort('-createdAt') }} className="px-3 py-1.5 text-sm text-[#8A8078] whitespace-nowrap">Clear</button>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-4 text-sm text-[#8A8078]">Loading…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => {
          const img = getProductImageUrl(p) || p.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
          const galleryName = p.gallery?.name || p.gallery || ''
          const catName = p.category?.name || p.category || ''
          return (
            <div key={p.id} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden group">
              <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                {Number(p.stock) === 0 && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-[#4B3621] text-white text-xs px-3 py-1 rounded-full">Out of stock</span></div>}
                {role === 'admin' && <div className="absolute top-2 left-2 flex gap-1"><span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full">Admin</span></div>}
              </div>
              <div className="p-4">
                <div className="flex justify-between gap-2">
                  <h3 className="font-medium text-sm truncate">{p.name}</h3>
                  <span className="text-sm font-semibold whitespace-nowrap">{Number(p.price).toLocaleString()} EGP</span>
                </div>
                <div className="text-xs text-[#8A8078] truncate">{galleryName}{galleryName && catName ? ' • ' : ''}{catName}</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigate(`/products/${p.id}`)} className="flex-1 border py-1.5 rounded-lg text-xs">View</button>
                  {role === 'admin' && <><button className="px-3 py-1.5 rounded-lg bg-white border text-xs">Edit</button><button className="px-3 py-1.5 rounded-lg bg-[#B3402E] text-white text-xs">Delete</button></>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length === 0 && !loading && <div className="text-center py-12 bg-white border border-dashed rounded-xl">No products — <button onClick={() => { setActiveCats(['All']); setInput(''); setQ(''); setAppliedMin(''); setAppliedMax('') }} className="text-[#C19A6B] underline">Clear filters</button></div>}
    </div>
  )
}
