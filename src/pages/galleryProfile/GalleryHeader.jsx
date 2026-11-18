import { getInitials } from '../../utils/getInitials'

export default function GalleryHeader({ bannerSrc, openBannerLightbox, t, logoSrc, openLogoLightbox, gallery, pagination, formatNumber, products, memberYear, setShareOpen }) {
  return (
    <div className="bg-white border border-[#E7DFD3] rounded-2xl overflow-hidden shadow-sm">
      <div
        className={`h-[280px] bg-cover bg-center relative group ${bannerSrc ? 'cursor-pointer' : ''}`}
        style={{ backgroundImage: bannerSrc ? `url(${bannerSrc})` : `url('https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?auto=format&fit=crop&w=1400&q=80')` }}
        onClick={bannerSrc ? openBannerLightbox : undefined}
        title={bannerSrc ? t('galleryProfile.viewCover') : undefined}
        role={bannerSrc ? 'button' : undefined}
        tabIndex={bannerSrc ? 0 : undefined}
        onKeyDown={(e) => {
          if (bannerSrc && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            openBannerLightbox()
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        {bannerSrc && (
          <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="inline-flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20 shadow-md">
              <span className="material-symbols-outlined text-[16px] text-[#C19A6B]">zoom_in</span>
              {t('galleryProfile.viewCover')}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex gap-4 -mt-12 relative">
          <div
            className={`w-[100px] h-[100px] rounded-full bg-white border-4 border-white flex items-center justify-center font-serif text-xl shadow-md overflow-hidden shrink-0 group relative ${
              logoSrc ? 'cursor-pointer' : ''
            }`}
            onClick={logoSrc ? openLogoLightbox : undefined}
            title={logoSrc ? t('galleryProfile.viewLogo') : undefined}
            role={logoSrc ? 'button' : undefined}
            tabIndex={logoSrc ? 0 : undefined}
            onKeyDown={(e) => {
              if (logoSrc && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                openLogoLightbox()
              }
            }}
          >
            {logoSrc ? (
              <>
                <img
                  src={logoSrc}
                  alt={`${gallery.name} logo`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fb = e.currentTarget.nextSibling
                    if (fb) fb.style.display = 'flex'
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                </div>
              </>
            ) : null}
            <span style={{ display: logoSrc ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
              {getInitials(gallery.name)}
            </span>
          </div>
          <div className="pt-10 min-w-0">
            <h1 className="font-serif text-2xl flex items-center gap-2 truncate text-[#4B3621]">
              {gallery.name} <span className="w-2 h-2 rounded-full bg-[#4C7A4C] shrink-0"></span>
            </h1>
            <div className="text-xs text-[#8A8078] flex items-center gap-1 truncate">
              <span className="material-symbols-outlined text-[14px]">location_on</span> {gallery.street ? `${gallery.street} · ` : ''}
              {gallery.city}
              {gallery.country ? ` · ${gallery.country}` : ''}
            </div>
            <p className="text-xs text-[#8A8078] mt-1 line-clamp-2">{gallery.description || t('galleries.fallbackDesc')}</p>
            <div className="text-xs text-[#8A8078] mt-2">
              {pagination ? `${pagination.currentPage ? '' : ''}` : ''}
              {t('galleryProfile.products', { n: formatNumber(products.length) })}
              {memberYear ? ` ${t('galleryProfile.memberSince', { year: formatNumber(memberYear) })}` : ''}
            </div>
          </div>
          <div className="ms-auto hidden md:flex gap-2 pt-10 shrink-0 items-center">
            {gallery.mapAddressUrl && (
              <a
                href={gallery.mapAddressUrl}
                target="_blank"
                rel="noreferrer"
                title="Open location in Google Maps"
                aria-label="Open gallery location in Google Maps"
                className="w-10 h-10 bg-[#4B3621] text-white hover:bg-[#33210d] rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </a>
            )}
            {gallery.phone && (
              <a
                href={`tel:${gallery.phone}`}
                className="border border-[#E7DFD3] hover:border-[#4B3621] px-4 py-1.5 rounded-full text-xs flex items-center gap-1 text-[#4B3621] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">call</span> {t('galleryProfile.call')}
              </a>
            )}
            <button
              onClick={() => setShareOpen(true)}
              aria-label="Share gallery"
              title="Share gallery"
              className="w-10 h-10 border border-[#E7DFD3] rounded-full flex items-center justify-center hover:bg-[#FAF7F2] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </div>
        <div className="md:hidden flex gap-2 mt-4 items-center">
          {gallery.mapAddressUrl && (
            <a
              href={gallery.mapAddressUrl}
              target="_blank"
              rel="noreferrer"
              title="Open location in Google Maps"
              aria-label="Open gallery location in Google Maps"
              className="w-11 h-11 bg-[#4B3621] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </a>
          )}
          {gallery.phone && (
            <a
              href={`tel:${gallery.phone}`}
              className="flex-1 border border-[#E7DFD3] px-4 py-2 rounded-full text-xs flex items-center justify-center gap-1 text-[#4B3621]"
            >
              <span className="material-symbols-outlined text-[16px]">call</span> {t('galleryProfile.call')}
            </a>
          )}
          <button
            onClick={() => setShareOpen(true)}
            aria-label="Share gallery"
            className="w-11 h-11 border border-[#E7DFD3] rounded-full flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
