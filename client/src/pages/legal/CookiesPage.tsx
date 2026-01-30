import Layout from '@/components/Layout'
import { useI18n } from '@/i18n'

export default function CookiesPage() {
  const { t } = useI18n()

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.legal.cookies.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.legal.cookies.lastUpdated}: 30. 1. 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <h2>1. Co su cookies?</h2>
            <p>
              Cookies su male textove subory, ktore sa ukladaju do vasho zariadenia pri
              navsteve webovej stranky. Pomahaju nam zabezpecit zakladne funkcie stranky,
              analyzovat navstevnost a personalizovat obsah.
            </p>

            <h2>2. Ake cookies pouzivame</h2>

            <h3>Nevyhnutne cookies</h3>
            <p>
              Tieto cookies su potrebne pre zakladne fungovanie stranky. Bez nich by
              niektore funkcie (napriklad nakupny kosik) nefungovali spravne.
            </p>
            <ul>
              <li><strong>session_id</strong> - identifikacia vasej relacie</li>
              <li><strong>cart_token</strong> - udrzanie obsahu kosika</li>
              <li><strong>cookie_consent</strong> - ulozenie vasich preferencii cookies</li>
            </ul>

            <h3>Analyticke cookies</h3>
            <p>
              Pomahaju nam pochopit, ako navstevnici pouzivaju nasu stranku. Vsetky
              udaje su anonymizovane.
            </p>
            <ul>
              <li><strong>_ga</strong> - Google Analytics identifikator</li>
              <li><strong>_gid</strong> - Google Analytics rozlisenie navstevnikov</li>
            </ul>

            <h3>Marketingove cookies</h3>
            <p>
              Tieto cookies sluzia na zobrazovanie relevantnych reklam na zaklade vasich
              zaujmov.
            </p>
            <ul>
              <li><strong>_fbp</strong> - Facebook Pixel</li>
              <li><strong>ads_id</strong> - Google Ads identifikator</li>
            </ul>

            <h2>3. Ako spravovat cookies</h2>
            <p>
              Svoje preferencie cookies mozete kedykolvek zmenit kliknutim na tlacidlo
              "Nastavenia cookies" v pate stranky. Taktiez mozete cookies vymazat alebo
              zablokovat v nastaveniach vasho prehliadaca.
            </p>

            <h2>4. Dalsie informacie</h2>
            <p>
              Viac informacii o spracovani vasich udajov najdete v nasich{' '}
              <a href="/ochrana-sukromia" className="text-primary hover:underline">
                zasadach ochrany sukromia
              </a>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
