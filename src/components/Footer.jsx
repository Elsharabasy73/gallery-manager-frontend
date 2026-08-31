export default function Footer(){
  return (
    <footer className="bg-[#4B3621] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-serif text-xl">Atelier Gallery</div>
        <div className="flex gap-6 text-xs text-white/60">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a><a href="#">Shipping</a>
        </div>
        <div className="text-xs text-white/60">© 2024 Atelier Gallery. All rights reserved.</div>
      </div>
    </footer>
  )
}
