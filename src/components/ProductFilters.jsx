import { useLanguage } from '../i18n/LanguageContext'
import CategoryScroller from './CategoryScroller'

export default function ProductFilters({
  categories,
  activeCategories,
  onToggleCategory,
  input,
  onInputChange,
  onSearch,
  sort,
  onSortChange,
  priceMin,
  onPriceMinChange,
  priceMax,
  onPriceMaxChange,
  onApplyPrice,
  onClear,
  visible = true,
  children,
}) {
  const { t, categoryLabel } = useLanguage()
  const sortOptions = [
    { value: '-createdAt', label: t('products.sortNewest') },
    { value: 'price', label: t('products.sortLowHigh') },
    { value: '-price', label: t('products.sortHighLow') },
  ]

  return (
    <div className={`bg-white border border-[#E7DFD3] rounded-xl p-4 sticky top-[72px] z-30 transition-all duration-300 motion-reduce:transition-none ${visible ? 'translate-y-0 opacity-100' : '-translate-y-[110%] opacity-0 pointer-events-none'}`}>
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] border border-[#E7DFD3] rounded-full px-4 py-2 w-full min-w-0">
          <span className="material-symbols-outlined text-[#8A8078]">search</span>
          <input
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') onSearch() }}
            placeholder={t('products.searchPh')}
            className="bg-transparent outline-none flex-1 text-sm min-w-0"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button onClick={onSearch} className="flex-1 md:flex-none bg-[#4B3621] text-white px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap">
            {t('products.searchBtn')}
          </button>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="flex-1 md:flex-none border border-[#E7DFD3] rounded-full px-3 py-2 text-sm bg-white min-w-[140px]"
          >
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        {children}
      </div>
      <CategoryScroller className="mt-3" contentClassName="gap-2 pb-1">
        <button
          onClick={() => onToggleCategory('All')}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm border ${activeCategories.includes('All') ? 'bg-[#4B3621] text-white border-[#4B3621]' : 'bg-white border-[#E7DFD3]'}`}
        >
          {t('products.all')}
        </button>
        {categories.map((category) => {
          const active = activeCategories.includes(category.name)
          return (
            <button
              key={category.id || category._id || category.slug || category.name}
              onClick={() => onToggleCategory(category.name)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm border ${active ? 'bg-[#4B3621] text-white border-[#4B3621]' : 'bg-white border-[#E7DFD3]'}`}
              title={category.slug}
            >
              {categoryLabel(category)}
            </button>
          )
        })}
      </CategoryScroller>
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <div className="flex gap-2 flex-1 min-w-0">
          <input
            type="number"
            inputMode="numeric"
            value={priceMin}
            onChange={(event) => onPriceMinChange(event.target.value)}
            placeholder={t('products.minPrice')}
            className="flex-1 min-w-0 border border-[#E7DFD3] rounded-full px-4 py-1.5 text-sm bg-[#FAF7F2]"
          />
          <input
            type="number"
            inputMode="numeric"
            value={priceMax}
            onChange={(event) => onPriceMaxChange(event.target.value)}
            placeholder={t('products.maxPrice')}
            className="flex-1 min-w-0 border border-[#E7DFD3] rounded-full px-4 py-1.5 text-sm bg-[#FAF7F2]"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onApplyPrice} className="px-4 py-1.5 rounded-full border text-sm bg-white whitespace-nowrap">
            {t('products.apply')}
          </button>
          <button onClick={onClear} className="px-3 py-1.5 text-sm text-[#8A8078] whitespace-nowrap">
            {t('products.clear')}
          </button>
        </div>
      </div>
    </div>
  )
}
