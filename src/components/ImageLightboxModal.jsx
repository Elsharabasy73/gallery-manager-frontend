import { useEffect, useState, useRef, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import LightboxHeader from './imageLightbox/LightboxHeader'
import ImageViewerStage from './imageLightbox/ImageViewerStage'
import ThumbnailCarousel from './imageLightbox/ThumbnailCarousel'

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
      <LightboxHeader
        galleryName={galleryName}
        t={t}
        formatNumber={formatNumber}
        currentIndex={currentIndex}
        images={images}
        scale={scale}
        handleZoomOut={handleZoomOut}
        handleZoomIn={handleZoomIn}
        handleResetZoom={handleResetZoom}
        currentUrl={currentUrl}
        onClose={onClose}
      />
      <ImageViewerStage
        containerRef={containerRef}
        scale={scale}
        isDragging={isDragging}
        isRTL={isRTL}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        handleDoubleClick={handleDoubleClick}
        imageLoading={imageLoading}
        currentUrl={currentUrl}
        currentAlt={currentAlt}
        position={position}
        setImageLoading={setImageLoading}
        images={images}
        handlePrev={handlePrev}
        handleNext={handleNext}
        t={t}
      />
      <ThumbnailCarousel
        images={images}
        thumbsRef={thumbsRef}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        t={t}
        formatNumber={formatNumber}
      />
    </div>
  )
}
