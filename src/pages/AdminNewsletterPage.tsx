import { useState, useEffect } from 'react'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, CheckCircle, TrendingUp, Download, Search, Filter } from 'lucide-react'

type Subscriber = {
  id: string
  email: string
  language: string
  discount_code: string | null
  discount_used: boolean
  subscribed_at: string
  is_active: boolean
}

type FilterType = 'all' | 'active' | 'used_coupon'

export default function AdminNewsletterPage() {
  const { t } = useI18n()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    usedCoupons: 0,
  })

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false })

      if (error) throw error

      setSubscribers(data || [])

      const total = data?.length || 0
      const active = data?.filter(s => s.is_active).length || 0
      const usedCoupons = data?.filter(s => s.discount_used).length || 0
      setStats({ total, active, usedCoupons })
    } catch (err) {
      console.error('Error fetching subscribers:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && sub.is_active) ||
      (filter === 'used_coupon' && sub.discount_used)
    return matchesSearch && matchesFilter
  })

  const exportCsv = () => {
    const headers = ['Email', 'Jazyk', 'Zlavovy kod', 'Pouzity', 'Datum prihlasenia', 'Aktivny']
    const rows = filteredSubscribers.map(sub => [
      sub.email,
      sub.language,
      sub.discount_code || '',
      sub.discount_used ? 'Ano' : 'Nie',
      new Date(sub.subscribed_at).toLocaleDateString('sk-SK'),
      sub.is_active ? 'Ano' : 'Nie',
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const conversionRate = stats.total > 0
    ? ((stats.usedCoupons / stats.total) * 100).toFixed(1)
    : '0'

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {t.admin.newsletter.title}
          </h1>
          <Button onClick={exportCsv} className="gap-2">
            <Download className="w-4 h-4" />
            {t.admin.newsletter.exportCsv}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.admin.newsletter.totalSubscribers}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.admin.newsletter.activeSubscribers}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.admin.newsletter.couponsUsed}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.usedCoupons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.admin.newsletter.conversionRate}
                </p>
                <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-lg">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Hladat email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">{t.admin.newsletter.filterAll}</option>
                <option value="active">{t.admin.newsletter.filterActive}</option>
                <option value="used_coupon">{t.admin.newsletter.filterUsedCoupon}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              {t.common.loading}
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t.admin.newsletter.noSubscribers}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {t.admin.newsletter.email}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {t.admin.newsletter.subscribedAt}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {t.admin.newsletter.discountCode}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {t.admin.newsletter.discountUsed}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      {t.admin.newsletter.status}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {sub.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(sub.subscribed_at).toLocaleDateString('sk-SK')}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-foreground">
                        {sub.discount_code || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {sub.discount_used ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {t.common.yes}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {t.common.no}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sub.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {t.admin.newsletter.active}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {t.admin.newsletter.inactive}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
