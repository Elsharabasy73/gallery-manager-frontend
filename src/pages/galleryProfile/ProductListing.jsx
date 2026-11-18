import ProductCard from '../../components/ProductCard'
import Pagination from '../../components/Pagination'

export default function ProductListing({ productsError, wishError, productListRef, loadingProducts, products, view, setWishError, t, hasProductFilters, clearFilters, pagination, page, handlePageChange }) {
  return (
    <>
      {productsError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{productsError}</div>}
      {wishError && <div className="bg-[#fff1f0] border border-[#ffdad6] text-[#B3402E] text-xs px-3 py-2 rounded-lg">{wishError}</div>}

      <div ref={productListRef} className="scroll-mt-28">
        {loadingProducts ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden animate-pulse"><div className="aspect-[4/3] bg-[#E7DFD3]/60" /><div className="p-3"><div className="h-4 bg-[#E7DFD3]/60 rounded w-3/4" /></div></div>)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed rounded-xl">{t('galleryProfile.noProducts')} {hasProductFilters ? <button onClick={clearFilters} className="text-[#C19A6B] underline">{t('products.clearFilters')}</button> : t('galleryProfile.checkLater')}</div>
        ) : (
          <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-4'}>
            {products.map((p) => (
              <ProductCard
                key={p.id || p._id}
                product={p}
                aspect={view === 'grid' ? 'aspect-[4/3]' : 'aspect-[16/9]'}
                onWishlistError={setWishError}
              />
            ))}
          </div>
        )}
      </div>

      {pagination && (
        <Pagination
          pagination={pagination}
          page={page}
          onPageChange={handlePageChange}
          showFirstLast={true}
        />
      )}
    </>
  )
}
