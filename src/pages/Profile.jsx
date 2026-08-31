import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
export default function Profile(){
  const { role, user, logout } = useRole()
  const navigate = useNavigate()
  const handleLogout = ()=>{ logout(); navigate('/login', { replace: true }) }
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="font-serif text-2xl">Profile</h2>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 grid md:grid-cols-[140px_1fr] gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xl">{user ? `${(user.firstName||'')[0]||''}${(user.lastName||'')[0]||''}`.toUpperCase() || 'U' : 'G'}</div>
          <button className="text-xs border px-3 py-1 rounded-full">Change avatar</button>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 capitalize">{(role||'guest').replace('_',' ')}</span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">First name*</label><input defaultValue={user?.firstName || 'Alexandra'} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">Last name*</label><input defaultValue={user?.lastName || 'Hayes'} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
          <div><label className="text-xs">Email</label><input defaultValue={user?.email || 'alex@atelier.test'} disabled className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-[#FAF7F2]" /></div>
          <div><label className="text-xs">Phone</label><input placeholder="Optional" defaultValue={user?.phone || ''} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div className="flex gap-2"><button className="bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">Save changes</button><button onClick={handleLogout} className="border border-[#B3402E] text-[#B3402E] px-4 py-2 rounded-lg text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">logout</span>Log out</button></div>
        </div>
      </div>

      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-3">
        <h3 className="font-medium text-sm">Change password</h3>
        <div className="grid gap-3"><input type="password" placeholder="Current password" className="border rounded-lg px-3 py-2 text-sm" /><input type="password" placeholder="New password (min 6)" className="border rounded-lg px-3 py-2 text-sm" /><input type="password" placeholder="Confirm" className="border rounded-lg px-3 py-2 text-sm" /></div>
        <button className="border px-4 py-1.5 rounded-lg text-sm">Update password</button>
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

      <div className="border border-[#ffdad6] bg-[#fff8f5] rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#B3402E]">Danger zone</h3>
        <p className="text-xs text-[#8A8078]">Delete your account — requires typing CONFIRM.</p>
        <button className="mt-2 border border-[#B3402E] text-[#B3402E] px-4 py-1.5 rounded-lg text-xs">Delete my account</button>
      </div>
    </div>
  )
}
