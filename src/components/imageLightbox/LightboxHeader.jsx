export default function LightboxHeader({
  galleryName,
  t,
  formatNumber,
  currentIndex,
  images,
  scale,
  handleZoomOut,
  handleZoomIn,
  handleResetZoom,
  currentUrl,
  onClose,
}) {
  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3.5 bg-black/40 border-b border-white/10 z-20">
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
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
            title={t('lightbox.zoomOut')}
            aria-label={t('lightbox.zoomOut')}
          >
            <span className="material-symbols-outlined text-[19px]">zoom_out</span>
          </button>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
            title={t('lightbox.zoomIn')}
            aria-label={t('lightbox.zoomIn')}
          >
            <span className="material-symbols-outlined text-[19px]">zoom_in</span>
          </button>

          {scale > 1 && (
            <button
              onClick={handleResetZoom}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
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
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
              title={t('lightbox.openOriginal')}
              aria-label={t('lightbox.openOriginal')}
            >
              <span className="material-symbols-outlined text-[19px]">open_in_new</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="w-10 h-10 ms-1 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
            title={t('lightbox.close')}
            aria-label={t('lightbox.close')}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </>
  )
}
