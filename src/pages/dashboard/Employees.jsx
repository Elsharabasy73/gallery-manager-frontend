import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, unwrapEmployees } from '../../api/employees';
import { useGallery } from '../../context/GalleryContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function Employees(){
  const navigate = useNavigate()
  const { t, formatDate } = useLanguage()
  const { galleryId: ctxGalleryId } = useGallery()
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ctxGalleryId) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function fetchEmployees(){
      setLoading(true)
      setError('')
      try {
        const res = await getEmployees({ galleryId: ctxGalleryId })
        if (cancelled) return
        const data = unwrapEmployees(res)
        setEmployees(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to load employees')
        setEmployees([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchEmployees()
    return () => { cancelled = true }
  }, [ctxGalleryId])

  const filtered = employees.filter(e => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase() || (e.name||'').toLowerCase()
    const email = (e.email || e.user?.email || '').toLowerCase()
    const title = (e.title || e.jobTitle || '').toLowerCase()
    return name.includes(q) || email.includes(q) || title.includes(q)
  })

  if (!ctxGalleryId && !loading) return <div className="text-center py-16 bg-white border rounded-xl"><p className="text-sm text-[#8A8078]">{t('employees.noGallery')}</p><button onClick={()=>navigate('/dashboard/create-gallery')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">{t('employees.createGallery')}</button></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">{t('employees.title')}</h2><button onClick={()=>navigate('/dashboard/employees/add')} className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-sm">{t('employees.add')}</button></div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('employees.searchPh')} className="w-full border rounded-full px-4 py-2 text-sm" />
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('employees.loading')}</div> : filtered.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">{t('employees.empty')} {search?t('employees.forSearch', { q: search }):''} — <button onClick={()=>navigate('/dashboard/employees/add')} className="text-[#C19A6B] underline">{t('employees.addFirst')}</button></div> : (
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-start">{t('employees.thEmployee')}</th><th>{t('employees.thJob')}</th><th>{t('employees.thEmail')}</th><th>{t('employees.thStatus')}</th><th>{t('employees.thJoined')}</th><th>{t('employees.thActions')}</th></tr></thead>
          <tbody>
            {filtered.map(e=>{
              const name = e.name || `${e.firstName||''} ${e.lastName||''}`.trim() || e.user?.firstName ? `${e.user.firstName} ${e.user.lastName||''}`.trim() : 'Employee'
              const email = e.email || e.user?.email || ''
              const title = e.title || e.jobTitle || ''
              const active = e.isActive ?? e.active ?? true
              const date = e.createdAt ? formatDate(e.createdAt) : e.date || ''
              const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()
              return (
              <tr key={e.id || email} className="border-t"><td className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{initials}</div>{name}</td><td className="text-center text-xs">{title || '—'}</td><td className="text-xs">{email}</td><td className="text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] ${active?'bg-green-100 text-green-800':'bg-zinc-100'}`}>{active?t('employees.active'):t('employees.inactive')}</span></td><td className="text-xs">{date}</td><td className="text-center"><button onClick={()=>navigate(`/dashboard/employees/add?id=${e.id}`)} className="text-xs border px-2 py-1 rounded hover:bg-[#FAF7F2]">{t('common.edit')}</button></td></tr>
            )})}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}

export default Employees;
