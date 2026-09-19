import { Navigate, useLocation } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { isTokenExpired, clearStoredAuth } from '../utils/auth'
import AccessDenied from './AccessDenied'

export default function Protected({ allow, pageId, redirectToHome=false, children }){
  const { role, isAllowed } = useRole()
  const location = useLocation()
  // Expired/missing token → force login instead of rendering stale protected UI.
  // RoleContext already purges on load; this covers expiry mid-session.
  const token = (()=>{ try{ return localStorage.getItem('token') }catch{ return null } })()
  if(!token || isTokenExpired(token)){
    clearStoredAuth()
    return <Navigate to="/login" replace state={{ from: location, expired: true }} />
  }
  // allow prop overrides PERMISSIONS if provided
  const allowed = allow ? allow.includes(role) : isAllowed(pageId)
  if(allowed) return children
  if(redirectToHome) return <Navigate to="/" replace state={{ from: location }} />
  return <AccessDenied pageId={pageId || location.pathname.slice(1) || 'home'} />
}
