import { createContext, useContext, useState, useMemo } from 'react'

export const ROLES = {
  customer: { id:'customer', label:'Customer', badge:'Customer', color:'bg-sky-500/20 text-sky-300 border-sky-500/30', user:'Alexandra Hayes' },
  gallery_owner: { id:'gallery_owner', label:'Gallery Owner', badge:'Owner', color:'bg-violet-500/20 text-violet-300 border-violet-500/30', user:'Alexandra Hayes' },
  employee: { id:'employee', label:'Employee', badge:'Employee', color:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', user:'Alexandra Hayes' },
  admin: { id:'admin', label:'Admin', badge:'Admin', color:'bg-amber-500/20 text-amber-300 border-amber-500/30', user:'Alexandra Hayes' },
}

export const ROLE_ORDER = ['customer','gallery_owner','employee','admin']

export const PERMISSIONS = {
  home: ['customer','gallery_owner','employee','admin'],
  about: ['customer','gallery_owner','employee','admin'],
  products: ['customer','gallery_owner','employee','admin'],
  'product-detail': ['customer','gallery_owner','employee','admin'],
  galleries: ['customer','gallery_owner','employee','admin'],
  'gallery-profile': ['customer','gallery_owner','employee','admin'],
  login: ['customer','gallery_owner','employee','admin'],
  signup: ['customer','gallery_owner','employee','admin'],
  otp: ['customer','gallery_owner','employee','admin'],
  'forgot-password': ['customer','gallery_owner','employee','admin'],
  'reset-password': ['customer','gallery_owner','employee','admin'],
  wishlist: ['customer'],
  cart: ['customer'],
  'my-orders': ['customer'],
  'dashboard-overview': ['gallery_owner','admin'],
  'my-gallery': ['gallery_owner'],
  'my-products': ['gallery_owner','employee'],
  'add-product': ['gallery_owner','employee'],
  'edit-product': ['gallery_owner','employee'],
  'gallery-orders': ['gallery_owner','employee'],
  'order-details': ['gallery_owner','employee','admin','customer'],
  employees: ['gallery_owner'],
  'add-employee': ['gallery_owner'],
  'create-gallery': ['gallery_owner'],
  'admin-users': ['admin'],
  'admin-products': ['admin'],
  'admin-galleries': ['admin'],
  'admin-orders': ['admin'],
  'admin-overview': ['admin'],
  profile: ['customer','gallery_owner','employee','admin'],
}

// Map URL path -> permission key
export const PATH_TO_PAGE = {
  '/': 'home',
  '/about': 'about',
  '/products': 'products',
  '/products/:id': 'product-detail',
  '/galleries': 'galleries',
  '/galleries/:slug': 'gallery-profile',
  '/login': 'login',
  '/signup': 'signup',
  '/otp': 'otp',
  '/forgot-password': 'forgot-password',
  '/reset-password': 'reset-password',
  '/wishlist': 'wishlist',
  '/cart': 'cart',
  '/my-orders': 'my-orders',
  '/dashboard/overview': 'dashboard-overview',
  '/dashboard/my-gallery': 'my-gallery',
  '/dashboard/my-products': 'my-products',
  '/dashboard/add-product': 'add-product',
  '/dashboard/edit-product': 'edit-product',
  '/dashboard/orders': 'gallery-orders',
  '/dashboard/orders/:id': 'order-details',
  '/dashboard/employees': 'employees',
  '/dashboard/employees/add': 'add-employee',
  '/dashboard/create-gallery': 'create-gallery',
  '/admin/overview': 'admin-overview',
  '/admin/users': 'admin-users',
  '/admin/products': 'admin-products',
  '/admin/galleries': 'admin-galleries',
  '/admin/orders': 'admin-orders',
  '/profile': 'profile',
}

export const NAV_CONFIG = {
  storefront: [
    { id:'home', label:'Home', path:'/' },
    { id:'products', label:'Products', path:'/products' },
    { id:'galleries', label:'Galleries', path:'/galleries' },
    { id:'about', label:'About Us', path:'/about' },
  ],
  customer: [
    { id:'wishlist', label:'Wishlist', icon:'favorite', path:'/wishlist' },
    { id:'cart', label:'Cart', icon:'shopping_cart', path:'/cart' },
    { id:'my-orders', label:'My Orders', icon:'receipt_long', path:'/my-orders' },
  ],
  gallery: [
    { id:'dashboard-overview', label:'Overview', icon:'dashboard', path:'/dashboard/overview', roles:['gallery_owner'] },
    { id:'my-gallery', label:'My Gallery', icon:'storefront', path:'/dashboard/my-gallery', roles:['gallery_owner'] },
    { id:'my-products', label:'My Products', icon:'inventory_2', path:'/dashboard/my-products', roles:['gallery_owner','employee'] },
    { id:'add-product', label:'Add Product', icon:'add_box', path:'/dashboard/add-product', roles:['gallery_owner','employee'] },
    { id:'gallery-orders', label:'Gallery Orders', icon:'orders', path:'/dashboard/orders', roles:['gallery_owner','employee'] },
    { id:'employees', label:'Employees', icon:'group', path:'/dashboard/employees', roles:['gallery_owner'] },
    { id:'create-gallery', label:'Create Gallery', icon:'add_business', path:'/dashboard/create-gallery', roles:['gallery_owner'] },
  ],
  admin: [
    { id:'admin-overview', label:'Admin Overview', icon:'admin_panel_settings', path:'/admin/overview', roles:['admin'] },
    { id:'admin-users', label:'Users', icon:'people', path:'/admin/users', roles:['admin'] },
    { id:'admin-products', label:'Products', icon:'category', path:'/admin/products', roles:['admin'] },
    { id:'admin-galleries', label:'Galleries', icon:'store', path:'/admin/galleries', roles:['admin'] },
    { id:'admin-orders', label:'All Orders', icon:'receipt_long', path:'/admin/orders', roles:['admin'] },
  ]
}

const RoleContext = createContext(null)
export const useRole = ()=> useContext(RoleContext)

export function RoleProvider({ children, defaultRole=null }){
  const [role, setRole] = useState(defaultRole)

  const isAllowed = (pageId) => {
    const allowed = PERMISSIONS[pageId]
    if(!allowed) return true
    // guest (unauthenticated, role === null) can access public + auth routes only
    if(!role){
      const guestAllowed = ['home','about','products','product-detail','galleries','gallery-profile','login','signup','otp','forgot-password','reset-password']
      return guestAllowed.includes(pageId)
    }
    return allowed.includes(role)
  }

  // legacy shim so old components calling setCurrentPage don't crash during migration
  const [currentPage, setCurrentPage] = useState('home')

  const value = useMemo(()=>({
    role, setRole,
    currentPage, setCurrentPage,
    isAllowed,
    isAuthenticated: !!role,
    roleMeta: ROLES[role] || { id:'guest', label:'Guest', badge:'Guest', color:'bg-stone-500/20 text-stone-300 border-stone-500/30', user:'Guest' }
  }), [role, currentPage])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
