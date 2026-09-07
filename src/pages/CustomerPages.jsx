import { products, orders } from '../data/mockData'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useRole } from '../context/RoleContext'
import { useCart } from '../context/CartContext'
import { createOrder, getMyOrders, unwrapOrders, cancelOrder } from '../api/orders'
import ProductCard from '../components/ProductCard'

export function Wishlist(){
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { items, loading, error, refresh, count } = useWishlist()
  const [localError, setLocalError] = useState(null)

  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">Wishlist is available for customers only. Please log in as a customer.</p>
        <button onClick={()=>navigate('/login')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">Go to login</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl">Wishlist <span className="text-sm text-[#8A8078]">({count} saved)</span></h2>
        <div className="flex gap-2">
          <button onClick={refresh} className="border px-4 py-1.5 rounded-full text-xs bg-white hover:bg-[#FAF7F2]">Refresh</button>
          <button onClick={()=>navigate('/products')} className="border px-4 py-1.5 rounded-full text-xs bg-white hover:bg-[#FAF7F2]">Discover products</button>
        </div>
      </div>

      {localError && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{localError}</div>}
      {error && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{error}</div>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length:3}).map((_,i)=>(
            <div key={i} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-[#E7DFD3]/60" />
              <div className="p-3 space-y-2"><div className="h-4 bg-[#E7DFD3]/60 rounded w-3/4" /><div className="h-3 bg-[#E7DFD3]/40 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : items.length===0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">
          <p className="text-sm text-[#8A8078]">No saved items — Discover products</p>
          <button onClick={()=>navigate('/products')} className="mt-3 text-[#C19A6B] text-sm underline">Browse products</button>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <ProductCard key={p._id || p.id} product={p} variant="wishlist" onWishlistError={setLocalError} />
        ))}
      </div>
      )}
    </div>
  )
}

export function CartPage(){
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const { cart, items, itemCount, totalPrice, groupedByGallery, loading, error, updateItem, removeItem, clear, refresh } = useCart()
  const [actionLoading, setActionLoading] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(null)

  const handleUpdateQty = async (productId, newQty) => {
    if (newQty < 1) return
    setActionLoading(productId)
    try {
      await updateItem(productId, newQty)
    } catch (err) {
      alert(err.message || 'Failed to update quantity')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return
    setActionLoading(productId)
    try {
      await removeItem(productId)
    } catch (err) {
      alert(err.message || 'Failed to remove item')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Clear all items from cart?')) return
    try {
      await clear()
    } catch (err) {
      alert(err.message || 'Failed to clear cart')
    }
  }

  const handleCheckout = async (galleryId) => {
    setCheckoutLoading(galleryId)
    try {
      const res = await createOrder({ galleryId })
      alert('Order placed successfully!')
      await refresh()
      navigate('/my-orders')
    } catch (err) {
      alert(err.message || 'Failed to checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">Cart is available for customers only. Please log in as a customer.</p>
        <button onClick={()=>navigate('/login')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">Go to login</button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl">Cart ({itemCount})</h2>
          {items.length > 0 && (
            <button onClick={handleClearCart} className="text-xs text-[#B3402E] border border-[#B3402E] px-3 py-1 rounded-full hover:bg-red-50">Clear all</button>
          )}
        </div>

        {error && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-sm text-[#8A8078]">Loading cart...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed rounded-xl">
            <span className="material-symbols-outlined text-4xl text-[#8A8078]">shopping_cart</span>
            <p className="text-sm text-[#8A8078] mt-2">Your cart is empty</p>
            <button onClick={()=>navigate('/products')} className="mt-3 text-[#C19A6B] text-sm underline">Browse products</button>
          </div>
        ) : (
          groupedByGallery.map(group => (
            <div key={group.galleryId} className="bg-white border border-[#E7DFD3] rounded-xl p-4">
              <div className="flex items-center gap-2 font-medium text-sm mb-3">
                <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">
                  {group.galleryName.substring(0, 2).toUpperCase()}
                </div>
                <span>{group.galleryName}</span>
              </div>
              {group.items.map(item => {
                const product = item.product || {}
                const displayImg = product.mainImageUrl || product.image || 'https://via.placeholder.com/64'
                const price = Number(product.price || 0)
                const qty = item.quantity
                const isLoading = actionLoading === item.productId

                return (
                  <div key={item.id || item.productId} className="flex gap-3 py-3 border-t">
                    <img src={displayImg} alt={product.name || 'Product'} className="w-16 h-16 rounded-lg object-cover bg-[#FAF7F2]" onError={e => e.target.src = 'https://via.placeholder.com/64'} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{product.name || 'Unknown Product'}</div>
                      <div className="text-xs text-[#8A8078]">{price.toLocaleString()} EGP × {qty}</div>
                      {product.stock !== undefined && product.stock <= 5 && (
                        <div className="text-xs text-amber-600">Only {product.stock} left</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleUpdateQty(item.productId, qty - 1)}
                          disabled={isLoading || qty <= 1}
                          className="px-2 text-xs disabled:opacity-40"
                        >−</button>
                        <span className="px-2 text-xs min-w-[24px] text-center">{qty}</span>
                        <button
                          onClick={() => handleUpdateQty(item.productId, qty + 1)}
                          disabled={isLoading || (product.stock && qty >= product.stock)}
                          className="px-2 text-xs disabled:opacity-40"
                        >+</button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={isLoading}
                        className="w-7 h-7 border rounded flex items-center justify-center hover:bg-red-50 disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                )
              })}
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm">Subtotal: <b>{group.subtotal.toLocaleString()} EGP</b></span>
                <button
                  onClick={() => handleCheckout(group.galleryId)}
                  disabled={checkoutLoading === group.galleryId}
                  className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-xs disabled:opacity-60"
                >
                  {checkoutLoading === group.galleryId ? 'Processing...' : 'Checkout this gallery'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 h-fit sticky top-[88px]">
        <h3 className="font-medium text-sm mb-3">Summary</h3>
        <div className="text-xs space-y-2 text-[#8A8078]">
          <div className="flex justify-between"><span>Total items</span><span>{itemCount}</span></div>
          <div className="flex justify-between"><span>Total value</span><span className="font-semibold text-[#4B3621]">{Number(totalPrice || 0).toLocaleString()} EGP</span></div>
        </div>
        <p className="text-[11px] text-[#8A8078] mt-3">Pay later with the gallery — no payment UI yet.</p>
      </div>
    </div>
  )
}

// Keep Cart as alias for backward compatibility
export const Cart = CartPage

export function MyOrders(){
  const navigate = useNavigate()
  const { role, isAuthenticated } = useRole()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || role !== 'customer') return

    let cancelled = false
    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const res = await getMyOrders()
        if (cancelled) return
        const data = unwrapOrders(res)
        setOrders(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to load orders')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [isAuthenticated, role])

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancellingId(orderId)
    try {
      await cancelOrder(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    } catch (err) {
      alert(err.message || 'Failed to cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  const statusCounts = orders.reduce((acc, o) => {
    acc.all = (acc.all || 0) + 1
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const statusFilters = [
    { key: 'all', label: `All (${statusCounts.all || 0})` },
    { key: 'pending', label: `Pending (${statusCounts.pending || 0})` },
    { key: 'accepted', label: `Accepted (${statusCounts.accepted || 0})` },
    { key: 'rejected', label: `Rejected (${statusCounts.rejected || 0})` },
    { key: 'cancelled', label: `Cancelled (${statusCounts.cancelled || 0})` },
  ]

  if (!isAuthenticated || role !== 'customer') {
    return (
      <div className="text-center py-12 bg-white border border-[#E7DFD3] rounded-xl">
        <p className="text-sm text-[#8A8078]">Orders are available for customers only. Please log in as a customer.</p>
        <button onClick={()=>navigate('/login')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">Go to login</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">My Orders</h2>

      <div className="flex gap-2 overflow-x-auto">
        {statusFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs border ${
              filter === f.key ? 'bg-[#4B3621] text-white border-[#4B3621]' : 'bg-white hover:bg-[#FAF7F2]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-sm text-[#8A8078]">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">
          <p className="text-sm text-[#8A8078]">
            {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          </p>
          <button onClick={()=>navigate('/products')} className="mt-3 text-[#C19A6B] text-sm underline">Browse products</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(o => {
            const totalItems = o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
            const totalPrice = Number(o.totalPrice || 0)
            const galleryName = o.gallery?.name || 'Unknown Gallery'
            const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'

            return (
              <div key={o.id} className="bg-white border border-[#E7DFD3] rounded-xl p-4">
                <div className="flex justify-between text-xs">
                  <span className="font-mono">{o.id?.substring(0, 8)}... • {orderDate}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                    o.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    o.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    o.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-zinc-100 text-zinc-800'
                  }`}>
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-[10px]">
                    {galleryName.substring(0, 2).toUpperCase()}
                  </div>
                  {galleryName} • {totalItems} items • {totalPrice.toLocaleString()} EGP
                </div>
                {o.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(o.id)}
                    disabled={cancellingId === o.id}
                    className="mt-3 text-xs border border-[#B3402E] text-[#B3402E] px-3 py-1 rounded-full hover:bg-red-50 disabled:opacity-60"
                  >
                    {cancellingId === o.id ? 'Cancelling...' : 'Cancel order'}
                  </button>
                )}
                {o.status === 'accepted' && (
                  <button
                    onClick={() => navigate(`/dashboard/orders/${o.id}`)}
                    className="mt-3 text-xs border px-3 py-1 rounded-full hover:bg-[#FAF7F2]"
                  >
                    View details
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
