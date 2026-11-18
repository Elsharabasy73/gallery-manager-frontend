export default function ImageViewerStage({
  containerRef,
  scale,
  isDragging,
  isRTL,
  handleMouseDown,
  handleMouseMove,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleDoubleClick,
  imageLoading,
  currentUrl,
  currentAlt,
  position,
  setImageLoading,
  images,
  handlePrev,
  handleNext,
  t,
}) {
  return (
    <>
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
    </>
  )
}
