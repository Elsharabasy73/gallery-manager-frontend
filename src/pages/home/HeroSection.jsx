export default function HeroSection({ t, search, setSearch, handleSearch }) {
  return (
    <>
      {/* Hero section */}
      <section className="relative min-h-[500px] overflow-hidden rounded-2xl shadow-md sm:min-h-[560px] lg:min-h-[620px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-[#201a17]/85 via-[#4B3621]/40 to-[#4B3621]/10 p-5 text-start sm:p-10 md:justify-center md:p-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-sm">
            {t('home.heroEyebrow')}
          </p>
          <h1 className="mb-4 max-w-3xl font-serif text-4xl leading-tight text-white drop-shadow sm:text-5xl md:mb-5 md:text-6xl lg:text-7xl">
            {t('home.heroTitle')}
          </h1>
          <p className="mb-7 max-w-xl text-sm leading-6 text-white/90 sm:text-base sm:leading-7">
            {t('home.heroIntro')}
          </p>
          <div className="mb-4 flex w-full max-w-2xl items-center gap-2 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 sm:p-2">
            <span className="material-symbols-outlined ms-2 shrink-0 text-[#8A8078]" aria-hidden="true">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="min-h-10 min-w-0 flex-1 bg-transparent text-sm text-[#4B3621] outline-none placeholder:text-[#74695f] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9A754B]"
              placeholder={t('home.searchPh')}
              aria-label={t('home.searchPh')}
            />
            <button
              onClick={handleSearch}
              className="min-h-10 shrink-0 whitespace-nowrap rounded-lg bg-[#4B3621] px-3 py-2.5 text-xs font-medium text-white transition hover:bg-[#33210d] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A754B] sm:px-6 sm:text-sm"
            >
              {t('home.browseProducts')}
            </button>
          </div>
          <a
            href="#home-categories"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/60 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t('home.browseCategories')}
            <span className="material-symbols-outlined text-[18px] rtl:rotate-180" aria-hidden="true">arrow_forward</span>
          </a>
        </div>
      </section>
    </>
  )
}
