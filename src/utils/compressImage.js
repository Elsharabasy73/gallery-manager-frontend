/**
 * compressImage — client-side image downscale + JPEG recompress before upload.
 *
 * Why: phone photos are 4–12MB. Uploading them raw is slow (especially on
 * mobile networks) and wasteful, because the backend downscales everything
 * to ≤1000px wide anyway (see galleries_manager sharp pipeline). Compressing
 * in the browser typically shrinks a photo by ~95% with no visible difference
 * at the sizes we display (cards, heroes, 100px logo circle).
 *
 * How: decode the file (EXIF-orientation aware) → draw onto a canvas capped
 * at `maxDimension` → encode JPEG, stepping quality down until the blob fits
 * `targetKB` → if still too big, shrink dimensions and retry. Files already
 * under target are returned untouched (never recompress — avoids quality loss).
 * Output is always JPEG (matches what the backend stores via sharp).
 */

export const IMAGE_PRESETS = {
  /** Gallery logo — displayed at ~100px circle */
  logo: { maxDimension: 512, targetKB: 80 },
  /** Gallery cover banner — full-width hero */
  banner: { maxDimension: 1920, targetKB: 300 },
  /** Gallery showcase images */
  gallery: { maxDimension: 1600, targetKB: 250 },
  /** Product main + secondary images */
  product: { maxDimension: 1600, targetKB: 250 },
}

/** Originals bigger than this are rejected — decoding them can OOM low-end phones. */
export const MAX_ORIGINAL_BYTES = 12 * 1024 * 1024

const START_QUALITIES = [0.85, 0.77, 0.68, 0.6]
const MIN_QUALITY = 0.6
const SHRINK_ROUNDS = 3
const SHRINK_FACTOR = 0.8

export function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function tooLargeError(file) {
  const err = new Error(
    `"${file.name || 'Image'}" is ${formatSize(file.size)} — please pick an image under ${formatSize(MAX_ORIGINAL_BYTES)}.`
  )
  err.code = 'TOO_LARGE'
  return err
}

/** Decode a File to something canvas can draw (bitmap or <img>), honoring EXIF rotation. */
async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // fall through to <img> fallback (e.g. uncommon formats)
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Could not read "${file.name || 'image'}".`))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function encodeCanvas(source, width, height, quality) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width))
    canvas.height = Math.max(1, Math.round(height))
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas is not available in this browser.'))
      return
    }
    // JPEG has no alpha channel — paint white first so transparent PNGs
    // don't end up with a black background.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed.'))),
      'image/jpeg',
      quality
    )
  })
}

/**
 * Compress a single image file.
 * @returns {Promise<{file: File, originalSize: number, size: number, compressed: boolean}>}
 * @throws Error with `code === 'TOO_LARGE'` when the original exceeds MAX_ORIGINAL_BYTES.
 */
export async function compressImage(file, opts = {}) {
  const { maxDimension = 1600, targetKB = 250 } = { ...IMAGE_PRESETS.product, ...opts }
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Please select an image file.')
  }
  if (file.size > MAX_ORIGINAL_BYTES) throw tooLargeError(file)

  const targetBytes = targetKB * 1024
  // Already small enough — return untouched to avoid pointless quality loss.
  if (file.size <= targetBytes) {
    return { file, originalSize: file.size, size: file.size, compressed: false }
  }

  const source = await decodeImage(file)
  try {
    const naturalW = source.width
    const naturalH = source.height
    if (!naturalW || !naturalH) throw new Error(`Could not read "${file.name || 'image'}".`)

    // Fit inside maxDimension, never upscale.
    const scale = Math.min(1, maxDimension / Math.max(naturalW, naturalH))
    let width = Math.round(naturalW * scale)
    let height = Math.round(naturalH * scale)

    // Pass 1: step quality down at full (capped) dimensions.
    let blob = null
    for (const quality of START_QUALITIES) {
      blob = await encodeCanvas(source, width, height, quality)
      if (blob.size <= targetBytes) break
    }

    // Pass 2: still over target → shrink dimensions and retry at floor quality.
    let rounds = 0
    while (blob && blob.size > targetBytes && rounds < SHRINK_ROUNDS) {
      width = Math.max(1, Math.round(width * SHRINK_FACTOR))
      height = Math.max(1, Math.round(height * SHRINK_FACTOR))
      blob = await encodeCanvas(source, width, height, MIN_QUALITY)
      rounds += 1
    }

    if (!blob) throw new Error('Image encoding failed.')
    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '') || 'image'
    const out = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
    return { file: out, originalSize: file.size, size: blob.size, compressed: true }
  } finally {
    // Release bitmap memory (HTMLImageElement has no close() — guarded call).
    source.close?.()
  }
}

/**
 * Compress a batch of files for a multi-image picker.
 * Fail-soft: oversized files are skipped (reported), undecodable files fall
 * back to the original so one bad apple never blocks the whole selection.
 * @returns {Promise<{files: File[], skipped: string[]}>}
 */
export async function prepareImages(files, opts = {}) {
  const ready = []
  const skipped = []
  for (const f of files) {
    try {
      const { file } = await compressImage(f, opts)
      ready.push(file)
    } catch (err) {
      if (err?.code === 'TOO_LARGE') {
        skipped.push(f.name || 'image')
      } else {
        // Transient decode/encode issue — send the original rather than blocking.
        ready.push(f)
      }
    }
  }
  return { files: ready, skipped }
}
