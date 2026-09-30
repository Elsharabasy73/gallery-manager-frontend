import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'
import { getMe, updateMe, updatePassword, deleteMe, unwrapUser } from '../api/users'

const ROLE_LABEL_KEYS = {
  customer: 'roles.customer',
  gallery_owner: 'roles.gallery_owner',
  employee: 'roles.employee',
  admin: 'roles.admin',
  user: 'roles.customer',
}

export default function Profile(){
  const { role, user, logout, setUser } = useRole()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErr, setProfileErr] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [passwordErr, setPasswordErr] = useState(null)

  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteErr, setDeleteErr] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setPhone(user?.phone || '')
  }, [user])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    getMe()
      .then(res => {
        const fresh = unwrapUser(res)
        if (fresh) {
          localStorage.setItem('user', JSON.stringify(fresh))
          setUser(fresh)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = ()=>{ logout(); navigate('/login', { replace: true }) }

  const handleSaveProfile = async () => {
    setProfileErr(null); setProfileMsg(null)
    if (!firstName.trim() || !lastName.trim()) {
      setProfileErr(t('profile.namesRequired'))
      return
    }
    setSavingProfile(true)
    try {
      const payload = {}
      if (firstName.trim()) payload.firstName = firstName.trim()
      if (lastName.trim()) payload.lastName = lastName.trim()
      payload.phone = phone.trim() || undefined
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

      const res = await updateMe(payload)
      const updated = unwrapUser(res) || res?.data
      const userToStore = updated?.user ? updated.user : updated
      if (userToStore && userToStore.firstName) {
        localStorage.setItem('user', JSON.stringify(userToStore))
        setUser(userToStore)
      } else if (freshFallback(res)) {
        const merged = { ...user, ...payload }
        localStorage.setItem('user', JSON.stringify(merged))
        setUser(merged)
      }
      setProfileMsg(t('profile.saved'))
    } catch (e) {
      const msg = formatError(e, t('profile.somethingWrong'))
      setProfileErr(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordErr(null); setPasswordMsg(null)
    if (!currentPassword || !newPassword || !passwordConfirm) {
      setPasswordErr(t('profile.allPassRequired'))
      return
    }
    if (newPassword.length < 6) {
      setPasswordErr(t('profile.newPassMin'))
      return
    }
    if (newPassword !== passwordConfirm) {
      setPasswordErr(t('profile.passConfirmMismatch'))
      return
    }
    setSavingPassword(true)
    try {
      await updatePassword({ currentPassword, newPassword, passwordConfirm })
      setPasswordMsg(t('profile.passUpdated'))
      setCurrentPassword(''); setNewPassword(''); setPasswordConfirm('')
    } catch (e) {
      setPasswordErr(formatError(e, t('profile.somethingWrong')))
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDelete = async () => {
    setDeleteErr(null)
    if (confirmText !== 'CONFIRM') {
      setDeleteErr(t('profile.confirmExact'))
      return
    }
    if (role === 'admin') {
      setDeleteErr(t('profile.adminCantDelete'))
      return
    }
    setDeleting(true)
    try {
      await deleteMe()
      logout()
      navigate('/login', { replace: true })
    } catch (e) {
      setDeleteErr(formatError(e, t('profile.somethingWrong')))
      setDeleting(false)
    }
  }

  if (!user && !localStorage.getItem('token')) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-[#E7DFD3] rounded-xl p-8 text-center">
        <p className="text-sm text-[#8A8078]">{t('profile.needLogin')}</p>
        <button onClick={() => navigate('/login')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">{t('common.goLogin')}</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="font-serif text-2xl">{t('profile.title')}</h2>

      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 grid md:grid-cols-[140px_1fr] gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xl">{user ? `${(user.firstName||'')[0]||''}${(user.lastName||'')[0]||''}`.toUpperCase() || 'U' : 'G'}</div>
          <button className="text-xs border px-3 py-1 rounded-full opacity-60 cursor-not-allowed" title={t('profile.avatarHint')}>{t('profile.changeAvatar')}</button>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 capitalize">{t(ROLE_LABEL_KEYS[role] || 'roles.guest')}</span>
        </div>
        <div className="space-y-3">
          {profileErr && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{profileErr}</div>}
          {profileMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg">{profileMsg}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">{t('profile.firstName')}</label>
              <input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs">{t('profile.lastName')}</label>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div><label className="text-xs">{t('profile.email')}</label><input value={user?.email || ''} disabled className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-[#FAF7F2]" /></div>
          <div><label className="text-xs">{t('profile.phone')}</label><input placeholder={t('profile.phonePh')} value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div className="flex gap-2">
            <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
              {savingProfile ? t('profile.saving') : t('profile.save')}
            </button>
            <button onClick={handleLogout} className="border border-[#B3402E] text-[#B3402E] px-4 py-2 rounded-lg text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">logout</span>{t('nav.logout')}</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-3">
        <h3 className="font-medium text-sm">{t('profile.changePass')}</h3>
        {passwordErr && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg whitespace-pre-wrap">{passwordErr}</div>}
        {passwordMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg">{passwordMsg}</div>}
        <div className="grid gap-3">
          <input type="password" placeholder={t('profile.curPassPh')} value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder={t('profile.newPassPh')} value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder={t('profile.confirmPh')} value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={handleUpdatePassword} disabled={savingPassword} className="bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
          {savingPassword ? t('profile.updating') : t('profile.updatePass')}
        </button>
      </div>

      <div className="border border-[#ffdad6] bg-[#fff8f5] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#B3402E]">{t('profile.danger')}</h3>
        <p className="text-xs text-[#8A8078]">{t('profile.dangerText')} {role==='admin' && <span className="text-[#B3402E]">{t('profile.adminNoDelete')}</span>}</p>
        {!showDeleteConfirm ? (
          <button onClick={()=>setShowDeleteConfirm(true)} className="mt-2 border border-[#B3402E] text-[#B3402E] px-4 py-1.5 rounded-lg text-xs">{t('profile.deleteAccount')}</button>
        ) : (
          <div className="mt-3 space-y-2">
            {deleteErr && <div className="bg-white border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg whitespace-pre-wrap">{deleteErr}</div>}
            <input value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder={t('profile.typeConfirm')} className="w-full border border-[#ffdad6] rounded-lg px-3 py-2 text-sm" dir="ltr" />
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting} className="bg-[#B3402E] text-white px-4 py-1.5 rounded-lg text-xs disabled:opacity-60">{deleting ? t('profile.deleting') : t('profile.confirmDelete')}</button>
              <button onClick={()=>{setShowDeleteConfirm(false); setConfirmText(''); setDeleteErr(null)}} className="border px-4 py-1.5 rounded-lg text-xs bg-white">{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatError(e, fallback){
  if (e?.details) {
    if (Array.isArray(e.details)) return e.details.map(d => d.msg || d.message || JSON.stringify(d)).join('\n')
    if (typeof e.details === 'object') return JSON.stringify(e.details)
  }
  return e?.message || fallback || 'Something went wrong'
}
function freshFallback(res){
  return !res || !res.data
}
