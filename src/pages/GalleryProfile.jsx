import { products } from '../data/mockData'
export default function GalleryProfile(){
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <div className="h-[280px] bg-cover bg-center relative" style={{backgroundImage:"url('https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?auto=format&fit=crop&w=1400&q=80')"}}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex gap-4 -mt-12 relative">
            <div className="w-[100px] h-[100px] rounded-full bg-white border-4 border-white flex items-center justify-center font-serif text-xl shadow">WH</div>
            <div className="pt-10">
              <h1 className="font-serif text-2xl flex items-center gap-2">Walnut House <span className="w-2 h-2 rounded-full bg-[#4C7A4C]"></span></h1>
              <div className="text-xs text-[#8A8078] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> 12 El Hegaz St · Cairo · Egypt</div>
              <p className="text-xs text-[#8A8078] mt-1">Family-run showroom since 2012 — solid wood, honest craft.</p>
              <div className="text-xs text-[#8A8078] mt-2">12 products • member since 2021</div>
            </div>
            <div className="ml-auto hidden md:flex gap-2 pt-10">
              <button className="border px-4 py-1.5 rounded-full text-xs">View on Map</button>
              <button className="border px-4 py-1.5 rounded-full text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> Call</button>
              <button className="w-8 h-8 border rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">share</span></button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E7DFD3] rounded-full p-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-[#8A8078]">search</span>
          <input placeholder="Search in this gallery..." className="bg-transparent outline-none flex-1 text-sm" />
        </div>
        <button className="w-9 h-9 border rounded-full flex items-center justify-center"><span className="material-symbols-outlined">tune</span></button>
        <div className="hidden md:flex gap-1">
          <button className="w-8 h-8 bg-[#4B3621] text-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">grid_view</span></button>
          <button className="w-8 h-8 border rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">view_list</span></button>
        </div>
      </div>
      <div className="text-xs text-[#8A8078]">24 products</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.slice(0,6).map(p=>(
          <div key={p.id} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
            <img src={p.image} alt={p.name} className="aspect-[4/3] object-cover w-full" />
            <div className="p-3 flex justify-between"><span className="text-sm font-medium">{p.name}</span><span className="text-sm">{p.price.toLocaleString()} EGP</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
