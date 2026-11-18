import { galleries as mockGalleries } from '../../data/mockData';
import { useEffect, useState } from 'react';
import { getGalleries, unwrapGalleries, updateGallery, deleteGallery } from '../../api/galleries';
import { getGalleryLogoUrl, getGalleryBannerUrl } from '../../utils/image';
import Pagination from '../../components/Pagination';
import { useLanguage } from '../../i18n/LanguageContext';

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

export default AdminGalleries;
