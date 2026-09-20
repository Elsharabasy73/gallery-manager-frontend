import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
// import RoleSelector from './RoleSelector'
import TopNav from './TopNav'
import Footer from './Footer'
import Sidebar from './Sidebar'
import usePageTracking from '../hooks/usePageTracking'

export default function Layout(){
  const location = useLocation()
  usePageTracking()
  const path = location.pathname
  const needsSidebar = path.startsWith('/dashboard') || path.startsWith('/admin')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(()=>{ setMobileSidebarOpen(false) }, [path])

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#201a17]">
      {/* {import.meta.env.DEV && <RoleSelector />} */}
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        {needsSidebar ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Mobile dashboard toggle - fixes dashboard taking whole screen */}
            <button
              onClick={()=>setMobileSidebarOpen(o=>!o)}
              className="md:hidden flex items-center justify-between w-full bg-white border border-[#E7DFD3] rounded-xl px-4 py-3 text-sm font-medium text-[#4B3621]"
            >
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard Menu</span>
              <span className="material-symbols-outlined text-[20px]">{mobileSidebarOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
            <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
              <Sidebar />
            </div>
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </div>
  )
}
