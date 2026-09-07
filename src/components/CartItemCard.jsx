import { getProductImageUrl } from '../utils/image'

/**
 * CartItemCard - Reusable component for displaying a cart item
 * 
 * @param {Object} props
 * @param {Object} props.item - Cart item with product and quantity
 * @param {boolean} props.isLoading - Whether this item is being updated
 * @param {Function} props.onUpdateQty - Handler for quantity change (productId, newQty)
 * @param {Function} props.onRemove - Handler for removing item (productId)
 */
export default function CartItemCard({ item, isLoading, onUpdateQty, onRemove }) {
  const product = item.product || {}
  const displayImg = getProductImageUrl(product)
  const price = Number(product.price || 0)
  const qty = item.quantity

  return (
    <div className="flex gap-3 py-3 border-t">
      {/* Product Image */}
      {displayImg ? (
        <img 
          src={displayImg} 
          alt={product.name || 'Product'} 
          className="w-16 h-16 rounded-lg object-cover bg-[#FAF7F2]" 
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-[#E7DFD3] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#8A8078] text-2xl">image</span>
        </div>
      )}

      {/* Product Details */}
      <div className="flex-1">
        <div className="text-sm font-medium">{product.name || 'Unknown Product'}</div>
        <div className="text-xs text-[#8A8078]">{price.toLocaleString()} EGP × {qty}</div>
        {product.stock !== undefined && product.stock <= 5 && (
          <div className="text-xs text-amber-600">Only {product.stock} left</div>
        )}
      </div>

      {/* Quantity Controls & Remove */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onUpdateQty(item.productId, qty - 1)}
            disabled={isLoading || qty <= 1}
            className="px-2 text-xs disabled:opacity-40"
          >
            −
          </button>
          <span className="px-2 text-xs min-w-[24px] text-center">{qty}</span>
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
