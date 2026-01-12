import React, { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    shopName: 'HDmobil',
    shopEmail: 'info@hdmobil.sk',
    shopPhone: '+421 2 1234 5678',
    shopAddress: 'Ulica 123, 811 01 Bratislava',
    companyName: 'HDmobil s.r.o.',
    ico: '12345678',
    dic: 'SK12345678',
    icDph: 'SK12345678',
    freeShippingThreshold: '50',
    defaultVatRate: '20',
    currency: 'EUR',
    language: 'sk',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Nastavení obchodu</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✓ Nastavení bylo úspěšně uloženo
          </div>
        )}

        {/* Shop Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Informace o obchodu</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Název obchodu</label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => handleChange('shopName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.shopEmail}
                  onChange={(e) => handleChange('shopEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={settings.shopPhone}
                  onChange={(e) => handleChange('shopPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresa</label>
                <input
                  type="text"
                  value={settings.shopAddress}
                  onChange={(e) => handleChange('shopAddress', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Údaje společnosti</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Název společnosti</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IČO</label>
                <input
                  type="text"
                  value={settings.ico}
                  onChange={(e) => handleChange('ico', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DIČ</label>
                <input
                  type="text"
                  value={settings.dic}
                  onChange={(e) => handleChange('dic', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IČ DPH</label>
                <input
                  type="text"
                  value={settings.icDph}
                  onChange={(e) => handleChange('icDph', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shop Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Nastavení obchodu</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bezplatná doprava od (EUR)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Výchozí DPH (%)</label>
                <input
                  type="number"
                  value={settings.defaultVatRate}
                  onChange={(e) => handleChange('defaultVatRate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Měna</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="CZK">CZK (Kč)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jazyk</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sk">Slovenčina</option>
                <option value="cs">Čeština</option>
                <option value="en">Angličtina</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Způsoby platby</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">+ Přidat</button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Kreditní karta', enabled: true },
              { name: 'Bankovní převod', enabled: true },
              { name: 'Dobírka', enabled: false },
              { name: 'Apple Pay', enabled: true },
            ].map((method, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-gray-900 font-medium">{method.name}</span>
                <input type="checkbox" checked={method.enabled} readOnly className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Způsoby dopravy</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">+ Přidat</button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'DPD kuriér', price: 4.99, enabled: true },
              { name: 'Packeta Z-Box', price: 2.49, enabled: true },
              { name: 'Osobní odběr', price: 0, enabled: true },
              { name: 'Slovenská pošta', price: 3.49, enabled: false },
            ].map((method, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <span className="text-gray-900 font-medium">{method.name}</span>
                  <span className="text-gray-600 text-sm ml-4">{method.price} EUR</span>
                </div>
                <input type="checkbox" checked={method.enabled} readOnly className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            Zrušit
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Uložit nastavení
          </button>
        </div>
      </main>
    </div>
  );
}
