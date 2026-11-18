import ProductCard from '../../components/ProductCard'

export default function ProductsSection({ t, activeTab, setActiveTab, wishError, loadingProducts, products, setWishError, navigate, errorProducts }) {
  return (
    <>
      {/* Curated Products Showcase with Tabs & 8 items */}
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A754B]">{t('home.productsEyebrow')}</p>
            <h2 className="font-serif text-2xl text-[#4B3621] sm:text-3xl">{t('home.curated')}</h2>
            <p className="mt-1 text-sm text-[#8A8078]">{t('home.curatedSub')}</p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1.5 rounded-full border border-[#E7DFD3] bg-white p-1 shadow-xs overflow-x-auto hide-scrollbar self-start sm:self-auto">
            {[
              { id: 'curated', label: t('home.tabCurated') },
              { id: 'new', label: t('home.tabNew') },
              { id: 'featured', label: t('home.tabFeatured') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#4B3621] text-white shadow-xs'
                    : 'text-[#8A8078] hover:text-[#4B3621]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {wishError && <div className="mb-3 bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{wishError}</div>}

        {loadingProducts ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[#E7DFD3] bg-white py-12" role="status" aria-label={t('products.loading')}>
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E7DFD3] border-t-[#C19A6B]" aria-hidden="true" />
            <span className="text-sm text-[#8A8078]">{t('products.loading')}</span>
          </div>
        ) : products.length ? (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id || p._id} product={p} variant="home" onWishlistError={setWishError} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 rounded-full border border-[#4B3621] bg-white px-6 py-2.5 text-sm font-medium text-[#4B3621] shadow-xs transition hover:bg-[#FAF7F2] hover:shadow-sm"
              >
                {t('home.exploreAll')}
                <span className="material-symbols-outlined text-[18px] rtl:rotate-180" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[#E7DFD3] bg-white py-12 text-center text-sm text-[#8A8078]">
            {errorProducts ? t('products.loadError') : t('products.empty')}
          </div>
        )}
      </section>
    </>
  )
}
