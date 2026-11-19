import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function Footer(){
  const { t } = useLanguage()
  return (
    <footer className="bg-[#4B3621] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-5 md:gap-4">
        <div className="font-serif text-xl">{t('brand')}</div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/75">
          <a href="#" className="min-h-10 inline-flex items-center transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#4B3621]">{t('footer.privacy')}</a><Link to="/terms" className="min-h-10 inline-flex items-center transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#4B3621]">{t('footer.terms')}</Link><Link to="/support" className="min-h-10 inline-flex items-center transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#4B3621]">{t('footer.contact')}</Link><a href="#" className="min-h-10 inline-flex items-center transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#4B3621]">{t('footer.shipping')}</a>
        </nav>
        <div className="text-xs text-white/75 text-center">{t('footer.rights')}</div>
      </div>
    </footer>
  )
}
