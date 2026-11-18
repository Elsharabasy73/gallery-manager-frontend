import { useEffect, useState } from 'react';
import { getCategories, unwrapCategories, unwrapCategory, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { useLanguage } from '../../i18n/LanguageContext';

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
                      <div className="text-sm font-medium truncate">{c.name}{c.arabicName ? <span className="text-[#8A8078] font-normal"> ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ {c.arabicName}</span> : null}</div>
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

export default AdminCategories;
