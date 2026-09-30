import { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useLanguage } from '../i18n/LanguageContext'

export default function ShareGalleryModal({ open, onClose, url = '', title = 'Gallery' }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState('')
  const qrBoxRef = useRef(null)
  const copyTimer = useRef(null)

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  useEffect(() => {
    if (!open) return
    setCopied(false)
    setShareError('')
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [open, onClose])

  if (!open) return null

  const doCopy = async () => {
    setShareError('')
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setShareError(t('share.copyFail'))
    }
  }

  const doDownload = () => {
    setShareError('')
    try {
      const canvas = qrBoxRef.current?.querySelector('canvas')
      if (!canvas) throw new Error('QR not ready')
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `gallery-qr.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      setShareError(t('share.exportFail'))
    }
  }

  const doNativeShare = async () => {
    setShareError('')
    try {
      await navigator.share({ title, text: t('share.checkOut', { title }), url })
    } catch (err) {
      if (err?.name !== 'AbortError') setShareError(t('share.shareFail'))
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${t('share.title')} ${title}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-[#E7DFD3] shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-lg text-[#4B3621] truncate">{t('share.title')}</h2>
            <p className="text-xs text-[#8A8078] truncate">{title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 shrink-0 border rounded-full flex items-center justify-center hover:bg-[#FAF7F2]" aria-label={t('share.close')}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E7DFD3] rounded-full ps-4 pe-1.5 py-1.5">
          <span className="material-symbols-outlined text-[#8A8078] text-[18px] shrink-0">link</span>
          <input value={url} readOnly onFocus={(e) => e.target.select()} className="bg-transparent outline-none flex-1 text-xs min-w-0 text-[#4B3621]" aria-label={t('share.urlLabel')} />
          <button onClick={doCopy} className={`px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${copied ? 'bg-[#4C7A4C] text-white' : 'bg-[#4B3621] text-white'}`}>
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl p-4">
          <div ref={qrBoxRef} className="bg-white p-2 rounded-lg border border-[#E7DFD3]">
            <QRCodeCanvas value={url || window.location.href} size={180} level="M" includeMargin={true} />
          </div>
          <p className="text-[11px] text-[#8A8078]">{t('share.scan')}</p>
          <div className="flex gap-2 w-full">
            <button onClick={doDownload} className="flex-1 border border-[#E7DFD3] bg-white px-3 py-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#FAF7F2]">
              <span className="material-symbols-outlined text-[16px]">download</span> {t('share.saveQr')}
            </button>
            {canNativeShare && (
              <button onClick={doNativeShare} className="flex-1 bg-[#4B3621] text-white px-3 py-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">ios_share</span> {t('share.share')}
              </button>
            )}
          </div>
        </div>

        {shareError && <div className="text-xs text-[#B3402E] bg-[#fff1f0] border border-[#ffdad6] rounded-lg px-3 py-2">{shareError}</div>}
      </div>
    </div>
  )
}
