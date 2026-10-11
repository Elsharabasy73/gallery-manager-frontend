import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { GalleryProvider } from './context/GalleryContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <BrowserRouter>
      <RoleProvider defaultRole={null}>
        <LanguageProvider>
        <GalleryProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </GalleryProvider>
        </LanguageProvider>
      </RoleProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
