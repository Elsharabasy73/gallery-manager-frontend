export default function LocationSection({ t, form, handleChange, fieldErrors }) {
  return (
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
            <h2 className="font-serif text-xl font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#78582f]">location_on</span> {t('createGallery.location')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="country">{t('createGallery.country')}</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 appearance-none"
                  id="country"
                >
                  <option value="">{t('createGallery.selectCountry')}</option>
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
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="city">{t('createGallery.city')}</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="city"
                  placeholder={t('createGallery.cityPh')}
                  type="text"
                />
                {fieldErrors.city && <p className="text-xs text-[#B3402E] mt-1">{fieldErrors.city}</p>}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="street">{t('createGallery.street')}</label>
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#d2c4ba] rounded-lg px-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                  id="street"
                  placeholder={t('createGallery.streetPh')}
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#201a17] mb-2" htmlFor="map-url">{t('createGallery.mapsUrl')}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute start-4 top-3.5 text-[#4e453d]">map</span>
                  <input
                    name="mapAddressUrl"
                    value={form.mapAddressUrl}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#d2c4ba] rounded-lg ps-12 pe-4 py-3 text-sm text-[#201a17] focus:outline-none focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20"
                    id="map-url"
                    placeholder="https://maps.google.com/..."
                    type="url"
                  />
                </div>
              </div>
            </div>
          </section>
  )
}
