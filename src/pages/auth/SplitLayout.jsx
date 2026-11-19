import { useLanguage } from '../../i18n/LanguageContext';

export function SplitLayout({ children }) {
  const { t } = useLanguage();
  return (
    <div className="grid md:grid-cols-2 bg-white border border-[#E7DFD3] rounded-xl overflow-hidden max-w-5xl mx-auto shadow-sm">
      <div
        className="hidden md:block bg-cover bg-center p-8 flex flex-col justify-end text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1616046229478-9901c5536daa?auto=format&fit=crop&w=900&q=80')",
        }}
      >
        <div className="bg-[#4B3621]/80 backdrop-blur p-6 rounded-xl">
          <div className="font-serif text-2xl mb-2">{t("brand")}</div>
          <p className="text-sm text-white/80">{t("brandTagline")}</p>
        </div>
      </div>
      <div className="min-w-0 p-5 sm:p-8">{children}</div>
    </div>
  );
}

export default SplitLayout;
