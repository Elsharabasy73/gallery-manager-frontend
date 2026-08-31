import { useRole, PERMISSIONS } from '../context/RoleContext'

export default function AccessDenied({ pageId }){
  const { role } = useRole()
  const allowed = PERMISSIONS[pageId] || []
  return (
    <div className="max-w-xl mx-auto text-center py-16 px-6 bg-white border border-[#E7DFD3] rounded-xl">
      <div className="w-12 h-12 mx-auto rounded-full bg-[#ffdad6] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[#B3402E]">block</span>
      </div>
      <h2 className="font-serif text-2xl mb-2">Access Denied</h2>
      <p className="text-sm text-[#8A8078] mb-4">
        Your current role <span className="font-semibold text-[#4B3621] capitalize">{role.replace('_',' ')}</span> cannot access <span className="font-mono bg-[#FAF7F2] px-1 rounded">{pageId}</span>.
      </p>
      <p className="text-xs text-[#8A8078]">Allowed roles: {allowed.length? allowed.join(', ') : 'public'}</p>
      <p className="text-xs mt-4 bg-amber-50 border border-amber-200 rounded p-2">Switch role using the top bar selector to verify permissions (as per .ods file).</p>
    </div>
  )
}
