import { useLanguage } from '../i18n/LanguageContext'
export default function About(){
  const { t } = useLanguage()
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center py-4 sm:py-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#4B3621] mb-4">{t('about.title')}</h1>
        <p className="text-[#62584E] max-w-2xl mx-auto leading-7">{t('about.sub')}</p>
        <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=80" className="rounded-xl mt-6 sm:mt-8 w-full h-56 sm:h-[380px] object-cover" alt="" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {title: t('about.c1t'), desc: t('about.c1d'), icon:'search'},
          {title: t('about.c2t'), desc: t('about.c2d'), icon:'favorite'},
          {title: t('about.c3t'), desc: t('about.c3d'), icon:'shopping_bag'},
        ].map(c=>(
          <div key={c.title} className="bg-white border border-[#E7DFD3] rounded-xl p-6 text-center shadow-sm">
            <span className="material-symbols-outlined text-[#C19A6B] text-3xl mb-2">{c.icon}</span>
            <h3 className="font-medium mb-1">{c.title}</h3>
            <p className="text-sm leading-6 text-[#62584E]">{c.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#4B3621] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div>
          <h3 className="font-serif text-xl">{t('about.ctaTitle')}</h3>
          <p className="text-white/70 text-sm">{t('about.ctaSub')}</p>
        </div>
        <button className="bg-white text-[#4B3621] px-6 py-3 min-h-11 rounded-lg text-sm font-medium hover:bg-[#FAF7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white">{t('about.ctaBtn')}</button>
      </div>
    </div>
  )
}
