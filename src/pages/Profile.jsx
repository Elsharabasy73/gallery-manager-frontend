import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { getMe, updateMe, updatePassword, deleteMe, unwrapUser } from '../api/users'

export default function Profile(){
  const { role, user, logout, setUser } = useRole()
  const navigate = useNavigate()

  // ---- profile form state ----
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErr, setProfileErr] = useState(null)

  // ---- password form state ----
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [passwordErr, setPasswordErr] = useState(null)

  // ---- delete state ----
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteErr, setDeleteErr] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // keep form in sync when user loads / changes; also optional fresh fetch via GET /users/me
  useEffect(() => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setPhone(user?.phone || '')
  }, [user])

  useEffect(() => {
    // if logged in, refresh from GET /users/me (protected)
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
      setProfileErr('First name and last name are required.')
      return
    }
    setSavingProfile(true)
    try {
      const payload = {}
      if (firstName.trim()) payload.firstName = firstName.trim()
      if (lastName.trim()) payload.lastName = lastName.trim()
      // phone is optional; send only if user typed something or wants to clear
      // if empty string we send empty to allow clearing, backend will validate
      payload.phone = phone.trim() || undefined
      // remove undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

      const res = await updateMe(payload)
      const updated = unwrapUser(res) || res?.data
      // backend may return { data: user } or { data: { user } }
      const userToStore = updated?.user ? updated.user : updated
      if (userToStore && userToStore.firstName) {
        localStorage.setItem('user', JSON.stringify(userToStore))
        setUser(userToStore)
      } else if (freshFallback(res)) {
        // fallback: merge locally
        const merged = { ...user, ...payload }
        localStorage.setItem('user', JSON.stringify(merged))
        setUser(merged)
      }
      setProfileMsg('Profile updated successfully.')
    } catch (e) {
      const msg = formatError(e)
      setProfileErr(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordErr(null); setPasswordMsg(null)
    if (!currentPassword || !newPassword || !passwordConfirm) {
      setPasswordErr('All password fields are required.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== passwordConfirm) {
      setPasswordErr('New password and confirmation do not match.')
      return
    }
    setSavingPassword(true)
    try {
      await updatePassword({ currentPassword, newPassword, passwordConfirm })
      setPasswordMsg('Password updated successfully.')
      setCurrentPassword(''); setNewPassword(''); setPasswordConfirm('')
    } catch (e) {
      setPasswordErr(formatError(e))
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDelete = async () => {
    setDeleteErr(null)
    if (confirmText !== 'CONFIRM') {
      setDeleteErr('Please type CONFIRM exactly to delete your account.')
      return
    }
    if (role === 'admin') {
      setDeleteErr('Admin accounts cannot be self-deleted.')
      return
    }
    setDeleting(true)
    try {
      await deleteMe()
      logout()
      navigate('/login', { replace: true })
    } catch (e) {
      setDeleteErr(formatError(e))
      setDeleting(false)
    }
  }

  if (!user && !localStorage.getItem('token')) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-[#E7DFD3] rounded-xl p-8 text-center">
        <p className="text-sm text-[#8A8078]">You need to log in to view your profile.</p>
        <button onClick={() => navigate('/login')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">Go to login</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="font-serif text-2xl">Profile</h2>

      {/* Profile info card: PUT /users/me */}
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 grid md:grid-cols-[140px_1fr] gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xl">{user ? `${(user.firstName||'')[0]||''}${(user.lastName||'')[0]||''}`.toUpperCase() || 'U' : 'G'}</div>
          <button className="text-xs border px-3 py-1 rounded-full opacity-60 cursor-not-allowed" title="Avatar upload not implemented">Change avatar</button>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 capitalize">{(role||'guest').replace('_',' ')}</span>
        </div>
        <div className="space-y-3">
          {profileErr && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{profileErr}</div>}
          {profileMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg">{profileMsg}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">First name*</label>
              <input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs">Last name*</label>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div><label className="text-xs">Email</label><input value={user?.email || ''} disabled className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-[#FAF7F2]" /></div>
          <div><label className="text-xs">Phone</label><input placeholder="Optional" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div className="flex gap-2">
            <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
            <button onClick={handleLogout} className="border border-[#B3402E] text-[#B3402E] px-4 py-2 rounded-lg text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">logout</span>Log out</button>
          </div>
        </div>
      </div>

      {/* Password card: PUT /users/me/password */}
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-3">
        <h3 className="font-medium text-sm">Change password</h3>
        {passwordErr && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg whitespace-pre-wrap">{passwordErr}</div>}
        {passwordMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg">{passwordMsg}</div>}
        <div className="grid gap-3">
          <input type="password" placeholder="Current password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="New password (min 6)" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="Confirm" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={handleUpdatePassword} disabled={savingPassword} className="bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
          {savingPassword ? 'Updating...' : 'Update password'}
        </button>
      </div>

      {role==='gallery_owner' && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#FAF7F2] border flex items-center justify-center">WH</div><div><div className="text-sm font-medium">Walnut House</div><div className="text-xs text-[#8A8078]">My gallery • Edit</div></div></div>
          <button className="text-sm border px-3 py-1 rounded-full">Edit gallery →</button>
        </div>
      )}
      {role==='employee' && (
        <div className="bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl p-4 text-sm">Member of <b>Walnut House</b> • Job: Sales</div>
      )}

      {/* Danger zone: DELETE /users/me */}
      <div className="border border-[#ffdad6] bg-[#fff8f5] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#B3402E]">Danger zone</h3>
        <p className="text-xs text-[#8A8078]">Delete your account — requires typing CONFIRM. {role==='admin' && <span className="text-[#B3402E]">Admins cannot self-delete (blocked by server).</span>}</p>
        {!showDeleteConfirm ? (
          <button onClick={()=>setShowDeleteConfirm(true)} className="mt-2 border border-[#B3402E] text-[#B3402E] px-4 py-1.5 rounded-lg text-xs">Delete my account</button>
        ) : (
          <div className="mt-3 space-y-2">
            {deleteErr && <div className="bg-white border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg whitespace-pre-wrap">{deleteErr}</div>}
            <input value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder='Type CONFIRM' className="w-full border border-[#ffdad6] rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting} className="bg-[#B3402E] text-white px-4 py-1.5 rounded-lg text-xs disabled:opacity-60">{deleting ? 'Deleting...' : 'Confirm delete'}</button>
              <button onClick={()=>{setShowDeleteConfirm(false); setConfirmText(''); setDeleteErr(null)}} className="border px-4 py-1.5 rounded-lg text-xs bg-white">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatError(e){
  if (e?.details) {
    // express-validator details often array of { msg, path }
    if (Array.isArray(e.details)) return e.details.map(d => d.msg || d.message || JSON.stringify(d)).join('\n')
    if (typeof e.details === 'object') return JSON.stringify(e.details)
  }
  return e?.message || 'Something went wrong'
}
function freshFallback(res){
  return !res || !res.data
}
