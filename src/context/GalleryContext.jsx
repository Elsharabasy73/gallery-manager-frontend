import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useRole } from './RoleContext'
import { getMyGallery } from '../api/galleries'

const GalleryContext = createContext(null)
export const useGallery = () => useContext(GalleryContext)

// unwrap helper reused from galleries api
function unwrapMyGallery(res) {
  const g = res?.data?.data || res?.data || res
  const gal = g?.gallery || g
  if (!gal || (!gal.id && !gal._id && !gal.name)) return null
  return gal
}

export function GalleryProvider({ children }) {
  const { role, isAuthenticated } = useRole()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  const [gallery, setGallery] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fetchingRef = useRef(false)
  const lastFetchedRoleRef = useRef(null)

  const galleryId = useMemo(() => {
    if (!gallery) return null
    return String(gallery.id || gallery._id || '')
  }, [gallery])

  const fetchMyGallery = useCallback(async ({ force = false } = {}) => {
    if (fetchingRef.current && !force) return null
    // only gallery_owner / employee should fetch my-gallery (backend 403 otherwise)
    if (!isAuthenticated || !['gallery_owner', 'employee'].includes(role)) return null
    fetchingRef.current = true
    setLoading(true)
    setError('')
    try {
      const res = await getMyGallery()
      const gal = unwrapMyGallery(res)
      if (!gal) {
        setGallery(null)
        // 404 case handled in catch; here means empty but not error
        return null
      }
      setGallery(gal)
      lastFetchedRoleRef.current = role
      return gal
    } catch (err) {
      if (err?.status === 404) {
        setGallery(null)
        // do not treat as error - owner has no gallery yet
        return null
      }
      setError(err.message || 'Failed to load gallery')
      return null
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [isAuthenticated, role])

  // auto-fetch when owner/employee enters dashboard
  useEffect(() => {
    if (!isDashboard) return
    if (!isAuthenticated) {
      setGallery(null)
      return
    }
    if (!['gallery_owner', 'employee'].includes(role)) {
      setGallery(null)
      return
    }
    // avoid refetch if already have gallery for same role
    if (gallery && lastFetchedRoleRef.current === role) return
    if (fetchingRef.current) return
    fetchMyGallery()
  }, [isDashboard, isAuthenticated, role, gallery, fetchMyGallery])

  // clear when logout or role change away from gallery roles
  useEffect(() => {
    if (!isAuthenticated || !['gallery_owner', 'employee'].includes(role)) {
      setGallery(null)
      setError('')
      lastFetchedRoleRef.current = null
    }
  }, [isAuthenticated, role])

  const refresh = useCallback(() => fetchMyGallery({ force: true }), [fetchMyGallery])
  const clear = useCallback(() => {
    setGallery(null)
    setError('')
    lastFetchedRoleRef.current = null
  }, [])

  const value = useMemo(() => ({
    gallery,
    galleryId,
    loading,
    error,
    refresh,
    clear,
    setGallery,
    fetchMyGallery,
    isDashboard,
  }), [gallery, galleryId, loading, error, refresh, clear, fetchMyGallery, isDashboard])

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
}
