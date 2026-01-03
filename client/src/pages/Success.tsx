import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Success() {
  return (
    <Layout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-6 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Objednávka potvrdená!
        </h1>
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          Ďakujeme za váš nákup. Odoslali sme vám potvrdzujúci email s detailmi objednávky. Váš tovar bude čoskoro odoslaný.
        </p>
        <div className="flex gap-4">
          <Button size="lg" className="font-display tracking-wider" asChild>
            <Link href="/">SPÄŤ DOMOV</Link>
          </Button>
          <Button size="lg" variant="outline" className="font-display tracking-wider" asChild>
            <Link href="/category/all">POKRAČOVAŤ V NÁKUPE</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
