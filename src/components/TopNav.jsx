import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRole, NAV_CONFIG } from '../context/RoleContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../i18n/LanguageContext'
import useHideOnScroll from '../hooks/useHideOnScroll'

const NAV_LABEL_KEYS = {
  home: 'nav.home',
  products: 'nav.products',
  galleries: 'nav.galleries',
  about: 'nav.about',
  support: 'nav.support',
  wishlist: 'nav.wishlist',
  cart: 'nav.cart',
  'my-orders': 'nav.myOrders',
  'dashboard-overview': 'nav.overview',
  'my-gallery': 'nav.myGallery',
  'my-products': 'nav.galleryProducts',
  'add-product': 'nav.addProduct',
  'gallery-orders': 'nav.galleryOrders',
  employees: 'nav.employees',
  'create-gallery': 'nav.createGallery',
  'admin-overview': 'nav.adminOverview',
  'admin-users': 'nav.users',
  'admin-products': 'nav.adminProducts',
  'admin-galleries': 'nav.adminGalleries',
  'admin-orders': 'nav.allOrders',
  'admin-categories': 'nav.categories',
}

function LangSwitcher({ compact = false }) {
  const { lang, setLang, t } = useLanguage()
  const btn = (code, label) => (
    <button
      key={code}
      onClick={() => setLang(code)}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        lang === code ? 'bg-[#4B3621] text-white' : 'text-[#8A8078] hover:text-[#4B3621]'
      }`}
      aria-pressed={lang === code}
    >
      {label}
    </button>
  )
  return (
    <div
      className={`flex items-center gap-0.5 bg-white border border-[#E7DFD3] rounded-full p-0.5 shrink-0 ${
        compact ? 'w-full justify-center' : ''
      }`}
      role="group"
      aria-label="Language / اللغة"
    >
      {btn('ar', t('lang.arabic'))}
      {btn('en', t('lang.english'))}
    </div>
  )
}

export default function TopNav(){
  const { role, logout, isAuthenticated } = useRole()
  const { count: wishlistCount } = useWishlist()
  const { itemCount: cartCount } = useCart()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const isCustomer = role==='customer' || role==='user'
  const isActive = (path)=> location.pathname===path
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const { visible: navVisible, scrolled } = useHideOnScroll({ threshold: 8, topBuffer: 96 })
  // The mobile drawer is portalled to document.body (see below), so it lives
  // outside the transformed <header> and its `fixed inset-0` works again.
  const showHeader = navVisible

  const handleLogout = ()=>{
    logout()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }
  const handleNav = (path)=>{
    setMenuOpen(false)
    navigate(path)
  }
  const handleSearch = ()=>{
    const q = searchInput.trim()
    setMenuOpen(false)
    if(q) navigate(`/products?keyword=${encodeURIComponent(q)}`)
    else navigate('/products')
  }

  // close menu on route change
  useEffect(()=>{ setMenuOpen(false) }, [location.pathname])
  // close menu on Escape
  useEffect(()=>{
    if (!menuOpen) return
    const onKey = (e)=>{ if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return ()=>document.removeEventListener('keydown', onKey)
  }, [menuOpen])
  // lock scroll when open
  useEffect(()=>{
    if(menuOpen) document.body.style.overflow='hidden'
    else document.body.style.overflow=''
    return ()=>{ document.body.style.overflow='' }
  }, [menuOpen])

  const galleryLinks = NAV_CONFIG.gallery.filter(l=> !l.roles || l.roles.includes(role))
  const adminLinks = NAV_CONFIG.admin.filter(l=> l.roles.includes(role))
  const navLabel = (link)=> t(NAV_LABEL_KEYS[link.id] || `nav.${link.id}`, null) === `nav.${link.id}` ? link.label : t(NAV_LABEL_KEYS[link.id])

  return (
    <header className={`bg-[#FAF7F2] sticky top-0 z-40 border-b border-[#E7DFD3] transition-transform duration-300 motion-reduce:transition-none ${showHeader ? 'translate-y-0' : '-translate-y-full'} ${scrolled && showHeader ? 'shadow-sm' : ''}`}>
      <div className="flex justify-between items-center w-full px-4 md:px-10 py-3 max-w-7xl mx-auto h-16">
        <button onClick={()=>navigate('/')} className="font-serif text-2xl text-[#4B3621] tracking-tight">{t('brand')}</button>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_CONFIG.storefront.map(link=>(
            <NavLink key={link.id} to={link.path}
              className={({isActive})=>`text-sm font-medium pb-1 border-b-2 transition-colors ${isActive?'border-[#4B3621] text-[#4B3621]':'border-transparent text-[#8A8078] hover:text-[#4B3621]'}`}>
              {navLabel(link)}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-[#4B3621]">
          <div className="hidden md:block"><LangSwitcher /></div>
          <button onClick={()=>navigate('/products')} className="hidden md:flex p-2 rounded-full hover:bg-white transition-colors" aria-label={t('common.search')}><span className="material-symbols-outlined">search</span></button>
          {isCustomer && (
            <>
              <button onClick={()=>navigate('/wishlist')} className={`hidden md:flex relative p-2 rounded-full hover:bg-white transition-colors ${isActive('/wishlist')?'bg-white':''}`}>
                <span className={`material-symbols-outlined ${isActive('/wishlist')?'icon-fill text-[#C19A6B]':''}`}>favorite</span>
                {wishlistCount > 0 && <span className="absolute -top-0.5 -end-0.5 bg-[#C19A6B] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount > 99 ? '99+' : wishlistCount}</span>}
              </button>
              <button onClick={()=>navigate('/cart')} className={`hidden md:flex relative p-2 rounded-full hover:bg-white transition-colors ${isActive('/cart')?'bg-white':''}`}>
                <span className={`material-symbols-outlined ${isActive('/cart')?'icon-fill text-[#4B3621]':''}`}>shopping_cart</span>
                {cartCount > 0 && <span className="absolute -top-0.5 -end-0.5 bg-[#4B3621] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount > 99 ? '99+' : cartCount}</span>}
              </button>
              <button onClick={()=>navigate('/my-orders')} className={`hidden md:flex relative p-2 rounded-full hover:bg-white transition-colors ${isActive('/my-orders')?'bg-white':''}`}>
                <span className={`material-symbols-outlined ${isActive('/my-orders')?'icon-fill text-[#4B3621]':''}`}>receipt_long</span>
              </button>
            </>
          )}
          {role==='gallery_owner' && (
            <button onClick={()=>navigate('/dashboard/overview')} className="hidden md:flex items-center gap-1 text-xs bg-[#4B3621] text-white px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px]">dashboard</span> {t('nav.dashboard')}
            </button>
          )}
          {role==='employee' && (
            <button onClick={()=>navigate('/dashboard/my-products')} className="hidden md:flex items-center gap-1 text-xs bg-white border px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span> {t('nav.galleryProducts')}
            </button>
          )}
          {role==='admin' && (
            <button onClick={()=>navigate('/admin/overview')} className="hidden md:flex items-center gap-1 text-xs bg-[#4B3621] text-white px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> {t('nav.admin')}
            </button>
          )}
          <div className="w-px h-6 bg-[#E7DFD3] mx-1 hidden md:block"></div>
          {!isAuthenticated ? (
            <button onClick={()=>navigate('/login')} className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-[#4B3621] text-white">
              {t('nav.login')}
            </button>
          ) : (
            <>
              <button onClick={()=>navigate('/profile')} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isActive('/profile')?'bg-[#4B3621] text-white':'bg-white border text-[#4B3621]'}`}>
                <span className="material-symbols-outlined text-[18px]">person</span> {t('nav.profile')}
              </button>
              <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border text-[#4B3621] hover:bg-[#FFF1F1] hover:text-[#B3402E] hover:border-[#ffdad6]">
                <span className="material-symbols-outlined text-[18px]">logout</span> {t('nav.logout')}
              </button>
            </>
          )}
          {/* Mobile hamburger */}
          <button onClick={()=>setMenuOpen(o=>!o)} className="md:hidden p-2 rounded-lg hover:bg-white" aria-label="Open menu" aria-expanded={menuOpen}>
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer — portalled to <body> so the header's scroll-hide
          transform can't hijack its `fixed` positioning or stacking */}
      {menuOpen && createPortal((
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setMenuOpen(false)} />
          <div className="absolute end-0 top-0 h-full w-[86%] max-w-[320px] bg-[#FAF7F2] border-s border-[#E7DFD3] shadow-xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7DFD3] bg-white sticky top-0">
              <span className="font-serif text-lg text-[#4B3621]">{t('nav.menu')}</span>
              <button onClick={()=>setMenuOpen(false)} className="p-2 rounded-full hover:bg-[#FAF7F2]"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="p-4 space-y-4">
              {/* Language */}
              <LangSwitcher compact />
              {/* Search */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-[#8A8078]">{t('nav.searchSection')}</div>
                <div className="flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full ps-3 pe-1.5 py-1.5">
                  <span className="material-symbols-outlined text-[#8A8078] text-[18px] shrink-0">search</span>
                  <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder={t('nav.searchProductsPh')} className="flex-1 outline-none text-sm bg-transparent min-w-0" />
                  <button onClick={handleSearch} aria-label={t('common.search')} className="w-8 h-8 shrink-0 bg-[#4B3621] text-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span></button>
                </div>
              </div>

              {/* Storefront */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-1">{t('nav.explore')}</div>
                {NAV_CONFIG.storefront.map(link=>(
                  <button key={link.id} onClick={()=>handleNav(link.path)} className={`w-full text-start flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${location.pathname===link.path?'bg-[#4B3621] text-white':'bg-white border border-[#E7DFD3] text-[#4B3621]'}`}>
                    {navLabel(link)}<span className="material-symbols-outlined text-[18px] opacity-60 rtl:rotate-180">chevron_right</span>
                  </button>
                ))}
              </div>

              {/* Customer quick links */}
              {isCustomer && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-1">{t('nav.myShop')}</div>
                  <button onClick={()=>handleNav('/wishlist')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-white border border-[#E7DFD3]"> <span className="material-symbols-outlined text-[18px]">favorite</span> {t('nav.wishlist')} {wishlistCount>0 && <span className="ms-auto bg-[#C19A6B] text-white text-[11px] px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}</button>
                  <button onClick={()=>handleNav('/cart')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-white border border-[#E7DFD3]"> <span className="material-symbols-outlined text-[18px]">shopping_cart</span> {t('nav.cart')} {cartCount>0 && <span className="ms-auto bg-[#4B3621] text-white text-[11px] px-1.5 py-0.5 rounded-full">{cartCount}</span>}</button>
                  <button onClick={()=>handleNav('/my-orders')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-white border border-[#E7DFD3]"> <span className="material-symbols-outlined text-[18px]">receipt_long</span> {t('nav.myOrders')}</button>
                </div>
              )}

              {/* Dashboard if gallery_owner / employee */}
              {(role==='gallery_owner' || role==='employee') && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-1">{t('nav.dashboard')}</div>
                  {galleryLinks.map(item=>(
                    <button key={item.id} onClick={()=>handleNav(item.path)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${location.pathname===item.path?'bg-[#4B3621] text-white':'bg-white border border-[#E7DFD3]'}`}><span className="material-symbols-outlined text-[18px]">{item.icon}</span>{t(NAV_LABEL_KEYS[item.id] || item.id)}</button>
                  ))}
                </div>
              )}

              {/* Admin if admin */}
              {role==='admin' && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-1">{t('nav.administration')}</div>
                  {adminLinks.map(item=>(
                    <button key={item.id} onClick={()=>handleNav(item.path)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${location.pathname===item.path?'bg-[#4B3621] text-white':'bg-white border border-[#E7DFD3]'}`}><span className="material-symbols-outlined text-[18px]">{item.icon}</span>{t(NAV_LABEL_KEYS[item.id] || item.id)}</button>
                  ))}
                </div>
              )}

              {/* Profile / Auth */}
              <div className="space-y-1 pt-2 border-t border-[#E7DFD3]">
                {!isAuthenticated ? (
                  <button onClick={()=>handleNav('/login')} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#4B3621] text-white"><span className="material-symbols-outlined text-[18px]">login</span> {t('nav.login')}</button>
                ) : (
                  <>
                    <button onClick={()=>handleNav('/profile')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${isActive('/profile')?'bg-[#4B3621] text-white':'bg-white border border-[#E7DFD3]'}`}><span className="material-symbols-outlined text-[18px]">person</span> {t('nav.profile')}</button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-white border border-[#ffdad6] text-[#B3402E]"><span className="material-symbols-outlined text-[18px]">logout</span> {t('nav.logout')}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ), document.body)}
    </header>
  )
}
