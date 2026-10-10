import { NavLink } from 'react-router-dom'
import { useRole, NAV_CONFIG } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'

const NAV_LABEL_KEYS = {
  home: 'nav.home',
  products: 'nav.products',
  galleries: 'nav.galleries',
  about: 'nav.about',
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
  'admin-support': 'nav.support',
}

const ROLE_LABEL_KEYS = {
  customer: 'roles.customer',
  gallery_owner: 'roles.gallery_owner',
  employee: 'roles.employee',
  admin: 'roles.admin',
  craftsman: 'roles.craftsman',
  guest: 'roles.guest',
}

export default function Sidebar(){
  const { role } = useRole()
  const { t } = useLanguage()
  if(!role || role==='customer') return null
  const galleryLinks = NAV_CONFIG.gallery.filter(l=> !l.roles || l.roles.includes(role))
  const adminLinks = NAV_CONFIG.admin.filter(l=> l.roles.includes(role))

  const showGallery = galleryLinks.length>0
  const showAdmin = adminLinks.length>0
  if(!showGallery && !showAdmin) return null

  const Item = ({item})=>(
    <NavLink to={item.path}
      className={({isActive})=>`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-start transition-colors ${isActive?'bg-[#4B3621] text-white':'text-[#8A8078] hover:bg-white hover:text-[#4B3621]'}`}>
      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
      {t(NAV_LABEL_KEYS[item.id] || item.id)}
    </NavLink>
  )

  return (
    <aside className="w-full bg-white border border-[#E7DFD3] rounded-xl p-4 h-fit md:sticky md:top-[88px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#4B3621] text-white flex items-center justify-center text-xs font-bold">AG</div>
        <div>
          <div className="text-sm font-semibold">{t('sidebar.dashboard')}</div>
          <div className="text-[11px] text-[#8A8078] capitalize">{t(ROLE_LABEL_KEYS[role] || 'roles.guest')}</div>
        </div>
      </div>
      {showGallery && (
        <div className="space-y-1 mb-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-2 mb-1">{t('sidebar.galleryManage')}</div>
          {galleryLinks.map(item=><Item key={item.id} item={item} />)}
        </div>
      )}
      {showAdmin && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8078] px-2 mb-1">{t('sidebar.administration')}</div>
          {adminLinks.map(item=><Item key={item.id} item={item} />)}
        </div>
      )}
      <div className="mt-6 p-3 bg-[#FAF7F2] rounded-lg border border-[#E7DFD3]">
        <div className="text-xs font-medium">{t('sidebar.needHelp')}</div>
        <div className="text-[11px] text-[#8A8078]">{t('sidebar.helpText')}</div>
      </div>
    </aside>
  )
}
