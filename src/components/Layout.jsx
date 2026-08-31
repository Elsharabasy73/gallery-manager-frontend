import { Outlet, useLocation } from 'react-router-dom'
import RoleSelector from './RoleSelector'
import TopNav from './TopNav'
import Footer from './Footer'
import Sidebar from './Sidebar'

export default function Layout(){
  const location = useLocation()
  const path = location.pathname
  const needsSidebar = path.startsWith('/dashboard') || path.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#201a17]">
      {import.meta.env.DEV && <RoleSelector />}
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        {needsSidebar ? (
          <div className="flex flex-col md:flex-row gap-6">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
      <div className="fixed bottom-3 right-3 bg-stone-900 text-white text-[11px] px-3 py-2 rounded-lg shadow-lg hidden md:block max-w-[260px]">
        <div className="font-semibold">Permissions (from gallery manager.ods)</div>
        <div className="text-stone-300 leading-tight mt-1">
          Customer: wishlist/cart/orders • Owner: overview/gallery/products/employees/orders • Employee: products/orders • Admin: users/products/galleries/all-orders
        </div>
      </div>
    </div>
  )
}
