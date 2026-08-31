import { NavLink } from 'react-router-dom'
import { useRole, NAV_CONFIG } from '../context/RoleContext'

export default function Sidebar(){
  const { role } = useRole()
  if(role==='customer') return null
  const galleryLinks = NAV_CONFIG.gallery.filter(l=> !l.roles || l.roles.includes(role))
  const adminLinks = NAV_CONFIG.admin.filter(l=> l.roles.includes(role))

  const showGallery = galleryLinks.length>0
  const showAdmin = adminLinks.length>0
  if(!showGallery && !showAdmin) return null

  const Item = ({item})=>(
    <NavLink to={item.path}
      className={({isActive})=>`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${isActive?'bg-[#4B3621] text-white':'text-[#8A8078] hover:bg-white hover:text-[#4B3621]'}`}>
      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
      {item.label}
    </NavLink>
  )

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white border border-[#E7DFD3] rounded-xl p-4 h-fit sticky top-[88px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#4B3621] text-white flex items-center justify-center text-xs font-bold">AG</div>
        <div>
          <div className="text-sm font-semibold">Dashboard</div>
          <div className="text-[11px] text-[#8A8078] capitalize">{role.replace('_',' ')}</div>
        </div>
      </div>
      {showGallery && (
        <div className="space-y-1 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-2 mb-1">Gallery Manage</div>
          {galleryLinks.map(item=><Item key={item.id} item={item} />)}
        </div>
      )}
      {showAdmin && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-2 mb-1">Administration</div>
          {adminLinks.map(item=><Item key={item.id} item={item} />)}
        </div>
      )}
      <div className="mt-6 p-3 bg-[#FAF7F2] rounded-lg border border-[#E7DFD3]">
        <div className="text-xs font-medium">Need help?</div>
        <div className="text-[11px] text-[#8A8078]">Conditional rendering active — only pages your role can access are shown here. URL now reflects navigation.</div>
      </div>
    </aside>
  )
}
