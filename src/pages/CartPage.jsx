import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useRole } from '../context/RoleContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/orders'
import CartItemCard from '../components/CartItemCard'

/**
 * CartPage - Customer's shopping cart
 * Single Responsibility: Display and manage cart items
 */
export default function CartPage() {
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { 
    items, 
    itemCount, 
    totalPrice, 
    groupedByGallery, 
    loading, 
    error, 
    updateItem, 
    removeItem, 
    clear, 
    refresh 
  } = useCart()
  
  const [actionLoading, setActionLoading] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')

  // Handlers
  const handleUpdateQty = async (productId, newQty) => {
    if (newQty < 1) return
    setActionLoading(productId)
    setSuccess('')
    setLocalError('')
    try {
      await updateItem(productId, newQty)
      setSuccess('Cart updated')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || 'Failed to update quantity')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return
    setActionLoading(productId)
    setSuccess('')
    setLocalError('')
    try {
      await removeItem(productId)
      setSuccess('Item removed from cart')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || 'Failed to remove item')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Clear all items from cart?')) return
    setSuccess('')
    setLocalError('')
    try {
      await clear()
      setSuccess('Cart cleared')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setLocalError(err.message || 'Failed to clear cart')
    }
  }

  const handleCheckout = async (galleryId) => {
    setCheckoutLoading(galleryId)
    setSuccess('')
    setLocalError('')
    try {
      await createOrder({ galleryId })
      setSuccess('Order placed successfully!')
      await refresh()
      setTimeout(() => {
        navigate('/my-orders')
      }, 1500)
    } catch (err) {
      setLocalError(err.message || 'Failed to checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }

  // Auth guard - only customers can access
  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">Cart is available for customers only. Please log in as a customer.</p>
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
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      {/* Cart Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl">Cart ({itemCount})</h2>
          {items.length > 0 && (
            <button 
              onClick={handleClearCart} 
              className="text-xs text-[#B3402E] border border-[#B3402E] px-3 py-1 rounded-full hover:bg-red-50"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {localError && (
          <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-sm px-4 py-3 rounded-lg">
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
          <div className="text-center py-12 text-sm text-[#8A8078]">Loading cart...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed rounded-xl">
            <span className="material-symbols-outlined text-4xl text-[#8A8078]">shopping_cart</span>
            <p className="text-sm text-[#8A8078] mt-2">Your cart is empty</p>
            <button 
              onClick={() => navigate('/products')} 
              className="mt-3 text-[#C19A6B] text-sm underline"
            >
              Browse products
            </button>
          </div>
        ) : (
          groupedByGallery.map(group => (
            <GalleryGroup
              key={group.galleryId}
              group={group}
              actionLoading={actionLoading}
              checkoutLoading={checkoutLoading}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
              onCheckout={handleCheckout}
            />
          ))
        )}
      </div>

      {/* Summary Sidebar */}
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 h-fit sticky top-[88px]">
        <h3 className="font-medium text-sm mb-3">Summary</h3>
        <div className="text-xs space-y-2 text-[#8A8078]">
          <div className="flex justify-between">
            <span>Total items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Total value</span>
            <span className="font-semibold text-[#4B3621]">
              {Number(totalPrice || 0).toLocaleString()} EGP
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[#8A8078] mt-3">
          Pay later with the gallery — no payment UI yet.
        </p>
      </div>
    </div>
  )
}

/**
 * GalleryGroup - Groups cart items by gallery
 * Single Responsibility: Display items from one gallery with checkout
 */
function GalleryGroup({ group, actionLoading, checkoutLoading, onUpdateQty, onRemove, onCheckout }) {
  return (
    <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
      {/* Gallery Header */}
      <div className="flex items-center gap-2 font-medium text-sm mb-3">
        <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">
          {group.galleryName.substring(0, 2).toUpperCase()}
        </div>
        <span>{group.galleryName}</span>
      </div>

      {/* Cart Items */}
      {group.items.map(item => (
        <CartItemCard
          key={item.id || item.productId}
          item={item}
          isLoading={actionLoading === item.productId}
          onUpdateQty={onUpdateQty}
          onRemove={onRemove}
        />
      ))}

      {/* Subtotal & Checkout */}
      <div className="flex justify-between items-center pt-3">
        <span className="text-sm">
          Subtotal: <b>{group.subtotal.toLocaleString()} EGP</b>
        </span>
        <button
          onClick={() => onCheckout(group.galleryId)}
          disabled={checkoutLoading === group.galleryId}
          className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-xs disabled:opacity-60"
        >
          {checkoutLoading === group.galleryId ? 'Processing...' : 'Checkout this gallery'}
        </button>
      </div>
    </div>
  )
}

// Backward compatibility alias
export const Cart = CartPage
