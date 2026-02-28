import { useI18n } from '../i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="language-switcher">
      <button
        className={`language-switcher__btn ${locale === 'zh' ? 'language-switcher__btn--active' : ''}`}
        onClick={() => setLocale('zh')}
      >
        {t.settings.languageZh}
      </button>
      <button
        className={`language-switcher__btn ${locale === 'en' ? 'language-switcher__btn--active' : ''}`}
        onClick={() => setLocale('en')}
      >
        {t.settings.languageEn}
      </button>
    </div>
  )
}
