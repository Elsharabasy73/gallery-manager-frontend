import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleProvider defaultRole={null}>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>
)
