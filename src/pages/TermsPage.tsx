import { useI18n } from '@/i18n'
import Layout from '@/components/Layout'

export default function TermsPage() {
  const { t, language } = useI18n()

  const content = {
    sk: {
      intro: 'Tieto obchodne podmienky upravuju prava a povinnosti medzi predavajucim (HDmobil s.r.o.) a kupujucim pri nakupe tovaru prostrednictvom internetoveho obchodu.',
      sections: [
        {
          title: '1. Zakladne ustanovenia',
          content: 'Predavajuci je HDmobil s.r.o., so sidlom v Slovenskej republike. Kupujuci je fyzicka alebo pravnicka osoba, ktora uzatvara zmluvu prostrednictvom internetoveho obchodu.'
        },
        {
          title: '2. Objednavka a uzatvorenie zmluvy',
          content: 'Objednavka kupujuceho je navrhom na uzatvorenie kupnej zmluvy. Zmluva je uzatvorena momentom dorucenia potvrdenia objednavky kupujucemu.'
        },
        {
          title: '3. Ceny a platobne podmienky',
          content: 'Vsetky ceny su uvedene vratane DPH. Platbu je mozne uskutocnit platobnou kartou, bankovym prevodom alebo na dobirku pri prevzati tovaru.'
        },
        {
          title: '4. Dodanie tovaru',
          content: 'Tovar je dodavany prostednictvom kurierskych spolocnosti. Dodacia lehota je zvycajne 1-3 pracovne dni. Cena dopravy sa zobrazuje v nakupnom kosiku.'
        },
        {
          title: '5. Odstupenie od zmluvy',
          content: 'Spotrebitel ma pravo odstupit od zmluvy do 14 dni od prevzatia tovaru bez udania dovodu. Tovar musi byt vrateny neposkodeny a v povodnom baleni.'
        },
        {
          title: '6. Reklamacie',
          content: 'Zaruka na tovar je 24 mesiacov. Reklamaciu je mozne uplatnit emailom alebo postou. Reklamacia bude vybavena do 30 dni od jej prijatia.'
        },
        {
          title: '7. Ochrana osobnych udajov',
          content: 'Predavajuci spracuva osobne udaje v sulade s GDPR. Podrobnosti su uvedene v zasadach ochrany sukromia.'
        },
        {
          title: '8. Zaverecne ustanovenia',
          content: 'Tieto podmienky nadobudaju ucinnost dnom ich zverejnenia. Predavajuci si vyhradzuje pravo na ich zmenu.'
        }
      ]
    },
    cs: {
      intro: 'Tyto obchodni podminky upravuji prava a povinnosti mezi prodavajicim (HDmobil s.r.o.) a kupujicim pri nakupu zbozi prostrednictvim internetoveho obchodu.',
      sections: [
        {
          title: '1. Zakladni ustanoveni',
          content: 'Prodavajici je HDmobil s.r.o., se sidlem ve Slovenske republice. Kupujici je fyzicka nebo pravnicka osoba, ktera uzavira smlouvu prostrednictvim internetoveho obchodu.'
        },
        {
          title: '2. Objednavka a uzavreni smlouvy',
          content: 'Objednavka kupujiciho je navrhem na uzavreni kupni smlouvy. Smlouva je uzavrena okamzikem doruceni potvrzeni objednavky kupujicimu.'
        },
        {
          title: '3. Ceny a platebni podminky',
          content: 'Vsechny ceny jsou uvedeny vcetne DPH. Platbu lze provest platebni kartou, bankovnim prevodem nebo dobirkou pri prevzeti zbozi.'
        },
        {
          title: '4. Dodani zbozi',
          content: 'Zbozi je dodavano prostrednictvim kurierskych spolecnosti. Dodaci lhuta je obvykle 1-3 pracovni dny. Cena dopravy se zobrazuje v nakupnim kosiku.'
        },
        {
          title: '5. Odstoupeni od smlouvy',
          content: 'Spotrebitel ma pravo odstoupit od smlouvy do 14 dnu od prevzeti zbozi bez udani duvodu. Zbozi musi byt vraceno neposkozene a v puvodnim baleni.'
        },
        {
          title: '6. Reklamace',
          content: 'Zaruka na zbozi je 24 mesicu. Reklamaci lze uplatnit emailem nebo postou. Reklamace bude vyrizena do 30 dnu od jejiho prijeti.'
        },
        {
          title: '7. Ochrana osobnich udaju',
          content: 'Prodavajici zpracovava osobni udaje v souladu s GDPR. Podrobnosti jsou uvedeny v zasadach ochrany soukromi.'
        },
        {
          title: '8. Zaverecna ustanoveni',
          content: 'Tyto podminky nabyvaji ucinnosti dnem jejich zverejneni. Prodavajici si vyhrazuje pravo na jejich zmenu.'
        }
      ]
    },
    pl: {
      intro: 'Niniejszy regulamin okresla prawa i obowiazki sprzedawcy (HDmobil s.r.o.) i kupujacego przy zakupie towarow za posrednictwem sklepu internetowego.',
      sections: [
        {
          title: '1. Postanowienia ogolne',
          content: 'Sprzedawca to HDmobil s.r.o., z siedziba w Republice Slowackiej. Kupujacy to osoba fizyczna lub prawna zawierajaca umowe za posrednictwem sklepu internetowego.'
        },
        {
          title: '2. Zamowienie i zawarcie umowy',
          content: 'Zamowienie kupujacego jest oferta zawarcia umowy kupna. Umowa zostaje zawarta z chwila doreczenia potwierdzenia zamowienia kupujacemu.'
        },
        {
          title: '3. Ceny i warunki platnosci',
          content: 'Wszystkie ceny sa podane z VAT. Platnosc mozna dokonac karta platnicza, przelewem bankowym lub za pobraniem przy odbiorze towaru.'
        },
        {
          title: '4. Dostawa towaru',
          content: 'Towar jest dostarczany przez firmy kurierskie. Czas dostawy wynosi zwykle 1-3 dni robocze. Koszt dostawy jest wyswietlany w koszyku.'
        },
        {
          title: '5. Odstapienie od umowy',
          content: 'Konsument ma prawo odstapic od umowy w ciagu 14 dni od otrzymania towaru bez podania przyczyny. Towar musi zostac zwrocony nieuszkodzony i w oryginalnym opakowaniu.'
        },
        {
          title: '6. Reklamacje',
          content: 'Gwarancja na towar wynosi 24 miesiace. Reklamacje mozna skladac mailowo lub poczta. Reklamacja zostanie rozpatrzona w ciagu 30 dni od jej przyjecia.'
        },
        {
          title: '7. Ochrona danych osobowych',
          content: 'Sprzedawca przetwarza dane osobowe zgodnie z RODO. Szczegoly znajduja sie w polityce prywatnosci.'
        },
        {
          title: '8. Postanowienia koncowe',
          content: 'Niniejszy regulamin wchodzi w zycie z dniem jego opublikowania. Sprzedawca zastrzega sobie prawo do jego zmiany.'
        }
      ]
    }
  }

  const pageContent = content[language]

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t.terms.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t.terms.lastUpdated}: 30.01.2026
        </p>

        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {pageContent.intro}
          </p>

          {pageContent.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
