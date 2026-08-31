import { BASE_URL } from '../api/client'

export const STORAGE_BASE = BASE_URL.replace(/\/api\/v1\/?$/, '')

/**
 * Gallery storage: served at /storage (app.js:20)
 * CSV: gallery.logo/bannner are filenames, gallery.storageFolder is folder
 * Working: http://localhost:3000/storage/uploads/galleries/<storageFolder>/<banner>
 * e.g. http://localhost:3000/storage/uploads/galleries/nordic-timber-and-living-11563464-6ba5-4a39-892d-daa9512e7377/banner-2026-08-31T14-39-48-220Z-1542f955-0d21-48e2-9c72-f3b3ff593a85.jpeg
 */
export function getGalleryLogoUrl(gallery) {
  if (!gallery?.logo || !gallery?.storageFolder) return null
  const raw = gallery.logo
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/storage/')) return `${STORAGE_BASE}${raw}`
  return `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${raw}`
}

export function getGalleryBannerUrl(gallery) {
  if (!gallery?.banner || !gallery?.storageFolder) return null
  const raw = gallery.banner
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/storage/')) return `${STORAGE_BASE}${raw}`
  return `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${raw}`
}

export function getGalleryImageUrl(gallery, fileName) {
  if (!fileName || !gallery?.storageFolder) return null
  if (fileName.startsWith('http')) return fileName
  return `${STORAGE_BASE}/storage/uploads/galleries/${gallery.storageFolder}/${fileName}`
}

/**
 * Product storage: CSV shows Product.mainImageUrl = "folder/file.jpeg" (folder embedded)
 * and Product.images = ["folder/file.jpeg", ...]
 * URL: http://localhost:3000/storage/uploads/products/<mainImageUrl>
 * e.g. kyoto-solid-white-oak-low-platform-bed-ae686be9-6e07-4afb-986c-bd56b1e31eed/product-number-1-2026-08-31T19-08-05-853Z-7d6fd47e.jpeg
 */
export function getProductImageUrl(product) {
  if (!product) return null
  const raw = product.mainImageUrl || product.image || product.images?.[0]
  if (!raw) return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/storage/')) return `${STORAGE_BASE}${raw}`
  if (raw.startsWith('storage/')) return `${STORAGE_BASE}/${raw}`
  if (raw.includes('/')) {
    if (raw.startsWith('products/')) return `${STORAGE_BASE}/storage/uploads/${raw}`
    return `${STORAGE_BASE}/storage/uploads/products/${raw}`
  }
  const folder = product.storageFolder || product.folderName || product.folder
  if (folder) return `${STORAGE_BASE}/storage/uploads/products/${folder}/${raw}`
  return `${STORAGE_BASE}/storage/uploads/products/${raw}`
}
