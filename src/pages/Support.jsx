import { useState } from 'react'
import { useRole } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'
import { createTicket } from '../api/support'

const TYPES = ['problem', 'feature', 'question', 'other']

export default function Support(){
  const { user } = useRole()
  const { t } = useLanguage()

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const [name, setName] = useState(fullName || user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [type, setType] = useState('problem')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const reset = () => {
    setSubject('')
    setDescription('')
    setType('problem')
    setError('')
    setSent(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !subject.trim() || !description.trim()) {
      setError(t('support.fillAll'))
      return
    }
    if (subject.trim().length < 5 || description.trim().length < 10) {
      setError(t('support.tooShort'))
      return
    }
    setSending(true)
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        type,
        subject: subject.trim(),
        description: description.trim(),
      }
      try {
        if (typeof window !== 'undefined') {
          payload.pageUrl = window.location.href.slice(0, 500)
          if (navigator?.userAgent) payload.userAgent = navigator.userAgent.slice(0, 500)
        }
      } catch {}
      const uid = user?.id || user?._id
      if (uid) payload.userId = uid
      await createTicket(payload)
      setSent(true)
    } catch (err) {
      setError(err.message || t('support.submitFail'))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-8 text-center space-y-3">
          <span className="material-symbols-outlined text-green-700 text-5xl">check_circle</span>
          <h1 className="font-serif text-2xl text-[#4B3621]">{t('support.success')}</h1>
          <p className="text-sm text-[#8A8078]">{t('support.successSub')}</p>
          <button onClick={reset} className="mt-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#4B3621] text-white">
            {t('support.sendAnother')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-[#4B3621] mb-2">{t('support.title')}</h1>
        <p className="text-sm text-[#8A8078]">{t('support.sub')}</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium">{t('support.name')}</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={t('support.namePh')}
              className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-[#78582f]" />
          </div>
          <div>
            <label className="text-xs font-medium">{t('support.email')}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-[#78582f]" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium">{t('support.type')}</label>
          <select value={type} onChange={e=>setType(e.target.value)}
            className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm bg-white outline-none focus:border-[#78582f]">
            {TYPES.map(tp=>(
              <option key={tp} value={tp}>{t(`support.type_${tp}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium">{t('support.subject')}</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder={t('support.subjectPh')} maxLength={150}
            className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-[#78582f]" />
        </div>
        <div>
          <label className="text-xs font-medium">{t('support.description')}</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder={t('support.descriptionPh')}
            rows={5} maxLength={2000}
            className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-[#78582f] resize-y" />
          <div className="text-[11px] text-[#8A8078] text-end mt-1">{description.length}/2000</div>
        </div>
        <button type="submit" disabled={sending}
          className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          {sending ? t('support.sending') : t('support.send')}
        </button>
      </form>
    </div>
  )
}
