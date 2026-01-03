import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Success() {
  return (
    <Layout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <div className="mb-8 rounded-full bg-primary/10 p-8 animate-in zoom-in duration-700 shadow-lg shadow-primary/5">
          <CheckCircle2 className="h-20 w-20 text-primary" />
        </div>
        <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Objednávka potvrdená!
        </h1>
        <div className="h-1 w-24 bg-primary rounded-full mb-8"></div>
        <p className="mb-10 max-w-lg text-xl text-muted-foreground leading-relaxed">
          Ďakujeme za váš nákup. Odoslali sme vám potvrdzujúci email s detailmi objednávky. Váš tovar bude čoskoro odoslaný.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Button size="lg" className="font-display tracking-wide h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all text-base" asChild>
            <Link href="/">SPÄŤ DOMOV</Link>
          </Button>
          <Button size="lg" variant="outline" className="font-display tracking-wide h-14 px-8 rounded-full border-border hover:bg-secondary hover:text-foreground text-base" asChild>
            <Link href="/category/all">POKRAČOVAŤ V NÁKUPE</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
