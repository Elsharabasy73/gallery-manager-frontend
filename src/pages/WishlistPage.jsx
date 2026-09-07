import { useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useRole } from '../context/RoleContext'
import { useState } from 'react'
import ProductCard from '../components/ProductCard'

/**
 * WishlistPage - Customer's saved products
 * Single Responsibility: Display and manage wishlist items
 */
export default function WishlistPage() {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { items, loading, error, refresh, count } = useWishlist()
  const [localError, setLocalError] = useState(null)

  // Auth guard - only customers can access
  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">Wishlist is available for customers only. Please log in as a customer.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm"
        >
          Go to login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl">
          Wishlist <span className="text-sm text-[#8A8078]">({count} saved)</span>
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={refresh} 
            className="border px-4 py-1.5 rounded-full text-xs bg-white hover:bg-[#FAF7F2]"
          >
            Refresh
          </button>
          <button 
            onClick={() => navigate('/products')} 
            className="border px-4 py-1.5 rounded-full text-xs bg-white hover:bg-[#FAF7F2]"
          >
            Discover products
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {localError && (
        <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">
          {localError}
        </div>
      )}
      {error && (
        <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-[#E7DFD3]/60" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-[#E7DFD3]/60 rounded w-3/4" />
                <div className="h-3 bg-[#E7DFD3]/40 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">
          <p className="text-sm text-[#8A8078]">No saved items — Discover products</p>
          <button 
            onClick={() => navigate('/products')} 
            className="mt-3 text-[#C19A6B] text-sm underline"
          >
            Browse products
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <ProductCard 
              key={p._id || p.id} 
              product={p} 
              variant="wishlist" 
              onWishlistError={setLocalError} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Backward compatibility alias
export const Wishlist = WishlistPage
