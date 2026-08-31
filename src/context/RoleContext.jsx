import { createContext, useContext, useState, useMemo } from 'react'

export const ROLES = {
  customer: { id:'customer', label:'Customer', badge:'Customer', color:'bg-sky-500/20 text-sky-300 border-sky-500/30', user:'Alexandra Hayes' },
  gallery_owner: { id:'gallery_owner', label:'Gallery Owner', badge:'Owner', color:'bg-violet-500/20 text-violet-300 border-violet-500/30', user:'Alexandra Hayes' },
  employee: { id:'employee', label:'Employee', badge:'Employee', color:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', user:'Alexandra Hayes' },
  admin: { id:'admin', label:'Admin', badge:'Admin', color:'bg-amber-500/20 text-amber-300 border-amber-500/30', user:'Alexandra Hayes' },
}

export const ROLE_ORDER = ['customer','gallery_owner','employee','admin']

// Permissions derived from gallery manager.ods + DESIGN.md + react_ready_ux_map_role_based.md
export const PERMISSIONS = {
  // public pages accessible to all authenticated roles
  home: ['customer','gallery_owner','employee','admin'],
  about: ['customer','gallery_owner','employee','admin'],
  products: ['customer','gallery_owner','employee','admin'],
  'product-detail': ['customer','gallery_owner','employee','admin'],
  galleries: ['customer','gallery_owner','employee','admin'],
  'gallery-profile': ['customer','gallery_owner','employee','admin'],
  // auth (visible to guest/customer primarily, but accessible if needed)
  login: ['customer','gallery_owner','employee','admin'],
  signup: ['customer','gallery_owner','employee','admin'],
  otp: ['customer','gallery_owner','employee','admin'],
  'forgot-password': ['customer','gallery_owner','employee','admin'],
  'reset-password': ['customer','gallery_owner','employee','admin'],
  // customer only
  wishlist: ['customer'],
  cart: ['customer'],
  'my-orders': ['customer'],
  // gallery owner + employee (dashboard)
  'dashboard-overview': ['gallery_owner','admin'], // admin also sees overview? keep owner only but admin has own
  'my-gallery': ['gallery_owner'],
  'my-products': ['gallery_owner','employee'],
  'add-product': ['gallery_owner','employee'],
  'edit-product': ['gallery_owner','employee'],
  'gallery-orders': ['gallery_owner','employee'],
  'order-details': ['gallery_owner','employee','admin','customer'],
  employees: ['gallery_owner'],
  'add-employee': ['gallery_owner'],
  'create-gallery': ['gallery_owner'],
  // admin only
  'admin-users': ['admin'],
  'admin-products': ['admin'],
  'admin-galleries': ['admin'],
  'admin-orders': ['admin'],
  'admin-overview': ['admin'],
  // shared
  profile: ['customer','gallery_owner','employee','admin'],
}

export const NAV_CONFIG = {
  storefront: [
    { id:'home', label:'Home', path:'home' },
    { id:'products', label:'Products', path:'products' },
    { id:'galleries', label:'Galleries', path:'galleries' },
    { id:'about', label:'About Us', path:'about' },
  ],
  customer: [
    { id:'wishlist', label:'Wishlist', icon:'favorite', path:'wishlist' },
    { id:'cart', label:'Cart', icon:'shopping_cart', path:'cart' },
    { id:'my-orders', label:'My Orders', icon:'receipt_long', path:'my-orders' },
  ],
  gallery: [
    { id:'dashboard-overview', label:'Overview', icon:'dashboard', path:'dashboard-overview', roles:['gallery_owner'] },
    { id:'my-gallery', label:'My Gallery', icon:'storefront', path:'my-gallery', roles:['gallery_owner'] },
    { id:'my-products', label:'My Products', icon:'inventory_2', path:'my-products', roles:['gallery_owner','employee'] },
    { id:'add-product', label:'Add Product', icon:'add_box', path:'add-product', roles:['gallery_owner','employee'] },
    { id:'gallery-orders', label:'Gallery Orders', icon:'orders', path:'gallery-orders', roles:['gallery_owner','employee'] },
    { id:'employees', label:'Employees', icon:'group', path:'employees', roles:['gallery_owner'] },
    { id:'create-gallery', label:'Create Gallery', icon:'add_business', path:'create-gallery', roles:['gallery_owner'] },
  ],
  admin: [
    { id:'admin-overview', label:'Admin Overview', icon:'admin_panel_settings', path:'admin-overview', roles:['admin'] },
    { id:'admin-users', label:'Users', icon:'people', path:'admin-users', roles:['admin'] },
    { id:'admin-products', label:'Products', icon:'category', path:'admin-products', roles:['admin'] },
    { id:'admin-galleries', label:'Galleries', icon:'store', path:'admin-galleries', roles:['admin'] },
    { id:'admin-orders', label:'All Orders', icon:'receipt_long', path:'admin-orders', roles:['admin'] },
  ]
}

const RoleContext = createContext(null)
export const useRole = ()=> useContext(RoleContext)

export function RoleProvider({ children, defaultRole='admin' }){
  const [role, setRole] = useState(defaultRole)
  const [currentPage, setCurrentPage] = useState('home')

  const isAllowed = (pageId) => {
    const allowed = PERMISSIONS[pageId]
    if(!allowed) return true
    return allowed.includes(role)
  }

  const value = useMemo(()=>({
    role, setRole,
    currentPage, setCurrentPage,
    isAllowed,
    roleMeta: ROLES[role]
  }), [role, currentPage])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
