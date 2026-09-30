import { useRole, PERMISSIONS } from '../context/RoleContext'
import { useLanguage } from '../i18n/LanguageContext'

const ROLE_LABEL_KEYS = {
  customer: 'roles.customer',
  gallery_owner: 'roles.gallery_owner',
  employee: 'roles.employee',
  admin: 'roles.admin',
  craftsman: 'roles.craftsman',
  user: 'roles.customer',
}

export default function AccessDenied({ pageId }){
  const { role } = useRole()
  const { t } = useLanguage()
  const allowed = PERMISSIONS[pageId] || []
  const roleKey = ROLE_LABEL_KEYS[role] || 'roles.guest'
  const allowedLabels = allowed.map(r => t(ROLE_LABEL_KEYS[r] || 'roles.guest'))
  return (
    <div className="max-w-xl mx-auto text-center py-16 px-6 bg-white border border-[#E7DFD3] rounded-xl">
      <div className="w-12 h-12 mx-auto rounded-full bg-[#ffdad6] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[#B3402E]">block</span>
      </div>
      <h2 className="font-serif text-2xl mb-2">{t('denied.title')}</h2>
      <p className="text-sm text-[#8A8078] mb-4">
        {t('denied.yourRole')} <span className="font-semibold text-[#4B3621] capitalize">{t(roleKey)}</span> {t('denied.cannotAccess')} <span className="font-mono bg-[#FAF7F2] px-1 rounded">{pageId}</span>.
      </p>
      <p className="text-xs text-[#8A8078]">{t('denied.allowed')}: {allowed.length? allowedLabels.join(', ') : t('denied.public')}</p>
    </div>
  )
}
