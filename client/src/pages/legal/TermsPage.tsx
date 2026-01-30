import Layout from '@/components/Layout'
import { useI18n } from '@/i18n'

export default function TermsPage() {
  const { t } = useI18n()

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.legal.terms.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.legal.terms.lastUpdated}: 30. 1. 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <h2>1. Vseobecne ustanovenia</h2>
            <p>
              Tieto vseobecne obchodne podmienky upravuju prava a povinnosti zmluvnych stran
              vyplyvajuce z kupnej zmluvy uzatvorenej medzi predavajucim HDmobil s.r.o. a
              kupujucim, ktorej predmetom je kupa a predaj tovaru prostrednictvom
              elektronickeho obchodu www.hdmobil.sk.
            </p>

            <h2>2. Objednavka a uzavretie zmluvy</h2>
            <p>
              Objednavka kupujuceho predstavuje navrh na uzavretie kupnej zmluvy. Kupna zmluva
              je uzavreta momentom potvrdenia objednavky predavajucim.
            </p>

            <h2>3. Ceny a platobne podmienky</h2>
            <p>
              Vsetky ceny su uvedene vrátane DPH. Kupujuci moze uhradit kupnu cenu nasledovnymi
              sposobmi:
            </p>
            <ul>
              <li>Bankovym prevodom</li>
              <li>Platbou kartou online</li>
              <li>Dobierkou pri prevzati tovaru</li>
            </ul>

            <h2>4. Dodacie podmienky</h2>
            <p>
              Predavajuci sa zaväzuje dodat tovar v co najkratsom case, obvykle do 1-3
              pracovnych dni od potvrdenia objednavky. Pri tovare, ktory nie je skladom,
              bude kupujuci informovany o predpokladanom termíne dodania.
            </p>

            <h2>5. Odstupenie od zmluvy</h2>
            <p>
              Kupujuci ma pravo odstupit od zmluvy bez udania dovodu do 14 dni od prevzatia
              tovaru. Tovar musi byť nepoškodeny, v povodnom obale a s kompletnym
              prislusenstvom.
            </p>

            <h2>6. Zaruka a reklamacie</h2>
            <p>
              Na tovar sa vztahuje zaruka 24 mesiacov od prevzatia tovaru. Reklamaciu je
              mozne uplatnit osobne v prevadzke alebo zaslanim tovaru na adresu predavajuceho.
            </p>

            <h2>7. Ochrana osobnych udajov</h2>
            <p>
              Predavajuci spracuva osobne udaje kupujuceho v sulade s GDPR. Podrobnosti
              najdete v{' '}
              <a href="/ochrana-sukromia" className="text-primary hover:underline">
                zasadach ochrany sukromia
              </a>.
            </p>

            <h2>8. Zaverecne ustanovenia</h2>
            <p>
              Tieto obchodne podmienky nadobudaju ucinnost dnom ich zverejnenia. Predavajuci
              si vyhradzuje pravo na ich zmenu bez predchadzajuceho upozornenia.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
