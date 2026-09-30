import { getProductImageUrl } from '../utils/image'
import { useLanguage } from '../i18n/LanguageContext'

export default function CartItemCard({ item, isLoading, onUpdateQty, onRemove }) {
  const { t, formatNumber, formatPrice } = useLanguage()
  const product = item.product || {}
  const displayImg = getProductImageUrl(product)
  const price = Number(product.price || 0)
  const qty = item.quantity

  return (
    <div className="flex gap-3 py-3 border-t">
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

      <div className="flex-1">
        <div className="text-sm font-medium">{product.name || t('cartItem.unknown')}</div>
        <div className="text-xs text-[#8A8078]">{formatNumber(price)} {t('common.currency')} × {formatNumber(qty)}</div>
        {product.stock !== undefined && product.stock <= 5 && (
          <div className="text-xs text-amber-600">{t('cartItem.onlyLeft', { n: formatNumber(product.stock) })}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onUpdateQty(item.productId, qty - 1)}
            disabled={isLoading || qty <= 1}
            className="px-2 text-xs disabled:opacity-40"
          >
            −
          </button>
          <span className="px-2 text-xs min-w-[24px] text-center">{formatNumber(qty)}</span>
          <button
            onClick={() => onUpdateQty(item.productId, qty + 1)}
            disabled={isLoading || (product.stock && qty >= product.stock)}
            className="px-2 text-xs disabled:opacity-40"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.productId)}
          disabled={isLoading}
          className="w-7 h-7 border rounded flex items-center justify-center hover:bg-red-50 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    </div>
  )
}
