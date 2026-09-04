import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { useWishlist } from '../context/WishlistContext'
import { getProductImageUrl } from '../utils/image'

function formatPrice(price) {
  const n = Number(price)
  if (Number.isNaN(n)) return price
  return n.toLocaleString()
}

/**
 * Reusable ProductCard — single source of truth for product presentation.
 * Wishlist affordance is visible ONLY when role === 'customer' (fixes bug where
 * Home showed heart for gallery_owner / employee / admin / guest while Products hid it).
 *
 * Props:
 *  - product: product object
 *  - variant: 'default' | 'home' | 'wishlist' — 'home' minimal, 'default' with View/Save or Admin, 'wishlist' with View/Remove (for Wishlist page)
 *  - aspect: tailwind aspect class, e.g. 'aspect-[4/3]'
 *  - onWishlistError: optional callback(msg) to bubble wishlist errors to parent banner
 */
export default function ProductCard({ product: p, variant = 'default', aspect = 'aspect-[4/3]', onWishlistError, onEdit, onDelete, deleting }) {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { isWishlisted, toggle } = useWishlist()
  const [toggling, setToggling] = useState(false)

  const pid = String(p?.id ?? p?._id ?? '')
  const img =
    getProductImageUrl(p) ||
    p?.image ||
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
  const galleryName = p?.gallery?.name || (typeof p?.gallery === 'string' ? p.gallery : '') || ''
  const categoryName = p?.category?.name || (typeof p?.category === 'string' ? p.category : '') || ''
  const price = p?.price
  const stock = p?.stock
  const wished = pid ? isWishlisted(pid) : false

  // Strict rule: only customers may see wishlist. Covers gallery_owner, employee, admin, and guest (role === null).
  const showWishlist = role === 'customer'
  const showAdminBadge = role === 'admin'

  const handleWishlist = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated || role !== 'customer') {
      navigate('/login')
      return
    }
    if (!pid) return
    setToggling(true)
    try {
      await toggle(pid)
    } catch (err) {
      const msg = err?.message || 'Wishlist failed'
      if (onWishlistError) onWishlistError(msg)
    } finally {
      setToggling(false)
    }
  }

  const handleNavigate = () => {
    if (pid) navigate(`/products/${pid}`)
  }

  // —— HOME VARIANT: minimal card (previous Home styling) ——
  if (variant === 'home') {
    return (
      <div className="group cursor-pointer" onClick={handleNavigate}>
        <div className={`relative ${aspect} rounded-xl overflow-hidden bg-white mb-3 border border-[#E7DFD3]`}>
          <img
            src={img}
            alt={p?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            loading="lazy"
          />
          {showWishlist && (
            <button
              onClick={handleWishlist}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition ${
                wished ? 'bg-[#C19A6B] text-white' : 'bg-white/90 hover:bg-white'
              }`}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              disabled={toggling}
            >
              <span className={`material-symbols-outlined text-[18px] ${wished ? 'icon-fill' : ''}`}>favorite</span>
            </button>
          )}
          {Number(stock) === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-[#4B3621] text-white text-xs px-3 py-1 rounded-full">Out of stock</span>
            </div>
          )}
        </div>
        <div className="flex justify-between text-sm gap-2">
          <span className="font-medium truncate">{p?.name}</span>
          <span className="font-semibold whitespace-nowrap">{formatPrice(price)} EGP</span>
        </div>
        <div className="text-xs text-[#8A8078] flex items-center gap-1 truncate">
          <span className="material-symbols-outlined text-[14px]">storefront</span>
          {galleryName || categoryName || 'Gallery'}
        </div>
      </div>
    )
  }

  // —— WISHLIST VARIANT: View + Remove (Wishlist page, customer-only) ——
  if (variant === 'wishlist') {
    return (
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden group">
        <div className={`relative ${aspect} overflow-hidden cursor-pointer`} onClick={handleNavigate}>
          <img src={img} alt={p?.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition" loading="lazy" />
          {Number(stock) === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-[#4B3621] text-white text-xs px-3 py-1 rounded-full">Out of stock</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex justify-between gap-2">
            <span className="text-sm font-medium truncate">{p?.name}</span>
            <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(price)} EGP</span>
          </div>
          <div className="text-xs text-[#8A8078] truncate">{galleryName}</div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleWishlist}
              disabled={toggling}
              className="flex-1 border py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 bg-white hover:bg-[#FAF7F2] disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px] icon-fill text-[#C19A6B]">favorite</span> {toggling ? 'Removing...' : 'Remove'}
            </button>
            <button onClick={handleNavigate} className="flex-1 bg-[#4B3621] text-white py-1.5 rounded-lg text-xs">
              View product
            </button>
          </div>
        </div>
      </div>
    )
  }

  // —— DEFAULT VARIANT: full card with action bar (used in Products, galleries, etc.) ——
  return (
    <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden group">
      <div className={`relative ${aspect} overflow-hidden cursor-pointer`} onClick={handleNavigate}>
        <img src={img} alt={p?.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        {Number(stock) === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-[#4B3621] text-white text-xs px-3 py-1 rounded-full">Out of stock</span>
          </div>
        )}
        {showAdminBadge && (
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full">Admin</span>
          </div>
        )}
        {showWishlist && (
          <button
            onClick={handleWishlist}
            disabled={toggling}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition ${
              wished ? 'bg-[#C19A6B] text-white' : 'bg-white/90 hover:bg-white'
            }`}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span className={`material-symbols-outlined text-[18px] ${wished ? 'icon-fill' : ''}`}>favorite</span>
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between gap-2">
          <h3 className="font-medium text-sm truncate">{p?.name}</h3>
          <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(price)} EGP</span>
        </div>
        <div className="text-xs text-[#8A8078] truncate">
          {galleryName}
          {galleryName && categoryName ? ' • ' : ''}
          {categoryName}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleNavigate} className="flex-1 border py-1.5 rounded-lg text-xs">
            View
          </button>
          {showWishlist && (
            <button
              onClick={handleWishlist}
              disabled={toggling}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                wished ? 'bg-[#C19A6B] text-white border-[#C19A6B]' : 'bg-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[14px] ${wished ? 'icon-fill' : ''}`}>favorite</span>{' '}
              {wished ? 'Saved' : 'Save'}
            </button>
          )}
          {showAdminBadge && (
            <>
              <button onClick={(e)=>{e.stopPropagation(); onEdit?.(p)}} className="px-3 py-1.5 rounded-lg bg-white border text-xs hover:bg-[#FAF7F2]">Edit</button>
              <button onClick={(e)=>{e.stopPropagation(); onDelete?.(p)}} disabled={!!deleting} className="px-3 py-1.5 rounded-lg bg-[#B3402E] text-white text-xs disabled:opacity-60">{deleting?'Deleting...':'Delete'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
