import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGallery } from '../api/galleries'
import { compressImage, prepareImages, IMAGE_PRESETS } from '../utils/compressImage'
import { useLanguage } from '../i18n/LanguageContext'
import BrandIdentity from './createGallery/BrandIdentity'
import LocationSection from './createGallery/LocationSection'
import ContactSection from './createGallery/ContactSection'
import AdditionalImages from './createGallery/AdditionalImages'

export default function CreateGallery() {
  const navigate = useNavigate()
  const { t, formatNumber } = useLanguage()
  const [form, setForm] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    street: '',
    mapAddressUrl: '',
    phone: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [imagesFiles, setImagesFiles] = useState([])
  const [imagesPreviews, setImagesPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [photoError, setPhotoError] = useState('')
  const [optimizing, setOptimizing] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleLogo = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setPhotoError('')
    setOptimizing(true)
    try {
      const { file } = await compressImage(f, IMAGE_PRESETS.logo)
      if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    } catch (err) {
      setPhotoError(err.message || t('createGallery.imgFail'))
    } finally {
      setOptimizing(false)
    }
  }
  const handleBanner = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setPhotoError('')
    setOptimizing(true)
    try {
      const { file } = await compressImage(f, IMAGE_PRESETS.banner)
      if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    } catch (err) {
      setPhotoError(err.message || t('createGallery.bannerFail'))
    } finally {
      setOptimizing(false)
    }
  }
  const handleImages = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setPhotoError('')
    setOptimizing(true)
    try {
      const { files: ready, skipped } = await prepareImages(files, IMAGE_PRESETS.gallery)
      if (skipped.length) setPhotoError(t('dashboard.skipped', { n: formatNumber(skipped.length), names: skipped.join(', ') }))
      if (!ready.length) return
      setImagesFiles((prev) => [...prev, ...ready].slice(0, 8))
      const previews = ready.map((f) => URL.createObjectURL(f))
      setImagesPreviews((prev) => [...prev, ...previews].slice(0, 8))
    } finally {
      setOptimizing(false)
    }
  }
  const removeImage = (idx) => {
    setImagesFiles((prev) => prev.filter((_, i) => i !== idx))
    setImagesPreviews((prev) => {
      const src = prev[idx]
      if (src?.startsWith('blob:')) URL.revokeObjectURL(src)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = t('createGallery.nameRequired')
    if (!form.description.trim()) errs.description = t('createGallery.descRequired')
    if (form.description.length > 500) errs.description = t('createGallery.descMax')
    if (!form.country) errs.country = t('createGallery.countryRequired')
    if (!form.city.trim()) errs.city = t('createGallery.cityRequired')
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const v = validate()
    setFieldErrors(v)
    if (Object.keys(v).length) return

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('description', form.description.trim())
      fd.append('country', form.country)
      fd.append('city', form.city.trim())
      if (form.street.trim()) fd.append('street', form.street.trim())
      if (form.mapAddressUrl.trim()) fd.append('mapAddressUrl', form.mapAddressUrl.trim())
      if (form.phone.trim()) fd.append('phone', form.phone.trim())
      if (logoFile) fd.append('logo', logoFile)
      if (bannerFile) fd.append('banner', bannerFile)
      imagesFiles.forEach((f) => fd.append('images', f))

      await createGallery(fd)
      navigate('/dashboard/my-gallery', { replace: true })
    } catch (err) {
      const msg = err?.message || t('createGallery.createFail')
      setError(msg)
      if (err?.details && typeof err.details === 'object') {
        setFieldErrors(err.details)
      }
    } finally {
      setLoading(false)
    }
  }

  const descLen = form.description.length

  return (
    <div className="min-h-screen bg-[#FAF7F2] -m-4 md:-m-6">
      <div className="max-w-3xl mx-auto px-4 md:px-10 py-12 md:py-16 pb-32">
        <header className="mb-10 text-center md:text-start">
          <h1 className="font-serif text-3xl md:text-[32px] font-semibold text-[#33210d] mb-3">{t('createGallery.title')}</h1>
          <p className="text-[16px] leading-6 text-[#4e453d] max-w-2xl">
            {t('createGallery.sub')}
          </p>
        </header>

        {error && <div className="mb-6 bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Brand Identity */}
          <BrandIdentity t={t} form={form} handleLogo={handleLogo} logoPreview={logoPreview} fieldErrors={fieldErrors} handleBanner={handleBanner} bannerPreview={bannerPreview} optimizing={optimizing} photoError={photoError} handleChange={handleChange} descLen={descLen} formatNumber={formatNumber} />

          {/* Location */}
          <LocationSection t={t} form={form} handleChange={handleChange} fieldErrors={fieldErrors} />

          {/* Contact */}
          <ContactSection t={t} form={form} handleChange={handleChange} />

          {/* Additional Images - optional field, additional to the website */}
          <AdditionalImages t={t} imagesPreviews={imagesPreviews} removeImage={removeImage} formatNumber={formatNumber} imagesFiles={imagesFiles} optimizing={optimizing} photoError={photoError} handleImages={handleImages} />
        </form>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 start-0 w-full bg-white/90 backdrop-blur-md border-t border-[#d2c4ba]/30 shadow-[0_-4px_20px_rgba(75,54,33,0.05)] z-50 py-4 px-4 md:px-10 flex justify-end">
        <div className="max-w-3xl w-full mx-auto flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || optimizing}
            className="bg-[#33210d] text-white text-sm font-medium py-3 px-8 rounded-lg shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity active:scale-95 flex items-center gap-2"
            type="button"
          >
            {loading ? t('createGallery.saving') : optimizing ? t('createGallery.optimizing') : t('createGallery.saveContinue')}
            <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
