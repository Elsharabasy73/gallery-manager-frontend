# Order & Cart Integration - Implementation Summary

## Files Created

### 1. `/src/api/cart.js`
Cart API functions:
- `getCart()` - Get user's cart
- `addToCart({ productId, quantity })` - Add item to cart
- `updateCartItem(productId, quantity)` - Update item quantity
- `removeFromCart(productId)` - Remove item from cart
- `clearCart()` - Clear entire cart
- `unwrapCart(res)` / `unwrapCartItems(res)` - Response helpers

### 2. `/src/api/orders.js`
Orders API functions:
- `getMyOrders()` - Get customer's orders
- `getGalleryOrders(galleryId)` - Get gallery's orders (for gallery_owner/employee)
- `getOrder(orderId)` - Get single order
- `createOrder({ galleryId, shippingAddress?, note? })` - Checkout
- `confirmOrder(orderId)` - Confirm pending order (gallery_owner/employee/admin)
- `cancelOrder(orderId)` - Placeholder (backend not implemented)
- `unwrapOrders(res)` / `unwrapOrder(res)` - Response helpers

### 3. `/src/context/CartContext.jsx`
Cart state management with React Context:
- Cart data and loading state
- Grouped items by gallery
- Add, update, remove, clear operations
- Auto-refresh cart on auth changes
- Customer-only access control

## Files Modified

### 1. `/src/main.jsx`
Added `CartProvider` to the provider tree.

### 2. `/src/pages/CustomerPages.jsx`
Rewrote Cart, Wishlist, and MyOrders pages:
- **Cart Page**: Real cart data from API, grouped by gallery, checkout per gallery
- **MyOrders Page**: Real order data from API, status filtering, cancel button (placeholder)

### 3. `/src/pages/DashboardPages.jsx`
Updated for gallery order management:
- Added imports for order API and hooks
- **GalleryOrders**: Real order data, search/filter, confirm orders
- **OrderDetails**: Real order data from API, confirm button for pending orders

### 4. `/src/pages/ProductDetail.jsx`
Added Add to Cart functionality:
- Quantity selector
- Add to Cart button with loading state
- Success message with cart link
- Stock/status validation

### 5. `/src/components/ProductCard.jsx`
Added Add to Cart button:
- Shows for customers on active, in-stock products
- Cart icon with loading state
- Integrated with CartContext

### 6. `/src/components/TopNav.jsx`
Dynamic cart badge:
- Real-time cart item count
- Shows count badge when items > 0

## Role-Based Access Summary

| Feature | Customer | Gallery Owner | Employee | Admin |
|---------|----------|---------------|----------|-------|
| View own cart | ✓ | - | - | - |
| Add to cart | ✓ | - | - | - |
| Checkout | ✓ | - | - | - |
| View own orders | ✓ | - | - | - |
| View gallery orders | - | ✓ (own gallery) | ✓ (own gallery) | ✓ (all) |
| Confirm orders | - | ✓ (own gallery) | ✓ (own gallery) | ✓ (all) |

## API Endpoints Used

### Cart Endpoints (User role required)
- `GET /cart` - Get cart
- `POST /cart` - Add item
- `PATCH /cart/:productId` - Update quantity
- `DELETE /cart/:productId` - Remove item
- `DELETE /cart` - Clear cart

### Order Endpoints
- `GET /orders` - Get user's orders (any authenticated)
- `POST /orders` - Create order (user only)
- `GET /orders/:id` - Get order (owner/gallery member/admin)
- `PATCH /orders/:id` - Confirm order (gallery_owner/employee/admin)
- `GET /galleries/:galleryId/orders` - Get gallery orders (gallery_owner/employee)

## Checkout Flow

1. **Customer adds products to cart** - Products must be active and in stock
2. **Cart shows items grouped by gallery** - Each gallery has separate subtotal
3. **Customer clicks "Checkout this gallery"** - Only items from that gallery are checked out
4. **Backend validates** - Stock, product status, etc.
5. **Order created with `pending` status**
6. **Gallery owner/employee confirms order** - Status changes to `accepted`

## Testing Checklist

To test the integration:

1. **Start both servers**:
   - Backend: `cd galleries_manager && npm run dev`
   - Frontend: `cd fornt\ test && npm run dev`

2. **Test Cart (as customer)**:
   - [ ] Login as customer
   - [ ] Browse products
   - [ ] Add products to cart
   - [ ] View cart
   - [ ] Update quantities
   - [ ] Remove items
   - [ ] Clear cart

3. **Test Checkout (as customer)**:
   - [ ] Add items from a gallery
   - [ ] Checkout that gallery's items
   - [ ] Verify order appears in My Orders

4. **Test Gallery Orders (as gallery_owner)**:
   - [ ] Login as gallery owner
   - [ ] Go to Dashboard > Gallery Orders
   - [ ] View pending orders
   - [ ] Confirm an order
   - [ ] Verify status changed to accepted

5. **Test Order Details**:
   - [ ] Click "View" on an order
   - [ ] Verify all order details are shown
   - [ ] Test confirm button (for pending orders)

## Notes

- Cancel order functionality is not yet implemented in the backend
- The frontend cancel button shows an error message when clicked
- All cart operations require user to be logged in as customer
- Gallery order management requires gallery_owner or employee role
- Orders can only be confirmed if status is `pending`
