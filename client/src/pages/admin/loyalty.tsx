import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Star, TrendingUp, Users, Save, Loader2, Plus, Trash2 } from 'lucide-react';

interface LoyaltyRule {
  id: string;
  points_per_euro: number;
  min_order_amount: number;
  expiry_days: number;
  is_active: boolean;
}

interface VipTier {
  id: string;
  name: string;
  label: string;
  min_spend: number;
  discount_percentage: number;
  points_multiplier: number;
  sort_order: number;
  color: string;
}

interface ReferralReward {
  id: string;
  referrer_points: number;
  referee_discount_percentage: number;
  min_order_amount: number;
  is_active: boolean;
}

export default function AdminLoyalty() {
  const [loyaltyRule, setLoyaltyRule] = useState<LoyaltyRule | null>(null);
  const [vipTiers, setVipTiers] = useState<VipTier[]>([]);
  const [referralReward, setReferralReward] = useState<ReferralReward | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLoyalty, setSavingLoyalty] = useState(false);
  const [savingReferral, setSavingReferral] = useState(false);
  const [savingTier, setSavingTier] = useState<string | null>(null);
  const [newTierForm, setNewTierForm] = useState(false);
  const [newTier, setNewTier] = useState({ name: '', label: '', min_spend: '', discount_percentage: '', points_multiplier: '1', color: '#6b7280' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [loyaltyRes, tiersRes, referralRes] = await Promise.all([
      supabase.from('loyalty_rules').select('*').eq('is_active', true).maybeSingle(),
      supabase.from('vip_tiers').select('*').order('sort_order'),
      supabase.from('referral_rewards').select('*').eq('is_active', true).maybeSingle(),
    ]);
    if (loyaltyRes.data) setLoyaltyRule(loyaltyRes.data);
    if (tiersRes.data) setVipTiers(tiersRes.data);
    if (referralRes.data) setReferralReward(referralRes.data);
    setLoading(false);
  }

  async function saveLoyaltyRule() {
    if (!loyaltyRule) return;
    setSavingLoyalty(true);
    const { error } = await supabase
      .from('loyalty_rules')
      .update({
        points_per_euro: loyaltyRule.points_per_euro,
        min_order_amount: loyaltyRule.min_order_amount,
        expiry_days: loyaltyRule.expiry_days,
      })
      .eq('id', loyaltyRule.id);
    setSavingLoyalty(false);
    if (!error) toast.success('Pravidlá uložené');
    else toast.error('Chyba pri ukladaní');
  }

  async function saveReferralReward() {
    if (!referralReward) return;
    setSavingReferral(true);
    const { error } = await supabase
      .from('referral_rewards')
      .update({
        referrer_points: referralReward.referrer_points,
        referee_discount_percentage: referralReward.referee_discount_percentage,
        min_order_amount: referralReward.min_order_amount,
      })
      .eq('id', referralReward.id);
    setSavingReferral(false);
    if (!error) toast.success('Nastavenia uložené');
    else toast.error('Chyba pri ukladaní');
  }

  async function saveTier(tier: VipTier) {
    setSavingTier(tier.id);
    const { error } = await supabase
      .from('vip_tiers')
      .update({
        label: tier.label,
        min_spend: tier.min_spend,
        discount_percentage: tier.discount_percentage,
        points_multiplier: tier.points_multiplier,
        color: tier.color,
      })
      .eq('id', tier.id);
    setSavingTier(null);
    if (!error) toast.success('Tier uložený');
    else toast.error('Chyba pri ukladaní');
  }

  async function deleteTier(tierId: string) {
    if (!confirm('Naozaj chcete odstrániť tento tier?')) return;
    const { error } = await supabase.from('vip_tiers').delete().eq('id', tierId);
    if (!error) {
      setVipTiers(vipTiers.filter((t) => t.id !== tierId));
      toast.success('Tier odstránený');
    } else {
      toast.error('Chyba pri mazaní');
    }
  }

  async function createTier() {
    if (!newTier.name || !newTier.label) {
      toast.error('Zadajte názov a popis tieru');
      return;
    }
    const { data, error } = await supabase
      .from('vip_tiers')
      .insert({
        name: newTier.name,
        label: newTier.label,
        min_spend: parseFloat(newTier.min_spend) || 0,
        discount_percentage: parseFloat(newTier.discount_percentage) || 0,
        points_multiplier: parseFloat(newTier.points_multiplier) || 1,
        sort_order: vipTiers.length,
        color: newTier.color,
      })
      .select()
      .single();
    if (!error && data) {
      setVipTiers([...vipTiers, data]);
      setNewTierForm(false);
      setNewTier({ name: '', label: '', min_spend: '', discount_percentage: '', points_multiplier: '1', color: '#6b7280' });
      toast.success('Tier vytvorený');
    } else {
      toast.error('Chyba pri vytváraní tieru');
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Vernostný program</h2>
          <p className="text-gray-500 text-sm mt-1">Nastavte pravidlá zbierania bodov, VIP úrovne a referral odmeny.</p>
        </div>

        {loyaltyRule && (
          <div className="bg-white border border-gray-200/80 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Pravidlá zbierania bodov</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Body za 1 €</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={loyaltyRule.points_per_euro}
                  onChange={(e) => setLoyaltyRule({ ...loyaltyRule, points_per_euro: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Min. suma objednávky (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={loyaltyRule.min_order_amount}
                  onChange={(e) => setLoyaltyRule({ ...loyaltyRule, min_order_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expirácia (dní, 0 = nikdy)</label>
                <input
                  type="number"
                  min="0"
                  value={loyaltyRule.expiry_days}
                  onChange={(e) => setLoyaltyRule({ ...loyaltyRule, expiry_days: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={saveLoyaltyRule}
              disabled={savingLoyalty}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm shadow-blue-500/20"
            >
              {savingLoyalty ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Uložiť pravidlá
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">VIP úrovne</h3>
            </div>
            <button
              onClick={() => setNewTierForm(!newTierForm)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Pridať tier
            </button>
          </div>

          {newTierForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Nový tier</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kód (napr. diamond)</label>
                  <input
                    type="text"
                    value={newTier.name}
                    onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="diamond"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Názov pre zákazníka</label>
                  <input
                    type="text"
                    value={newTier.label}
                    onChange={(e) => setNewTier({ ...newTier, label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Diamantový"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min. útrata (€)</label>
                  <input
                    type="number"
                    value={newTier.min_spend}
                    onChange={(e) => setNewTier({ ...newTier, min_spend: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Zľava (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTier.discount_percentage}
                    onChange={(e) => setNewTier({ ...newTier, discount_percentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Násobiteľ bodov</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={newTier.points_multiplier}
                    onChange={(e) => setNewTier({ ...newTier, points_multiplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Farba</label>
                  <input
                    type="color"
                    value={newTier.color}
                    onChange={(e) => setNewTier({ ...newTier, color: e.target.value })}
                    className="w-full h-[38px] border border-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={createTier} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Vytvoriť</button>
                <button onClick={() => setNewTierForm(false)} className="px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">Zrušiť</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {vipTiers.map((tier) => (
              <div key={tier.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tier.color }} />
                <div className="flex-1 grid grid-cols-5 gap-3 items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Úroveň</p>
                    <input
                      type="text"
                      value={tier.label}
                      onChange={(e) => setVipTiers(vipTiers.map((t) => t.id === tier.id ? { ...t, label: e.target.value } : t))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Min. útrata €</p>
                    <input
                      type="number"
                      value={tier.min_spend}
                      onChange={(e) => setVipTiers(vipTiers.map((t) => t.id === tier.id ? { ...t, min_spend: parseFloat(e.target.value) || 0 } : t))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Zľava %</p>
                    <input
                      type="number"
                      step="0.1"
                      value={tier.discount_percentage}
                      onChange={(e) => setVipTiers(vipTiers.map((t) => t.id === tier.id ? { ...t, discount_percentage: parseFloat(e.target.value) || 0 } : t))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Násobiteľ</p>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={tier.points_multiplier}
                      onChange={(e) => setVipTiers(vipTiers.map((t) => t.id === tier.id ? { ...t, points_multiplier: parseFloat(e.target.value) || 1 } : t))}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Farba</p>
                    <input
                      type="color"
                      value={tier.color}
                      onChange={(e) => setVipTiers(vipTiers.map((t) => t.id === tier.id ? { ...t, color: e.target.value } : t))}
                      className="w-full h-[34px] border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => saveTier(tier)}
                    disabled={savingTier === tier.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Uložiť"
                  >
                    {savingTier === tier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  {tier.name !== 'standard' && (
                    <button
                      onClick={() => deleteTier(tier.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Odstrániť"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {referralReward && (
          <div className="bg-white border border-gray-200/80 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Referral odmeny</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Body pre odporúčateľa</label>
                <input
                  type="number"
                  min="0"
                  value={referralReward.referrer_points}
                  onChange={(e) => setReferralReward({ ...referralReward, referrer_points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Zľava pre nového zákazníka (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={referralReward.referee_discount_percentage}
                  onChange={(e) => setReferralReward({ ...referralReward, referee_discount_percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Min. suma prvého nákupu (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={referralReward.min_order_amount}
                  onChange={(e) => setReferralReward({ ...referralReward, min_order_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={saveReferralReward}
              disabled={savingReferral}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm shadow-blue-500/20"
            >
              {savingReferral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Uložiť nastavenia
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
