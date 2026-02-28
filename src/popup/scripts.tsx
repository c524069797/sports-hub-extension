import { createRoot } from 'react-dom/client'
import App from './App'
import { I18nProvider } from '../i18n'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const reactRoot = createRoot(rootElement)
reactRoot.render(
  <I18nProvider>
    <App />
  </I18nProvider>
)
