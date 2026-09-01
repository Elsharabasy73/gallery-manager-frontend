import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { products as mockProducts } from '../data/mockData'
import { getProduct, unwrapProduct } from '../api/products'
import { getProductImageUrl, getGalleryLogoUrl } from '../utils/image'
import { useWishlist } from '../context/WishlistContext'
import { useRole } from '../context/RoleContext'

export default function ProductDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useRole()
  const { isWishlisted, toggle } = useWishlist()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty,setQty]=useState(1)
  const [wishLoading, setWishLoading]=useState(false)
  const [wishError, setWishError]=useState(null)

  // image gallery + magnifier state — hooks must be before any early return
  const [activeSrc, setActiveSrc] = useState(null)
  const [isZoomVisible, setIsZoomVisible] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 })
  const zoomLevel = 1.5
  const lensSize = 150
  const mainRef = useRef(null)

  useEffect(()=>{
    let cancelled=false
    async function fetchProduct() {
      setLoading(true)
      try {
        const res = await getProduct(id, { fields: 'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,description,materials,dimensions,gallery[id,name,slug,city,country,logo,storageFolder],category[id,name,slug]' })
        if (cancelled) return
        const data = unwrapProduct(res)
        if (data) setP(data)
        else setP(mockProducts.find(x=> String(x.id)===String(id)) || mockProducts[0])
      } catch {
        if (!cancelled) setP(mockProducts.find(x=> String(x.id)===String(id)) || mockProducts[0])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) fetchProduct()
    else { setP(mockProducts[0]); setLoading(false) }
    return ()=>{cancelled=true}
  },[id])

  // keep activeSrc in sync when product loads
  useEffect(()=>{
    if (!p) return
    const first = getProductImageUrl(p) || p.image || null
    if (first) setActiveSrc(first)
  },[p])

  const handleWishlist = async () => {
    setWishError(null)
    if (!isAuthenticated || role !== 'customer') {
      navigate('/login')
      return
    }
    const pid = p?._id || p?.id || id
    setWishLoading(true)
    try {
      await toggle(String(pid))
    } catch (e) {
      setWishError(e.message || 'Wishlist failed')
    } finally {
      setWishLoading(false)
    }
  }

  const handleMouseMove = (e) => {
    const el = mainRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    const xPercent = (x / rect.width) * 100
    const yPercent = (y / rect.height) * 100
    // clamp lens inside image
    const half = lensSize / 2
    const clampedX = Math.max(half, Math.min(rect.width - half, x))
    const clampedY = Math.max(half, Math.min(rect.height - half, y))
    setLensPos({ x: clampedX, y: clampedY })
    setBgPos({ x: xPercent, y: yPercent })
  }

  if (loading) return <div className="text-center py-12 text-sm text-[#8A8078]">Loading product...</div>
  if (!p) return <div className="text-center py-12 bg-white border rounded-xl">Product not found</div>

  const pid = p._id || p.id || id
  const wish = isWishlisted(String(pid))
  const img = getProductImageUrl(p) || p.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
  const galleryName = p.gallery?.name || p.gallery || 'Gallery'
  const galleryId = p.gallery?._id || p.gallery?.id
  const price = p.price
  const compare = p.compareAtPrice || p.compare
  const stock = p.stock ?? 0
  const desc = p.description || p.desc || 'Crafted from premium materials with attention to joinery and finish.'

  const resolveThumb = (s) => {
    if (!s) return null
    if (s.startsWith('http://') || s.startsWith('https://')) return s
    return getProductImageUrl({ mainImageUrl: s, storageFolder: p.storageFolder }) || s
  }
  const rawImages = (() => {
    const list = []
    if (p.mainImageUrl) list.push(p.mainImageUrl)
    if (Array.isArray(p.images)) list.push(...p.images)
    if (list.length === 0) list.push(img)
    if (list.length < 4) {
      const fallbacks = ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=300&q=80','https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=300&q=80']
      fallbacks.forEach(f=>{ if(list.length < 4) list.push(f)})
    }
    const resolved = list.map(resolveThumb).filter(Boolean)
    return [...new Set(resolved)].slice(0,6)
  })()
  const images = rawImages
  const displaySrc = activeSrc || img

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        {/* Main image with Amazon-like magnifier */}
        <div className="relative">
          <div
            ref={mainRef}
            className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-[#E7DFD3] cursor-zoom-in relative select-none touch-none"
            onMouseEnter={()=>setIsZoomVisible(true)}
            onMouseLeave={()=>setIsZoomVisible(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={(e)=>{ setIsZoomVisible(true); handleMouseMove(e) }}
            onTouchMove={handleMouseMove}
            onTouchEnd={()=>setIsZoomVisible(false)}
          >
            <img src={displaySrc} alt={p.name} className="w-full h-full object-cover" draggable={false} />
            {/* lens overlay — visible on hover */}
            {isZoomVisible && (
              <div
                className="hidden md:block absolute pointer-events-none border-2 border-[#C19A6B]/70 bg-[#C19A6B]/10 shadow-sm z-10"
                style={{
                  width: lensSize,
                  height: lensSize,
                  left: lensPos.x - lensSize/2,
                  top: lensPos.y - lensSize/2,
                }}
              />
            )}
          </div>

          {/* Zoom result pane — Amazon style, appears to the right */}
          {isZoomVisible && (
            <>
              {/* desktop/tablet side pane — show from md breakpoint */}
              <div
                className="hidden md:block absolute left-[calc(100%+16px)] top-0 w-[440px] h-[440px] rounded-xl overflow-hidden bg-white border-2 border-[#E7DFD3] shadow-2xl z-30 pointer-events-none"
                style={{
                  backgroundImage: `url(${displaySrc})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${zoomLevel * 100}% auto`,
                  backgroundPosition: `${Math.max(0, Math.min(100, bgPos.x))}% ${Math.max(0, Math.min(100, bgPos.y))}%`,
                }}
              />
              {/* mobile: inline magnified overlay */}
              <div
                className="md:hidden absolute inset-0 rounded-xl overflow-hidden pointer-events-none border-2 border-[#E7DFD3] bg-white shadow-xl z-20"
                style={{
                  backgroundImage: `url(${displaySrc})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${zoomLevel * 100}% auto`,
                  backgroundPosition: `${Math.max(0, Math.min(100, bgPos.x))}% ${Math.max(0, Math.min(100, bgPos.y))}%`,
                  opacity: isZoomVisible ? 1 : 0,
                }}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {images.map((src,i)=>{
            const isActive = src === displaySrc
            return (
              <button
                key={src + i}
                onClick={()=>setActiveSrc(src)}
                className={`rounded-lg overflow-hidden border-2 h-20 bg-white ${isActive ? 'border-[#4B3621] ring-1 ring-[#4B3621]' : 'border-[#E7DFD3] hover:border-[#C19A6B]/60'} transition`}
                aria-label={`View image ${i+1}`}
              >
                <img src={src} className="w-full h-full object-cover" alt="" loading="lazy" />
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-[#8A8078] hidden md:block">Hover to zoom • Click thumbnail to change main image</p>
        <p className="text-[11px] text-[#8A8078] md:hidden">Tap thumbnail to change image • Touch & hold to magnify</p>
      </div>
      <div className="space-y-4">
        <div className="text-xs text-[#8A8078]">Home / {p.category?.name || 'Products'} / {p.name}</div>
        <h1 className="font-serif text-3xl text-[#4B3621]">{p.name}</h1>
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-semibold">{Number(price).toLocaleString()} EGP</span>
          {compare && <span className="line-through text-sm text-[#8A8078]">{Number(compare).toLocaleString()} EGP</span>}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${Number(stock)>0?'bg-[#4C7A4C]':'bg-[#B3402E]'}`}></span> {Number(stock)>0 ? `In stock (${stock})` : 'Out of stock'}
          {p.dimensions && <span className="px-2 py-0.5 bg-[#E7DFD3] rounded-full">{typeof p.dimensions === 'string' ? p.dimensions : 'W 200 × D 90 × H 75 cm'}</span>}
        </div>
        {wishError && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{wishError}</div>}
        <p className="text-sm text-[#8A8078]">{desc} Dimensions and materials are customizable per gallery.</p>
        <div className="flex gap-2">
          {(p.materials || ['Oak','Bouclé','Brass']).slice?.(0,4).map?.(m=>(
            <span key={m} className="text-xs border px-2 py-1 rounded-full">{typeof m === 'string' ? m : m.name || m}</span>
          )) || <><span className="text-xs border px-2 py-1 rounded-full">Oak</span><span className="text-xs border px-2 py-1 rounded-full">Bouclé</span><span className="text-xs border px-2 py-1 rounded-full">Brass</span></>}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center border rounded-lg">
            <button onClick={()=>setQty(Math.max(1,qty-1))} className="px-3 py-1.5">−</button>
            <span className="px-3 text-sm">{qty}</span>
            <button onClick={()=>setQty(qty+1)} className="px-3 py-1.5">+</button>
          </div>
          <button className="flex-1 bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium">Add to Cart</button>
          <button onClick={handleWishlist} disabled={wishLoading} className={`w-10 h-10 rounded-lg border flex items-center justify-center disabled:opacity-60 ${wish?'bg-[#C19A6B] text-white border-[#C19A6B]': 'bg-white hover:bg-[#FAF7F2]'}`} title={wish ? 'Remove from wishlist' : 'Add to wishlist'}>
            <span className={`material-symbols-outlined ${wish?'icon-fill':''}`}>favorite</span>
          </button>
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border flex items-center justify-center overflow-hidden text-xs font-medium">
              {p.gallery?.logo ? <img src={getGalleryLogoUrl(p.gallery) || ''} alt={galleryName} className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} /> : (galleryName.slice(0,2).toUpperCase())}
            </div>
            <div><div className="text-sm font-medium">{galleryName}</div><div className="text-xs text-[#8A8078]">{p.gallery?.city || ''} {p.gallery?.country || ''}</div></div>
          </div>
          <button onClick={()=> galleryId ? navigate(`/galleries/${galleryId}`) : navigate('/galleries')} className="text-xs border px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2]">View Gallery</button>
        </div>
      </div>
    </div>
  )
}
