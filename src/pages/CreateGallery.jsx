import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGallery } from '../api/galleries'

export default function CreateGallery() {
  const navigate = useNavigate()
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleLogo = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      setLogoFile(f)
      setLogoPreview(URL.createObjectURL(f))
    }
  }
  const handleBanner = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      setBannerFile(f)
      setBannerPreview(URL.createObjectURL(f))
    }
  }
  const handleImages = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setImagesFiles((prev) => [...prev, ...files].slice(0, 8))
    const previews = files.map((f) => URL.createObjectURL(f))
    setImagesPreviews((prev) => [...prev, ...previews].slice(0, 8))
  }
  const removeImage = (idx) => {
    setImagesFiles((prev) => prev.filter((_, i) => i !== idx))
    setImagesPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Gallery name is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.length > 500) errs.description = 'Max 500 characters'
    if (!form.country) errs.country = 'Country is required'
    if (!form.city.trim()) errs.city = 'City is required'
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
      const msg = err?.message || 'Failed to create gallery'
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
        <header className="mb-10 text-center md:text-left">
          <h1 className="font-serif text-3xl md:text-[32px] font-semibold text-[#33210d] mb-3">Set up your gallery</h1>
          <p className="text-[16px] leading-6 text-[#4e453d] max-w-2xl">
            Define the digital presence of your gallery. These details will be visible to collectors and visitors exploring your curation.
          </p>
        </header>

        {error && <div className="mb-6 bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Brand Identity */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">brush</span> Brand Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="col-span-1 flex flex-col items-center gap-3">
                <label className="block text-sm font-medium text-[#201a17] text-center w-full">Gallery Logo</label>
                <label className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer transition-colors group overflow-hidden">
                  <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleLogo} />
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#4e453d] group-hover:text-[#78582f]">
                      <span className="material-symbols-outlined text-3xl mb-1">add_photo_alternate</span>
                      <span className="text-xs">Upload</span>
                    </div>
                  )}
                </label>
                <p className="text-xs text-[#8A8078] text-center max-w-[120px]">Recommended 400x400px</p>
                {fieldErrors.logo && <p className="text-xs text-[#B3402E]">{fieldErrors.logo}</p>}
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="block text-sm font-medium text-[#201a17]">Cover Banner</label>
                <label className="relative w-full h-32 rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer transition-colors group overflow-hidden">
                  <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleBanner} />
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="banner preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#4e453d] group-hover:text-[#78582f]">
                      <span className="material-symbols-outlined text-3xl mb-1">panorama</span>
                      <span className="text-xs">Upload Wide Banner</span>
                    </div>
                  )}
                </label>
                <p className="text-xs text-[#8A8078]">High resolution, ideal 16:9 ratio.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="gallery-name">Gallery Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="gallery-name"
                  placeholder="e.g. Atelier Modern"
                  type="text"
                />
                {fieldErrors.name && <p className="text-xs text-[#B3402E] mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-[#201a17]" htmlFor="description">Curatorial Statement / Description</label>
                  <span className={`text-xs ${descLen > 450 ? 'text-[#C98A2D]' : 'text-[#8A8078]'}`}>{descLen}/500</span>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 resize-y"
                  id="description"
                  placeholder="Describe your gallery's focus, represented artists, and history..."
                  rows="4"
                />
                {fieldErrors.description && <p className="text-xs text-[#B3402E] mt-1">{fieldErrors.description}</p>}
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">location_on</span> Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="country">Country</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 appearance-none"
                  id="country"
                >
                  <option value="">Select Country</option>
                  <option value="Egypt">Egypt</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="France">France</option>
                  <option value="Italy">Italy</option>
                  <option value="Japan">Japan</option>
                  <option value="Germany">Germany</option>
                  <option value="UAE">UAE</option>
                </select>
                {fieldErrors.country && <p className="text-xs text-[#B3402E] mt-1">{fieldErrors.country}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="city">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="city"
                  placeholder="e.g. Cairo"
                  type="text"
                />
                {fieldErrors.city && <p className="text-xs text-[#B3402E] mt-1">{fieldErrors.city}</p>}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="street">Street Address</label>
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="street"
                  placeholder="123 Arts District Blvd"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="map-url">Google Maps URL</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-[#4e453d]">map</span>
                  <input
                    name="mapAddressUrl"
                    value={form.mapAddressUrl}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#d2c4ba] rounded-lg pl-12 pr-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                    id="map-url"
                    placeholder="https://maps.google.com/..."
                    type="url"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">contact_phone</span> Contact Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="phone">Phone Number</label>
              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-[#4e453d]">call</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg pl-12 pr-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="phone"
                  placeholder="+20 10 000 00000"
                  type="tel"
                />
              </div>
            </div>
          </section>

          {/* Additional Images - optional field, additional to the website */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">photo_library</span> Gallery Images
              <span className="ml-2 text-xs font-normal bg-[#fdf1eb] border border-[#d2c4ba] px-2 py-0.5 rounded-full text-[#8A8078]">Optional</span>
            </h2>
            <p className="text-sm text-[#8A8078] mb-6">Add additional showcase images for your gallery profile. These will appear on your gallery page. Up to 8 images.</p>

            <label className="relative w-full min-h-[120px] rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex flex-col items-center justify-center bg-[#fdf1eb] cursor-pointer transition-colors p-4">
              <input accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handleImages} />
              <span className="material-symbols-outlined text-[#78582f] text-3xl mb-1">add_a_photo</span>
              <span className="text-sm font-medium text-[#33210d]">Upload gallery images</span>
              <span className="text-xs text-[#8A8078]">PNG, JPG up to 5MB each • Optional</span>
            </label>

            {imagesPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {imagesPreviews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#d2c4ba] h-28">
                    <img src={src} alt={`gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-[#8A8078] mt-2">{imagesFiles.length}/8 images selected (optional)</p>
          </section>
        </form>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-[#d2c4ba]/30 shadow-[0_-4px_20px_rgba(75,54,33,0.05)] z-50 py-4 px-4 md:px-10 flex justify-end">
        <div className="max-w-3xl w-full mx-auto flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#33210d] text-white text-sm font-medium py-3 px-8 rounded-lg shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity active:scale-95 flex items-center gap-2"
            type="button"
          >
            {loading ? 'Saving...' : 'Save and Continue'}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
