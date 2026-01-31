import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Link } from "wouter";
import { MailX, CheckCircle, XCircle, Loader2, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";

type UnsubscribeStatus = "loading" | "success" | "error" | "invalid";

export default function Unsubscribe() {
  const { t } = useI18n();
  const search = useSearch();
  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (!token) {
      setStatus("invalid");
      return;
    }

    unsubscribe(token);
  }, [search]);

  async function unsubscribe(token: string) {
    try {
      const { data: subscriber, error: fetchError } = await supabase
        .from("newsletter_subscribers")
        .select("id, email, is_active")
        .eq("unsubscribe_token", token)
        .maybeSingle();

      if (fetchError || !subscriber) {
        setStatus("invalid");
        return;
      }

      if (!subscriber.is_active) {
        setEmail(subscriber.email);
        setStatus("success");
        return;
      }

      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("id", subscriber.id);

      if (updateError) {
        setStatus("error");
        return;
      }

      setEmail(subscriber.email);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {status === "loading" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
            <h1 className="text-xl font-bold mb-2">{t.unsubscribe.processing}</h1>
            <p className="text-muted-foreground">{t.unsubscribe.pleaseWait}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">{t.unsubscribe.successTitle}</h1>
            <p className="text-muted-foreground mb-6">
              {t.unsubscribe.successMessage}
              {email && (
                <span className="block mt-2 font-medium text-foreground">{email}</span>
              )}
            </p>
            <Link href="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                {t.unsubscribe.backToShop}
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">{t.unsubscribe.errorTitle}</h1>
            <p className="text-muted-foreground mb-6">{t.unsubscribe.errorMessage}</p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                {t.unsubscribe.backToShop}
              </Button>
            </Link>
          </>
        )}

        {status === "invalid" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
              <MailX className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">{t.unsubscribe.invalidTitle}</h1>
            <p className="text-muted-foreground mb-6">{t.unsubscribe.invalidMessage}</p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                {t.unsubscribe.backToShop}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
