import { useRole, PERMISSIONS } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'
import { ROLE_LABEL_KEYS } from '../constants/labels'

export default function AccessDenied({ pageId }){
  const { role } = useRole()
  const { t } = useLanguage()
  const allowed = PERMISSIONS[pageId] || []
  const roleKey = ROLE_LABEL_KEYS[role] || 'roles.guest'
  const allowedLabels = allowed.map(r => t(ROLE_LABEL_KEYS[r] || 'roles.guest'))
  return (
    <section className="max-w-xl mx-auto text-center my-6 sm:my-10 py-10 sm:py-14 px-5 sm:px-8 bg-white border border-[#E7DFD3] rounded-2xl shadow-sm" aria-labelledby="access-denied-title">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fff1f0] border border-[#ffdad6] flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-[#B3402E]">block</span>
      </div>
      <h2 id="access-denied-title" className="font-serif text-2xl sm:text-3xl text-[#4B3621] mb-3">{t('denied.title')}</h2>
      <p className="text-sm leading-6 text-[#6F6258] mb-5">
        {t('denied.yourRole')} <span className="font-semibold text-[#4B3621] capitalize">{t(roleKey)}</span> {t('denied.cannotAccess')} <span className="font-mono bg-[#FAF7F2] text-[#4B3621] px-1.5 py-0.5 rounded break-all">{pageId}</span>.
      </p>
      <p className="text-xs leading-5 text-[#6F6258]">{t('denied.allowed')}: <span className="text-[#4B3621]">{allowed.length? allowedLabels.join(', ') : t('denied.public')}</span></p>
    </section>
  )
}
