import { Link } from 'react-router-dom'
import { getProductImageUrl } from '../utils/image'
import { useLanguage } from '../i18n/LanguageContext'

export default function CartItemCard({ item, isLoading, onUpdateQty, onRemove }) {
  const { t, formatNumber, formatPrice } = useLanguage()
  const product = item.product || {}
  const productId = product.id || product._id || item.productId
  const productUrl = productId ? `/products/${productId}` : null
  const displayImg = getProductImageUrl(product)
  const price = Number(product.price || 0)
  const hasPrice = price > 0
  const qty = item.quantity

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3 py-3 border-t border-[#E7DFD3]">
      {productUrl ? (
        <Link to={productUrl} className="shrink-0 block rounded-lg overflow-hidden hover:opacity-80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]">
          {displayImg ? (
            <img
              src={displayImg}
              alt={product.name || t('cartItem.product')}
              className="w-16 h-16 rounded-lg object-cover bg-[#FAF7F2]"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[#E7DFD3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#8A8078] text-2xl">image</span>
            </div>
          )}
        </Link>
      ) : displayImg ? (
        <img
          src={displayImg}
          alt={product.name || t('cartItem.product')}
          className="w-16 h-16 rounded-lg object-cover bg-[#FAF7F2] shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-[#E7DFD3] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#8A8078] text-2xl">image</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {productUrl ? (
          <Link
            to={productUrl}
            className="text-sm font-medium hover:text-[#C19A6B] hover:underline transition block truncate"
          >
            {product.name || t('cartItem.unknown')}
          </Link>
        ) : (
          <div className="text-sm font-medium truncate">{product.name || t('cartItem.unknown')}</div>
        )}
        <div className="text-xs text-[#8A8078]">
          {hasPrice ? `${formatNumber(price)} ${t('common.currency')} × ` : ''}
          {formatNumber(qty)}
        </div>
        {product.stock !== undefined && product.stock <= 5 && (
          <div className="text-xs text-amber-600">{t('cartItem.onlyLeft', { n: formatNumber(product.stock) })}</div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="flex items-center border border-[#E7DFD3] rounded-lg">
          <button
            onClick={() => onUpdateQty(item.productId, qty - 1)}
            disabled={isLoading || qty <= 1}
            aria-label={t('cartItem.decreaseQty')}
            className="min-h-10 min-w-10 rounded-s-lg text-base hover:bg-[#FAF7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C19A6B] disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[24px] text-xs text-center" aria-live="polite">{formatNumber(qty)}</span>
          <button
            onClick={() => onUpdateQty(item.productId, qty + 1)}
            disabled={isLoading || (product.stock && qty >= product.stock)}
            aria-label={t('cartItem.increaseQty')}
            className="min-h-10 min-w-10 rounded-e-lg text-base hover:bg-[#FAF7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C19A6B] disabled:opacity-40"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.productId)}
          disabled={isLoading}
          aria-label={t('cartItem.remove')}
          className="min-h-10 min-w-10 border border-[#E7DFD3] rounded-lg flex items-center justify-center hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    </div>
  )
}
