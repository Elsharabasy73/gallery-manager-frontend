import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export default function CategoryScroller({ children, className = '', contentClassName = '' }) {
  const { t } = useLanguage()
  const scrollRef = useRef(null)
  const [canScroll, setCanScroll] = useState(false)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return undefined

    const updateScrollState = () => {
      setCanScroll(element.scrollWidth > element.clientWidth + 1)
    }

    updateScrollState()
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(element)
    window.addEventListener('resize', updateScrollState)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [children])

  const scroll = (direction) => {
    const element = scrollRef.current
    if (!element) return
    element.scrollBy({
      left: direction * Math.max(element.clientWidth * 0.75, 160),
      behavior: 'smooth',
    })
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className={`flex overflow-x-auto hide-scrollbar scroll-fade-mask px-10 ${contentClassName}`}
      >
        {children}
      </div>
      {canScroll && (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={t('common.scrollCategoriesLeft')}
            title={t('common.scrollCategoriesLeft')}
            className="absolute start-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7DFD3] bg-white text-[#4B3621] shadow-sm transition hover:bg-[#FAF7F2] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
          >
            <span className="material-symbols-outlined rtl:rotate-180" aria-hidden="true">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={t('common.scrollCategoriesRight')}
            title={t('common.scrollCategoriesRight')}
            className="absolute end-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7DFD3] bg-white text-[#4B3621] shadow-sm transition hover:bg-[#FAF7F2] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78582f]"
          >
            <span className="material-symbols-outlined rtl:rotate-180" aria-hidden="true">chevron_right</span>
          </button>
        </>
      )}
    </div>
  )
}
