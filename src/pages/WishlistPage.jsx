import { useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useRole } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useState } from 'react'
import ProductCard from '../components/ProductCard'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { items, loading, error, refresh, count } = useWishlist()
  const { t, formatNumber } = useLanguage()
  const [localError, setLocalError] = useState(null)

  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">{t('wishlist.onlyCustomer')}</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm"
        >
          {t('common.goLogin')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="font-serif text-2xl">
          {t('wishlist.title')} <span className="text-sm text-[#8A8078]">{t('wishlist.saved', { n: formatNumber(count) })}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refresh}
            className="min-h-10 border border-[#E7DFD3] px-4 rounded-full text-xs bg-white hover:bg-[#FAF7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
          >
            {t('common.refresh')}
          </button>
          <button
            onClick={() => navigate('/products')}
            className="min-h-10 border border-[#E7DFD3] px-4 rounded-full text-xs bg-white hover:bg-[#FAF7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
          >
            {t('wishlist.discover')}
          </button>
        </div>
      </div>

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
        <div className="text-center py-12 bg-white border border-dashed border-[#E7DFD3] rounded-xl">
          <p className="text-sm text-[#8A8078]">{t('wishlist.empty')}</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-3 text-[#C19A6B] text-sm underline"
          >
            {t('wishlist.browse')}
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

export const Wishlist = WishlistPage
