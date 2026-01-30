import { useState } from 'react'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Mail, Gift, CheckCircle, Loader2 } from 'lucide-react'
import { Link } from 'wouter'
import { nanoid } from 'nanoid'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm() {
  const { t, language } = useI18n()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [successData, setSuccessData] = useState<{ code: string; email: string } | null>(null)

  const generateDiscountCode = () => {
    const prefix = 'NEWS'
    const randomPart = nanoid(6).toUpperCase()
    return `${prefix}-${randomPart}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !email.includes('@')) {
      setErrorMessage(t.newsletter.invalidEmail)
      return
    }

    if (!consent) {
      setErrorMessage(t.newsletter.consentRequired)
      return
    }

    setFormState('loading')

    try {
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (existingSubscriber) {
        setErrorMessage(t.newsletter.alreadySubscribed)
        setFormState('error')
        return
      }

      const discountCode = generateDiscountCode()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          language,
          discount_code: discountCode,
          discount_expires_at: expiresAt.toISOString(),
          gdpr_consent: true,
          gdpr_consent_at: new Date().toISOString(),
        })

      if (insertError) {
        throw insertError
      }

      await supabase.from('discounts').insert({
        code: discountCode,
        discount_type: 'percentage',
        value: 5,
        min_order_value: 0,
        max_uses: 1,
        max_uses_per_customer: 1,
        current_uses: 0,
        valid_from: new Date().toISOString(),
        valid_until: expiresAt.toISOString(),
        is_active: true,
      })

      setSuccessData({ code: discountCode, email })
      setFormState('success')
    } catch (err) {
      console.error('Newsletter subscription error:', err)
      setErrorMessage(t.common.error)
      setFormState('error')
    }
  }

  if (formState === 'success' && successData) {
    const successMessage = t.newsletter.successMessage
      .replace('{code}', successData.code)
      .replace('{email}', successData.email)

    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">
          {t.newsletter.successTitle}
        </h3>
        <p className="text-emerald-700 text-sm">
          {successMessage}
        </p>
        <div className="mt-4 p-3 bg-emerald-100 rounded-md">
          <span className="font-mono font-bold text-lg text-emerald-800">
            {successData.code}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-100 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {t.newsletter.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t.newsletter.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder={t.newsletter.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={formState === 'loading'}
          />
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="newsletter-consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked === true)}
            disabled={formState === 'loading'}
          />
          <Label
            htmlFor="newsletter-consent"
            className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
          >
            {t.newsletter.consentLabel}{' '}
            <Link href="/ochrana-sukromia">
              <span className="text-primary hover:underline">
                {t.newsletter.privacyLink}
              </span>
            </Link>
            .
          </Label>
        </div>

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={formState === 'loading'}
        >
          {formState === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.newsletter.subscribing}
            </>
          ) : (
            t.newsletter.subscribeButton
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t.newsletter.discountInfo}
        </p>
      </form>
    </div>
  )
}
