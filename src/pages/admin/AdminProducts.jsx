import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { getProducts, unwrapProducts, updateProduct, deleteProduct } from '../../api/products';
import Pagination from '../../components/Pagination';
import { useLanguage } from '../../i18n/LanguageContext';

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
          <Pagination
            pagination={pagination}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            showFirstLast={true}
          />
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

export default AdminProducts;
