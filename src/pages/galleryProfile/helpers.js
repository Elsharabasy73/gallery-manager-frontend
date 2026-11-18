import { apiFetch } from '../../api/client'

export async function getGalleryProducts(galleryId, params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  // nested route: /galleries/:galleryId/products handles galleryIdFilter
  return apiFetch(`/galleries/${galleryId}/products${qs}&galleryId=${galleryId}`)
}
