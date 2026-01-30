import { useState, useEffect } from 'react'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Link, useSearch } from 'wouter'

type UnsubscribeState = 'loading' | 'success' | 'error' | 'invalid'

export default function UnsubscribePage() {
  const { t } = useI18n()
  const searchString = useSearch()
  const params = new URLSearchParams(searchString)
  const token = params.get('token')
  const email = params.get('email')

  const [state, setState] = useState<UnsubscribeState>('loading')

  useEffect(() => {
    const processUnsubscribe = async () => {
      if (!token || !email) {
        setState('invalid')
        return
      }

      try {
        const { data: subscriber, error: fetchError } = await supabase
          .from('newsletter_subscribers')
          .select('id, is_active')
          .eq('email', email.toLowerCase())
          .eq('unsubscribe_token', token)
          .maybeSingle()

        if (fetchError || !subscriber) {
          setState('invalid')
          return
        }

        if (!subscriber.is_active) {
          setState('success')
          return
        }

        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            is_active: false,
            unsubscribed_at: new Date().toISOString(),
          })
          .eq('id', subscriber.id)

        if (updateError) {
          throw updateError
        }

        setState('success')
      } catch (err) {
        console.error('Unsubscribe error:', err)
        setState('error')
      }
    }

    processUnsubscribe()
  }, [token, email])

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
            <p className="text-muted-foreground">{t.unsubscribe.processing}</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t.unsubscribe.success}
            </h2>
            <p className="text-muted-foreground mb-6">
              {email}
            </p>
            <Link href="/">
              <Button>{t.unsubscribe.backToHome}</Button>
            </Link>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t.common.error}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t.unsubscribe.error}
            </p>
            <Link href="/">
              <Button>{t.unsubscribe.backToHome}</Button>
            </Link>
          </div>
        )

      case 'invalid':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t.unsubscribe.invalidLink}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t.unsubscribe.error}
            </p>
            <Link href="/">
              <Button>{t.unsubscribe.backToHome}</Button>
            </Link>
          </div>
        )
    }
  }

  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center text-foreground mb-8">
            {t.unsubscribe.title}
          </h1>
          <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  )
}
