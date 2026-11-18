import { users } from '../../data/mockData';
import { useEffect, useState } from 'react';
import { getUsers, unwrapUsers, deleteUser, updateUser } from '../../api/users';
import Pagination from '../../components/Pagination';
import { useLanguage } from '../../i18n/LanguageContext';

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
                const avatarUrl = typeof u.avatar === 'string' && /^https?:\/\//i.test(u.avatar) ? u.avatar : null
                const initials = name ? name.slice(0,2).toUpperCase() : 'U'
                const email = u.email
                const role = u.role
                const status = u.isActive ?? u.status ?? 'active'
                const isActive = status === 'active' || status === true
                return (
                <tr key={uid} className="border-t"><td className="p-3 flex items-center gap-2">{avatarUrl ? <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover border border-[#E7DFD3]" /> : <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{initials}</div>}{name}</td><td className="text-xs">{email}</td><td className="text-xs">{role}</td><td><span className={`px-2 py-0.5 rounded-full text-[11px] ${isActive?'bg-green-100 text-green-800':'bg-zinc-100'}`}>{isActive?t('admin.active'):t('admin.inactive')}</span></td><td><div className="flex items-center gap-1 whitespace-nowrap"><button onClick={()=>startEdit(u)} className="text-xs border px-2 py-1 rounded hover:bg-[#FAF7F2]">{t('common.edit')}</button><button onClick={()=>handleDelete(uid)} disabled={deletingId===uid} className="text-xs bg-[#B3402E] text-white px-2 py-1 rounded disabled:opacity-60">{deletingId===uid?t('common.deleting'):t('common.delete')}</button></div></td></tr>
              )})}
            </tbody>
          </table>
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

export default AdminUsers;
