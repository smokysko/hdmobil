import { useState, useEffect } from 'react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Cookie, Settings, X } from 'lucide-react'
import { Link } from 'wouter'

const COOKIE_CONSENT_KEY = 'hdmobil_cookie_consent'

type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

export default function CookieConsent() {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences)

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!savedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
    }))
    setIsVisible(false)
  }

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true }
    setPreferences(allAccepted)
    saveConsent(allAccepted)
  }

  const acceptNecessary = () => {
    saveConsent(defaultPreferences)
  }

  const saveSettings = () => {
    saveConsent(preferences)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" />

      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-border overflow-hidden">
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    {t.cookies.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.cookies.description}{' '}
                    <Link href="/cookies">
                      <span className="text-primary hover:underline">
                        {t.footer.cookies}
                      </span>
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={acceptAll}>
                      {t.cookies.acceptAll}
                    </Button>
                    <Button variant="outline" onClick={acceptNecessary}>
                      {t.cookies.acceptNecessary}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettings(true)}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      {t.cookies.settings}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Cookie className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    {t.cookies.settings}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="necessary"
                    checked={preferences.necessary}
                    disabled
                  />
                  <div className="flex-1">
                    <Label htmlFor="necessary" className="font-medium">
                      {t.cookies.necessary}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.cookies.necessaryDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({ ...p, analytics: checked === true }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="analytics" className="font-medium cursor-pointer">
                      {t.cookies.analytics}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.cookies.analyticsDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="marketing"
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({ ...p, marketing: checked === true }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="marketing" className="font-medium cursor-pointer">
                      {t.cookies.marketing}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.cookies.marketingDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  {t.common.cancel}
                </Button>
                <Button onClick={saveSettings}>
                  {t.cookies.saveSettings}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
