import RoleSelector from './components/RoleSelector'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import AccessDenied from './components/AccessDenied'
import { useRole } from './context/RoleContext'

import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import BrowseGalleries from './pages/BrowseGalleries'
import GalleryProfile from './pages/GalleryProfile'
import { Login, Signup, Otp, ForgotPassword } from './pages/AuthPages'
import { Wishlist, Cart, MyOrders } from './pages/CustomerPages'
import { Overview, MyGallery, MyProducts, AddEditProduct, GalleryOrders, OrderDetails, Employees, AddEmployee, CreateGallery } from './pages/DashboardPages'
import { AdminUsers, AdminProducts, AdminGalleries, AdminOrders, AdminOverview } from './pages/AdminPages'
import Profile from './pages/Profile'

const PAGE_COMPONENTS = {
  'home': Home,
  'about': About,
  'products': Products,
  'product-detail': ProductDetail,
  'galleries': BrowseGalleries,
  'gallery-profile': GalleryProfile,
  'login': Login,
  'signup': Signup,
  'otp': Otp,
  'forgot-password': ForgotPassword,
  'reset-password': ForgotPassword,
  'wishlist': Wishlist,
  'cart': Cart,
  'my-orders': MyOrders,
  'dashboard-overview': Overview,
  'my-gallery': MyGallery,
  'my-products': MyProducts,
  'add-product': AddEditProduct,
  'edit-product': AddEditProduct,
  'gallery-orders': GalleryOrders,
  'order-details': OrderDetails,
  'employees': Employees,
  'add-employee': AddEmployee,
  'create-gallery': CreateGallery,
  'admin-users': AdminUsers,
  'admin-products': AdminProducts,
  'admin-galleries': AdminGalleries,
  'admin-orders': AdminOrders,
  'admin-overview': AdminOverview,
  'profile': Profile,
}

export default function App(){
  const { currentPage, isAllowed } = useRole()
  const Comp = PAGE_COMPONENTS[currentPage] || Home
  const allowed = isAllowed(currentPage)
  // dashboard pages need sidebar layout
  const needsSidebar = ['dashboard-overview','my-gallery','my-products','add-product','edit-product','gallery-orders','order-details','employees','add-employee','create-gallery','admin-users','admin-products','admin-galleries','admin-orders','admin-overview'].includes(currentPage)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#201a17]">
      <RoleSelector />
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        {needsSidebar ? (
          <div className="flex flex-col md:flex-row gap-6">
            <Sidebar />
            <div className="flex-1 min-w-0">
              {allowed ? <Comp /> : <AccessDenied pageId={currentPage} />}
            </div>
          </div>
        ) : (
          allowed ? <Comp /> : <AccessDenied pageId={currentPage} />
        )}
      </main>
      <Footer />
      {/* permission hint banner */}
      <div className="fixed bottom-3 right-3 bg-stone-900 text-white text-[11px] px-3 py-2 rounded-lg shadow-lg hidden md:block max-w-[260px]">
        <div className="font-semibold">Permissions (from gallery manager.ods)</div>
        <div className="text-stone-300 leading-tight mt-1">
          Customer: wishlist/cart/orders • Owner: overview/gallery/products/employees/orders • Employee: products/orders • Admin: users/products/galleries/all-orders
        </div>
      </div>
    </div>
  )
}
