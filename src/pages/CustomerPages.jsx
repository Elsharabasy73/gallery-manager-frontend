import { products, orders } from '../data/mockData'
import { useState } from 'react'

export function Wishlist(){
  const [items,setItems]=useState(products.slice(0,3))
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl">Wishlist <span className="text-sm text-[#8A8078]">({items.length} saved)</span></h2>
        <button className="border px-4 py-1.5 rounded-full text-xs">Add all to cart</button>
      </div>
      {items.length===0? <div className="text-center py-12 bg-white border border-dashed rounded-xl">No saved items — Discover products</div> :
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(p=>(
          <div key={p.id} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
            <img src={p.image} alt={p.name} className="aspect-[4/3] object-cover w-full" />
            <div className="p-3">
              <div className="flex justify-between"><span className="text-sm font-medium">{p.name}</span><span className="text-sm">{p.price.toLocaleString()} EGP</span></div>
              <div className="flex gap-2 mt-3"><button onClick={()=>setItems(items.filter(x=>x.id!==p.id))} className="flex-1 border py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[16px] icon-fill text-[#C19A6B]">favorite</span> Remove</button><button className="flex-1 bg-[#4B3621] text-white py-1.5 rounded-lg text-xs">Move to Cart</button></div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}
export function Cart(){
  const groups = [
    { gallery:'Walnut House', logo:'WH', items:[{...products[5], qty:2},{...products[3], qty:1}] },
    { gallery:'Cairo Living', logo:'CL', items:[{...products[4], qty:1}] },
  ]
  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-4">
        <h2 className="font-serif text-2xl">Cart (3)</h2>
        {groups.map(g=>(
          <div key={g.gallery} className="bg-white border border-[#E7DFD3] rounded-xl p-4">
            <div className="flex items-center gap-2 font-medium text-sm mb-3"><div className="w-7 h-7 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{g.logo}</div>{g.gallery}</div>
            {g.items.map(item=>(
              <div key={item.id} className="flex gap-3 py-3 border-t">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-[#8A8078]">{item.price.toLocaleString()} EGP × {item.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg"><button className="px-2">−</button><span className="px-2 text-xs">{item.qty}</span><button className="px-2">+</button></div>
                  <button className="w-7 h-7 border rounded flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3">
              <span className="text-sm">Subtotal: <b>{g.items.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString()} EGP</b></span>
              <button className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-xs">Checkout this gallery</button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 h-fit sticky top-[88px]">
        <h3 className="font-medium text-sm mb-3">Summary</h3>
        <div className="text-xs space-y-2 text-[#8A8078]"><div className="flex justify-between"><span>Total items</span><span>4</span></div><div className="flex justify-between"><span>Total value</span><span className="font-semibold text-[#4B3621]">3,880 EGP</span></div></div>
        <p className="text-[11px] text-[#8A8078] mt-3">Pay later with the gallery — no payment UI yet.</p>
      </div>
    </div>
  )
}
export function MyOrders(){
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">My Orders</h2>
      <div className="flex gap-2 overflow-x-auto">
        {['All (4)','Pending (1)','Accepted (1)','Rejected (1)','Cancelled (1)'].map(t=>(
          <button key={t} className={`shrink-0 px-3 py-1 rounded-full text-xs border ${t.startsWith('All')?'bg-[#4B3621] text-white': 'bg-white'}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {orders.filter(o=>o.customer==='Alexandra Hayes').map(o=>(
          <div key={o.id} className="bg-white border border-[#E7DFD3] rounded-xl p-4">
            <div className="flex justify-between text-xs">
              <span className="font-mono">{o.id} • {o.date}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${o.status==='pending'?'bg-amber-100 text-amber-800': o.status==='accepted'?'bg-green-100 text-green-800': o.status==='rejected'?'bg-red-100 text-red-800':'bg-zinc-100'}`}>{o.status}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm"><div className="w-6 h-6 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px]">WH</div>{o.gallery} • {o.items} items • {o.total.toLocaleString()} EGP</div>
            {o.status==='pending' && <button className="mt-3 text-xs border border-[#B3402E] text-[#B3402E] px-3 py-1 rounded-full">Cancel order</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
