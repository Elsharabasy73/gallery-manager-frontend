import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyGallery, updateGallery } from '../../api/galleries';
import { getGalleryLogoUrl, getGalleryBannerUrl, STORAGE_BASE } from '../../utils/image';
import { useLanguage } from '../../i18n/LanguageContext';
import { compressImageUpload, prepareImageUploads, IMAGE_PRESETS } from '../../hooks/useImageUploads';

export function MyGallery(){
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [gallery, setGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [form, setForm] = useState({ name:'', description:'', country:'', city:'', street:'', mapAddressUrl:'', phone:'' })
  const [initialForm, setInitialForm] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [initialLogoPreview, setInitialLogoPreview] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [initialBannerPreview, setInitialBannerPreview] = useState(null)
  const [imagesFiles, setImagesFiles] = useState([])
  const [imagesPreviews, setImagesPreviews] = useState([])
  const [initialImagesPreviews, setInitialImagesPreviews] = useState([])
  const [photoError, setPhotoError] = useState('')
  const [optimizing, setOptimizing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchMyGallery(){
      setLoading(true)
      setFetchError('')
      try {
        const res = await getMyGallery()
        if (cancelled) return
        const g = res?.data?.data || res?.data || res
        // backend: { status: 'success', data: { gallery }} or { data: gallery }
        const gal = g?.gallery || g
        if (!gal || !gal.id && !gal._id && !gal.name) {
          // treat as no gallery — redirect to create
          navigate('/dashboard/create-gallery', { replace: true })
          return
        }
        setGallery(gal)
        const nextForm = {
          name: gal.name || '',
          description: gal.description || '',
          country: gal.country || '',
          city: gal.city || '',
          street: gal.street || '',
          mapAddressUrl: gal.mapAddressUrl || gal.mapUrl || '',
          phone: gal.phone || '',
        }
        setForm(nextForm)
        setInitialForm(nextForm)
        const logoUrl = gal.logo && gal.storageFolder ? getGalleryLogoUrl(gal) : null
        const bannerUrl = gal.banner && gal.storageFolder ? getGalleryBannerUrl(gal) : null
        if (logoUrl) { setLogoPreview(logoUrl); setInitialLogoPreview(logoUrl) }
        if (bannerUrl) { setBannerPreview(bannerUrl); setInitialBannerPreview(bannerUrl) }
        if (Array.isArray(gal.images) && gal.images.length && gal.storageFolder) {
          const previews = gal.images.map(f => f.startsWith('http') ? f : `${STORAGE_BASE}/storage/uploads/galleries/${gal.storageFolder}/${f}`)
          setImagesPreviews(previews)
          setInitialImagesPreviews(previews)
        } else {
          setInitialImagesPreviews([])
        }
      } catch (err) {
        if (cancelled) return
        // 404 means gallery_owner has no gallery yet → redirect to create
        if (err?.status === 404) {
          navigate('/dashboard/create-gallery', { replace: true })
          return
        }
        setFetchError(err.message || 'Failed to load gallery')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMyGallery()
    return () => { cancelled = true }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(s => ({ ...s, [name]: value }))
  }
  const handleLogo = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setPhotoError('')
    setOptimizing(true)
    try {
      await compressImageUpload(f, IMAGE_PRESETS.logo, logoPreview, setLogoFile, setLogoPreview)
    } catch (err) {
      setPhotoError(err.message || 'Could not process logo image.')
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
      await compressImageUpload(f, IMAGE_PRESETS.banner, bannerPreview, setBannerFile, setBannerPreview)
    } catch (err) {
      setPhotoError(err.message || 'Could not process banner image.')
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
      await prepareImageUploads(files, IMAGE_PRESETS.gallery, {
        onSkipped: (skipped) => setPhotoError(`${skipped.length} image(s) skipped — over 12MB each: ${skipped.join(', ')}`),
        onFiles: (ready) => setImagesFiles(prev => [...prev, ...ready].slice(0,8)),
        onPreviews: (previews) => setImagesPreviews(prev => [...prev, ...previews].slice(0,8)),
      })
    } finally {
      setOptimizing(false)
    }
  }
  const removeNewImage = (idx) => {
    // only removes newly added? For simplicity remove from both arrays.
    // If idx corresponds to existing server images, we just hide preview — backend will not delete unless we send flag. Keep simple: remove preview.
    const src = imagesPreviews[idx]
    if (src?.startsWith('blob:')) URL.revokeObjectURL(src)
    setImagesPreviews(prev => prev.filter((_,i)=>i!==idx))
    setImagesFiles(prev => {
      // if there are more previews than files (existing images), adjust
      if (prev.length > 0 && idx >= prev.length) return prev
      return prev.filter((_,i)=>i!==idx)
    })
  }

  const hasChanges = (() => {
    if (!initialForm) return false
    if (JSON.stringify(form) !== JSON.stringify(initialForm)) return true
    if (logoFile) return true
    if (bannerFile) return true
    if (imagesFiles.length > 0) return true
    if (imagesPreviews.length !== initialImagesPreviews.length) return true
    // also check if logo/banner preview was cleared/changed via file removal (not currently supported) — handled by file
    return false
  })()

  const handleSave = async () => {
    if (!hasChanges) return
    setSaveError(''); setSaveSuccess('')
    if (!form.name.trim() || !form.description.trim()){ setSaveError(t('dashboard.nameDescRequired')); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('description', form.description.trim())
      if (form.country) fd.append('country', form.country)
      if (form.city) fd.append('city', form.city.trim())
      if (form.street) fd.append('street', form.street.trim())
      if (form.mapAddressUrl) fd.append('mapAddressUrl', form.mapAddressUrl.trim())
      if (form.phone) fd.append('phone', form.phone.trim())
      if (logoFile) fd.append('logo', logoFile)
      if (bannerFile) fd.append('banner', bannerFile)
      imagesFiles.forEach(f => fd.append('images', f))
      const gid = gallery.id || gallery._id
      if (!gid) throw new Error(t('dashboard.missingId'))
      await updateGallery(gid, fd)
      setSaveSuccess(t('dashboard.galleryUpdated'))
      setImagesFiles([])
      // reset dirty state to current values
      setInitialForm({ ...form })
      setInitialLogoPreview(logoPreview)
      setInitialBannerPreview(bannerPreview)
      setInitialImagesPreviews([...imagesPreviews])
      setLogoFile(null)
      setBannerFile(null)
    } catch (err){
      setSaveError(err.message || t('dashboard.updateFail'))
    } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-sm text-[#8A8078]">{t('dashboard.loadingGallery')}</div>
  if (fetchError) return <div className="text-center py-16 bg-white border rounded-xl"><p className="text-sm text-[#B3402E]">{fetchError}</p><button onClick={()=>window.location.reload()} className="mt-3 text-sm underline text-[#78582f]">{t('common.retry')}</button></div>
  if (!gallery) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#33210d]">{t('dashboard.myGallery')}</h1>
        <p className="text-sm text-[#8A8078]">{t('dashboard.myGallerySub')}</p>
      </div>

      {saveError && <div role="alert" className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{saveError}</div>}
      {saveSuccess && <div role="status" className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{saveSuccess}</div>}

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#78582f]">brush</span> {t('dashboard.brandIdentity')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-medium text-[#201a17]">{t('dashboard.galleryLogo')}</label>
            <label className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] focus-within:ring-2 focus-within:ring-[#78582f]/30 focus-within:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer overflow-hidden group">
              <input aria-label={t('dashboard.galleryLogo')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleLogo} />
              {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>}
            </label>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-[#201a17]">{t('dashboard.coverBanner')}</label>
            <label className="relative w-full h-32 rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] focus-within:ring-2 focus-within:ring-[#78582f]/30 focus-within:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer overflow-hidden">
              <input aria-label={t('dashboard.coverBanner')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleBanner} />
              {bannerPreview ? <img src={bannerPreview} alt="banner" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-3xl">panorama</span>}
            </label>
          </div>
        </div>
        {optimizing && <p className="text-xs text-[#78582f] mt-4">{t('dashboard.optimizing')}</p>}
        {photoError && <p className="text-xs text-[#B3402E] mt-4">{photoError}</p>}
        <div className="space-y-4">
          <div><label className="text-sm font-medium">{t('dashboard.galleryName')}</label><input name="name" value={form.name} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1 focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 outline-none" /></div>
          <div><label className="text-sm font-medium">{t('dashboard.description')}</label><textarea name="description" value={form.description} onChange={handleChange} maxLength={500} rows={3} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1 focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 outline-none resize-y" /><div className="text-xs text-right text-[#8A8078]">{form.description.length}/500</div></div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2"><span className="material-symbols-outlined text-[#78582f]">location_on</span> {t('dashboard.location')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="text-sm font-medium">{t('dashboard.country')}</label><select name="country" value={form.country} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1 bg-white"><option value="">{t('dashboard.selectCountry')}</option><option>Egypt</option><option>United States</option><option>United Kingdom</option><option>France</option><option>Italy</option><option>Japan</option></select></div>
          <div><label className="text-sm font-medium">{t('dashboard.city')}</label><input name="city" value={form.city} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1" /></div>
        </div>
        <div className="mt-4 space-y-4">
          <div><label className="text-sm font-medium">{t('dashboard.street')}</label><input name="street" value={form.street} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1" placeholder={t('dashboard.streetPh')} /></div>
          <div><label className="text-sm font-medium">{t('dashboard.mapsUrl')}</label><input name="mapAddressUrl" value={form.mapAddressUrl} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1" placeholder="https://maps.google.com/..." /></div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2"><span className="material-symbols-outlined text-[#78582f]">contact_phone</span> {t('dashboard.contact')}</h2>
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#8A8078] text-[20px]">call</span>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg ps-10 pe-4 py-2.5 text-sm" placeholder={t('dashboard.phone')} />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[#78582f]">photo_library</span> {t('dashboard.galleryImages')} <span className="text-xs font-normal bg-[#fdf1eb] border px-2 py-0.5 rounded-full">{t('common.optional')}</span></h2>
        <p className="text-sm text-[#8A8078] mb-4">{t('dashboard.galleryImagesSub')}</p>
        <label className="relative w-full min-h-[120px] rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] focus-within:ring-2 focus-within:ring-[#78582f]/30 focus-within:border-[#78582f] flex flex-col items-center justify-center bg-[#fdf1eb] cursor-pointer p-4">
          <input aria-label={t('dashboard.uploadImages')} accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handleImages} />
          <span className="material-symbols-outlined text-[#78582f] text-3xl">add_a_photo</span>
          <span className="text-sm font-medium">{t('dashboard.uploadImages')}</span>
          <span className="text-xs text-[#8A8078]">{t('dashboard.uploadHint')}</span>
        </label>
        {imagesPreviews.length>0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {imagesPreviews.map((src,i)=>(
              <div key={i} className="relative h-28 rounded-lg overflow-hidden border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" aria-label={t('common.removeImage')} onClick={()=>removeNewImage(i)} className="absolute top-1 end-1 w-10 h-10 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78582f]"><span className="material-symbols-outlined text-[16px]">close</span></button>
              </div>
            ))}
          </div>
        )}
        {optimizing && <p className="text-xs text-[#78582f] mt-3">{t('dashboard.optimizing')}</p>}
        {photoError && <p className="text-xs text-[#B3402E] mt-3">{photoError}</p>}
      </section>

      <div className="flex justify-end gap-3">
        <button onClick={()=>navigate('/galleries/'+ (gallery.id || gallery._id))} className="border border-[#d2c4ba] px-6 py-3 min-h-11 rounded-lg text-sm bg-white hover:bg-[#fdf1eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78582f]">{t('dashboard.viewPublic')}</button>
        <button
          onClick={handleSave}
          disabled={saving || optimizing || !hasChanges}
          title={!hasChanges ? t('dashboard.noChanges') : ''}
          className={`px-8 py-3 min-h-11 rounded-lg text-sm font-medium flex items-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78582f] focus-visible:ring-offset-2 ${hasChanges && !saving && !optimizing ? 'bg-[#33210d] text-white hover:bg-[#4a3219]' : 'bg-[#33210d]/40 text-white/80 cursor-not-allowed'}`}
        >
          {saving?t('common.saving'):optimizing?t('dashboard.optimizing'):t('common.saveChanges')} <span className="material-symbols-outlined text-[18px]">save</span>
        </button>
      </div>
    </div>
  )
}

export default MyGallery;
