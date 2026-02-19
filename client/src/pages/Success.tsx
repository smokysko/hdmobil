import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, Download, FileText, Home, ShoppingBag, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";

interface InvoiceData {
  invoiceId: string;
  invoiceNumber: string;
}

export default function Success() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderId = params.get("orderId");
  const orderNumber = params.get("orderNumber");
  const resultCode = params.get("ResultCode");
  const paymentRequestId = params.get("PaymentRequestId");

  const isFromFinby = resultCode !== null;
  const paymentFailed = isFromFinby && resultCode !== "0";
  const wasCancelled = resultCode === "1005";

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      generateInvoice(orderId);
    }
  }, [orderId]);

  const generateInvoice = async (orderId: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase nie je nakonfigurovany");
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/invoices/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setInvoice({
          invoiceId: result.data.invoiceId || result.data.id,
          invoiceNumber: result.data.invoiceNumber || result.data.invoice_number,
        });
      } else {
        setError(result.error || "Nepodarilo sa vygenerovat fakturu");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba pri generovani faktury");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!invoice?.invoiceId) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const downloadUrl = `${supabaseUrl}/functions/v1/invoices/download?id=${invoice.invoiceId}`;
    window.open(downloadUrl, "_blank");
  };

  if (paymentFailed) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
          <div className="mb-8 rounded-full bg-red-50 p-8 animate-in zoom-in duration-700">
            {wasCancelled ? (
              <XCircle className="h-20 w-20 text-red-400" />
            ) : (
              <AlertCircle className="h-20 w-20 text-red-500" />
            )}
          </div>

          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {wasCancelled ? "Platba zrušená" : "Platba sa nepodarila"}
          </h1>

          <div className="h-1 w-24 rounded-full bg-red-300 mb-8"></div>

          <p className="mb-8 max-w-lg text-xl leading-relaxed text-muted-foreground">
            {wasCancelled
              ? "Platbu ste zrušili. Vaša objednávka bola uložená a môžete sa vrátiť a skúsiť znova."
              : "Pri spracovaní platby nastala chyba. Skúste to prosím znova alebo zvoľte iný spôsob platby."}
          </p>

          {orderNumber && (
            <p className="mb-8 text-sm text-muted-foreground">
              Číslo objednávky: <span className="font-medium text-foreground">{orderNumber}</span>
            </p>
          )}

          <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row justify-center">
            <Button
              size="lg"
              className="h-14 rounded-full px-8 font-display text-base tracking-wide shadow-lg transition-all hover:shadow-xl"
              asChild
            >
              <Link href="/checkout">
                Skúsiť znova
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-border px-8 font-display text-base hover:bg-secondary hover:text-foreground"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Domov
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <div className="mb-8 rounded-full bg-primary/10 p-8 animate-in zoom-in duration-700 shadow-lg shadow-primary/5">
          <CheckCircle2 className="h-20 w-20 text-primary" />
        </div>

        <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          {isFromFinby ? "Platba úspešná!" : "Objednávka potvrdená!"}
        </h1>

        <div className="h-1 w-24 rounded-full bg-primary mb-8"></div>

        <p className="mb-6 max-w-lg text-xl leading-relaxed text-muted-foreground">
          {isFromFinby
            ? "Platba bola úspešne spracovaná. Odošleme vám potvrdenie emailom."
            : "Ďakujeme za váš nákup. Odoslali sme vám potvrdzujúci email s detailmi objednávky. Váš tovar bude čoskoro odoslaný."}
        </p>

        {isFromFinby && paymentRequestId && (
          <p className="mb-2 text-xs text-muted-foreground">
            ID transakcie: <span className="font-mono">{paymentRequestId}</span>
          </p>
        )}

        {orderNumber && (
          <p className="mb-8 text-lg font-medium text-foreground">
            Číslo objednávky: <span className="text-primary">{orderNumber}</span>
          </p>
        )}

        {orderId && (
          <Card className="mb-10 w-full max-w-md border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold">Faktúra</h3>
              </div>

              <Separator className="mb-4" />

              {isGenerating ? (
                <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
                  <Spinner className="h-5 w-5" />
                  <span>Generujem fakturu...</span>
                </div>
              ) : error ? (
                <div className="py-4 text-sm text-destructive">{error}</div>
              ) : invoice ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Faktura <span className="font-medium text-foreground">{invoice.invoiceNumber}</span> bola
                    uspesne vygenerovana.
                  </p>
                  <Button
                    onClick={handleDownloadInvoice}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Zobrazit / Stiahnut fakturu
                  </Button>
                </div>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  Faktura bude dostupna po spracovani objednavky.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row justify-center">
          <Button
            size="lg"
            className="h-14 rounded-full px-8 font-display text-base tracking-wide shadow-lg transition-all hover:shadow-xl"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              SPAT DOMOV
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 rounded-full border-border px-8 font-display text-base hover:bg-secondary hover:text-foreground"
            asChild
          >
            <Link href="/category/all">
              <ShoppingBag className="mr-2 h-5 w-5" />
              POKRACOVAT V NAKUPE
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
