export default function BrandIdentity({ t, form, handleLogo, logoPreview, fieldErrors, handleBanner, bannerPreview, optimizing, photoError, handleChange, descLen, formatNumber }) {
  return (
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">brush</span> {t('createGallery.brandIdentity')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="col-span-1 flex flex-col items-center gap-3">
                <label className="block text-sm font-medium text-[#201a17] text-center w-full">{t('createGallery.logo')}</label>
                <label className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer transition-colors group overflow-hidden">
                  <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleLogo} />
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#4e453d] group-hover:text-[#78582f]">
                      <span className="material-symbols-outlined text-3xl mb-1">add_photo_alternate</span>
                      <span className="text-xs">{t('createGallery.upload')}</span>
                    </div>
                  )}
                </label>
                <p className="text-xs text-[#8A8078] text-center max-w-[120px]">{t('createGallery.logoHint')}</p>
                {fieldErrors.logo && <p className="text-xs text-[#B3402E]">{fieldErrors.logo}</p>}
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="block text-sm font-medium text-[#201a17]">{t('createGallery.banner')}</label>
                <label className="relative w-full h-32 rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer transition-colors group overflow-hidden">
                  <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleBanner} />
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="banner preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#4e453d] group-hover:text-[#78582f]">
                      <span className="material-symbols-outlined text-3xl mb-1">panorama</span>
                      <span className="text-xs">{t('createGallery.uploadBanner')}</span>
                    </div>
                  )}
                </label>
                <p className="text-xs text-[#8A8078]">{t('createGallery.bannerHint')}</p>
              </div>
            </div>
            {optimizing && <p className="text-xs text-[#78582f] mt-4">{t('createGallery.optimizing')}</p>}
            {photoError && <p className="text-xs text-[#B3402E] mt-4">{photoError}</p>}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="gallery-name">{t('createGallery.name')}</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="gallery-name"
                  placeholder={t('createGallery.namePh')}
                  type="text"
                />
                {fieldErrors.name && <p className="text-xs text-[#B3402E] mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-[#201a17]" htmlFor="description">{t('createGallery.descLabel')}</label>
                  <span className={`text-xs ${descLen > 450 ? 'text-[#C98A2D]' : 'text-[#8A8078]'}`}>{formatNumber(descLen)}/{formatNumber(500)}</span>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 resize-y"
                  id="description"
                  placeholder={t('createGallery.descPh')}
                  rows="4"
                />
                {fieldErrors.description && <p className="text-xs text-[#B3402E] mt-1">{fieldErrors.description}</p>}
              </div>
            </div>
          </section>
  )
}
