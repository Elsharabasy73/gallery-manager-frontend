import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { products } from '../data/mockData'
import { useRole } from '../context/RoleContext'

const categories = ['All','Sofas','Tables','Seating','Lighting','Decor']

export default function Products(){
  const navigate = useNavigate()
  const { role } = useRole()
  const [activeCats, setActiveCats] = useState(['All'])
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const doSearch = () => setQ(input.trim())
  const toggle = (c)=>{
    if(c==='All') setActiveCats(['All'])
    else {
      let next = activeCats.includes(c) ? activeCats.filter(x=>x!==c) : [...activeCats.filter(x=>x!=='All'), c]
      if(next.length===0) next=['All']
      setActiveCats(next)
    }
  }
  const filtered = products.filter(p=>{
    const catOk = activeCats.includes('All') || activeCats.includes(p.category)
    const qOk = !q || p.name.toLowerCase().includes(q.toLowerCase())
    return catOk && qOk
  })
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 sticky top-[88px] z-30">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] border border-[#E7DFD3] rounded-full px-4 py-2 w-full">
            <span className="material-symbols-outlined text-[#8A8078]">search</span>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') doSearch() }} placeholder="Search furniture..." className="bg-transparent outline-none flex-1 text-sm" />
          </div>
          <button onClick={doSearch} className="bg-[#4B3621] text-white px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap">Search</button>
          <select className="border border-[#E7DFD3] rounded-full px-3 py-2 text-sm bg-white"><option>Newest</option><option>Price low→high</option><option>Price high→low</option></select>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-3">
          {categories.map(c=>{
            const active = activeCats.includes(c)
            return (
              <button key={c} onClick={()=>toggle(c)} className={`shrink-0 px-4 py-1.5 rounded-full text-sm border ${active?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white border-[#E7DFD3]'}`}>{c} {c!=='All' && <span className="text-[11px] opacity-60">· {c==='Sofas'?'صوفا':c==='Tables'?'طاولات':''}</span>}</button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p=>(
          <div key={p.id} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden group">
            <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={()=>navigate(`/products/${p.id}`)}>
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              {p.stock===0 && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-[#4B3621] text-white text-xs px-3 py-1 rounded-full">Out of stock</span></div>}
              {role==='admin' && <div className="absolute top-2 left-2 flex gap-1"><span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full">Admin</span></div>}
            </div>
            <div className="p-4">
              <div className="flex justify-between">
                <h3 className="font-medium text-sm">{p.name}</h3>
                <span className="text-sm font-semibold">{p.price.toLocaleString()} EGP</span>
              </div>
              <div className="text-xs text-[#8A8078]">{p.gallery} • {p.category}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={()=>navigate(`/products/${p.id}`)} className="flex-1 border py-1.5 rounded-lg text-xs">View</button>
                {role==='admin' && <><button className="px-3 py-1.5 rounded-lg bg-white border text-xs">Edit</button><button className="px-3 py-1.5 rounded-lg bg-[#B3402E] text-white text-xs">Delete</button></>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length===0 && <div className="text-center py-12 bg-white border border-dashed rounded-xl">No products — <button onClick={()=>{setActiveCats(['All']); setInput(''); setQ('')}} className="text-[#C19A6B] underline">Clear filters</button></div>}
    </div>
  )
}
