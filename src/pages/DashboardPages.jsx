import { products, orders } from '../data/mockData'
import { useState } from 'react'

export function Overview(){
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {k:'Total Products', v:'24', c:'bg-white'},
          {k:'Pending Orders', v:'7', c:'bg-amber-50'},
          {k:'Employees', v:'4', c:'bg-white'},
          {k:'Revenue (Aug)', v:'48,200 EGP', c:'bg-green-50'},
        ].map(s=>(
          <div key={s.k} className={`border border-[#E7DFD3] rounded-xl p-4 ${s.c}`}><div className="text-xs text-[#8A8078]">{s.k}</div><div className="text-xl font-semibold">{s.v}</div></div>
        ))}
      </div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
        <h3 className="font-medium mb-3">Recent Orders</h3>
        <div className="space-y-2">
          {orders.slice(0,3).map(o=>(
            <div key={o.id} className="flex justify-between text-sm border-b py-2"><span>{o.id} • {o.gallery}</span><span className="text-[#8A8078]">{o.status}</span><span>{o.total.toLocaleString()} EGP</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}
export function MyGallery(){
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">My Gallery</h2>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-medium">Brand</label>
          <div className="mt-2 flex gap-4">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border-2 border-dashed flex items-center justify-center text-xs">Logo</div>
            <div className="flex-1 border-2 border-dashed rounded-xl h-20 flex items-center justify-center text-xs text-[#8A8078]">Banner uploader (drag & drop)</div>
          </div>
          <div className="mt-4 space-y-3">
            <div><label className="text-xs">Gallery name*</label><input defaultValue="Walnut House" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /><div className="text-[11px] text-[#8A8078]">URL: /galleries/walnut-house</div></div>
            <div><label className="text-xs">Description* (255)</label><textarea defaultValue="Family-run showroom since 2012." className="w-full border rounded-lg px-3 py-2 text-sm mt-1" rows={3} /><div className="text-[11px] text-right text-[#8A8078]">32 / 255</div></div>
          </div>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs">Country</label><input defaultValue="Egypt" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">City</label><input defaultValue="Cairo" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">Street</label><input placeholder="Optional" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
          <div><label className="text-xs">Map address URL</label><input placeholder="Paste Google Maps link" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs">Phone</label><input placeholder="Optional" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <button className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm mt-4">Save Gallery</button>
        </div>
      </div>
    </div>
  )
}
export function MyProducts(){
  const [filter,setFilter]=useState('All')
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">My Products</h2>
        <button className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-sm">+ Add Product</button>
      </div>
      <div className="flex gap-2">
        {['All','Active','Draft','Archived'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full text-xs border ${filter===f?'bg-[#4B3621] text-white':'bg-white'}`}>{f}</button>
        ))}
        <input placeholder="Search by name" className="ml-auto border rounded-full px-3 py-1 text-xs" />
      </div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="text-left p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id} className="border-t">
                  <td className="p-3 flex items-center gap-2"><img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />{p.name}</td>
                  <td className="text-center text-xs">{p.category}</td>
                  <td className="text-center">{p.price.toLocaleString()} EGP</td>
                  <td className={`text-center ${p.stock<=3?'text-amber-600':''}`}>{p.stock}</td>
                  <td className="text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] ${p.status==='active'?'bg-green-100 text-green-800': p.status==='draft'?'bg-amber-100 text-amber-800':'bg-zinc-100'}`}>{p.status}</span></td>
                  <td className="text-center"><button className="text-xs border px-2 py-1 rounded mr-1">Edit</button><button className="text-xs text-[#B3402E]">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export function AddEditProduct(){
  return (
    <div className="space-y-4 max-w-5xl">
      <h2 className="font-serif text-2xl">Add / Edit Product</h2>
      <div className="grid md:grid-cols-[1fr_340px] gap-6">
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
          <div><label className="text-xs font-medium">Name* (slug: /products/oak-dining-table)</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Oak Dining Table" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">Category*</label><select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"><option>Sofas · صوفا</option><option>Tables</option></select></div><div><label className="text-xs">Price*</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="12500" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">Compare-at price</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="13900" /></div><div><label className="text-xs">Stock</label><input type="number" defaultValue={5} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
          <div className="flex gap-2 text-xs"><span className="px-3 py-1 rounded-full bg-[#4B3621] text-white">Draft</span><span className="px-3 py-1 rounded-full border">Active</span><span className="px-3 py-1 rounded-full border">Archived</span></div>
          <div><label className="text-xs">Dimensions</label><input placeholder="W 200 × D 90 × H 75 cm" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs">Materials (type + Enter)</label><div className="flex gap-2 mt-1"><span className="border px-2 py-1 rounded-full text-xs">Oak ✕</span><span className="border px-2 py-1 rounded-full text-xs">Brass ✕</span><input className="flex-1 border rounded-full px-3 py-1 text-xs" placeholder="Add material" /></div></div>
          <div><label className="text-xs">Description (1000)</label><textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Describe the piece..." /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Featured — show on homepage</label>
          <div className="flex gap-3"><button className="border px-4 py-2 rounded-lg text-sm">Cancel</button><button className="bg-[#4B3621] text-white px-6 py-2 rounded-lg text-sm">Save Product</button></div>
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 space-y-3 h-fit">
          <div className="border-2 border-dashed rounded-xl h-40 flex items-center justify-center text-xs text-[#8A8078]">Main image dropzone — drag & drop</div>
          <div className="grid grid-cols-3 gap-2"><div className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-[10px]">+</div><div className="h-20 bg-cover rounded-lg" style={{backgroundImage:`url(${products[0].image})`}} /><div className="h-20 bg-cover rounded-lg" style={{backgroundImage:`url(${products[1].image})`}} /></div>
          <p className="text-[11px] text-[#8A8078]">Preview with Replace • reorder handles • remove on hover</p>
        </div>
      </div>
    </div>
  )
}
export function GalleryOrders(){
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">Gallery Orders</h2>
      <div className="flex gap-2"><input placeholder="Search order / customer" className="border rounded-full px-3 py-1.5 text-sm flex-1" /><select className="border rounded-full px-3 py-1.5 text-sm bg-white"><option>All Status</option><option>pending</option><option>accepted</option></select></div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-left">Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map(o=>(
              <tr key={o.id} className="border-t"><td className="p-3 font-mono text-xs">{o.id}<div className="text-[11px] text-[#8A8078]">{o.date}</div></td><td className="text-xs">{o.customer}<div className="text-[11px] text-[#8A8078]">{o.gallery}</div></td><td className="text-center">{o.items}</td><td className="text-center">{o.total.toLocaleString()} EGP</td><td><span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100">{o.status}</span></td><td><button className="text-xs border px-2 py-1 rounded">View</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export function OrderDetails(){
  const o = orders[0]
  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="font-serif text-2xl">Order {o.id}</h2>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
        <div className="flex justify-between"><span className="text-sm">{o.date} • {o.gallery}</span><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs">{o.status}</span></div>
        <div className="space-y-2">
          {[{name:'Oak Dining Table', price:1250, qty:2, img:products[5].image},{name:'Walnut Bench', price:480, qty:1, img:products[3].image}].map(it=>(
            <div key={it.name} className="flex gap-3 border-t py-3"><img src={it.img} className="w-16 h-16 rounded object-cover" alt="" /><div className="flex-1"><div className="text-sm font-medium">{it.name}</div><div className="text-xs text-[#8A8078]">{it.price.toLocaleString()} EGP × {it.qty}</div></div><div className="text-sm">{(it.price*it.qty).toLocaleString()} EGP</div></div>
          ))}
        </div>
        <div className="bg-[#FAF7F2] rounded-lg p-3 text-xs"><div className="font-medium">Shipping address</div><div className="text-[#8A8078]">12 El Hegaz St, Cairo, Egypt — Apt 4</div><div className="font-medium mt-2">Note</div><div className="text-[#8A8078]">Please deliver after 5pm</div></div>
        <div className="flex justify-between font-semibold"><span>Grand total</span><span>{o.total.toLocaleString()} EGP</span></div>
      </div>
    </div>
  )
}
export function Employees(){
  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Employees</h2><button className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-sm">+ Add Employee</button></div>
      <input placeholder="Search by name/email" className="w-full border rounded-full px-4 py-2 text-sm" />
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-left">Employee</th><th>Job title</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {[
              {name:'Sara Ahmed', title:'Sales', email:'sara@walnut.test', active:true, date:'Jan 12, 2024'},
              {name:'Khaled N.', title:'Inventory', email:'khaled@walnut.test', active:true, date:'Mar 3, 2024'},
            ].map(e=>(
              <tr key={e.email} className="border-t"><td className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{e.name.split(' ').map(s=>s[0]).join('')}</div>{e.name}</td><td className="text-center text-xs">{e.title}</td><td className="text-xs">{e.email}</td><td className="text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] ${e.active?'bg-green-100 text-green-800':'bg-zinc-100'}`}>{e.active?'Active':'Inactive'}</span></td><td className="text-xs">{e.date}</td><td className="text-center"><button className="text-xs border px-2 py-1 rounded">Edit</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export function AddEmployee(){
  return (
    <div className="max-w-xl mx-auto bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
      <h2 className="font-serif text-xl">Add Employee</h2>
      <p className="text-xs text-[#8A8078] bg-amber-50 border border-amber-200 rounded p-2">This employee will automatically belong to your gallery.</p>
      <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">First name*</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">Last name*</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
      <div><label className="text-xs">Email* (unique)</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="employee@gallery.test" /></div>
      <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">Temporary password* (min 6)</label><input type="password" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">Confirm*</label><input type="password" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
      <div><label className="text-xs">Job title</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Sales, Inventory..." /></div>
      <div><label className="text-xs">Phone</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
      <div className="flex gap-3"><button className="flex-1 border py-2 rounded-lg text-sm">Cancel</button><button className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm">Create Employee</button></div>
    </div>
  )
}
export function CreateGallery(){
  return <MyGallery />
}
