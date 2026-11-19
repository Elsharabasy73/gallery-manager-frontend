import CategoryScroller from '../../components/CategoryScroller'

export default function CategoriesSection({ t, categoryLabel, loadingCategories, categories, handleCategoryClick }) {
  return (
    <>
      {/* Categories section */}
      <section id="home-categories" className="scroll-mt-24">
        <div className="mb-5 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A754B]">{t('home.categoryEyebrow')}</p>
            <h2 className="font-serif text-2xl text-[#4B3621] sm:text-3xl">{t('home.categoryTitle')}</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#8A8078]">{t('home.categorySub')}</p>
        </div>
        <CategoryScroller contentClassName="gap-3 py-2">
          {loadingCategories
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-28 h-9 rounded-full bg-[#E7DFD3]/60 animate-pulse" />
              ))
            : categories.map((c) => {
                const label = categoryLabel(c)
                return (
                  <button
                    key={c.id || c.slug || c.name}
                    onClick={() => handleCategoryClick(c)}
                    className="min-h-10 shrink-0 rounded-full border border-[#E7DFD3] bg-white px-5 py-2 text-sm text-[#4B3621] shadow-xs transition hover:border-[#C7B69F] hover:bg-[#FAF7F2] active:bg-[#F1EADF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
                    title={c.slug}
                  >
                    {label}
                  </button>
                )
              })}
        </CategoryScroller>
      </section>
    </>
  )
}
