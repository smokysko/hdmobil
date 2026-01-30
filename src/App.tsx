import { useState, useCallback } from 'react'
import { Route, Switch } from 'wouter'
import { I18nContext, type Language, translations } from '@/i18n'
import HomePage from '@/pages/HomePage'
import PrivacyPage from '@/pages/PrivacyPage'
import CookiesPage from '@/pages/CookiesPage'
import TermsPage from '@/pages/TermsPage'
import UnsubscribePage from '@/pages/UnsubscribePage'
import AdminNewsletterPage from '@/pages/AdminNewsletterPage'

function App() {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hdmobil_language')
    return (saved as Language) || 'sk'
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('hdmobil_language', lang)
  }, [])

  const t = translations[language]

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/ochrana-sukromia" component={PrivacyPage} />
        <Route path="/cookies" component={CookiesPage} />
        <Route path="/obchodne-podmienky" component={TermsPage} />
        <Route path="/odhlasit-newsletter" component={UnsubscribePage} />
        <Route path="/admin/newsletter" component={AdminNewsletterPage} />
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
              <p className="text-muted-foreground">Stranka sa nenasla</p>
            </div>
          </div>
        </Route>
      </Switch>
    </I18nContext.Provider>
  )
}

export default App
