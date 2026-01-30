import Layout from '@/components/Layout'
import { useI18n } from '@/i18n'

export default function PrivacyPage() {
  const { t } = useI18n()

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.legal.privacy.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.legal.privacy.lastUpdated}: 30. 1. 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <h2>1. Spracovanie osobnych udajov</h2>
            <p>
              Spolocnost HDmobil s.r.o., so sidlom Hlavna 123, 831 01 Bratislava, ICO: 12345678,
              ako prevadzkovatel, spracuva vase osobne udaje v sulade s Nariadenim Europskeho
              parlamentu a Rady (EU) 2016/679 o ochrane fyzickych osob pri spracuvani osobnych
              udajov (GDPR).
            </p>

            <h2>2. Ake udaje zhromazdujeme</h2>
            <p>Pri pouzivani nasich sluzieb mozeme zhromazdovat nasledovne udaje:</p>
            <ul>
              <li>Identifikacne udaje (meno, priezvisko)</li>
              <li>Kontaktne udaje (email, telefon, adresa)</li>
              <li>Udaje o objednavkach a platbach</li>
              <li>Technicke udaje (IP adresa, cookies)</li>
            </ul>

            <h2>3. Ucel spracovania</h2>
            <p>Vase osobne udaje spracuvame na nasledovne ucely:</p>
            <ul>
              <li>Plnenie zmluvy (spracovanie objednavok, dorucenie tovaru)</li>
              <li>Marketingova komunikacia (newsletter) - len so suhlsom</li>
              <li>Zlepsovanie nasich sluzieb</li>
              <li>Plnenie zakonnych povinnosti</li>
            </ul>

            <h2>4. Doba uchovavania</h2>
            <p>
              Osobne udaje uchováme po dobu nevyhnutnu na splnenie ucelu, na ktory boli
              zhromazdene, alebo po dobu vyzadovanu pravnymi predpismi.
            </p>

            <h2>5. Vase prava</h2>
            <p>V suvislosti so spracovanim vasich osobnych udajov mate nasledovne prava:</p>
            <ul>
              <li>Pravo na pristup k osobnym udajom</li>
              <li>Pravo na opravu nepresnych udajov</li>
              <li>Pravo na vymazanie udajov</li>
              <li>Pravo na obmedzenie spracovania</li>
              <li>Pravo na prenositelnost udajov</li>
              <li>Pravo namietat proti spracovaniu</li>
              <li>Pravo odvolat suhlas</li>
            </ul>

            <h2>6. Kontakt</h2>
            <p>
              V pripade otazok ohladom spracovania osobnych udajov nas kontaktujte na:
              <br />
              Email: gdpr@hdmobil.sk
              <br />
              Telefon: +421 900 000 000
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
