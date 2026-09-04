import { users, orders, galleries as mockGalleries } from '../data/mockData'
import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts, unwrapProducts, updateProduct, deleteProduct } from '../api/products'
import { getGalleries, unwrapGalleries, updateGallery, deleteGallery } from '../api/galleries'
import { getUsers, unwrapUsers, deleteUser, updateUser } from '../api/users'
import { apiFetch } from '../api/client'
import { getProductImageUrl, getGalleryLogoUrl, getGalleryBannerUrl } from '../utils/image'

export function AdminUsers(){
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [actionMsg, setActionMsg] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ firstName:'', lastName:'', email:'', phone:'', role:'user', isActive: true })
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { limit: 20, page }
      if (search) params.keyword = search
      const res = await getUsers(params)
      const data = unwrapUsers(res)
      setUsersList(data)
      setPagination(res?.paginationResult || res?.pagination || null)
    } catch (err) {
      setError(err.message || 'Failed to load users')
      setUsersList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchUsers() }, [page, search])

  const handleSearch = () => { setPage(1); setSearch(searchInput.trim()) }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    setDeletingId(id)
    setActionMsg('')
    try {
      await deleteUser(id)
      setUsersList(prev => prev.filter(u => (u.id||u._id) !== id))
      setActionMsg('User deleted')
    } catch (err) {
      setActionMsg(err.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (u) => {
    setEditing(u)
    // backend role is `user` (frontend alias `customer` maps to it)
    const normalizedRole = u.role === 'customer' ? 'user' : u.role
    setEditForm({
      firstName: u.firstName || (u.name ? u.name.split(' ')[0] : '') || '',
      lastName: u.lastName || (u.name ? u.name.split(' ').slice(1).join(' ') : '') || '',
      email: u.email || '',
      phone: u.phone || '',
      role: normalizedRole === 'admin' ? 'user' : (normalizedRole || 'user'), // never prefill admin for editing
      isActive: u.isActive ?? (u.status === 'active' ? true : u.status === 'inactive' ? false : true),
    })
    setActionMsg('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editing) return
    const id = editing.id || editing._id
    if (!editForm.firstName.trim() || !editForm.email.trim()) { setActionMsg('First name and email required'); return }
    if (editForm.role === 'admin') { setActionMsg("Admins cannot assign 'admin' role"); return }
    setSaving(true)
    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        role: editForm.role,
        isActive: editForm.isActive,
      }
      // remove empty phone so it doesn't overwrite with empty string if not needed
      if (!payload.phone) delete payload.phone
      if (!payload.lastName) delete payload.lastName
      await updateUser(id, payload)
      setUsersList(prev => prev.map(x => (x.id||x._id)===id ? { ...x, ...payload, name: `${payload.firstName} ${payload.lastName||''}`.trim() } : x))
      setEditing(null)
      setActionMsg('User updated')
    } catch (err) {
      setActionMsg(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  // fallback to mock if API empty and no search (for demo) + client-side search for when API keyword not supported
  const baseList = usersList.length ? usersList : (!loading && !error && !search ? users : [])
  const q = search.toLowerCase()
  const displayUsers = q ? baseList.filter(u => {
    const name = (u.name || `${u.firstName||''} ${u.lastName||''}`.trim() || '').toLowerCase()
    const email = (u.email||'').toLowerCase()
    const role = (u.role||'').toLowerCase()
    return name.includes(q) || email.includes(q) || role.includes(q)
  }) : baseList

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Admin — Users</h2><span className="text-xs bg-[#4B3621] text-white px-2 py-1 rounded-full self-center">GET /users • DELETE /users/:id</span></div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px]">search</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder="Search name/email" className="flex-1 outline-none text-sm" />
        </div>
        <button onClick={handleSearch} className="bg-[#4B3621] text-white px-4 py-2 rounded-full text-sm">Search</button>
        <button onClick={()=>{setSearch(''); setSearchInput(''); setPage(1)}} className="border px-3 py-2 rounded-full text-sm bg-white">Clear</button>
      </div>
      {actionMsg && <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">Loading users...</div> : displayUsers.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">No users</div> : (
        <>
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-left">User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {displayUsers.map(u=>{
                const uid = u.id || u._id || u.email
                const name = u.name || `${u.firstName||''} ${u.lastName||''}`.trim() || u.email
                const avatar = u.avatar || (name ? name.slice(0,2).toUpperCase() : 'U')
                const email = u.email
                const role = u.role
                const status = u.isActive ?? u.status ?? 'active'
                const isActive = status === 'active' || status === true
                return (
                <tr key={uid} className="border-t"><td className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{avatar}</div>{name}</td><td className="text-xs">{email}</td><td className="text-xs">{role}</td><td><span className={`px-2 py-0.5 rounded-full text-[11px] ${isActive?'bg-green-100 text-green-800':'bg-zinc-100'}`}>{isActive?'active':'inactive'}</span></td><td><div className="flex items-center gap-1 whitespace-nowrap"><button onClick={()=>startEdit(u)} className="text-xs border px-2 py-1 rounded hover:bg-[#FAF7F2]">Edit</button><button onClick={()=>handleDelete(uid)} disabled={deletingId===uid} className="text-xs bg-[#B3402E] text-white px-2 py-1 rounded disabled:opacity-60">{deletingId===uid?'Deleting...':'Delete'}</button></div></td></tr>
              )})}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="flex justify-center items-center gap-2 pt-2">
            <button disabled={!pagination.prev && page===1} onClick={()=>setPage(x=>Math.max(1,x-1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">Prev</button>
            <span className="text-sm text-[#8A8078]">Page {pagination.currentPage || page} / {pagination.numberOfPages || 1}</span>
            <button disabled={!pagination.next && pagination?.numberOfPages && page>=pagination.numberOfPages} onClick={()=>setPage(x=>x+1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">Next</button>
          </div>
        )}
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setEditing(null)}>
          <form onClick={e=>e.stopPropagation()} onSubmit={handleUpdate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-medium">Edit User {editing.id || editing._id}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs">First Name*</label><input value={editForm.firstName} onChange={e=>setEditForm(s=>({...s,firstName:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div><label className="text-xs">Last Name</label><input value={editForm.lastName} onChange={e=>setEditForm(s=>({...s,lastName:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            </div>
            <div><label className="text-xs">Email*</label><input value={editForm.email} onChange={e=>setEditForm(s=>({...s,email:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs">Phone</label><input value={editForm.phone} onChange={e=>setEditForm(s=>({...s,phone:e.target.value}))} placeholder="+20..." className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs">Role</label><select value={editForm.role} onChange={e=>setEditForm(s=>({...s,role:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"><option value="user">user</option><option value="gallery_owner">gallery_owner</option><option value="employee">employee</option></select><p className="text-[11px] text-[#8A8078] mt-1">Admin role is blocked — admin cannot create another admin. Backend uses `user` not `customer`.</p></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={editForm.isActive} onChange={e=>setEditForm(s=>({...s,isActive:e.target.checked}))} id="isActive" /><label htmlFor="isActive" className="text-xs">Active (isActive)</label></div>
            <div className="flex gap-3"><button type="button" onClick={()=>setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?'Saving...':'Save'}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
export function AdminProducts(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name:'', price:'', stock:'', status:'active' })
  const [saving, setSaving] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        limit: 12,
        page,
        sort: '-createdAt',
        fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,gallery[id,name,slug],category[id,name,slug]',
      }
      if (search) params.keyword = search
      const res = await getProducts(params)
      const data = unwrapProducts(res)
      setProducts(data)
      setPagination(res?.paginationResult || res?.pagination || null)
    } catch (err) {
      setError(err.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    setDeletingId(id)
    setActionMsg('')
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => (p.id||p._id) !== id))
      setActionMsg('Product deleted')
    } catch (err) {
      setActionMsg(err.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (p) => {
    setEditing(p)
    setEditForm({
      name: p.name || '',
      price: String(p.price ?? ''),
      stock: String(p.stock ?? ''),
      status: p.status || 'active',
    })
    setActionMsg('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editing) return
    const id = editing.id || editing._id
    if (!editForm.name.trim()) { setActionMsg('Name required'); return }
    setSaving(true)
    try {
      // only schema fields, no isFeatured
      const payload = {
        name: editForm.name.trim(),
        price: Number(editForm.price),
        stock: parseInt(editForm.stock, 10),
        status: editForm.status,
      }
      await updateProduct(id, payload)
      setProducts(prev => prev.map(p => (p.id||p._id)===id ? { ...p, ...payload } : p))
      setEditing(null)
      setActionMsg('Product updated')
    } catch (err) {
      setActionMsg(err.message || 'Update failed')
      if (err.details) setActionMsg(typeof err.details==='string'?err.details:JSON.stringify(err.details))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Admin — Products</h2><span className="text-xs bg-white border px-2 py-1 rounded-full">GET /products • PUT /products/:id • DELETE /products/:id</span></div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px]">search</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder="Search products..." className="flex-1 outline-none text-sm" />
        </div>
        <button onClick={handleSearch} className="bg-[#4B3621] text-white px-4 py-2 rounded-full text-sm">Search</button>
        <button onClick={()=>{setSearch(''); setSearchInput(''); setPage(1)}} className="border px-3 py-2 rounded-full text-sm bg-white">Clear</button>
      </div>
      {actionMsg && <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">Loading products...</div> : products.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">No products</div> : (
        <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const pid = p.id || p._id
            return (
              <ProductCard key={pid} product={p} onEdit={()=>startEdit(p)} onDelete={()=>handleDelete(pid)} deleting={deletingId===pid} />
            )
          })}
        </div>
        {pagination && (
          <div className="flex justify-center items-center gap-2 pt-2">
            <button disabled={!pagination.prev && page===1} onClick={()=>setPage(x=>Math.max(1,x-1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">Prev</button>
            <span className="text-sm text-[#8A8078]">Page {pagination.currentPage || page} / {pagination.numberOfPages || 1}</span>
            <button disabled={!pagination.next && pagination?.numberOfPages && page>=pagination.numberOfPages} onClick={()=>setPage(x=>x+1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">Next</button>
          </div>
        )}
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setEditing(null)}>
          <form onClick={e=>e.stopPropagation()} onSubmit={handleUpdate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-medium">Edit Product {editing.id || editing._id}</h3>
            <div><label className="text-xs">Name*</label><input value={editForm.name} onChange={e=>setEditForm(s=>({...s,name:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">Price*</label><input type="number" value={editForm.price} onChange={e=>setEditForm(s=>({...s,price:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">Stock</label><input type="number" value={editForm.stock} onChange={e=>setEditForm(s=>({...s,stock:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
            <div><label className="text-xs">Status</label><div className="flex gap-2 mt-1 text-xs">{['draft','active','archived'].map(s=> <button key={s} type="button" onClick={()=>setEditForm(f=>({...f,status:s}))} className={`px-3 py-1 rounded-full border capitalize ${editForm.status===s?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white'}`}>{s}</button>)}</div></div>
            <div className="flex gap-3"><button type="button" onClick={()=>setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?'Saving...':'Save'}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
export function AdminGalleries(){
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name:'', city:'', country:'', description:'' })
  const [saving, setSaving] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  const fetchGalleries = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { limit: 12, page, sort: '-createdAt', fields: 'id,name,slug,city,country,logo,banner,storageFolder,description' }
      if (search) params.keyword = search
      const res = await getGalleries(params)
      const data = unwrapGalleries(res)
      setGalleries(data.length ? data : [])
      setPagination(res?.paginationResult || res?.pagination || null)
      if (data.length===0 && !search) setGalleries(mockGalleries)
    } catch (err) {
      setError(err.message || 'Failed to load galleries')
      setGalleries(mockGalleries)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchGalleries() }, [page, search])

  const handleSearch = () => { setPage(1); setSearch(searchInput.trim()) }

  const handleDelete = async (id) => {
    if (!confirm('Delete this gallery?')) return
    setDeletingId(id)
    try {
      await deleteGallery(id)
      setGalleries(prev => prev.filter(g=> (g.id||g._id)!==id))
      setActionMsg('Gallery deleted')
    } catch (err) {
      setActionMsg(err.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (g) => {
    setEditing(g)
    setEditForm({ name: g.name||'', city: g.city||'', country: g.country||'', description: g.description||'' })
    setActionMsg('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editing) return
    const id = editing.id || editing._id
    if (!editForm.name.trim()) { setActionMsg('Name required'); return }
    setSaving(true)
    try {
      const payload = { name: editForm.name.trim(), city: editForm.city.trim(), country: editForm.country.trim(), description: editForm.description }
      await updateGallery(id, payload)
      setGalleries(prev => prev.map(g => (g.id||g._id)===id ? { ...g, ...payload } : g))
      setEditing(null)
      setActionMsg('Gallery updated')
    } catch (err) {
      setActionMsg(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Admin — Galleries</h2><span className="text-xs bg-white border px-2 py-1 rounded-full">GET /galleries • PUT /galleries/:id • DELETE /galleries/:id</span></div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px]">search</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder="Search galleries..." className="flex-1 outline-none text-sm" />
        </div>
        <button onClick={handleSearch} className="bg-[#4B3621] text-white px-4 py-2 rounded-full text-sm">Search</button>
        <button onClick={()=>{setSearch(''); setSearchInput(''); setPage(1)}} className="border px-3 py-2 rounded-full text-sm bg-white">Clear</button>
      </div>
      {actionMsg && <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">Loading galleries...</div> : galleries.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">No galleries</div> : (
        <>
        <div className="grid md:grid-cols-2 gap-4">
          {galleries.map(g=>{
            const gid = g.id || g._id
            const logoUrl = getGalleryLogoUrl(g)
            const bannerUrl = getGalleryBannerUrl(g)
            return (
            <div key={gid} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
              {bannerUrl && <div className="h-24 bg-cover bg-center" style={{backgroundImage:`url(${bannerUrl})`}} />}
              <div className="p-4 flex gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border flex items-center justify-center font-serif overflow-hidden shrink-0">
                  {logoUrl ? <img src={logoUrl} alt={g.name} className="w-full h-full object-cover" /> : (g.logo || g.name?.slice(0,2).toUpperCase())}
                </div>
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{g.name}</div><div className="text-xs text-[#8A8078] truncate">{g.city}{g.country?`, ${g.country}`:''} • {g.productCount ?? ''} products</div><div className="text-[11px] text-[#8A8078] truncate">{g.description||''}</div></div>
                <div className="flex flex-row items-center gap-1 shrink-0 self-center whitespace-nowrap"><button onClick={()=>startEdit(g)} className="text-xs border px-3 py-1 rounded hover:bg-[#FAF7F2]">Edit</button><button onClick={()=>handleDelete(gid)} disabled={deletingId===gid} className="text-xs bg-[#B3402E] text-white px-3 py-1 rounded disabled:opacity-60">{deletingId===gid?'Deleting...':'Delete'}</button></div>
              </div>
            </div>
          )})}
        </div>
        {pagination && (
          <div className="flex justify-center items-center gap-2 pt-2">
            <button disabled={!pagination.prev && page===1} onClick={()=>setPage(x=>Math.max(1,x-1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">Prev</button>
            <span className="text-sm text-[#8A8078]">Page {pagination.currentPage || page} / {pagination.numberOfPages || 1}</span>
            <button disabled={!pagination.next && pagination?.numberOfPages && page>=pagination.numberOfPages} onClick={()=>setPage(x=>x+1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">Next</button>
          </div>
        )}
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setEditing(null)}>
          <form onClick={e=>e.stopPropagation()} onSubmit={handleUpdate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-medium">Edit Gallery {editing.id || editing._id}</h3>
            <div><label className="text-xs">Name*</label><input value={editForm.name} onChange={e=>setEditForm(s=>({...s,name:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">City</label><input value={editForm.city} onChange={e=>setEditForm(s=>({...s,city:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">Country</label><input value={editForm.country} onChange={e=>setEditForm(s=>({...s,country:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
            <div><label className="text-xs">Description</label><textarea value={editForm.description} onChange={e=>setEditForm(s=>({...s,description:e.target.value}))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div className="flex gap-3"><button type="button" onClick={()=>setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?'Saving...':'Save'}</button></div>
          </form>
        </div>
      )}
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
          <select value={galleryFilter} onChange={e=>setGalleryFilter(e.target.value)} className="border rounded-full px-3 py-1 text-xs bg-white"><option>All</option>{mockGalleries.map(g=><option key={g.id}>{g.name}</option>)}</select>
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
  const [counts, setCounts] = useState({ users: null, galleries: null, products: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{
    let cancelled=false
    async function fetchCounts(){
      setLoading(true)
      setError('')
      try{
        const [uRes, gRes, pRes] = await Promise.all([
          apiFetch('/users/count').catch(e=>{ throw new Error(e.message || 'users count failed') }),
          apiFetch('/galleries/count').catch(()=>({ data:{count:null} })),
          apiFetch('/products/count').catch(e=>{ throw new Error(e.message || 'products count failed') }),
        ])
        if(cancelled) return
        const usersCount = uRes?.data?.count ?? uRes?.count ?? null
        const galleriesCount = gRes?.data?.count ?? gRes?.count ?? null
        const productsCount = pRes?.data?.count ?? pRes?.count ?? null
        setCounts({ users: usersCount, galleries: galleriesCount, products: productsCount })
      }catch(err){
        if(!cancelled) setError(err.message || 'Failed to load counts')
      }finally{ if(!cancelled) setLoading(false)}
    }
    fetchCounts()
    return ()=>{cancelled=true}
  },[])
  const items = [
    {k:'Users', v: counts.users, api:'/users/count'},
    {k:'Galleries', v: counts.galleries, api:'/galleries/count'},
    {k:'Products', v: counts.products, api:'/products/count'},
  ]
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">Admin Overview</h2>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-3 gap-4">
        {items.map(s=>(
          <div key={s.k} className="bg-white border border-[#E7DFD3] rounded-xl p-4 text-center">
            <div className="text-xs text-[#8A8078]">{s.k}</div>
            <div className="text-xl font-semibold">{loading ? '…' : (s.v ?? '—')}</div>
            <div className="text-[10px] text-[#8A8078] font-mono">{s.api}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
        <h3 className="text-sm font-medium mb-2">Platform Note</h3>
        <p className="text-xs text-[#8A8078]">Admin sees platform-wide counts from <span className="font-mono">GET /users/count, /galleries/count, /products/count</span> (public for galleries, admin for users/products). Use Table/Board switcher and inline status dropdown. Terminal states (rejected/cancelled) are read-only.</p>
      </div>
    </div>
  )
}
