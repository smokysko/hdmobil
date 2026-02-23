import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { loadSettings, saveSettings, type ShopSettings } from '../../lib/settings';

const EMPTY: ShopSettings = {
  shopName: '',
  email: '',
  phone: '',
  address: '',
  companyName: '',
  ico: '',
  dic: '',
  icDph: '',
  freeShippingThreshold: 50,
  defaultVatRate: 20,
  currency: 'EUR',
  language: 'sk',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<ShopSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<ShopSettings>) => setSettings((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      toast.success('Nastavenia boli úspešne uložené');
    } catch {
      toast.error('Nepodarilo sa uložiť nastavenia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200/80 p-6 mb-6 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                    <div className="h-10 bg-gray-100 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  const inputCls =
    'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:opacity-50';

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Nastavenia obchodu</h2>
          <p className="text-gray-500 text-sm mt-1">Upravte základné informácie a nastavenia vášho obchodu</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informácie o obchode</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Názov obchodu</label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => set({ shopName: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => set({ email: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefón</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => set({ phone: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresa (ulica, mesto, PSČ)</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => set({ address: e.target.value })}
                placeholder="Hlavná 123, Bratislava, 811 01"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Údaje spoločnosti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Názov spoločnosti</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => set({ companyName: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IČO</label>
              <input
                type="text"
                value={settings.ico}
                onChange={(e) => set({ ico: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DIČ</label>
              <input
                type="text"
                value={settings.dic}
                onChange={(e) => set({ dic: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IČ DPH</label>
              <input
                type="text"
                value={settings.icDph}
                onChange={(e) => set({ icDph: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nastavenia predaja</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doprava zdarma od (EUR)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => set({ freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Predvolená DPH (%)</label>
              <input
                type="number"
                value={settings.defaultVatRate}
                onChange={(e) => set({ defaultVatRate: parseFloat(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mena</label>
              <select
                value={settings.currency}
                onChange={(e) => set({ currency: e.target.value })}
                className={inputCls}
              >
                <option value="EUR">EUR (€)</option>
                <option value="CZK">CZK (Kč)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jazyk</label>
              <select
                value={settings.language}
                onChange={(e) => set({ language: e.target.value })}
                className={inputCls}
              >
                <option value="sk">Slovenčina</option>
                <option value="cs">Čeština</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Ukladám...' : 'Uložiť nastavenia'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
