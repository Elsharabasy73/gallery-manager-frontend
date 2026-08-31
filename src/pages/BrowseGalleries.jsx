import { useNavigate } from 'react-router-dom'
import { galleries } from '../data/mockData'
import { useRole } from '../context/RoleContext'
export default function BrowseGalleries(){
  const { role } = useRole()
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7DFD3] rounded-full px-4 py-2.5">
          <span className="material-symbols-outlined text-[#8A8078]">search</span>
          <input placeholder="Search galleries..." className="bg-transparent outline-none flex-1 text-sm" />
        </div>
        <select className="border rounded-full px-3 py-2 text-sm bg-white"><option>All Cities</option><option>Cairo</option><option>Paris</option></select>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {galleries.map(g=>(
          <div key={g.id} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
            <div className="h-28 bg-cover bg-center" style={{backgroundImage:`url(${g.banner})`}} />
            <div className="p-4">
              <div className="flex gap-3 -mt-8">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-white flex items-center justify-center font-serif shadow">{g.logo}</div>
                <div className="pt-6">
                  <div className="font-medium text-sm">{g.name}</div>
                  <div className="text-xs text-[#8A8078]">{g.city} • {g.products} products</div>
                </div>
              </div>
              <p className="text-xs text-[#8A8078] mt-3 line-clamp-2">Curated showroom featuring handcrafted furniture and timeless design pieces.</p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=>navigate(`/galleries/${g.id}`)} className="flex-1 bg-[#4B3621] text-white py-1.5 rounded-lg text-xs">View Showroom</button>
                {role==='admin' && <><button className="px-3 border rounded-lg text-xs">Edit</button><button className="px-3 bg-[#B3402E] text-white rounded-lg text-xs">Delete</button></>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
