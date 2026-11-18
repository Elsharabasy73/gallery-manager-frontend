export default function ShowcaseGallery({ showcaseImages, openShowcaseLightbox, gallery, formatNumber, t }) {
  return (
    <>
      {showcaseImages.length > 0 && (
        <div className="bg-white border border-[#E7DFD3] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {showcaseImages.map((src, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => openShowcaseLightbox(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openShowcaseLightbox(i)
                  }
                }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E7DFD3] hover:border-[#C19A6B] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
                aria-label={`${gallery.name} photo ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`${gallery.name} photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <span className="bg-black/60 text-white/95 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                      {formatNumber(i + 1)} / {formatNumber(showcaseImages.length)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white text-xs font-medium self-center bg-[#4B3621]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[16px] text-[#C19A6B]">zoom_in</span>
                    <span>{t('galleryProfile.clickToExpand')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
