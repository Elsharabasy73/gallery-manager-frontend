import { useNavigate } from 'react-router-dom'
import { useRole, ROLES, ROLE_ORDER } from '../context/RoleContext'

export default function RoleSelector(){
  const { role, setRole, roleMeta } = useRole()
  const navigate = useNavigate()
  const handleSwitch = (r)=>{
    setRole(r)
    navigate('/', { replace: true })
  }
  return (
    <div className="bg-stone-950 text-stone-200 px-4 py-1.5 text-xs border-b border-stone-800 sticky top-0 z-[60]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-stone-400 hidden sm:inline">Active User:</span>
          <span className="font-medium text-white">{roleMeta.user}</span>
          <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${roleMeta.color}`}>{roleMeta.badge}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-[11px] text-stone-400 hidden md:inline mr-1">Switch Role:</span>
          {ROLE_ORDER.map(r=>{
            const isActive = role===r
            return (
              <button
                key={r}
                onClick={()=>handleSwitch(r)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${isActive ? 'bg-amber-700 text-white font-bold shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
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
