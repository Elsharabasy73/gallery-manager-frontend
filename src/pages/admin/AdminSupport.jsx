import { useEffect, useState } from 'react';
import { getTickets, unwrapTickets, updateTicketStatus, deleteTicket } from '../../api/support';
import Pagination from '../../components/Pagination';
import { useLanguage } from '../../i18n/LanguageContext';

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
      {pagination && (
        <Pagination
          pagination={pagination}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          showFirstLast={true}
        />
      )}
    </div>
  )
}

export default AdminSupport;
