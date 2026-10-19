import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

/**
 * Reusable Pagination component with Quick Page Jump ("Go to page") option.
 *
 * Props:
 * - pagination: { currentPage, numberOfPages, lastPage, prev, next }
 * - page: current page number fallback
 * - onPageChange: function(newPage: number) => void
 * - showFirstLast: optional boolean to show First/Last buttons (default true)
 * - className: optional container classes
 */
export default function Pagination({
  pagination,
  page = 1,
  onPageChange,
  showFirstLast = true,
  className = '',
}) {
  const { t, formatNumber } = useLanguage()
  const [jumpInput, setJumpInput] = useState('')

  if (!pagination) return null

  const currentPage = Number(pagination.currentPage || page || 1)
  const totalPages = Number(pagination.numberOfPages || pagination.lastPage || 1)
  const hasPrev = Boolean(pagination.prev || currentPage > 1)
  const hasNext = Boolean(pagination.next || (totalPages > 1 && currentPage < totalPages))

  const handleJump = (e) => {
    e?.preventDefault?.()
    const target = parseInt(jumpInput, 10)
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      if (target !== currentPage) {
        onPageChange(target)
      }
      setJumpInput('')
    }
  }

  return (
    <div className={`space-y-3 pt-3 ${className}`}>
      {/* Main Prev / Page / Next controls */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {showFirstLast && (
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            className="px-3 py-1.5 rounded-lg border border-[#E7DFD3] text-sm bg-white hover:bg-[#FAF7F2] transition disabled:opacity-40 disabled:hover:bg-white"
          >
            {t('common.first')}
          </button>
        )}

        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-3 py-1.5 rounded-lg border border-[#E7DFD3] text-sm bg-white hover:bg-[#FAF7F2] transition disabled:opacity-40 disabled:hover:bg-white"
        >
          {t('common.prev')}
        </button>

        <span className="text-sm text-[#8A8078] px-2 whitespace-nowrap">
          {t('common.page')} <span className="font-medium text-[#4B3621]">{formatNumber(currentPage)}</span> / {formatNumber(totalPages)}
        </span>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg border border-[#E7DFD3] text-sm bg-white hover:bg-[#FAF7F2] transition disabled:opacity-40 disabled:hover:bg-white"
        >
          {t('common.next')}
        </button>

        {showFirstLast && (
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1.5 rounded-lg border border-[#E7DFD3] text-sm bg-white hover:bg-[#FAF7F2] transition disabled:opacity-40 disabled:hover:bg-white"
          >
            {t('common.last')}
          </button>
        )}
      </div>

      {/* Quick Jump option under pagination (visible when there are 2 or more pages) */}
      {totalPages > 1 && (
        <form onSubmit={handleJump} className="flex justify-center items-center gap-2 text-xs text-[#8A8078]">
          <span>{t('pagination.goToPage') || (t('common.page') + ':')}</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            inputMode="numeric"
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder={`${currentPage}`}
            aria-label={t('pagination.goToPage') || 'Go to page'}
            className="w-16 px-2.5 py-1 text-center text-xs text-[#201a17] bg-white border border-[#E7DFD3] rounded-lg outline-none focus:border-[#4B3621] transition"
          />
          <button
            type="submit"
            disabled={!jumpInput || isNaN(parseInt(jumpInput, 10)) || parseInt(jumpInput, 10) < 1 || parseInt(jumpInput, 10) > totalPages}
            className="px-3 py-1 bg-[#4B3621] text-white rounded-lg text-xs font-medium hover:bg-[#33210d] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('pagination.go') || 'Go'}
          </button>
        </form>
      )}
    </div>
  )
}

