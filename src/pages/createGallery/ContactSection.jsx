export default function ContactSection({ t, form, handleChange }) {
  return (
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">contact_phone</span> {t('createGallery.contact')}
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="phone">{t('createGallery.phone')}</label>
              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute start-4 top-3.5 text-[#4e453d]">call</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg ps-12 pe-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="phone"
                  placeholder={t('createGallery.phonePh')}
                  type="tel"
                />
              </div>
            </div>
          </section>
  )
}
