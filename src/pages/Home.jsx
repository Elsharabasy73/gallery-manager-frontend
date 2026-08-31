import { useNavigate } from 'react-router-dom'
import { products, galleries } from '../data/mockData'
export default function Home(){
  const navigate = useNavigate()
  return (
    <div className="space-y-12">
      <section className="relative w-full h-[58vh] min-h-[420px] rounded-xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80')"}} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4B3621]/60 via-[#4B3621]/20 to-transparent flex flex-col items-center justify-end md:justify-center text-center p-8">
          <h1 className="font-serif text-3xl md:text-5xl text-white mb-6 max-w-3xl drop-shadow">Furniture crafted for living</h1>
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur rounded-lg p-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8A8078] ml-2">search</span>
            <input className="w-full bg-transparent outline-none text-sm placeholder:text-[#8A8078]" placeholder="Search products, styles, or galleries..." />
            <button onClick={()=>navigate('/products')} className="bg-[#4B3621] text-white px-6 py-2.5 rounded text-sm font-medium whitespace-nowrap">Browse Products</button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2">
          {['Sofas • صوفا','Tables • طاولات','Seating • مقاعد','Lighting • إضاءة','Decor • ديكور'].map(c=>(
            <button key={c} className="shrink-0 border border-[#E7DFD3] bg-white px-5 py-2 rounded-full text-sm">{c}</button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-serif text-2xl text-[#4B3621]">Curated Selections</h2>
            <p className="text-sm text-[#8A8078]">Handpicked pieces from premium galleries</p>
          </div>
          <button onClick={()=>navigate('/products')} className="hidden md:flex items-center gap-1 text-sm text-[#78582f]">View all <span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0,4).map(p=>(
            <div key={p.id} className="group cursor-pointer" onClick={()=>navigate('/products/1')}>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white mb-3">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">favorite</span></button>
              </div>
              <div className="flex justify-between text-sm"><span className="font-medium">{p.name}</span><span className="font-semibold">{p.price.toLocaleString()} EGP</span></div>
              <div className="text-xs text-[#8A8078] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">storefront</span>{p.gallery}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#E7DFD3] p-8 text-center">
        <h3 className="font-serif text-xl mb-6">Represented Galleries</h3>
        <div className="flex flex-wrap justify-center gap-10">
          {galleries.map(g=>(
            <button key={g.id} onClick={()=>navigate('/galleries/1')} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border flex items-center justify-center font-serif">{g.logo}</div>
              <span className="text-sm font-medium">{g.name}</span>
              <span className="text-xs text-[#8A8078]">{g.city}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
