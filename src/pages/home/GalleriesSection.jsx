import { galleries as mockGalleries } from '../../data/mockData'
import { getGalleryBannerUrl, getGalleryLogoUrl } from '../../utils/image'
import { getInitials } from '../../utils/getInitials'
import Spinner from '../../components/Spinner'

export default function GalleriesSection({ t, navigate, loadingGalleries, galleries, errorGalleries }) {
  return (
    <>
      {/* Galleries section */}
      <section>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A754B]">{t('home.galleriesEyebrow')}</p>
            <h2 className="font-serif text-2xl text-[#4B3621] sm:text-3xl">{t('home.galleries')}</h2>
            <p className="mt-1 text-sm text-[#8A8078]">{t('home.galleriesSub')}</p>
          </div>
          <button
            onClick={() => navigate('/galleries')}
            className="flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-[#68491f] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
          >
            {t('home.viewAll')} <span className="material-symbols-outlined text-[18px] rtl:rotate-180" aria-hidden="true">arrow_forward</span>
          </button>
        </div>

        {loadingGalleries ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3" role="status" aria-label={t('galleries.loading')}>
            <Spinner />
            <span className="text-sm text-[#8A8078]">{t('galleries.loading')}</span>
          </div>
        ) : galleries.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
            {galleries.map((g) => {
              const gid = g.id || g._id
              const city = g.city ? `${g.city}${g.country ? `, ${g.country}` : ''}` : g.country || mockGalleries.find((m) => m.id === gid)?.city || ''
              const logoSrc = getGalleryLogoUrl(g)
              const bannerSrc = getGalleryBannerUrl(g)
              const initials = getInitials(g.name)
              return (
                <button
                  key={gid}
                  onClick={() => navigate(`/galleries/${gid}`)}
                  className="group w-full overflow-hidden rounded-2xl border border-[#E7DFD3] bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
                >
                  <div className="relative h-32 overflow-hidden bg-[#E7DFD3] sm:h-40">
                    <img
                      src={bannerSrc || g.banner || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#201a17]/45 to-transparent" />
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#FAF7F2] font-serif text-[#4B3621] shadow-sm">
                      {logoSrc ? (
                        <img src={logoSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#4B3621] sm:text-base">{g.name}</span>
                      <span className="mt-1 flex items-center gap-1 truncate text-xs text-[#8A8078]">
                        {city && <><span className="material-symbols-outlined text-[14px]" aria-hidden="true">location_on</span>{city}</>}
                      </span>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#78582f]">
                      {t('home.visitGallery')}
                      <span className="material-symbols-outlined text-[16px] rtl:rotate-180" aria-hidden="true">arrow_forward</span>
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <p role={errorGalleries ? 'alert' : undefined} className="rounded-xl border border-[#E7DFD3] bg-white px-4 py-8 text-center text-sm text-[#74695f]">{errorGalleries || t('galleries.empty')}</p>
        )}
      </section>
    </>
  )
}
