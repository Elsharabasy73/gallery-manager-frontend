export default function ThumbnailCarousel({ images, thumbsRef, currentIndex, setCurrentIndex, t, formatNumber }) {
  return (
    <>
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
                  className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] ${
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
    </>
  )
}
