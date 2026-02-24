import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Star, Gift, Users, Copy, CheckCircle, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string;
  created_at: string;
}

interface VipTier {
  name: string;
  label: string;
  min_spend: number;
  discount_percentage: number;
  points_multiplier: number;
  color: string;
}

interface ReferralReward {
  referrer_points: number;
  referee_discount_percentage: number;
  min_order_amount: number;
}

export default function LoyaltyPage() {
  const { user, profile, isAuthenticated, loading: isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useDocumentTitle('Vernostný program');

  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [vipTiers, setVipTiers] = useState<VipTier[]>([]);
  const [referralReward, setReferralReward] = useState<ReferralReward | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/prihlasenie');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoadingData(true);
    const [txResult, tiersResult, rewardResult] = await Promise.all([
      supabase
        .from('loyalty_transactions')
        .select('id, points, type, description, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('vip_tiers')
        .select('name, label, min_spend, discount_percentage, points_multiplier, color')
        .order('sort_order'),
      supabase
        .from('referral_rewards')
        .select('referrer_points, referee_discount_percentage, min_order_amount')
        .eq('is_active', true)
        .maybeSingle(),
    ]);

    if (txResult.data) setTransactions(txResult.data);
    if (tiersResult.data) setVipTiers(tiersResult.data);
    if (rewardResult.data) setReferralReward(rewardResult.data);
    setLoadingData(false);
  }

  function handleCopyReferral() {
    if (!profile?.referral_code) return;
    const url = `${window.location.origin}/registracia?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Odkaz skopírovaný');
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading || !isAuthenticated || !user) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const loyaltyPoints = profile?.loyalty_points ?? 0;
  const vipLevel = profile?.vip_level ?? 'standard';
  const currentTier = vipTiers.find((t) => t.name === vipLevel);
  const nextTier = vipTiers.find((t) => t.min_spend > (currentTier?.min_spend ?? 0));

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                <Link href="/moj-ucet">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer">
                    <span>Prehľad</span>
                  </div>
                </Link>
                <Link href="/moje-objednavky">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer">
                    <span>Moje objednávky</span>
                  </div>
                </Link>
                <Link href="/oblubene">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer">
                    <span>Obľúbené</span>
                  </div>
                </Link>
                <Link href="/vernostny-program">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium cursor-pointer">
                    <Star className="h-5 w-5" />
                    <span>Vernostný program</span>
                  </div>
                </Link>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loyaltyPoints}</p>
                    <p className="text-xs text-muted-foreground">Vernostné body</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${currentTier?.color}20` }}
                  >
                    <TrendingUp className="h-5 w-5" style={{ color: currentTier?.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentTier?.label ?? 'Štandard'}</p>
                    <p className="text-xs text-muted-foreground">VIP úroveň</p>
                  </div>
                </div>
                {currentTier && currentTier.discount_percentage > 0 && (
                  <p className="text-xs text-green-600 mt-1">+{currentTier.discount_percentage}% zľava</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{referralReward?.referrer_points ?? 100}</p>
                    <p className="text-xs text-muted-foreground">Bodov za odporúčanie</p>
                  </div>
                </div>
              </div>
            </div>

            {vipTiers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold mb-4">VIP úrovne</h2>
                <div className="space-y-3">
                  {vipTiers.map((tier) => {
                    const isActive = tier.name === vipLevel;
                    return (
                      <div
                        key={tier.name}
                        className={`flex items-center gap-4 p-3 rounded-lg border ${
                          isActive ? 'border-2' : 'border-gray-100'
                        }`}
                        style={isActive ? { borderColor: tier.color, backgroundColor: `${tier.color}08` } : {}}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tier.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{tier.label}</span>
                            {isActive && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
                                Vaša úroveň
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            od {tier.min_spend.toFixed(0)} €
                            {tier.discount_percentage > 0 && ` · ${tier.discount_percentage}% zľava`}
                            {tier.points_multiplier > 1 && ` · ${tier.points_multiplier}× body`}
                          </p>
                        </div>
                        {isActive && <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: tier.color }} />}
                        {!isActive && nextTier?.name === tier.name && (
                          <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {profile?.referral_code && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-bold">Odporúčajte priateľov</h2>
                </div>
                {referralReward && (
                  <p className="text-sm text-gray-600 mb-4">
                    Za každého nového zákazníka, ktorý nakúpi za min. {referralReward.min_order_amount.toFixed(0)} €,
                    získate <strong>{referralReward.referrer_points} bodov</strong>.
                    Váš priateľ dostane <strong>{referralReward.referee_discount_percentage}% zľavu</strong> na prvý nákup.
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-600 truncate">
                    {`${window.location.origin}/registracia?ref=${profile.referral_code}`}
                  </div>
                  <button
                    onClick={handleCopyReferral}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Skopírované' : 'Kopírovať'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold">História bodov</h2>
              </div>
              {loadingData ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Zatiaľ žiadne transakcie. Nakúpte a získajte body!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('sk-SK')}</p>
                      </div>
                      <span className={`text-sm font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.points > 0 ? '+' : ''}{tx.points} b
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
