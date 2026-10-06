import { useEffect, useState, useRef, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export default function ImageLightboxModal({
  open,
  onClose,
  images = [],
  initialIndex = 0,
  galleryName = '',
}) {
  const { t, formatNumber, isRTL } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [touchStart, setTouchStart] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)

  const containerRef = useRef(null)
  const thumbsRef = useRef(null)

  // Reset state whenever modal opens or initialIndex changes
  useEffect(() => {
    if (open) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)))
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setImageLoading(true)
    }
  }, [open, initialIndex, images.length])

  // Reset zoom when switching images
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setImageLoading(true)
  }, [currentIndex])

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!open || !thumbsRef.current) return
    const activeThumb = thumbsRef.current.children[currentIndex]
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentIndex, open])

  // Navigation callbacks
  const handlePrev = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1)
      if (next === 1) setPosition({ x: 0, y: 0 })
      return next
    })
  }

  const handleResetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      } else if (e.key === 'ArrowRight') {
        if (isRTL) handlePrev()
        else handleNext()
      } else if (e.key === 'ArrowLeft') {
        if (isRTL) handleNext()
        else handlePrev()
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn()
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut()
      } else if (e.key === '0') {
        handleResetZoom()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose, handleNext, handlePrev, isRTL])

  // Drag to pan when zoomed
  const handleMouseDown = (e) => {
    if (scale <= 1) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch navigation & swipe
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      if (scale > 1) {
        setIsDragging(true)
        setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y })
      }
    }
  }

  const handleTouchMove = (e) => {
    if (scale > 1 && isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      })
    }
  }

  const handleTouchEnd = (e) => {
    if (scale > 1) {
      setIsDragging(false)
      return
    }
    if (!touchStart || e.changedTouches.length === 0) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart.x - touchEnd
    const swipeThreshold = 50

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // swipe left
        if (isRTL) handlePrev()
        else handleNext()
      } else {
        // swipe right
        if (isRTL) handleNext()
        else handlePrev()
      }
    }
    setTouchStart(null)
  }

  const handleDoubleClick = () => {
    if (scale > 1) {
      handleResetZoom()
    } else {
      setScale(2)
    }
  }

  if (!open || !images || images.length === 0) return null

  const currentImage = images[currentIndex]
  const currentUrl = typeof currentImage === 'string' ? currentImage : currentImage?.url || ''
  const currentAlt = (typeof currentImage === 'object' && currentImage?.alt) || galleryName || 'Gallery image'

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-between bg-black/95 backdrop-blur-md select-none transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-label={galleryName ? `${galleryName} - ${t('galleryProfile.galleryImages')}` : t('galleryProfile.galleryImages')}
      onMouseUp={handleMouseUp}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/40 border-b border-white/10 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#C19A6B]/20 border border-[#C19A6B]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#C19A6B] text-[18px]">photo_library</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-medium text-sm truncate max-w-[200px] sm:max-w-md">
              {galleryName || t('galleryProfile.galleryImages')}
            </h3>
            <p className="text-xs text-stone-400">
              {t('lightbox.imageCount', {
                cur: formatNumber(currentIndex + 1),
                total: formatNumber(images.length),
              })}
            </p>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {scale > 1 && (
            <span className="text-[11px] font-mono text-[#C19A6B] bg-[#C19A6B]/15 px-2 py-1 rounded-md border border-[#C19A6B]/30 hidden sm:inline-block">
              {Math.round(scale * 100)}%
            </span>
          )}

          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition"
            title={t('lightbox.zoomOut')}
            aria-label={t('lightbox.zoomOut')}
          >
            <span className="material-symbols-outlined text-[19px]">zoom_out</span>
          </button>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition"
            title={t('lightbox.zoomIn')}
            aria-label={t('lightbox.zoomIn')}
          >
            <span className="material-symbols-outlined text-[19px]">zoom_in</span>
          </button>

          {scale > 1 && (
            <button
              onClick={handleResetZoom}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title={t('lightbox.resetZoom')}
              aria-label={t('lightbox.resetZoom')}
            >
              <span className="material-symbols-outlined text-[19px]">restart_alt</span>
            </button>
          )}

          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title={t('lightbox.openOriginal')}
              aria-label={t('lightbox.openOriginal')}
            >
              <span className="material-symbols-outlined text-[19px]">open_in_new</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="w-9 h-9 ms-1 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition hover:scale-105 active:scale-95"
            title={t('lightbox.close')}
            aria-label={t('lightbox.close')}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Main image viewer stage */}
      <div
        ref={containerRef}
        className={`relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        {/* Loading Spinner */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-10 h-10 border-2 border-[#C19A6B] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Current Image */}
        <img
          src={currentUrl}
          alt={currentAlt}
          className={`max-h-[70vh] sm:max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform ${
            isDragging ? 'duration-0' : 'duration-200'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          draggable={false}
          onLoad={() => setImageLoading(false)}
        />

        {/* Floating Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#4B3621] border border-white/20 hover:border-[#C19A6B] text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 z-20 backdrop-blur-sm"
              title={t('lightbox.prev')}
              aria-label={t('lightbox.prev')}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isRTL ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#4B3621] border border-white/20 hover:border-[#C19A6B] text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 z-20 backdrop-blur-sm"
              title={t('lightbox.next')}
              aria-label={t('lightbox.next')}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isRTL ? 'chevron_left' : 'chevron_right'}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Carousel Bar */}
      {images.length > 1 && (
        <div className="px-4 py-3 bg-black/50 border-t border-white/10 z-20">
          <div
            ref={thumbsRef}
            className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 max-w-4xl mx-auto scrollbar-thin scrollbar-thumb-white/20"
          >
            {images.map((img, idx) => {
              const url = typeof img === 'string' ? img : img?.url || ''
              const isActive = idx === currentIndex
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-[#C19A6B] ring-2 ring-[#C19A6B] scale-105 opacity-100 shadow-md'
                      : 'border-transparent opacity-50 hover:opacity-90 hover:border-white/40'
                  }`}
                  aria-label={t('lightbox.imageCount', {
                    cur: formatNumber(idx + 1),
                    total: formatNumber(images.length),
                  })}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  {isActive && <div className="absolute inset-0 bg-[#C19A6B]/15 pointer-events-none" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
