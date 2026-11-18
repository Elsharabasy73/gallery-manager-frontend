export default function AdditionalImages({ t, imagesPreviews, removeImage, formatNumber, imagesFiles, optimizing, photoError, handleImages }) {
  return (
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">photo_library</span> {t('createGallery.images')}
              <span className="ms-2 text-xs font-normal bg-[#fdf1eb] border border-[#d2c4ba] px-2 py-0.5 rounded-full text-[#8A8078]">{t('common.optional')}</span>
            </h2>
            <p className="text-sm text-[#8A8078] mb-6">{t('createGallery.imagesSub')}</p>

            <label className="relative w-full min-h-[120px] rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex flex-col items-center justify-center bg-[#fdf1eb] cursor-pointer transition-colors p-4">
              <input accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handleImages} />
              <span className="material-symbols-outlined text-[#78582f] text-3xl mb-1">add_a_photo</span>
              <span className="text-sm font-medium text-[#33210d]">{t('createGallery.uploadImages')}</span>
              <span className="text-xs text-[#8A8078]">{t('createGallery.uploadHint')}</span>
            </label>

            {imagesPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {imagesPreviews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#d2c4ba] h-28">
                    <img src={src} alt={`gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 end-1 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-[#8A8078] mt-2">{t('createGallery.selected', { n: formatNumber(imagesFiles.length) })}</p>
            {optimizing && <p className="text-xs text-[#78582f] mt-1">{t('createGallery.optimizing')}</p>}
            {photoError && <p className="text-xs text-[#B3402E] mt-1">{photoError}</p>}
          </section>
  )
}
