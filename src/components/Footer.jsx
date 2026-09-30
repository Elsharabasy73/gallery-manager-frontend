import { useLanguage } from '../i18n/LanguageContext'

export default function Footer(){
  const { t } = useLanguage()
  return (
    <footer className="bg-[#4B3621] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-serif text-xl">{t('brand')}</div>
        <div className="flex gap-6 text-xs text-white/60">
          <a href="#">{t('footer.privacy')}</a><a href="#">{t('footer.terms')}</a><a href="#">{t('footer.contact')}</a><a href="#">{t('footer.shipping')}</a>
        </div>
        <div className="text-xs text-white/60">{t('footer.rights')}</div>
      </div>
    </footer>
  )
}
