import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Protected from './components/Protected'

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

function NotFound(){
  return <div className="text-center py-16 bg-white border rounded-xl"><h2 className="font-serif text-2xl">404 — Not found</h2><p className="text-sm text-[#8A8078]">This page does not exist.</p><a href="/" className="text-[#C19A6B] text-sm underline">Go home</a></div>
}

export default function App(){
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/galleries" element={<BrowseGalleries />} />
        <Route path="/galleries/:slug" element={<GalleryProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />

        {/* customer only — redirect to home if not allowed */}
        <Route path="/wishlist" element={<Protected allow={['customer']} pageId="wishlist" redirectToHome><Wishlist /></Protected>} />
        <Route path="/cart" element={<Protected allow={['customer']} pageId="cart" redirectToHome><Cart /></Protected>} />
        <Route path="/my-orders" element={<Protected allow={['customer']} pageId="my-orders" redirectToHome><MyOrders /></Protected>} />

        {/* gallery owner / employee */}
        <Route path="/dashboard/overview" element={<Protected allow={['gallery_owner']} pageId="dashboard-overview" redirectToHome><Overview /></Protected>} />
        <Route path="/dashboard/my-gallery" element={<Protected allow={['gallery_owner']} pageId="my-gallery" redirectToHome><MyGallery /></Protected>} />
        <Route path="/dashboard/my-products" element={<Protected allow={['gallery_owner','employee']} pageId="my-products" redirectToHome><MyProducts /></Protected>} />
        <Route path="/dashboard/add-product" element={<Protected allow={['gallery_owner','employee']} pageId="add-product" redirectToHome><AddEditProduct /></Protected>} />
        <Route path="/dashboard/edit-product" element={<Protected allow={['gallery_owner','employee']} pageId="edit-product" redirectToHome><AddEditProduct /></Protected>} />
        <Route path="/dashboard/orders" element={<Protected allow={['gallery_owner','employee']} pageId="gallery-orders" redirectToHome><GalleryOrders /></Protected>} />
        <Route path="/dashboard/orders/:id" element={<Protected allow={['gallery_owner','employee','admin','customer']} pageId="order-details"><OrderDetails /></Protected>} />
        <Route path="/dashboard/employees" element={<Protected allow={['gallery_owner']} pageId="employees" redirectToHome><Employees /></Protected>} />
        <Route path="/dashboard/employees/add" element={<Protected allow={['gallery_owner']} pageId="add-employee" redirectToHome><AddEmployee /></Protected>} />
        <Route path="/dashboard/create-gallery" element={<Protected allow={['gallery_owner']} pageId="create-gallery" redirectToHome><CreateGallery /></Protected>} />

        {/* admin only */}
        <Route path="/admin/overview" element={<Protected allow={['admin']} pageId="admin-overview" redirectToHome><AdminOverview /></Protected>} />
        <Route path="/admin/users" element={<Protected allow={['admin']} pageId="admin-users" redirectToHome><AdminUsers /></Protected>} />
        <Route path="/admin/products" element={<Protected allow={['admin']} pageId="admin-products" redirectToHome><AdminProducts /></Protected>} />
        <Route path="/admin/galleries" element={<Protected allow={['admin']} pageId="admin-galleries" redirectToHome><AdminGalleries /></Protected>} />
        <Route path="/admin/orders" element={<Protected allow={['admin']} pageId="admin-orders" redirectToHome><AdminOrders /></Protected>} />

        {/* legacy path redirects for old state keys */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/dashboard-overview" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="/my-products" element={<Navigate to="/dashboard/my-products" replace />} />
        <Route path="/admin-users" element={<Navigate to="/admin/users" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
