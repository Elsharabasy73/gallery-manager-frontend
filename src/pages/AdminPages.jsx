import { users, orders, galleries as mockGalleries } from '../data/mockData'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProducts, unwrapProducts, updateProduct, deleteProduct } from '../api/products'
import { getGalleries, unwrapGalleries, updateGallery, deleteGallery } from '../api/galleries'
import { getUsers, unwrapUsers, deleteUser, updateUser } from '../api/users'
import { getMyOrders, unwrapOrders, updateOrderStatus, cancelOrder, acceptOrder, getStatusStyles, ORDER_STATUSES } from '../api/orders'
import { getCategories, unwrapCategories, unwrapCategory, createCategory, updateCategory, deleteCategory } from '../api/categories'
import { getTickets, unwrapTickets, updateTicketStatus, deleteTicket } from '../api/support'
import { apiFetch } from '../api/client'
import { getVisitors } from '../api/analytics'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getProductImageUrl, getGalleryLogoUrl, getGalleryBannerUrl } from '../utils/image'
import { useLanguage } from '../i18n/LanguageContext'

export function AdminUsers(){
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
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
    if (!confirm(t('admin.deleteUserConfirm'))) return
    setDeletingId(id)
    setActionMsg('')
    try {
      await deleteUser(id)
      setUsersList(prev => prev.filter(u => (u.id||u._id) !== id))
      setActionMsg(t('admin.userDeleted'))
    } catch (err) {
      setActionMsg(err.message || t('admin.deleteFail'))
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
    if (!editForm.firstName.trim() || !editForm.email.trim()) { setActionMsg(t('admin.firstEmailRequired')); return }
    if (editForm.role === 'admin') { setActionMsg(t('admin.noAdminAssign')); return }
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
      setActionMsg(t('admin.userUpdated'))
    } catch (err) {
      setActionMsg(err.message || t('admin.updateFail'))
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
      <div className="flex justify-between"><h2 className="font-serif text-xl">{t('admin.users')}</h2></div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px]">search</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder={t('admin.searchUserPh')} className="flex-1 outline-none text-sm" />
        </div>
        <button onClick={handleSearch} className="bg-[#4B3621] text-white px-4 py-2 rounded-full text-sm">{t('common.search')}</button>
        <button onClick={()=>{setSearch(''); setSearchInput(''); setPage(1)}} className="border px-3 py-2 rounded-full text-sm bg-white">{t('common.clear')}</button>
      </div>
      {actionMsg && <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingUsers')}</div> : displayUsers.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">{t('admin.noUsers')}</div> : (
        <>
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-start">{t('admin.thUser')}</th><th>{t('admin.thEmail')}</th><th>{t('admin.thRole')}</th><th>{t('admin.thStatus')}</th><th>{t('admin.thActions')}</th></tr></thead>
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
                <tr key={uid} className="border-t"><td className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{avatar}</div>{name}</td><td className="text-xs">{email}</td><td className="text-xs">{role}</td><td><span className={`px-2 py-0.5 rounded-full text-[11px] ${isActive?'bg-green-100 text-green-800':'bg-zinc-100'}`}>{isActive?t('admin.active'):t('admin.inactive')}</span></td><td><div className="flex items-center gap-1 whitespace-nowrap"><button onClick={()=>startEdit(u)} className="text-xs border px-2 py-1 rounded hover:bg-[#FAF7F2]">{t('common.edit')}</button><button onClick={()=>handleDelete(uid)} disabled={deletingId===uid} className="text-xs bg-[#B3402E] text-white px-2 py-1 rounded disabled:opacity-60">{deletingId===uid?t('common.deleting'):t('common.delete')}</button></div></td></tr>
              )})}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="flex justify-center items-center gap-2 pt-2">
            <button disabled={!pagination.prev && page===1} onClick={()=>setPage(x=>Math.max(1,x-1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">{t('common.prev')}</button>
            <span className="text-sm text-[#8A8078]">{t('common.page')} {formatNumber(pagination.currentPage || page)} / {formatNumber(pagination.numberOfPages || 1)}</span>
            <button disabled={!pagination.next && pagination?.numberOfPages && page>=pagination.numberOfPages} onClick={()=>setPage(x=>x+1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">{t('common.next')}</button>
          </div>
        )}
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setEditing(null)}>
          <form onClick={e=>e.stopPropagation()} onSubmit={handleUpdate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-medium">{t('admin.editUser')} {editing.id || editing._id}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs">{t('admin.firstName')}</label><input value={editForm.firstName} onChange={e=>setEditForm(s=>({...s,firstName:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div><label className="text-xs">{t('admin.lastName')}</label><input value={editForm.lastName} onChange={e=>setEditForm(s=>({...s,lastName:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            </div>
            <div><label className="text-xs">{t('admin.thEmail')}*</label><input value={editForm.email} onChange={e=>setEditForm(s=>({...s,email:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs">{t('admin.phone')}</label><input value={editForm.phone} onChange={e=>setEditForm(s=>({...s,phone:e.target.value}))} placeholder="+20..." className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs">{t('admin.role')}</label><select value={editForm.role} onChange={e=>setEditForm(s=>({...s,role:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"><option value="user">user</option><option value="gallery_owner">gallery_owner</option><option value="employee">employee</option></select><p className="text-[11px] text-[#8A8078] mt-1">{t('admin.roleHint')}</p></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={editForm.isActive} onChange={e=>setEditForm(s=>({...s,isActive:e.target.checked}))} id="isActive" /><label htmlFor="isActive" className="text-xs">{t('admin.activeLabel')}</label></div>
            <div className="flex gap-3"><button type="button" onClick={()=>setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm">{t('common.cancel')}</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?t('common.saving'):t('common.save')}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
export function AdminProducts(){
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
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
    if (!confirm(t('admin.deleteProductConfirm'))) return
    setDeletingId(id)
    setActionMsg('')
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => (p.id||p._id) !== id))
      setActionMsg(t('admin.productDeleted'))
    } catch (err) {
      setActionMsg(err.message || t('admin.deleteFail'))
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
    if (!editForm.name.trim()) { setActionMsg(t('admin.nameRequired')); return }
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
      setActionMsg(t('admin.productUpdated'))
    } catch (err) {
      setActionMsg(err.message || t('admin.updateFail'))
      if (err.details) setActionMsg(typeof err.details==='string'?err.details:JSON.stringify(err.details))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">{t('admin.products')}</h2></div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px]">search</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder={t('admin.searchProductsPh')} className="flex-1 outline-none text-sm" />
        </div>
        <button onClick={handleSearch} className="bg-[#4B3621] text-white px-4 py-2 rounded-full text-sm">{t('common.search')}</button>
        <button onClick={()=>{setSearch(''); setSearchInput(''); setPage(1)}} className="border px-3 py-2 rounded-full text-sm bg-white">{t('common.clear')}</button>
      </div>
      {actionMsg && <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingProducts')}</div> : products.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">{t('admin.noProducts')}</div> : (
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
            <button disabled={!pagination.prev && page===1} onClick={()=>setPage(x=>Math.max(1,x-1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">{t('common.prev')}</button>
            <span className="text-sm text-[#8A8078]">{t('common.page')} {formatNumber(pagination.currentPage || page)} / {formatNumber(pagination.numberOfPages || 1)}</span>
            <button disabled={!pagination.next && pagination?.numberOfPages && page>=pagination.numberOfPages} onClick={()=>setPage(x=>x+1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">{t('common.next')}</button>
          </div>
        )}
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setEditing(null)}>
          <form onClick={e=>e.stopPropagation()} onSubmit={handleUpdate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-medium">{t('admin.editProduct')} {editing.id || editing._id}</h3>
            <div><label className="text-xs">Name*</label><input value={editForm.name} onChange={e=>setEditForm(s=>({...s,name:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">{t('admin.price')}</label><input type="number" value={editForm.price} onChange={e=>setEditForm(s=>({...s,price:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">{t('admin.stock')}</label><input type="number" value={editForm.stock} onChange={e=>setEditForm(s=>({...s,stock:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
            <div><label className="text-xs">{t('admin.status')}</label><div className="flex gap-2 mt-1 text-xs">{['draft','active','archived'].map(s=> <button key={s} type="button" onClick={()=>setEditForm(f=>({...f,status:s}))} className={`px-3 py-1 rounded-full border capitalize ${editForm.status===s?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white'}`}>{s}</button>)}</div></div>
            <div className="flex gap-3"><button type="button" onClick={()=>setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm">{t('common.cancel')}</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?t('common.saving'):t('common.save')}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
export function AdminGalleries(){
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
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
    if (!confirm(t('admin.deleteGalleryConfirm'))) return
    setDeletingId(id)
    try {
      await deleteGallery(id)
      setGalleries(prev => prev.filter(g=> (g.id||g._id)!==id))
      setActionMsg(t('admin.galleryDeleted'))
    } catch (err) {
      setActionMsg(err.message || t('admin.deleteFail'))
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
    if (!editForm.name.trim()) { setActionMsg(t('admin.nameRequired')); return }
    setSaving(true)
    try {
      const payload = { name: editForm.name.trim(), city: editForm.city.trim(), country: editForm.country.trim(), description: editForm.description }
      await updateGallery(id, payload)
      setGalleries(prev => prev.map(g => (g.id||g._id)===id ? { ...g, ...payload } : g))
      setEditing(null)
      setActionMsg(t('admin.galleryUpdated'))
    } catch (err) {
      setActionMsg(err.message || t('admin.updateFail'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">{t('admin.galleries')}</h2></div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px]">search</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder={t('admin.searchGalleriesPh')} className="flex-1 outline-none text-sm" />
        </div>
        <button onClick={handleSearch} className="bg-[#4B3621] text-white px-4 py-2 rounded-full text-sm">{t('common.search')}</button>
        <button onClick={()=>{setSearch(''); setSearchInput(''); setPage(1)}} className="border px-3 py-2 rounded-full text-sm bg-white">{t('common.clear')}</button>
      </div>
      {actionMsg && <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingGalleries')}</div> : galleries.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">{t('admin.noGalleries')}</div> : (
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
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{g.name}</div><div className="text-xs text-[#8A8078] truncate">{g.city}{g.country?`, ${g.country}`:''} • {g.productCount != null ? t('galleries.products', { n: formatNumber(g.productCount) }) : ''}</div><div className="text-[11px] text-[#8A8078] truncate">{g.description||''}</div></div>
                <div className="flex flex-row items-center gap-1 shrink-0 self-center whitespace-nowrap"><button onClick={()=>startEdit(g)} className="text-xs border px-3 py-1 rounded hover:bg-[#FAF7F2]">{t('common.edit')}</button><button onClick={()=>handleDelete(gid)} disabled={deletingId===gid} className="text-xs bg-[#B3402E] text-white px-3 py-1 rounded disabled:opacity-60">{deletingId===gid?t('common.deleting'):t('common.delete')}</button></div>
              </div>
            </div>
          )})}
        </div>
        {pagination && (
          <div className="flex justify-center items-center gap-2 pt-2">
            <button disabled={!pagination.prev && page===1} onClick={()=>setPage(x=>Math.max(1,x-1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">{t('common.prev')}</button>
            <span className="text-sm text-[#8A8078]">{t('common.page')} {formatNumber(pagination.currentPage || page)} / {formatNumber(pagination.numberOfPages || 1)}</span>
            <button disabled={!pagination.next && pagination?.numberOfPages && page>=pagination.numberOfPages} onClick={()=>setPage(x=>x+1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 bg-white">{t('common.next')}</button>
          </div>
        )}
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setEditing(null)}>
          <form onClick={e=>e.stopPropagation()} onSubmit={handleUpdate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-medium">{t('admin.editGallery')} {editing.id || editing._id}</h3>
            <div><label className="text-xs">Name*</label><input value={editForm.name} onChange={e=>setEditForm(s=>({...s,name:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">{t('admin.city')}</label><input value={editForm.city} onChange={e=>setEditForm(s=>({...s,city:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">{t('admin.country')}</label><input value={editForm.country} onChange={e=>setEditForm(s=>({...s,country:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
            <div><label className="text-xs">{t('admin.description')}</label><textarea value={editForm.description} onChange={e=>setEditForm(s=>({...s,description:e.target.value}))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div className="flex gap-3"><button type="button" onClick={()=>setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm">{t('common.cancel')}</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?t('common.saving'):t('common.save')}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
export function AdminOrders(){
  const navigate = useNavigate()
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [galleryFilter, setGalleryFilter] = useState('All')
  const [view, setView] = useState('table')
  const [actionId, setActionId] = useState(null)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchOrders() {
      setLoading(true)
      setError('')
      try {
        const res = await getMyOrders() // Admin sees all orders
        if (cancelled) return
        const data = unwrapOrders(res)
        setOrdersList(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || t('admin.loadOrdersFail'))
        setOrdersList([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [])

  const refreshOrders = async () => {
    try {
      const res = await getMyOrders()
      const data = unwrapOrders(res)
      setOrdersList(data)
    } catch (err) {
      console.error('Failed to refresh orders:', err)
    }
  }

  const statusLabel = (s) => t(`status.${s}`) === `status.${s}` ? (ORDER_STATUSES[s]?.label || s) : t(`status.${s}`)

  const handleStatusChange = async (orderId, newStatus) => {
    const label = statusLabel(newStatus)
    if (!window.confirm(t('orderDetails.statusConfirm', { label }))) return
    setActionId(orderId)
    setSuccess('')
    setLocalError('')
    try {
      if (newStatus === 'cancelled') {
        await cancelOrder(orderId)
      } else if (newStatus === 'accepted') {
        await acceptOrder(orderId)
      } else {
        await updateOrderStatus(orderId, newStatus)
      }
      await refreshOrders()
      setSuccess(t('orderDetails.statusOk', { label }))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || t('orderDetails.statusFail'))
    } finally {
      setActionId(null)
    }
  }

  // Get unique galleries for filter
  const galleries = [...new Set(ordersList.map(o => o.gallery?.name).filter(Boolean))]

  // Filter orders
  const filteredOrders = ordersList.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (galleryFilter !== 'All' && o.gallery?.name !== galleryFilter) return false
    return true
  })

  // Status counts
  const statusCounts = ordersList.reduce((acc, o) => {
    acc.all = (acc.all || 0) + 1
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">{t('admin.allOrders')}</h2>
        <div className="flex gap-2">
          <select 
            value={galleryFilter} 
            onChange={e => setGalleryFilter(e.target.value)} 
            className="border rounded-full px-3 py-1 text-xs bg-white"
          >
            <option value="All">{t('common.all')}</option>
            {galleries.map(g => <option key={g}>{g}</option>)}
          </select>
          <div className="flex border rounded-full overflow-hidden text-xs">
            <button onClick={() => setView('table')} className={`px-3 py-1 ${view === 'table' ? 'bg-[#4B3621] text-white' : ''}`}>{t('admin.table')}</button>
            <button onClick={() => setView('board')} className={`px-3 py-1 ${view === 'board' ? 'bg-[#4B3621] text-white' : ''}`}>{t('admin.board')}</button>
          </div>
        </div>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{success}</div>}
      {localError && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{localError}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}

      <div className="flex gap-2 text-xs overflow-x-auto pb-1">
        <button 
          onClick={() => setStatusFilter('all')} 
          className={`px-3 py-1 rounded-full border ${statusFilter === 'all' ? 'bg-[#4B3621] text-white' : 'bg-white'}`}
        >
          {t('common.all')} ({formatNumber(statusCounts.all || 0)})
        </button>
        {Object.keys(ORDER_STATUSES).map(status => (
          <button 
            key={status}
            onClick={() => setStatusFilter(status)} 
            className={`px-3 py-1 rounded-full border ${statusFilter === status ? 'bg-[#4B3621] text-white' : 'bg-white'}`}
          >
            {statusLabel(status)} ({formatNumber(statusCounts[status] || 0)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingOrders')}</div>
      ) : view === 'table' ? (
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]">
                <tr>
                  <th className="p-3 text-start">{t('admin.thOrder')}</th>
                  <th>{t('admin.thCustomer')}</th>
                  <th>{t('admin.thGallery')}</th>
                  <th>{t('admin.thItems')}</th>
                  <th>{t('admin.thTotal')}</th>
                  <th>{t('admin.thStatus')}</th>
                  <th>{t('galleryOrders.thAction')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const totalItems = o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
                  const totalPrice = Number(o.totalPrice || 0)
                  const customerName = `${o.user?.firstName || 'Unknown'} ${o.user?.lastName || ''}`.trim()
                  const galleryName = o.gallery?.name || t('orders.unknownGallery')
                  const availableTransitions = ORDER_STATUSES[o.status]?.canTransitionTo || []

                  return (
                    <tr key={o.id} className="border-t">
                      <td className="p-3 font-mono text-xs">
                        {o.id?.substring(0, 8)}...
                        <div className="text-[11px] text-[#8A8078]">{o.createdAt ? formatDate(o.createdAt) : ''}</div>
                      </td>
                      <td className="text-xs">
                        {customerName}
                        <div className="text-[11px] text-[#8A8078]">{o.user?.email || ''}</div>
                      </td>
                      <td className="text-xs">
                        <div className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px]">
                            {galleryName.substring(0, 2).toUpperCase()}
                          </span>
                          {galleryName}
                        </div>
                      </td>
                      <td className="text-center">{formatNumber(totalItems)}</td>
                      <td className="text-center text-xs">{formatPrice(totalPrice)}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusStyles(o.status)}`}>
                          {statusLabel(o.status)}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => navigate(`/admin/orders/${o.id}`)}
                          className="text-xs border px-2 py-1 rounded me-1 hover:bg-[#FAF7F2]"
                        >
                          {t('common.view')}
                        </button>
                        {availableTransitions.length > 0 && (
                          <select 
                            defaultValue=""
                            onChange={e => e.target.value && handleStatusChange(o.id, e.target.value)}
                            disabled={actionId === o.id}
                            className="border rounded px-2 py-1 text-xs disabled:opacity-60"
                          >
                            <option value="" disabled>{t('status.changeStatus')}</option>
                            {availableTransitions.map(s => (
                              <option key={s} value={s}>{statusLabel(s)}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['pending', 'accepted', 'paid', 'delivered'].map(status => (
            <div key={status} className="bg-white border border-[#E7DFD3] rounded-xl p-3">
              <div className="text-xs font-semibold mb-2 flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded-full ${getStatusStyles(status)}`}>
                  {statusLabel(status)}
                </span>
                <span className="bg-[#FAF7F2] px-2 rounded-full text-[#8A8078]">
                  {formatNumber(ordersList.filter(o => o.status === status).length)}
                </span>
              </div>
              <div className="space-y-2">
                {ordersList.filter(o => o.status === status).map(o => (
                  <div 
                    key={o.id} 
                    onClick={() => navigate(`/admin/orders/${o.id}`)}
                    className="border rounded-lg p-3 text-xs cursor-pointer hover:bg-[#FAF7F2]"
                  >
                    <div className="font-mono">{o.id?.substring(0, 8)}...</div>
                    <div className="text-[#8A8078]">{o.gallery?.name || t('orders.unknownGallery')} • {formatPrice(Number(o.totalPrice || 0))}</div>
                  </div>
                ))}
                {ordersList.filter(o => o.status === status).length === 0 && (
                  <div className="text-[11px] text-[#8A8078] text-center py-4">{t('admin.noOrders')}</div>
                )}
              </div>
            </div>
          ))}
          <div className="bg-white border border-[#E7DFD3] rounded-xl p-3">
            <div className="text-xs font-semibold mb-2 flex justify-between items-center">
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800">{t('status.terminal')}</span>
              <span className="bg-[#FAF7F2] px-2 rounded-full text-[#8A8078]">
                {formatNumber(ordersList.filter(o => ['completed', 'cancelled'].includes(o.status)).length)}
              </span>
            </div>
            <div className="space-y-2">
              {ordersList.filter(o => ['completed', 'cancelled'].includes(o.status)).map(o => (
                <div 
                  key={o.id} 
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="border rounded-lg p-3 text-xs cursor-pointer hover:bg-[#FAF7F2] opacity-60"
                >
                  <div className="font-mono">{o.id?.substring(0, 8)}...</div>
                  <div className="text-[#8A8078]">{statusLabel(o.status)} • {formatPrice(Number(o.totalPrice || 0))}</div>
                </div>
              ))}
              {ordersList.filter(o => ['completed', 'cancelled'].includes(o.status)).length === 0 && (
                <div className="text-[11px] text-[#8A8078] text-center py-4">{t('admin.noOrders')}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export function AdminCategories(){
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [form, setForm] = useState({ name:'', arabicName:'' })
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name:'', arabicName:'' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getCategories({ limit: 50, sort: 'name', fields: 'id,name,arabicName,slug' })
      setCategories(unwrapCategories(res))
    } catch (err) {
      setError(err.message || 'Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const validName = (v) => v.trim().length >= 3 && v.trim().length <= 60

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validName(form.name) || !validName(form.arabicName)) { setActionMsg(t('admin.catValid')); return }
    setCreating(true)
    setActionMsg('')
    try {
      const res = await createCategory({ name: form.name.trim(), arabicName: form.arabicName.trim() })
      const created = unwrapCategory(res)
      if (created) setCategories(prev => [created, ...prev])
      else fetchCategories()
      setForm({ name:'', arabicName:'' })
      setActionMsg(t('admin.catAdded'))
    } catch (err) {
      setActionMsg(err.details ? (typeof err.details==='string'?err.details:JSON.stringify(err.details)) : (err.message || t('admin.catCreateFail')))
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (c) => {
    setEditingId(c.id || c._id)
    setEditForm({ name: c.name || '', arabicName: c.arabicName || '' })
    setActionMsg('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingId) return
    if (!validName(editForm.name) || !validName(editForm.arabicName)) { setActionMsg(t('admin.catValid')); return }
    setSaving(true)
    try {
      const payload = { name: editForm.name.trim(), arabicName: editForm.arabicName.trim() }
      await updateCategory(editingId, payload)
      setCategories(prev => prev.map(c => (c.id||c._id)===editingId ? { ...c, ...payload } : c))
      setEditingId(null)
      setActionMsg(t('admin.catUpdated'))
    } catch (err) {
      setActionMsg(err.details ? (typeof err.details==='string'?err.details:JSON.stringify(err.details)) : (err.message || t('admin.updateFail')))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('admin.deleteCatConfirm'))) return
    setDeletingId(id)
    setActionMsg('')
    try {
      await deleteCategory(id)
      setCategories(prev => prev.filter(c => (c.id||c._id) !== id))
      setActionMsg(t('admin.catDeleted'))
    } catch (err) {
      setActionMsg(err.message || t('admin.deleteFail'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">{t('admin.categories')}</h2></div>
      <form onSubmit={handleCreate} className="bg-white border border-[#E7DFD3] rounded-xl p-4 flex flex-col sm:flex-row gap-2">
        <input value={form.name} onChange={e=>setForm(s=>({...s, name:e.target.value}))} placeholder={t('admin.catNamePh')} className="flex-1 border border-[#E7DFD3] rounded-full px-4 py-2 text-sm outline-none focus:border-[#78582f]" />
        <input value={form.arabicName} onChange={e=>setForm(s=>({...s, arabicName:e.target.value}))} placeholder={t('admin.catArPh')} className="flex-1 border border-[#E7DFD3] rounded-full px-4 py-2 text-sm outline-none focus:border-[#78582f]" />
        <button type="submit" disabled={creating} className="bg-[#4B3621] text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-60 whitespace-nowrap">{creating?t('admin.adding'):t('admin.addCategory')}</button>
      </form>
      {actionMsg && <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingCats')}</div> : categories.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">{t('admin.noCats')}</div> : (
        <div className="bg-white border border-[#E7DFD3] rounded-xl divide-y divide-[#E7DFD3]/70 overflow-hidden">
          {categories.map((c) => {
            const cid = c.id || c._id
            const isEditing = editingId === cid
            return (
              <div key={cid} className="px-4 py-3 flex items-center gap-3">
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="flex-1 flex flex-col sm:flex-row gap-2">
                    <input value={editForm.name} onChange={e=>setEditForm(s=>({...s, name:e.target.value}))} className="flex-1 border border-[#E7DFD3] rounded-full px-3 py-1.5 text-sm outline-none focus:border-[#78582f]" />
                    <input value={editForm.arabicName} onChange={e=>setEditForm(s=>({...s, arabicName:e.target.value}))} className="flex-1 border border-[#E7DFD3] rounded-full px-3 py-1.5 text-sm outline-none focus:border-[#78582f]" />
                    <div className="flex gap-1.5 shrink-0">
                      <button type="submit" disabled={saving} className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-xs disabled:opacity-60">{saving?t('common.saving'):t('common.save')}</button>
                      <button type="button" onClick={()=>setEditingId(null)} className="border px-3 py-1.5 rounded-full text-xs bg-white">{t('common.cancel')}</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[#C19A6B] text-[20px]">sell</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{c.name}{c.arabicName ? <span className="text-[#8A8078] font-normal"> • {c.arabicName}</span> : null}</div>
                      {c.slug && <div className="text-[11px] text-[#8A8078] truncate">/{c.slug}</div>}
                    </div>
                    <button onClick={()=>startEdit(c)} className="px-3 py-1.5 border rounded-full text-xs bg-white hover:bg-[#FAF7F2]">{t('common.edit')}</button>
                    <button onClick={()=>handleDelete(cid)} disabled={deletingId===cid} className="px-3 py-1.5 rounded-full text-xs bg-[#B3402E] text-white disabled:opacity-60">{deletingId===cid?t('common.deleting'):t('common.delete')}</button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
const TRAFFIC_RANGES = [
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: '90d', label: '90d', days: 90 },
]

export function AdminOverview(){
  const { t, formatPrice, formatNumber, formatDate } = useLanguage()
  const [counts, setCounts] = useState({ users: null, galleries: null, products: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('30d')
  const [traffic, setTraffic] = useState(null)
  const [trafficLoading, setTrafficLoading] = useState(true)
  const [trafficError, setTrafficError] = useState('')
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
  useEffect(()=>{
    let cancelled=false
    async function fetchTraffic(){
      setTrafficLoading(true)
      setTrafficError('')
      try{
        const days = TRAFFIC_RANGES.find(r=>r.id===range)?.days || 30
        const to = new Date()
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
        const res = await getVisitors({ from: from.toISOString(), to: to.toISOString(), groupBy: 'day' })
        if(cancelled) return
        setTraffic(res?.data || res)
      }catch(err){
        if(!cancelled){
          setTrafficError(err.message || 'Failed to load traffic')
          setTraffic(null)
        }
      }finally{ if(!cancelled) setTrafficLoading(false)}
    }
    fetchTraffic()
    return ()=>{cancelled=true}
  },[range])
  const items = [
    {k: t('admin.usersCount'), v: counts.users},
    {k: t('admin.galleriesCount'), v: counts.galleries},
    {k: t('admin.productsCount'), v: counts.products},
  ]
  const totals = traffic?.totals || {}
  const trafficItems = [
    {k: t('admin.uniqueVisitors'), v: totals.visitors, hint: t('admin.uniqueHint')},
    {k: t('admin.visits'), v: totals.visits, hint: t('admin.visitsHint')},
    {k: t('admin.pageViews'), v: totals.pageViews, hint: t('admin.viewsHint')},
  ]
  const series = Array.isArray(traffic?.series) ? traffic.series : []
  const topPages = Array.isArray(traffic?.topPages) ? traffic.topPages : []
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">{t('admin.overview')}</h2>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map(s=>(
          <div key={s.k} className="bg-white border border-[#E7DFD3] rounded-xl p-4 text-center">
            <div className="text-xs text-[#8A8078]">{s.k}</div>
            <div className="text-xl font-semibold">{loading ? '…' : (s.v != null ? formatNumber(s.v) : '—')}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="font-serif text-lg">{t('admin.traffic')}</h3>
        <div className="flex gap-1 text-xs">
          {TRAFFIC_RANGES.map(r=>(
            <button key={r.id} onClick={()=>setRange(r.id)} className={`px-3 py-1 rounded-full border ${range===r.id?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white'}`}>{r.label}</button>
          ))}
        </div>
      </div>
      {trafficError && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{trafficError}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trafficItems.map(s=>(
          <div key={s.k} className="bg-white border border-[#E7DFD3] rounded-xl p-4 text-center">
            <div className="text-xs text-[#8A8078]">{s.k}</div>
            <div className="text-xl font-semibold">{trafficLoading ? '…' : (s.v != null ? formatNumber(s.v) : '—')}</div>
            <div className="text-[11px] text-[#8A8078]">{s.hint}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
          <div className="text-sm font-medium mb-2">{t('admin.chartTitle')}</div>
          {trafficLoading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingTraffic')}</div>
          : series.length===0 ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.noTraffic')}</div>
          : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d)=>String(d).slice(5)} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" name={t('admin.uniqueVisitors')} stroke="#4B3621" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="views" name={t('admin.pageViews')} stroke="#C19A6B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
          <div className="text-sm font-medium mb-2">{t('admin.topPages')}</div>
          {trafficLoading ? <div className="text-center py-8 text-sm text-[#8A8078]">…</div>
          : topPages.length===0 ? <div className="text-center py-8 text-xs text-[#8A8078]">{t('common.noResults')}</div>
          : (
          <div className="space-y-2">
            {topPages.map(p=>(
              <div key={p.path} className="flex justify-between items-center text-xs border-b border-[#E7DFD3]/60 pb-2">
                <span className="font-mono truncate max-w-[140px]" title={p.path}>{p.path}</span>
                <span className="text-[#8A8078] whitespace-nowrap">{formatNumber(p.visitors)} {t('admin.uniqueVisitors')} • {formatNumber(p.views)} {t('admin.pageViews')}</span>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TICKET_STATUSES = ['all', 'new', 'in_progress', 'resolved', 'closed']

export function AdminSupport(){
  const { t, formatDate } = useLanguage()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [actionMsg, setActionMsg] = useState('')
  const [busyId, setBusyId] = useState(null)

  const fetchTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getTickets({ limit: 20, page })
      setTickets(unwrapTickets(res))
      setPagination(res?.paginationResult || res?.pagination || null)
    } catch (err) {
      setError(err.message || 'Failed to load tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchTickets() }, [page])

  const handleStatus = async (id, next) => {
    setBusyId(id)
    setActionMsg('')
    try {
      await updateTicketStatus(id, next)
      setTickets(prev => prev.map(x => (x.id||x._id)===id ? { ...x, status: next } : x))
      setActionMsg(t('admin.statusUpdated'))
    } catch (err) {
      setActionMsg(err.message || t('admin.updateFail'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('admin.deleteTicketConfirm'))) return
    setBusyId(id)
    setActionMsg('')
    try {
      await deleteTicket(id)
      setTickets(prev => prev.filter(x => (x.id||x._id) !== id))
      setActionMsg(t('admin.ticketDeleted'))
    } catch (err) {
      setActionMsg(err.message || t('admin.deleteFail'))
    } finally {
      setBusyId(null)
    }
  }

  const q = searchInput.trim().toLowerCase()
  const display = tickets.filter(x => {
    if (status !== 'all' && x.status !== status) return false
    if (!q) return true
    return [x.name, x.email, x.subject, x.description, x.type]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
  })

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">{t('admin.support')}</h2>
      {actionMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2">{actionMsg}</div>}
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full ps-3 pe-1.5 py-1.5 flex-1">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px]">search</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
            placeholder={t('admin.searchSupportPh')} className="flex-1 outline-none text-sm bg-transparent min-w-0" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {TICKET_STATUSES.map(s=>(
            <button key={s} onClick={()=>setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs border ${status===s?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white border-[#E7DFD3]'}`}>
              {s==='all' ? t('orders.all') : t(`admin.status_${s}`)}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.loadingTickets')}</div>
      ) : display.length===0 ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">{t('admin.noTickets')}</div>
      ) : (
        <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_220px_130px_150px_80px] gap-3 px-4 py-2 text-[11px] uppercase tracking-widest text-[#8A8078] border-b border-[#E7DFD3]">
            <span>{t('admin.thTicket')}</span><span>{t('admin.thFrom')}</span><span>{t('admin.thDate')}</span><span>{t('admin.thStatus')}</span><span></span>
          </div>
          {display.map(x=>{
            const id = x.id || x._id
            return (
              <div key={id} className="px-4 py-3 border-b border-[#E7DFD3]/60 last:border-0">
                <div className="grid md:grid-cols-[1fr_220px_130px_150px_80px] gap-2 md:gap-3 items-start">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" title={x.subject}>{x.subject}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E7DFD3] text-[#4B3621]">{t(`support.type_${x.type}`) || x.type}</span>
                      {x.pageUrl && <a href={x.pageUrl} target="_blank" rel="noreferrer" className="text-[11px] text-[#C19A6B] underline truncate max-w-[160px]">{x.pageUrl}</a>}
                    </div>
                    <details className="mt-1">
                      <summary className="text-[11px] text-[#8A8078] cursor-pointer">{t('support.description')}</summary>
                      <p className="text-xs text-[#4B3621] whitespace-pre-wrap mt-1">{x.description}</p>
                    </details>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm truncate">{x.name}</div>
                    <div className="text-[11px] text-[#8A8078] truncate" title={x.email}>{x.email}</div>
                  </div>
                  <div className="text-xs text-[#8A8078]">{formatDate(x.createdAt)}</div>
                  <select value={x.status || 'new'} disabled={busyId===id} onChange={e=>handleStatus(id, e.target.value)}
                    className="border border-[#E7DFD3] rounded-lg px-2 py-1.5 text-xs bg-white outline-none disabled:opacity-60">
                    {['new','in_progress','resolved','closed'].map(s=>(
                      <option key={s} value={s}>{t(`admin.status_${s}`)}</option>
                    ))}
                  </select>
                  <button onClick={()=>handleDelete(id)} disabled={busyId===id}
                    className="px-3 py-1.5 rounded-full text-xs bg-[#B3402E] text-white disabled:opacity-60 justify-self-start md:justify-self-end">
                    {busyId===id ? t('common.deleting') : t('common.delete')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {pagination?.numberOfPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1.5 border rounded-full bg-white disabled:opacity-50">{t('common.prev')}</button>
          <span className="text-xs text-[#8A8078]">{t('common.page')} {page}/{pagination.numberOfPages}</span>
          <button disabled={page>=pagination.numberOfPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 border rounded-full bg-white disabled:opacity-50">{t('common.next')}</button>
        </div>
      )}
    </div>
  )
}
