import { useState } from "react";
import { Mail, ArrowRight, Check, Copy, Clock } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { subscribeToNewsletter } from "@/services/newsletter";
import { cn } from "@/lib/utils";

export default function NewsletterFooter() {
  const { t, language } = useI18n();
  const [email, setEmail] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    discountCode: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t.newsletter.emailRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.newsletter.invalidEmail);
      return;
    }

    if (!gdprConsent) {
      setError(t.newsletter.gdprRequired);
      return;
    }

    setIsLoading(true);

    const result = await subscribeToNewsletter(email, language, gdprConsent);

    setIsLoading(false);

    if (result.success && result.discountCode) {
      setSuccess({
        discountCode: result.discountCode,
        expiresAt: result.expiresAt || "",
      });
      setEmail("");
      setGdprConsent(false);
    } else if (result.alreadySubscribed) {
      setError(t.newsletter.alreadySubscribed);
    } else {
      setError(t.newsletter.subscribeError);
    }
  };

  const handleCopyCode = async () => {
    if (success?.discountCode) {
      await navigator.clipboard.writeText(success.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-background">
          {t.footer.newsletter}
        </h3>
        <div className="bg-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <Check className="h-5 w-5" />
            <span className="font-medium">{t.newsletter.thankYou}</span>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {t.newsletter.yourCode}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold tracking-wider text-primary">
                {success.discountCode}
              </span>
              <button
                onClick={handleCopyCode}
                className={cn(
                  "p-1.5 rounded transition-all",
                  copied
                    ? "bg-green-500/20 text-green-400"
                    : "hover:bg-white/10 text-muted-foreground"
                )}
                aria-label={t.newsletter.copyCode}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{t.newsletter.validFor24h}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-background">
        {t.footer.newsletter}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t.newsletter.footerText}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t.newsletter.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-background placeholder:text-muted-foreground focus:bg-white/15"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="shrink-0"
            disabled={isLoading}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="gdpr-footer"
            checked={gdprConsent}
            onCheckedChange={(checked) => setGdprConsent(checked === true)}
            disabled={isLoading}
            className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label
            htmlFor="gdpr-footer"
            className="text-xs text-muted-foreground cursor-pointer leading-relaxed"
          >
            {t.newsletter.gdprShort}{" "}
            <a href="#" className="text-primary hover:underline">
              {t.newsletter.privacyPolicy}
            </a>
          </label>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      <p className="text-xs text-muted-foreground/70">
        {t.newsletter.discountInfo}
      </p>
    </div>
  );
}
