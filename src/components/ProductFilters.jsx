import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../i18n/LanguageContext'
import CategoryScroller from './CategoryScroller'

const DEFAULT_SORT = '-createdAt'

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
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetRef = useRef(null)
  const sortOptions = [
    { value: '-createdAt', label: t('products.sortNewest') },
    { value: 'price', label: t('products.sortLowHigh') },
    { value: '-price', label: t('products.sortHighLow') },
  ]
  const activeFilterCount = (sort && sort !== DEFAULT_SORT ? 1 : 0) + (String(priceMin || '').trim() || String(priceMax || '').trim() ? 1 : 0)

  // Mobile sheet: lock page scroll, close on Escape, move focus into the sheet
  useEffect(() => {
    if (!sheetOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => { if (event.key === 'Escape') setSheetOpen(false) }
    window.addEventListener('keydown', onKey)
    sheetRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen])

  const categoryChips = (
    <>
      <button
        onClick={() => onToggleCategory('All')}
        aria-pressed={activeCategories.includes('All')}
        className={`min-h-[40px] shrink-0 px-4 rounded-full text-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f] ${activeCategories.includes('All') ? 'bg-[#4B3621] text-white border-[#4B3621]' : 'bg-white border-[#E7DFD3] text-[#4B3621] hover:bg-[#FAF7F2]'}`}
      >
        {t('products.all')}
      </button>
      {categories.map((category) => {
        const active = activeCategories.includes(category.name)
        return (
          <button
            key={category.id || category._id || category.slug || category.name}
            onClick={() => onToggleCategory(category.name)}
            aria-pressed={active}
            className={`min-h-[40px] shrink-0 px-4 rounded-full text-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f] ${active ? 'bg-[#4B3621] text-white border-[#4B3621]' : 'bg-white border-[#E7DFD3] text-[#4B3621] hover:bg-[#FAF7F2]'}`}
            title={category.slug}
          >
            {categoryLabel(category)}
          </button>
        )
      })}
    </>
  )

  const sheet = sheetOpen && createPortal(
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-labelledby="product-filters-title">
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={() => setSheetOpen(false)}
        className="absolute inset-0 bg-[#201a17]/50 animate-[fadeIn_150ms_ease-out]"
      />
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col rounded-t-2xl bg-white shadow-2xl outline-none animate-[sheetUp_200ms_ease-out] motion-reduce:animate-none"
      >
        <div className="flex justify-center pt-2.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-[#E7DFD3]" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-[#E7DFD3]">
          <h2 id="product-filters-title" className="font-serif text-lg text-[#4B3621]">{t('products.filtersTitle')}</h2>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            aria-label={t('common.close')}
            className="w-10 h-10 -me-2 rounded-full flex items-center justify-center text-[#8A8078] hover:bg-[#FAF7F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#78582f]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-6">
          <fieldset>
            <legend className="text-sm font-medium text-[#4B3621] mb-3">{t('products.sortBy')}</legend>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => {
                const active = sort === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSortChange(option.value)}
                    aria-pressed={active}
                    className={`min-h-[40px] px-4 rounded-full text-sm border transition-colors ${active ? 'bg-[#4B3621] text-white border-[#4B3621]' : 'bg-white border-[#E7DFD3] text-[#4B3621]'}`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-[#4B3621] mb-3">{t('products.priceRange')}</legend>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={priceMin}
                onChange={(event) => onPriceMinChange(event.target.value)}
                placeholder={t('products.minPrice')}
                aria-label={t('products.minPrice')}
                className="w-full min-w-0 min-h-[44px] border border-[#E7DFD3] rounded-xl px-4 text-sm bg-[#FAF7F2] focus:outline-none focus:border-[#C19A6B]"
              />
              <span className="text-[#8A8078]" aria-hidden="true">–</span>
              <input
                type="number"
                inputMode="numeric"
                value={priceMax}
                onChange={(event) => onPriceMaxChange(event.target.value)}
                placeholder={t('products.maxPrice')}
                aria-label={t('products.maxPrice')}
                className="w-full min-w-0 min-h-[44px] border border-[#E7DFD3] rounded-xl px-4 text-sm bg-[#FAF7F2] focus:outline-none focus:border-[#C19A6B]"
              />
            </div>
          </fieldset>
        </div>

        <div className="flex gap-3 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#E7DFD3] bg-white">
          <button
            type="button"
            onClick={() => { onClear(); setSheetOpen(false) }}
            className="min-h-[48px] px-5 rounded-full border border-[#E7DFD3] text-sm font-medium text-[#4B3621] hover:bg-[#FAF7F2]"
          >
            {t('products.clearAll')}
          </button>
          <button
            type="button"
            onClick={() => { onApplyPrice(); setSheetOpen(false) }}
            className="flex-1 min-h-[48px] rounded-full bg-[#4B3621] text-white text-sm font-medium hover:opacity-90 active:scale-[0.98] transition"
          >
            {t('products.showResults')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )

  return (
    <>
      <div className={`bg-white border border-[#E7DFD3] rounded-xl p-3 md:p-4 sticky top-[72px] z-30 transition-all duration-300 motion-reduce:transition-none ${visible ? 'translate-y-0 opacity-100' : '-translate-y-[110%] opacity-0 pointer-events-none'}`}>
        {/* Mobile: compact search + filters button; sort and price live in a bottom sheet */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <form
              role="search"
              onSubmit={(event) => { event.preventDefault(); onSearch() }}
              className="flex-1 flex items-center gap-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-full ps-4 pe-1 min-w-0 focus-within:border-[#C19A6B]"
            >
              <input
                type="search"
                enterKeyHint="search"
                value={input}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder={t('products.searchPh')}
                aria-label={t('products.searchPh')}
                className="bg-transparent outline-none flex-1 text-sm min-w-0 min-h-[40px]"
              />
              <button
                type="submit"
                aria-label={t('products.searchBtn')}
                className="w-10 h-10 shrink-0 rounded-full bg-[#4B3621] text-white flex items-center justify-center active:scale-95 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
            </form>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              className="relative shrink-0 min-h-[44px] flex items-center gap-1.5 px-3.5 rounded-full border border-[#E7DFD3] bg-white text-sm font-medium text-[#4B3621] hover:bg-[#FAF7F2] active:scale-95 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
              {t('products.filters')}
              {activeFilterCount > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#C19A6B] text-white text-[11px] leading-5 text-center" aria-label={t('products.activeFilters', { n: activeFilterCount })}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <CategoryScroller className="mt-2.5" contentClassName="gap-2 pb-0.5">
            {categoryChips}
          </CategoryScroller>
        </div>

        {/* Desktop/tablet: full filter bar (unchanged) */}
        <div className="hidden md:block">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] border border-[#E7DFD3] rounded-full px-4 py-2 w-full min-w-0">
              <span className="material-symbols-outlined text-[#8A8078]" aria-hidden="true">search</span>
              <input
                value={input}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') onSearch() }}
                placeholder={t('products.searchPh')}
                aria-label={t('products.searchPh')}
                className="bg-transparent outline-none flex-1 text-sm min-w-0"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <button onClick={onSearch} className="min-h-[40px] flex-1 md:flex-none bg-[#4B3621] text-white px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-[#33210d] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]">
                {t('products.searchBtn')}
              </button>
              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
                aria-label={t('products.sortBy')}
                className="min-h-[40px] flex-1 md:flex-none border border-[#E7DFD3] rounded-full px-3 py-2 text-sm bg-white min-w-[140px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
              >
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            {children}
          </div>
          <CategoryScroller className="mt-3" contentClassName="gap-2 pb-1">
            {categoryChips}
          </CategoryScroller>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="flex gap-2 flex-1 min-w-0">
              <input
                type="number"
                inputMode="numeric"
                value={priceMin}
                onChange={(event) => onPriceMinChange(event.target.value)}
                placeholder={t('products.minPrice')}
                aria-label={t('products.minPrice')}
                className="flex-1 min-w-0 min-h-[40px] border border-[#E7DFD3] rounded-full px-4 py-1.5 text-sm bg-[#FAF7F2] focus:outline-none focus:border-[#C19A6B] focus-visible:ring-2 focus-visible:ring-[#C19A6B]/40"
              />
              <input
                type="number"
                inputMode="numeric"
                value={priceMax}
                onChange={(event) => onPriceMaxChange(event.target.value)}
                placeholder={t('products.maxPrice')}
                aria-label={t('products.maxPrice')}
                className="flex-1 min-w-0 min-h-[40px] border border-[#E7DFD3] rounded-full px-4 py-1.5 text-sm bg-[#FAF7F2] focus:outline-none focus:border-[#C19A6B] focus-visible:ring-2 focus-visible:ring-[#C19A6B]/40"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={onApplyPrice} className="min-h-[40px] px-4 rounded-full border border-[#E7DFD3] text-sm bg-white whitespace-nowrap hover:bg-[#FAF7F2] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]">
                {t('products.apply')}
              </button>
              <button onClick={onClear} className="min-h-[40px] px-3 text-sm text-[#8A8078] whitespace-nowrap underline-offset-4 hover:text-[#4B3621] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]">
                {t('products.clear')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {sheet}
    </>
  )
}
