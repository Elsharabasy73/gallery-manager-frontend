import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useRole, NAV_CONFIG } from '../context/RoleContext'

export default function TopNav(){
  const { role } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const isCustomer = role==='customer'
  const isActive = (path)=> location.pathname===path
  return (
    <header className="bg-[#FAF7F2] sticky top-[28px] z-40 border-b border-[#E7DFD3]">
      <div className="flex justify-between items-center w-full px-4 md:px-10 py-3 max-w-7xl mx-auto h-16">
        <button onClick={()=>navigate('/')} className="font-serif text-2xl text-[#4B3621] tracking-tight">Atelier Gallery</button>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_CONFIG.storefront.map(link=>(
            <NavLink key={link.id} to={link.path}
              className={({isActive})=>`text-sm font-medium pb-1 border-b-2 transition-colors ${isActive?'border-[#4B3621] text-[#4B3621]':'border-transparent text-[#8A8078] hover:text-[#4B3621]'}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-[#4B3621]">
          <button onClick={()=>navigate('/products')} className="p-2 rounded-full hover:bg-white transition-colors"><span className="material-symbols-outlined">search</span></button>
          {isCustomer && (
            <>
              <button onClick={()=>navigate('/wishlist')} className={`relative p-2 rounded-full hover:bg-white transition-colors ${isActive('/wishlist')?'bg-white':''}`}>
                <span className={`material-symbols-outlined ${isActive('/wishlist')?'icon-fill text-[#C19A6B]':''}`}>favorite</span>
                <span className="absolute -top-0.5 -right-0.5 bg-[#C19A6B] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">2</span>
              </button>
              <button onClick={()=>navigate('/cart')} className={`relative p-2 rounded-full hover:bg-white transition-colors ${isActive('/cart')?'bg-white':''}`}>
                <span className="material-symbols-outlined">shopping_cart</span>
                <span className="absolute -top-0.5 -right-0.5 bg-[#4B3621] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">3</span>
              </button>
            </>
          )}
          {role==='gallery_owner' && (
            <button onClick={()=>navigate('/dashboard/overview')} className="hidden sm:flex items-center gap-1 text-xs bg-[#4B3621] text-white px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px]">dashboard</span> Dashboard
            </button>
          )}
          {role==='employee' && (
            <button onClick={()=>navigate('/dashboard/my-products')} className="hidden sm:flex items-center gap-1 text-xs bg-white border px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span> My Products
            </button>
          )}
          {role==='admin' && (
            <button onClick={()=>navigate('/admin/overview')} className="hidden sm:flex items-center gap-1 text-xs bg-[#4B3621] text-white px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> Admin
            </button>
          )}
          <div className="w-px h-6 bg-[#E7DFD3] mx-1 hidden md:block"></div>
          {!role ? (
            <button onClick={()=>navigate('/login')} className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-[#4B3621] text-white">
              Log in
            </button>
          ) : (
            <button onClick={()=>navigate('/profile')} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isActive('/profile')?'bg-[#4B3621] text-white':'bg-white border text-[#4B3621]'}`}>
              <span className="material-symbols-outlined text-[18px]">person</span> Profile
            </button>
          )}
          <button onClick={()=>navigate('/login')} className="md:hidden p-2"><span className="material-symbols-outlined">menu</span></button>
        </div>
      </div>
      <div className="md:hidden flex gap-4 px-4 pb-2 overflow-x-auto hide-scrollbar">
        {NAV_CONFIG.storefront.map(l=>(
          <NavLink key={l.id} to={l.path} className={({isActive})=>`text-xs whitespace-nowrap ${isActive?'text-[#4B3621] font-semibold':''}`}>{l.label}</NavLink>
        ))}
      </div>
    </header>
  )
}
