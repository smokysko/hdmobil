import { useI18n } from '@/i18n'
import { Link } from 'wouter'
import NewsletterForm from './NewsletterForm'
import CookieConsent from './CookieConsent'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-bold tracking-tight text-foreground cursor-pointer">
                HD<span className="text-primary">MOBIL</span>
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link href="/admin/newsletter">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                  Admin
                </span>
              </Link>

              <div className="flex items-center gap-1 border border-border rounded-md">
                {(['sk', 'cs', 'pl'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-1 text-xs font-medium uppercase transition-colors ${
                      language === lang
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-secondary/10">
        {children}
      </main>

      <footer className="bg-foreground text-background pt-12 pb-6">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div className="space-y-4">
              <span className="text-xl font-bold tracking-tight text-background">
                HD<span className="text-primary">MOBIL</span>
              </span>
              <p className="text-sm text-muted-foreground max-w-xs">
                Vas specialista na mobilnu elektroniku a prislusenstvo.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-background mb-4">
                {t.footer.legal}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/ochrana-sukromia">
                    <span className="hover:text-primary cursor-pointer transition-colors">
                      {t.footer.privacy}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/cookies">
                    <span className="hover:text-primary cursor-pointer transition-colors">
                      {t.footer.cookies}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/obchodne-podmienky">
                    <span className="hover:text-primary cursor-pointer transition-colors">
                      {t.footer.terms}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-background mb-4">
                {t.footer.newsletter}
              </h3>
              <NewsletterForm />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-xs text-muted-foreground">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </div>
  )
}
