import { Navigate, useLocation } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import AccessDenied from './AccessDenied'

export default function Protected({ allow, pageId, redirectToHome=false, children }){
  const { role, isAllowed } = useRole()
  const location = useLocation()
  // allow prop overrides PERMISSIONS if provided
  const allowed = allow ? allow.includes(role) : isAllowed(pageId)
  if(allowed) return children
  if(redirectToHome) return <Navigate to="/" replace state={{ from: location }} />
  return <AccessDenied pageId={pageId || location.pathname.slice(1) || 'home'} />
}
