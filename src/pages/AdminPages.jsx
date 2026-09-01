import { users, products, galleries, orders } from '../data/mockData'
import { useState } from 'react'
import ProductCard from '../components/ProductCard'

export function AdminUsers(){
  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Admin — Users</h2><span className="text-xs bg-[#4B3621] text-white px-2 py-1 rounded-full self-center">all users + delete/edit</span></div>
      <input placeholder="Search name/email" className="w-full border rounded-full px-4 py-2 text-sm" />
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-left">User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.email} className="border-t"><td className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{u.avatar}</div>{u.name}</td><td className="text-xs">{u.email}</td><td className="text-xs">{u.role}</td><td><span className="px-2 py-0.5 rounded-full text-[11px] bg-green-100 text-green-800">{u.status}</span></td><td><button className="text-xs border px-2 py-1 rounded mr-1">Edit</button><button className="text-xs bg-[#B3402E] text-white px-2 py-1 rounded">Delete</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export function AdminProducts(){
  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Admin — Products</h2><span className="text-xs bg-white border px-2 py-1 rounded-full">Same as products with delete/edit</span></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
export function AdminGalleries(){
  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Admin — Galleries</h2><span className="text-xs bg-white border px-2 py-1 rounded-full">Same galleries with delete/edit</span></div>
      <div className="grid md:grid-cols-2 gap-4">
        {galleries.map(g=>(
          <div key={g.id} className="bg-white border border-[#E7DFD3] rounded-xl p-4 flex gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border flex items-center justify-center font-serif">{g.logo}</div>
            <div className="flex-1"><div className="text-sm font-medium">{g.name}</div><div className="text-xs text-[#8A8078]">{g.city} • {g.products} products</div></div>
            <div className="flex flex-col gap-1"><button className="text-xs border px-3 py-1 rounded">Edit</button><button className="text-xs bg-[#B3402E] text-white px-3 py-1 rounded">Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
export function AdminOrders(){
  const [galleryFilter,setGalleryFilter]=useState('All')
  const [view,setView]=useState('table')
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">Admin — All Orders</h2>
        <div className="flex gap-2">
          <select value={galleryFilter} onChange={e=>setGalleryFilter(e.target.value)} className="border rounded-full px-3 py-1 text-xs bg-white"><option>All</option>{galleries.map(g=><option key={g.id}>{g.name}</option>)}</select>
          <div className="flex border rounded-full overflow-hidden text-xs">
            <button onClick={()=>setView('table')} className={`px-3 py-1 ${view==='table'?'bg-[#4B3621] text-white':''}`}>Table</button>
            <button onClick={()=>setView('board')} className={`px-3 py-1 ${view==='board'?'bg-[#4B3621] text-white':''}`}>Board</button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 text-xs">{['All (4)','Pending (1)','Accepted (1)','Rejected (1)','Cancelled (1)'].map(t=><button key={t} className={`px-3 py-1 rounded-full border ${t.startsWith('All')?'bg-[#4B3621] text-white':'bg-white'}`}>{t}</button>)}</div>
      {view==='table' ? (
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-left">Order</th><th>Customer</th><th>Gallery</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.filter(o=> galleryFilter==='All' || o.gallery===galleryFilter).map(o=>(
                <tr key={o.id} className="border-t"><td className="p-3 font-mono text-xs">{o.id}</td><td className="text-xs">{o.customer}</td><td className="text-xs flex items-center gap-1"><span className="w-6 h-6 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px]">WH</span>{o.gallery}</td><td className="text-center">{o.items}</td><td className="text-center text-xs">{o.total.toLocaleString()} EGP</td><td><select defaultValue={o.status} className="border rounded px-2 py-1 text-xs"><option>pending</option><option>accepted</option><option>rejected</option><option>cancelled</option></select></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['pending','accepted','rejected','cancelled'].map(status=>(
            <div key={status} className="bg-white border border-[#E7DFD3] rounded-xl p-3">
              <div className="text-xs font-semibold capitalize mb-2 flex justify-between"><span>{status}</span><span className="bg-[#FAF7F2] px-2 rounded-full">{orders.filter(o=>o.status===status).length}</span></div>
              <div className="space-y-2">
                {orders.filter(o=>o.status===status).map(o=>(
                  <div key={o.id} className="border rounded-lg p-3 text-xs"><div className="font-mono">{o.id}</div><div className="text-[#8A8078]">{o.gallery} • {o.total.toLocaleString()} EGP</div></div>
                ))}
                {orders.filter(o=>o.status===status).length===0 && <div className="text-[11px] text-[#8A8078] text-center py-4">No orders</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export function AdminOverview(){
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">Admin Overview</h2>
      <div className="grid grid-cols-3 gap-4">
        {[{k:'Users',v:'1,284'},{k:'Galleries',v:'42'},{k:'Orders',v:'3,102'}].map(s=>(
          <div key={s.k} className="bg-white border border-[#E7DFD3] rounded-xl p-4 text-center"><div className="text-xs text-[#8A8078]">{s.k}</div><div className="text-xl font-semibold">{s.v}</div></div>
        ))}
      </div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
        <h3 className="text-sm font-medium mb-2">Platform Note</h3>
        <p className="text-xs text-[#8A8078]">Admin sees platform-wide categories and all orders with gallery filter dropdown (per .ods). Use Table/Board switcher and inline status dropdown. Terminal states (rejected/cancelled) are read-only.</p>
      </div>
    </div>
  )
}
