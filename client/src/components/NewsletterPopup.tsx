import { useState, useEffect, useCallback } from "react";
import { X, Gift, Mail, Check, Copy, Clock } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { subscribeToNewsletter } from "@/services/newsletter";
import { cn } from "@/lib/utils";

const POPUP_STORAGE_KEY = "hdmobil_newsletter_popup_shown";
const POPUP_DELAY_MS = 10000;

interface NewsletterPopupProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function NewsletterPopup({
  forceOpen,
  onClose,
}: NewsletterPopupProps) {
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    discountCode: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    const wasShown = localStorage.getItem(POPUP_STORAGE_KEY);
    if (wasShown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [forceOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-secondary/80 transition-colors"
          aria-label={t.common.close}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t.newsletter.popupTitle}</h2>
          <p className="text-muted-foreground">{t.newsletter.popupSubtitle}</p>
        </div>

        <div className="p-8 pt-6">
          {success ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">
                  {t.newsletter.successTitle}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.newsletter.successMessage}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {t.newsletter.yourCode}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-wider text-primary">
                    {success.discountCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      copied
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "hover:bg-secondary"
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
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{t.newsletter.validFor24h}</span>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                {t.newsletter.startShopping}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t.newsletter.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="gdpr-popup"
                  checked={gdprConsent}
                  onCheckedChange={(checked) =>
                    setGdprConsent(checked === true)
                  }
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label
                  htmlFor="gdpr-popup"
                  className="text-xs text-muted-foreground cursor-pointer leading-relaxed"
                >
                  {t.newsletter.gdprText}{" "}
                  <a href="#" className="text-primary hover:underline">
                    {t.newsletter.privacyPolicy}
                  </a>
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold"
                disabled={isLoading}
              >
                {isLoading
                  ? t.newsletter.subscribing
                  : t.newsletter.getDiscount}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {t.newsletter.noSpam}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
