import { useSettings } from '../hooks/useData'
import { useI18n } from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'

export default function SettingsPanel() {
  const { settings, updateSettings } = useSettings()
  const { t } = useI18n()

  if (!settings) {
    return <div className="settings-panel"><div className="spinner" /></div>
  }

  return (
    <div className="settings-panel">
      <h3 className="settings-panel__title">{t.settings.title}</h3>

      {/* 语言切换 */}
      <div className="settings-panel__item">
        <label className="settings-panel__label">
          {t.settings.language}
        </label>
        <LanguageSwitcher />
      </div>

      {/* 刷新间隔 */}
      <div className="settings-panel__item">
        <label className="settings-panel__label">
          {t.settings.refreshInterval}
        </label>
        <select
          className="settings-panel__select"
          value={settings.refreshInterval}
          onChange={(e) => {
            const val = Number(e.target.value)
            updateSettings({ refreshInterval: val })
            // 通知 background 更新 alarm
            chrome.runtime?.sendMessage?.({ type: 'UPDATE_ALARM' }).catch(() => {})
          }}
        >
          <option value={5}>5{t.settings.minutes}</option>
          <option value={10}>10{t.settings.minutes}</option>
          <option value={15}>15{t.settings.minutes}</option>
          <option value={30}>30{t.settings.minutes}</option>
          <option value={60}>60{t.settings.minutes}</option>
        </select>
      </div>

      {/* 主题 */}
      <div className="settings-panel__item">
        <label className="settings-panel__label">
          {t.settings.theme}
        </label>
        <div className="settings-panel__toggle-group">
          <button
            className={`settings-panel__toggle ${settings.theme === 'dark' ? 'settings-panel__toggle--active' : ''}`}
            onClick={() => updateSettings({ theme: 'dark' })}
          >
            {t.settings.themeDark}
          </button>
          <button
            className={`settings-panel__toggle ${settings.theme === 'light' ? 'settings-panel__toggle--active' : ''}`}
            onClick={() => updateSettings({ theme: 'light' })}
          >
            {t.settings.themeLight}
          </button>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="settings-panel__footer">
        <p className="settings-panel__version">{t.settings.version}</p>
        <p className="settings-panel__desc">
          {t.settings.description}
        </p>
      </div>
    </div>
  )
}
