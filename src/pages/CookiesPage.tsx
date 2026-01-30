import { useI18n } from '@/i18n'
import Layout from '@/components/Layout'

export default function CookiesPage() {
  const { t, language } = useI18n()

  const content = {
    sk: {
      intro: 'Tato stranka vysvetluje, ako pouzivame cookies a podobne technologie na nasej webovej stranke.',
      sections: [
        {
          title: '1. Co su cookies?',
          content: 'Cookies su male textove subory, ktore sa ukladaju do vasho zariadenia (pocitac, tablet, mobil) pri navsteve webovej stranky. Pomahaju nam zapametat vase preferencie a zlepsit vasu skusenost.'
        },
        {
          title: '2. Typy cookies, ktore pouzivame',
          subsections: [
            {
              subtitle: 'Nevyhnutne cookies',
              content: 'Tieto cookies su potrebne pre fungovanie zakladnych funkcii stranky ako prihlasenie, nakupny kosik a bezpecnost. Bez nich by stranka nefungovala spravne.'
            },
            {
              subtitle: 'Analyticke cookies',
              content: 'Pomahaju nam pochopit, ako navstevnici pouzivaju stranku. Zhromazduju anonymne informacie o pocte navstev, zdrojoch navstevnosti a najpouzivanejiach strankach.'
            },
            {
              subtitle: 'Marketingove cookies',
              content: 'Pouzivaju sa na sledovanie navstevnikov napriec webovymi strankami za ucelom zobrazovania relevantnych reklam.'
            }
          ]
        },
        {
          title: '3. Ako spravovat cookies',
          content: 'Vasetenie cookies mozete spravovat v nastaveniach vasho prehliadaca. Mozete ich vymazat alebo zablokovat. Upozornujeme, ze zablokovanie niektroych cookies moze ovplyvnit funkcnost stranky.'
        },
        {
          title: '4. Cookies tretich stran',
          content: 'Na nasej stranke mozu byt pouzite cookies tretich stran ako Google Analytics pre analyzu navstevnosti. Tieto sluzby maju vlastne zasady ochrany sukromia.'
        },
        {
          title: '5. Ako dlho zostanu cookies ulozene',
          content: 'Session cookies su vymazane po zatvoreni prehliadaca. Permanentne cookies zostavaju ulozene od niekolkych dni az po niekolko rokov, v zavislosti od ich ucelu.'
        },
        {
          title: '6. Kontakt',
          content: 'Ak mate otazky ohladom cookies, kontaktujte nas na info@hdmobil.sk.'
        }
      ]
    },
    cs: {
      intro: 'Tato stranka vysvetluje, jak pouzivame cookies a podobne technologie na nasich webovych strankach.',
      sections: [
        {
          title: '1. Co jsou cookies?',
          content: 'Cookies jsou male textove soubory, ktere se ukladaji do vaseho zarizeni (pocitac, tablet, mobil) pri navsteve webove stranky. Pomahaji nam zapamatovat si vase preference a zlepsit vas zazitek.'
        },
        {
          title: '2. Typy cookies, ktere pouzivame',
          subsections: [
            {
              subtitle: 'Nezbytne cookies',
              content: 'Tyto cookies jsou potrebne pro fungovani zakladnich funkci stranky jako prihlaseni, nakupni kosik a bezpecnost. Bez nich by stranka nefungovala spravne.'
            },
            {
              subtitle: 'Analyticke cookies',
              content: 'Pomahaji nam pochopit, jak navstevnici pouzivaji stranky. Shromazduji anonymni informace o poctu navstev, zdrojich navstevnosti a nejpouzivanejsich strankach.'
            },
            {
              subtitle: 'Marketingove cookies',
              content: 'Pouzivaji se k sledovani navstevniku napric webovymi strankami za ucelem zobrazovani relevantnich reklam.'
            }
          ]
        },
        {
          title: '3. Jak spravovat cookies',
          content: 'Nastaveni cookies muzete spravovat v nastaveni vaseho prohlizece. Muzete je smazat nebo zablokovat. Upozornujeme, ze zablokovani nekterych cookies muze ovlivnit funkcnost stranky.'
        },
        {
          title: '4. Cookies tretich stran',
          content: 'Na nasich strankach mohou byt pouzity cookies tretich stran jako Google Analytics pro analyzu navstevnosti. Tyto sluzby maji vlastni zasady ochrany soukromi.'
        },
        {
          title: '5. Jak dlouho zustanou cookies ulozeny',
          content: 'Session cookies jsou smazany po zavreni prohlizece. Permanentni cookies zustavaji ulozeny od nekolika dnu az po nekolik let, v zavislosti na jejich ucelu.'
        },
        {
          title: '6. Kontakt',
          content: 'Pokud mate dotazy ohledne cookies, kontaktujte nas na info@hdmobil.sk.'
        }
      ]
    },
    pl: {
      intro: 'Ta strona wyjasnia, jak uzywamy plikow cookie i podobnych technologii na naszej stronie internetowej.',
      sections: [
        {
          title: '1. Czym sa pliki cookie?',
          content: 'Cookies to male pliki tekstowe zapisywane na Twoim urzadzeniu (komputer, tablet, telefon) podczas odwiedzania strony internetowej. Pomagaja nam zapamietac Twoje preferencje i poprawic Twoje doswiadczenie.'
        },
        {
          title: '2. Rodzaje uzywanych cookies',
          subsections: [
            {
              subtitle: 'Niezbedne cookies',
              content: 'Te cookies sa potrzebne do dzialania podstawowych funkcji strony, takich jak logowanie, koszyk zakupow i bezpieczenstwo. Bez nich strona nie dzialaby prawidlowo.'
            },
            {
              subtitle: 'Analityczne cookies',
              content: 'Pomagaja nam zrozumiec, jak odwiedzajacy korzystaja ze strony. Zbieraja anonimowe informacje o liczbie odwiedzin, zrodlach ruchu i najpopularniejszych stronach.'
            },
            {
              subtitle: 'Marketingowe cookies',
              content: 'Sluza do sledzenia odwiedzajacych na roznych stronach internetowych w celu wyswietlania odpowiednich reklam.'
            }
          ]
        },
        {
          title: '3. Jak zarzadzac cookies',
          content: 'Ustawienia cookies mozesz zarzadzac w ustawieniach przegladarki. Mozesz je usunac lub zablokowac. Pamietaj, ze zablokowanie niektorych cookies moze wplynac na dzialanie strony.'
        },
        {
          title: '4. Cookies stron trzecich',
          content: 'Na naszej stronie moga byc uzywane cookies stron trzecich, takich jak Google Analytics do analizy ruchu. Te uslugi maja wlasne polityki prywatnosci.'
        },
        {
          title: '5. Jak dlugo pozostaja zapisane cookies',
          content: 'Cookies sesyjne sa usuwane po zamknieciu przegladarki. Cookies stale pozostaja zapisane od kilku dni do kilku lat, w zaleznosci od ich celu.'
        },
        {
          title: '6. Kontakt',
          content: 'Jesli masz pytania dotyczace cookies, skontaktuj sie z nami pod adresem info@hdmobil.sk.'
        }
      ]
    }
  }

  const pageContent = content[language]

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t.cookiesPage.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t.cookiesPage.lastUpdated}: 30.01.2026
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
              {section.content && (
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.subsections && (
                <div className="ml-4 mt-4 space-y-4">
                  {section.subsections.map((sub, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {sub.subtitle}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {sub.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
