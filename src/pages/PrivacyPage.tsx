import { useI18n } from '@/i18n'
import Layout from '@/components/Layout'

export default function PrivacyPage() {
  const { t, language } = useI18n()

  const content = {
    sk: {
      intro: 'Vazime si vase sukromie a zaviazali sme sa chranit vase osobne udaje. Tieto zasady ochrany sukromia vysvetluju, ako zhromazdujeme, pouzivame a chranime vase informacie.',
      sections: [
        {
          title: '1. Ake udaje zhromazdujeme',
          content: 'Zhromazdujeme nasledujuce typy osobnych udajov: meno a priezvisko, emailova adresa, telefonne cislo, dodacia a fakturacna adresa, informacie o objednavkach a platobnych transakciach.'
        },
        {
          title: '2. Ucel spracovania udajov',
          content: 'Vase osobne udaje pouzivame na: spracovanie a dorucenie objednavok, komunikaciu o objednavkach, zasielanie newsletterov (ak ste sa prihlasili), zlepsovanie nasich sluzieb a splnenie zakonnych povinnosti.'
        },
        {
          title: '3. Pravny zaklad spracovania',
          content: 'Vase udaje spracuvavame na zaklade: plnenia zmluvy (pri spracovani objednavok), vaseho suhlasu (pri newsletteroch), opravneneho zaujmu (zlepsovanie sluzieb) a zakonnej povinnosti (uctovnictvo, dane).'
        },
        {
          title: '4. Zdielanie udajov',
          content: 'Vase udaje zdielame len s dorucovaciemi spolocnostami pre dorucenie objednavok, s platobnou branou pre spracovanie platieb a so statnym organi pri zakonnej povinnosti.'
        },
        {
          title: '5. Uchovavanie udajov',
          content: 'Vase osobne udaje uchovavame po dobu nevyhnutnu na splnenie ucelu, pre ktory boli zhromazdene. Uctovne doklady uchovavame 10 rokov. Udaje z newslettera uchovavame do odhlasenia.'
        },
        {
          title: '6. Vase prava',
          content: 'Mate pravo na pristup k svojim udajom, ich opravu, vymazanie, prenosnost, namietku proti spracovaniu a odvolanie suhlasu. Pre uplatnenie prav nas kontaktujte na info@hdmobil.sk.'
        },
        {
          title: '7. Bezpecnost udajov',
          content: 'Pouzivame technické a organizacne opatrenia na ochranu vasich udajov pred neopravnenym pristupom, stratou alebo zneuzitim, vratane SSL sifrovania a bezpecneho ulozenia dat.'
        },
        {
          title: '8. Kontakt',
          content: 'Ak mate otazky o ochrane sukromia, kontaktujte nas: HDmobil s.r.o., Email: info@hdmobil.sk, Tel: +421 900 000 000'
        }
      ]
    },
    cs: {
      intro: 'Vazime si vaseho soukromi a zavazali jsme se chranit vase osobni udaje. Tyto zasady ochrany soukromi vysvetluji, jak shromazdujeme, pouzivame a chranime vase informace.',
      sections: [
        {
          title: '1. Jake udaje shromazdujeme',
          content: 'Shromazdujeme nasledujici typy osobnich udaju: jmeno a prijmeni, emailova adresa, telefonni cislo, dorucovaci a fakturacni adresa, informace o objednavkach a platnich transakcich.'
        },
        {
          title: '2. Ucel zpracovani udaju',
          content: 'Vase osobni udaje pouzivame k: zpracovani a doruceni objednavek, komunikaci o objednavkach, zasilani newsletteru (pokud jste se prihlasili), zlepsovani nasich sluzeb a splneni zakonnych povinnosti.'
        },
        {
          title: '3. Pravni zaklad zpracovani',
          content: 'Vase udaje zpracovavame na zaklade: plneni smlouvy (pri zpracovani objednavek), vaseho souhlasu (u newsletteru), opravneneho zajmu (zlepsovani sluzeb) a zakonne povinnosti (ucetnictvi, dane).'
        },
        {
          title: '4. Sdileni udaju',
          content: 'Vase udaje sdilime pouze s dorucovacimi spolecnostmi pro doruceni objednavek, s platebni branou pro zpracovani plateb a se statnimi organy pri zakonne povinnosti.'
        },
        {
          title: '5. Uchovavani udaju',
          content: 'Vase osobni udaje uchovavame po dobu nezbytnou ke splneni ucelu, pro ktery byly shromazdeny. Ucetni doklady uchovavame 10 let. Udaje z newsletteru uchovavame do odhlaseni.'
        },
        {
          title: '6. Vase prava',
          content: 'Mate pravo na pristup ke svym udajum, jejich opravu, vymazani, prenositelnost, namitku proti zpracovani a odvolani souhlasu. Pro uplatneni prav nas kontaktujte na info@hdmobil.sk.'
        },
        {
          title: '7. Bezpecnost udaju',
          content: 'Pouzivame technicka a organizacni opatreni k ochrane vasich udaju pred neopravnenym pristupem, ztratou nebo zneuzitim, vcetne SSL sifrovani a bezpecneho ulozeni dat.'
        },
        {
          title: '8. Kontakt',
          content: 'Pokud mate dotazy ohledne ochrany soukromi, kontaktujte nas: HDmobil s.r.o., Email: info@hdmobil.sk, Tel: +421 900 000 000'
        }
      ]
    },
    pl: {
      intro: 'Szanujemy Twoja prywatnosc i zobowiazujemy sie chronic Twoje dane osobowe. Niniejsza polityka prywatnosci wyjasnia, jak zbieramy, wykorzystujemy i chronimy Twoje informacje.',
      sections: [
        {
          title: '1. Jakie dane zbieramy',
          content: 'Zbieramy nastepujace rodzaje danych osobowych: imie i nazwisko, adres email, numer telefonu, adres dostawy i faktury, informacje o zamowieniach i transakcjach platniczych.'
        },
        {
          title: '2. Cel przetwarzania danych',
          content: 'Twoje dane osobowe wykorzystujemy do: realizacji i dostawy zamowien, komunikacji dotyczacej zamowien, wysylania newsletterow (jesli sie zapisales), ulepszania naszych uslug i spelnienia obowiazkow prawnych.'
        },
        {
          title: '3. Podstawa prawna przetwarzania',
          content: 'Twoje dane przetwarzamy na podstawie: wykonania umowy (realizacja zamowien), Twojej zgody (newsletter), prawnie uzasadnionego interesu (ulepszanie uslug) i obowiazku prawnego (ksiegowosc, podatki).'
        },
        {
          title: '4. Udostepnianie danych',
          content: 'Twoje dane udostepniamy tylko firmom kurierskim do dostarczenia zamowien, bramce platniczej do obslugi platnosci i organom panstwowym w razie obowiazku prawnego.'
        },
        {
          title: '5. Przechowywanie danych',
          content: 'Twoje dane osobowe przechowujemy przez okres niezbedny do realizacji celu, w jakim zostaly zebrane. Dokumenty ksiegowe przechowujemy 10 lat. Dane z newslettera przechowujemy do wypisania.'
        },
        {
          title: '6. Twoje prawa',
          content: 'Masz prawo do dostepu do swoich danych, ich poprawiania, usuwania, przenoszenia, sprzeciwu wobec przetwarzania i cofniecia zgody. Aby skorzystac z praw, skontaktuj sie na info@hdmobil.sk.'
        },
        {
          title: '7. Bezpieczenstwo danych',
          content: 'Stosujemy srodki techniczne i organizacyjne w celu ochrony Twoich danych przed nieuprawnionym dostepem, utrata lub naduzyciami, w tym szyfrowanie SSL i bezpieczne przechowywanie danych.'
        },
        {
          title: '8. Kontakt',
          content: 'Jesli masz pytania dotyczace prywatnosci, skontaktuj sie z nami: HDmobil s.r.o., Email: info@hdmobil.sk, Tel: +421 900 000 000'
        }
      ]
    }
  }

  const pageContent = content[language]

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t.privacy.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t.privacy.lastUpdated}: 30.01.2026
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
