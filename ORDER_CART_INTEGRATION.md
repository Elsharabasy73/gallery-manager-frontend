# Order & Cart Integration - Documentation

This document describes the order and cart integration between the frontend and the backend API.

## Overview

The integration connects the frontend to the backend API endpoints for:
- **Cart Management**: Add, update, remove, and clear cart items
- **Order Processing**: Checkout, view, and manage orders

## Role-Based Access Control

### Backend Roles (from API)
- `admin` - Full access to all resources
- `gallery_owner` - Can manage their gallery's orders
- `employee` - Can manage orders in their gallery
- `craftsman` - (Reserved for future use)
- `user` - Regular customer (mapped to `customer` in frontend)

### Frontend Roles
- `admin` - Mapped directly from backend
- `gallery_owner` - Mapped directly from backend
- `employee` - Mapped directly from backend
- `customer` - Mapped from backend `user` role

## API Endpoints

### Cart Endpoints (`/cart`)

All cart endpoints require authentication with **user** role only.

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/cart` | Get user's cart | - | `{ results, data: { id, items[], totalPrice } }` |
| POST | `/cart` | Add item to cart | `{ productId, quantity? }` | `{ message, data: cart }` |
| PATCH | `/cart/:productId` | Update item quantity | `{ quantity }` | `{ message, data: cart }` |
| DELETE | `/cart/:productId` | Remove item from cart | - | `204 No Content` |
| DELETE | `/cart` | Clear entire cart | - | `204 No Content` |

### Order Endpoints (`/orders`)

| Method | Endpoint | Allowed Roles | Description | Request Body |
|--------|----------|---------------|-------------|--------------|
| GET | `/orders` | Any authenticated | Get user's own orders | - |
| POST | `/orders` | user only | Checkout gallery items | `{ galleryId, shippingAddress?, note? }` |
| GET | `/orders/:id` | Order owner / gallery member / admin | Get single order | - |
| PATCH | `/orders/:id` | gallery_owner / employee / admin | Confirm pending order | - |

### Gallery Orders Endpoint (`/galleries/:galleryId/orders`)

| Method | Endpoint | Allowed Roles | Description |
|--------|----------|---------------|-------------|
| GET | `/galleries/:galleryId/orders` | gallery_owner / employee | Get orders for a specific gallery |

## File Structure

```
src/
├── api/
│   ├── cart.js          # Cart API functions
│   ├── orders.js        # Orders API functions
│   └── client.js        # API client (base URL, auth)
├── context/
│   ├── CartContext.jsx  # Cart state management
│   ├── RoleContext.jsx  # Role management & permissions
│   └── WishlistContext.jsx
├── pages/
│   ├── CustomerPages.jsx  # Cart, Wishlist, MyOrders pages
│   ├── DashboardPages.jsx # GalleryOrders, OrderDetails
│   └── ProductDetail.jsx  # Product detail with Add to Cart
└── components/
    ├── ProductCard.jsx    # Product card with Add to Cart
    └── TopNav.jsx         # Navigation with cart badge
```

## Usage Examples

### Adding to Cart (ProductCard)

```jsx
import { useCart } from '../context/CartContext'

const { addItem: addToCart, canAccessCart } = useCart()

const handleAddToCart = async (productId) => {
  if (!canAccessCart) {
    navigate('/login')
    return
  }
  try {
    await addToCart(productId, 1)
    // Success feedback
  } catch (err) {
    alert(err.message)
  }
}
```

### Checkout (Cart Page)

```jsx
import { createOrder } from '../api/orders'

const handleCheckout = async (galleryId) => {
  try {
    await createOrder({
      galleryId,
      shippingAddress: { street, city, country },
      note: 'Optional note'
    })
    await refresh() // Refresh cart
    navigate('/my-orders')
  } catch (err) {
    alert(err.message)
  }
}
```

### Gallery Orders (Dashboard)

```jsx
import { getGalleryOrders, confirmOrder, unwrapOrders } from '../api/orders'

// Fetch orders
const res = await getGalleryOrders(galleryId)
const orders = unwrapOrders(res)

// Confirm order
await confirmOrder(orderId)
```

## Important Notes

### Cart Behavior

1. **Per-User Cart**: Each authenticated user has exactly one cart
2. **Multi-Gallery Items**: Cart can contain items from multiple galleries
3. **Per-Gallery Checkout**: When checking out, you must specify which gallery's items to purchase
4. **Stock Validation**: Backend validates stock availability before checkout
5. **Atomic Stock Decrement**: Stock is decremented atomically with rollback on failure

### Order Statuses

- `pending` - Order created, awaiting confirmation
- `accepted` - Order confirmed by gallery staff
- `rejected` - Order rejected by gallery staff
- `cancelled` - Order cancelled by customer

### Order Access Rules

- **Customer**: Can view their own orders, can cancel pending orders
- **Gallery Owner/Employee**: Can view and confirm orders for their gallery
- **Admin**: Can view all orders, can confirm any order

### Product Requirements

Products must be:
- **Active** (`status === 'active'`) to be added to cart
- **In Stock** (`stock > 0`) to be added to cart
- Products that are out of stock or inactive will show "Out of stock" or "Unavailable"

## Error Handling

All API functions throw errors with meaningful messages:
- `err.message` - Human-readable error message
- `err.status` - HTTP status code
- `err.details` - Validation details (if available)

Example:
```jsx
try {
  await addToCart(productId)
} catch (err) {
  if (err.status === 401) {
    navigate('/login')
  } else if (err.details) {
    // Show validation errors
    setError(JSON.stringify(err.details))
  } else {
    setError(err.message)
  }
}
```

## Testing

To test the integration:

1. **Login as a customer** to add items to cart
2. **Add products** to cart from product cards or product detail page
3. **Update quantities** in the cart page
4. **Checkout** items from a specific gallery
5. **View orders** in My Orders page
6. **Switch to gallery_owner role** to manage orders in dashboard

## Backend Requirements

Ensure the backend API is running at the URL specified in `VITE_API_URL` (default: `http://localhost:3000/api/v1`).

Required environment variable:
```env
VITE_API_URL=http://localhost:3000/api/v1
```
