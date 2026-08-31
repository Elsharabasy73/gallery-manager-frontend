export default function About(){
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center py-8">
        <h1 className="font-serif text-4xl text-[#4B3621] mb-4">Furniture with a story</h1>
        <p className="text-[#8A8078] max-w-2xl mx-auto">Atelier Gallery connects discerning customers with independent showrooms. We curate warmth, craftsmanship and trust — not just catalogs.</p>
        <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=80" className="rounded-xl mt-8 w-full h-[380px] object-cover" alt="atelier" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {title:'Discover galleries', desc:'Browse verified showrooms with rich photography and brand stories.', icon:'search'},
          {title:'Save what you love', desc:'Wishlist and compare pieces across galleries.', icon:'favorite'},
          {title:'Order directly', desc:'Place orders per gallery — pay later with the gallery.', icon:'shopping_bag'},
        ].map(c=>(
          <div key={c.title} className="bg-white border border-[#E7DFD3] rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-[#C19A6B] text-3xl mb-2">{c.icon}</span>
            <h3 className="font-medium mb-1">{c.title}</h3>
            <p className="text-xs text-[#8A8078]">{c.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#4B3621] text-white rounded-xl p-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif text-xl">Open your own gallery</h3>
          <p className="text-white/70 text-sm">Create a showroom in minutes and start selling.</p>
        </div>
        <button className="bg-white text-[#4B3621] px-6 py-2 rounded-lg text-sm font-medium">Start selling</button>
      </div>
    </div>
  )
}
