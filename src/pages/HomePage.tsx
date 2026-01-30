import Layout from '@/components/Layout'
import { Gift, Shield, Truck, Headphones } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Gift,
      title: '5% zlava pre novych zakaznikov',
      description: 'Prihlaste sa na newsletter a ziskajte zlavovy kupon.',
    },
    {
      icon: Truck,
      title: 'Rychle dorucenie',
      description: 'Dorucenie do 1-3 pracovnych dni po celom Slovensku.',
    },
    {
      icon: Shield,
      title: '24 mesacna zaruka',
      description: 'Na vsetky produkty poskytujeme plnu zaruku.',
    },
    {
      icon: Headphones,
      title: 'Zakaznicka podpora',
      description: 'Sme tu pre vas po-pi od 9:00 do 17:00.',
    },
  ]

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/5 to-sky-50 py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Vitajte v <span className="text-primary">HDmobil</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Vas specialista na mobilne telefony, tablety, notebooky a prislusenstvo.
            Kvalitne produkty za skvele ceny.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Gift className="w-4 h-4" />
            Prihlaste sa na newsletter a ziskajte 5% zlavu!
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Preco nakupovat u nas?
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground leading-relaxed">
              HDmobil je vas spolahlivy partner pre nakup mobilnej elektroniky.
              Ponukame siroky sortiment produktov od poprednych znaciek za konkurencne ceny.
              Vsetky produkty su plne zarukovane a dodavame ich v najkratsom moznom case.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  )
}
