import { useState } from 'react'
import { products } from '../data/mockData'
export default function ProductDetail(){
  const p = products[0]
  const [qty,setQty]=useState(1)
  const [wish,setWish]=useState(false)
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white"><img src={p.image} alt={p.name} className="w-full h-full object-cover" /></div>
        <div className="grid grid-cols-4 gap-2">
          {[p.image,'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=300&q=80','https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=300&q=80',p.image].map((s,i)=><img key={i} src={s} className="rounded-lg h-20 object-cover border" alt="" />)}
        </div>
      </div>
      <div className="space-y-4">
        <div className="text-xs text-[#8A8078]">Home / Sofas / {p.name}</div>
        <h1 className="font-serif text-3xl text-[#4B3621]">{p.name}</h1>
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-semibold">{p.price.toLocaleString()} EGP</span>
          {p.compare && <span className="line-through text-sm text-[#8A8078]">{p.compare.toLocaleString()} EGP</span>}
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">-17%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#4C7A4C]"></span> In stock ({p.stock}) 
          <span className="px-2 py-0.5 bg-[#E7DFD3] rounded-full">W 200 × D 90 × H 75 cm</span>
        </div>
        <p className="text-sm text-[#8A8078]">{p.desc} Crafted from premium materials with attention to joinery and finish. Dimensions and materials are customizable per gallery.</p>
        <div className="flex gap-2">
          <span className="text-xs border px-2 py-1 rounded-full">Oak</span><span className="text-xs border px-2 py-1 rounded-full">Bouclé</span><span className="text-xs border px-2 py-1 rounded-full">Brass</span>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center border rounded-lg">
            <button onClick={()=>setQty(Math.max(1,qty-1))} className="px-3 py-1.5">−</button>
            <span className="px-3 text-sm">{qty}</span>
            <button onClick={()=>setQty(qty+1)} className="px-3 py-1.5">+</button>
          </div>
          <button className="flex-1 bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium">Add to Cart</button>
          <button onClick={()=>setWish(!wish)} className={`w-10 h-10 rounded-lg border flex items-center justify-center ${wish?'bg-[#C19A6B] text-white border-[#C19A6B]':''}`}><span className={`material-symbols-outlined ${wish?'icon-fill':''}`}>favorite</span></button>
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border flex items-center justify-center">SK</div>
            <div><div className="text-sm font-medium">Studio Kairo</div><div className="text-xs text-[#8A8078]">Cairo · Egypt</div></div>
          </div>
          <button className="text-xs border px-3 py-1.5 rounded-full">View Gallery</button>
        </div>
      </div>
    </div>
  )
}
