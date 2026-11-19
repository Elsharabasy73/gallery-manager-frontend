import { useNavigate } from 'react-router-dom'
import { useRole, ROLES, ROLE_ORDER } from '../context/RoleContext'

export default function RoleSelector(){
  const { role, setRole, roleMeta } = useRole()
  const navigate = useNavigate()
  const ROLE_HOME = {
    customer: '/',
    gallery_owner: '/dashboard/overview',
    employee: '/dashboard/my-products',
    admin: '/admin/overview',
  }
  const handleSwitch = (r)=>{
    setRole(r)
    if(r === null) navigate('/', { replace: true })
    else navigate(ROLE_HOME[r] || '/', { replace: true })
  }
  return (
    <div className="bg-stone-950 text-stone-200 px-4 py-1.5 text-xs border-b border-stone-800 sticky top-0 z-[60]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-stone-400 hidden sm:inline">Active User:</span>
          <span className="font-medium text-white truncate max-w-[6rem] sm:max-w-none">{roleMeta.user}</span>
          <span className={`shrink-0 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${roleMeta.color}`}>{roleMeta.badge}</span>
        </div>
        <div className="flex shrink-0 max-w-[58vw] sm:max-w-none items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] text-stone-400 hidden md:inline mr-1">Switch Role:</span>
          <button
            onClick={()=>handleSwitch(null)}
            aria-pressed={!role}
            className={`min-h-10 shrink-0 whitespace-nowrap px-2.5 rounded text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${!role ? 'bg-amber-700 text-white font-bold shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
          >
            Guest
          </button>
          {ROLE_ORDER.map(r=>{
            const isActive = role===r
            return (
              <button
                key={r}
                onClick={()=>handleSwitch(r)}
                aria-pressed={isActive}
                className={`min-h-10 shrink-0 whitespace-nowrap px-2.5 rounded text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${isActive ? 'bg-amber-700 text-white font-bold shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
              >
                {ROLES[r].label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
