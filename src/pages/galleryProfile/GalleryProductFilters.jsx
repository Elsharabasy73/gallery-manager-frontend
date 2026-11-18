import ProductFilters from '../../components/ProductFilters'

export default function GalleryProductFilters({ displayCategories, activeCats, toggleCategory, input, setInput, doSearch, sort, setSort, setPage, priceMin, setPriceMin, priceMax, setPriceMax, setAppliedMin, setAppliedMax, clearFilters, filtersVisible, view, setView }) {
  return (
    <ProductFilters
      categories={displayCategories}
      activeCategories={activeCats}
      onToggleCategory={toggleCategory}
      input={input}
      onInputChange={setInput}
      onSearch={doSearch}
      sort={sort}
      onSortChange={(value) => { setSort(value); setPage(1) }}
      priceMin={priceMin}
      onPriceMinChange={setPriceMin}
      priceMax={priceMax}
      onPriceMaxChange={setPriceMax}
      onApplyPrice={() => { setAppliedMin(priceMin.trim()); setAppliedMax(priceMax.trim()); setPage(1) }}
      onClear={clearFilters}
      visible={filtersVisible}
    >
      <div className="hidden md:flex gap-1 shrink-0">
        <button onClick={() => setView('grid')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view === 'grid' ? 'bg-[#4B3621] text-white' : 'border'}`}>
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
        </button>
        <button onClick={() => setView('list')} className={`w-8 h-8 rounded-full flex items-center justify-center ${view === 'list' ? 'bg-[#4B3621] text-white' : 'border'}`}>
          <span className="material-symbols-outlined text-[18px]">view_list</span>
        </button>
      </div>
    </ProductFilters>
  )
}
