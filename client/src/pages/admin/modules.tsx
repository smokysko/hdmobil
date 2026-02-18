import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  Settings,
  Check,
  X,
  ChevronRight,
  ExternalLink,
  Truck,
  ShoppingCart,
  Calculator,
  Rss,
  Package,
  MapPin,
  Copy,
} from 'lucide-react';

interface ModuleConfig {
  [key: string]: string;
}

interface ModuleSetting {
  id: string;
  module_id: string;
  is_enabled: boolean;
  config: ModuleConfig;
}

interface ModuleDef {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryColor: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  features: string[];
  docUrl: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'readonly';
    placeholder?: string;
    hint?: string;
  }[];
}

const MODULES: ModuleDef[] = [
  {
    id: 'heureka',
    name: 'Heureka.sk',
    description: 'Porovnávač cien – exportujte produktový XML feed a zbierajte hodnotenia cez Overené zákazníkmi.',
    category: 'Porovnávač cien',
    categoryColor: 'bg-orange-100 text-orange-700',
    icon: ShoppingCart,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    features: ['XML Feed produktov (Feed 2.0)', 'Overené zákazníkmi', 'Sledovanie konverzií'],
    docUrl: 'https://sluzby.heureka.sk/napoveda/xml-feed/',
    fields: [
      {
        key: 'store_url',
        label: 'URL e-shopu',
        type: 'url',
        placeholder: 'https://www.hdmobil.sk',
        hint: 'Základná URL adresa vášho e-shopu, použije sa na generovanie odkazov v XML feede.',
      },
      {
        key: 'feed_url',
        label: 'URL XML Feedu (pre Heureka)',
        type: 'readonly',
        hint: 'Túto adresu zadajte v administrácii Heureka.sk ako URL XML importu.',
      },
      {
        key: 'api_key',
        label: 'API kľúč – Overené zákazníkmi',
        type: 'password',
        placeholder: 'Váš Heureka API kľúč',
        hint: 'Nájdete ho v administrácii Heureka → Overené zákazníkmi → Nastavenia.',
      },
      {
        key: 'conversion_id',
        label: 'ID pre sledovanie konverzií',
        type: 'text',
        placeholder: 'napr. 1234567',
        hint: 'Voliteľné. Použite pre meranie konverzií z Heureka.',
      },
    ],
  },
  {
    id: 'packeta',
    name: 'Packeta (Zásilkovna)',
    description: 'Integrácia výdajných miest Packeta a automatické odosielanie zásielok cez API.',
    category: 'Doprava',
    categoryColor: 'bg-red-100 text-red-700',
    icon: Package,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    features: ['Widget výdajných miest', 'Automatické odoslanie cez API', 'Sledovanie zásielok'],
    docUrl: 'https://docs.packeta.com/',
    fields: [
      {
        key: 'api_key',
        label: 'API kľúč',
        type: 'password',
        placeholder: 'Váš Packeta API kľúč',
        hint: 'Nájdete v Packeta klientskej zóne → Nastavenia → API kľúč.',
      },
      {
        key: 'sender_name',
        label: 'Meno odosielateľa',
        type: 'text',
        placeholder: 'HDmobil s.r.o.',
      },
      {
        key: 'sender_street',
        label: 'Ulica odosielateľa',
        type: 'text',
        placeholder: 'Hlavná 123',
      },
      {
        key: 'sender_city',
        label: 'Mesto odosielateľa',
        type: 'text',
        placeholder: 'Bratislava',
      },
      {
        key: 'sender_zip',
        label: 'PSČ odosielateľa',
        type: 'text',
        placeholder: '811 01',
      },
    ],
  },
  {
    id: 'dpd',
    name: 'DPD Slovakia',
    description: 'Priame napojenie na DPD Slovakia – generovanie štítkov a sledovanie zásielok.',
    category: 'Doprava',
    categoryColor: 'bg-red-100 text-red-700',
    icon: Truck,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    features: ['Generovanie prepravných štítkov', 'Sledovanie zásielok (T&T)', 'Automatická notifikácia zákazníka'],
    docUrl: 'https://www.dpd.com/sk/en/developers/',
    fields: [
      {
        key: 'username',
        label: 'Používateľské meno (WebService)',
        type: 'text',
        placeholder: 'DPD WebService login',
        hint: 'Prihlasovacie údaje pre DPD WebService. Kontaktujte DPD obchodné oddelenie.',
      },
      {
        key: 'password',
        label: 'Heslo (WebService)',
        type: 'password',
        placeholder: 'DPD WebService heslo',
      },
      {
        key: 'depot_code',
        label: 'Kód depa',
        type: 'text',
        placeholder: 'napr. SK-BA',
        hint: 'Kód vášho zberného depa. Poskytne vám DPD obchodný zástupca.',
      },
    ],
  },
  {
    id: 'posta',
    name: 'Slovenská pošta',
    description: 'Napojenie na Web ePH API – elektronické podacie hárky a Track & Trace.',
    category: 'Doprava',
    categoryColor: 'bg-red-100 text-red-700',
    icon: MapPin,
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    features: ['Web ePH API (podacie hárky)', 'Track & Trace API', 'BalíkoBOX & Balík na poštu'],
    docUrl: 'https://www.posta.sk/informacie/api-dokumentacia',
    fields: [
      {
        key: 'user_id',
        label: 'User ID (ePH API)',
        type: 'text',
        placeholder: 'Váš userId z portálu eph.posta.sk',
        hint: 'Aktivujte Web ePH API na eph.posta.sk → Viac / Notifikácie a API / WebEPH API.',
      },
      {
        key: 'api_key',
        label: 'API kľúč (ePH API)',
        type: 'password',
        placeholder: 'Váš apiKey z portálu eph.posta.sk',
      },
      {
        key: 'contract_number',
        label: 'Číslo zmluvy',
        type: 'text',
        placeholder: 'Číslo zmluvy so Slovenskou poštou',
        hint: 'Potrebné pre generovanie podacích hárkoch.',
      },
    ],
  },
  {
    id: 'sps',
    name: 'SPS Slovak Parcel Service',
    description: 'Integrácia WebShip systému – expedícia zásielok a výber odberných miest Balíkovo.',
    category: 'Doprava',
    categoryColor: 'bg-red-100 text-red-700',
    icon: Truck,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    features: ['WebShip API integrácia', 'Odberné miesta Balíkovo', 'Samoobslužné boxy 24/7'],
    docUrl: 'https://www.sps-sro.sk/zasielky/integracia-pre-e-shopy/',
    fields: [
      {
        key: 'username',
        label: 'Prihlasovací login (WebShip)',
        type: 'text',
        placeholder: 'WebShip login',
        hint: 'Prihlasovacie meno do WebShip systému SPS. Kontaktujte telesales@sps-sro.sk.',
      },
      {
        key: 'password',
        label: 'Heslo (WebShip)',
        type: 'password',
        placeholder: 'WebShip heslo',
      },
      {
        key: 'contact_id',
        label: 'ID kontaktu / zákazníka',
        type: 'text',
        placeholder: 'SPS zákaznícke číslo',
        hint: 'Vaše zákaznícke číslo SPS, ktoré uvediete pri podaní zásielok.',
      },
    ],
  },
  {
    id: 'mksoft',
    name: 'MkSOFT',
    description: 'Prepojenie s ekonomickým softvérom MkSOFT – import objednávok a synchronizácia skladu.',
    category: 'Účtovníctvo',
    categoryColor: 'bg-blue-100 text-blue-700',
    icon: Calculator,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    features: ['Import objednávok do MkSOFT', 'Synchronizácia skladových cien', 'Export faktúr'],
    docUrl: 'https://www.mksoft.sk/',
    fields: [
      {
        key: 'server_url',
        label: 'URL servera MkSOFT',
        type: 'url',
        placeholder: 'https://mksoft.vasafirma.sk/api',
        hint: 'Adresa MkSOFT servera s API rozhraním. Kontaktujte MkSOFT podporu: 051/77 22 111.',
      },
      {
        key: 'api_key',
        label: 'API kľúč',
        type: 'password',
        placeholder: 'MkSOFT API kľúč',
      },
      {
        key: 'database_name',
        label: 'Názov databázy',
        type: 'text',
        placeholder: 'napr. MKSQL_FIRMA',
        hint: 'Názov databázy v MkSOFT systéme. Nájdete v nastaveniach MkSOFT.',
      },
      {
        key: 'sync_interval',
        label: 'Interval synchronizácie (minúty)',
        type: 'text',
        placeholder: '30',
        hint: 'Ako často sa majú synchronizovať objednávky (v minútach).',
      },
    ],
  },
];

export default function AdminModules() {
  const [settings, setSettings] = useState<Record<string, ModuleSetting>>({});
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<ModuleDef | null>(null);
  const [editConfig, setEditConfig] = useState<ModuleConfig>({});
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase.from('module_settings').select('*');
    if (data) {
      const map: Record<string, ModuleSetting> = {};
      data.forEach((row: ModuleSetting) => {
        map[row.module_id] = row;
      });
      setSettings(map);
    }
    setLoading(false);
  }

  async function toggleModule(moduleId: string, currentEnabled: boolean) {
    setToggling(moduleId);
    const existing = settings[moduleId];
    if (existing) {
      const { error } = await supabase
        .from('module_settings')
        .update({ is_enabled: !currentEnabled })
        .eq('module_id', moduleId);
      if (!error) {
        setSettings((prev) => ({
          ...prev,
          [moduleId]: { ...prev[moduleId], is_enabled: !currentEnabled },
        }));
        toast.success(!currentEnabled ? 'Modul aktivovaný' : 'Modul deaktivovaný');
      }
    } else {
      const { data, error } = await supabase
        .from('module_settings')
        .insert({ module_id: moduleId, is_enabled: true, config: {} })
        .select()
        .single();
      if (!error && data) {
        setSettings((prev) => ({ ...prev, [moduleId]: data }));
        toast.success('Modul aktivovaný');
      }
    }
    setToggling(null);
  }

  function openSettings(mod: ModuleDef) {
    setSelectedModule(mod);
    const existing = settings[mod.id];
    setEditConfig(existing?.config || {});
  }

  async function saveSettings() {
    if (!selectedModule) return;
    setSaving(true);
    const existing = settings[selectedModule.id];
    if (existing) {
      const { error } = await supabase
        .from('module_settings')
        .update({ config: editConfig })
        .eq('module_id', selectedModule.id);
      if (!error) {
        setSettings((prev) => ({
          ...prev,
          [selectedModule.id]: { ...prev[selectedModule.id], config: editConfig },
        }));
        toast.success('Nastavenia uložené');
        setSelectedModule(null);
      } else {
        toast.error('Chyba pri ukladaní');
      }
    } else {
      const { data, error } = await supabase
        .from('module_settings')
        .insert({ module_id: selectedModule.id, is_enabled: false, config: editConfig })
        .select()
        .single();
      if (!error && data) {
        setSettings((prev) => ({ ...prev, [selectedModule.id]: data }));
        toast.success('Nastavenia uložené');
        setSelectedModule(null);
      } else {
        toast.error('Chyba pri ukladaní');
      }
    }
    setSaving(false);
  }

  const feedUrl = `${supabaseUrl}/functions/v1/heureka-feed`;

  const activeCount = MODULES.filter((m) => settings[m.id]?.is_enabled).length;
  const configuredCount = MODULES.filter(
    (m) => settings[m.id] && Object.keys(settings[m.id].config || {}).length > 0
  ).length;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Moduly & Integrácie</h2>
          <p className="text-gray-500 text-sm mt-1">
            Rozšírte funkcionalitu e-shopu prepojením s externými službami a dopravcami.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200/80 rounded-xl p-4">
            <p className="text-sm text-gray-500">Dostupné moduly</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{MODULES.length}</p>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl p-4">
            <p className="text-sm text-gray-500">Aktívne</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">{loading ? '–' : activeCount}</p>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-xl p-4">
            <p className="text-sm text-gray-500">Nakonfigurované</p>
            <p className="text-2xl font-semibold text-blue-600 mt-1">{loading ? '–' : configuredCount}</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Porovnávač cien</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 mb-8">
          {MODULES.filter((m) => m.category === 'Porovnávač cien').map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              setting={settings[mod.id]}
              toggling={toggling === mod.id}
              loading={loading}
              onToggle={() => toggleModule(mod.id, settings[mod.id]?.is_enabled ?? false)}
              onSettings={() => openSettings(mod)}
            />
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dopravcovia</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {MODULES.filter((m) => m.category === 'Doprava').map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              setting={settings[mod.id]}
              toggling={toggling === mod.id}
              loading={loading}
              onToggle={() => toggleModule(mod.id, settings[mod.id]?.is_enabled ?? false)}
              onSettings={() => openSettings(mod)}
            />
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Účtovníctvo & ERP</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {MODULES.filter((m) => m.category === 'Účtovníctvo').map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              setting={settings[mod.id]}
              toggling={toggling === mod.id}
              loading={loading}
              onToggle={() => toggleModule(mod.id, settings[mod.id]?.is_enabled ?? false)}
              onSettings={() => openSettings(mod)}
            />
          ))}
        </div>
      </div>

      {selectedModule && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedModule(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedModule.iconBg}`}>
                  <selectedModule.icon className={`w-5 h-5 ${selectedModule.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedModule.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedModule.categoryColor}`}>
                    {selectedModule.category}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedModule(null)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Funkcie modulu</h4>
                <ul className="space-y-1.5">
                  {selectedModule.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Konfigurácia</h4>
                <div className="space-y-4">
                  {selectedModule.fields.map((field) => {
                    const isReadonly = field.type === 'readonly';
                    const value = field.key === 'feed_url' ? feedUrl : (editConfig[field.key] || '');
                    return (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                        {isReadonly ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono break-all">
                              {value || feedUrl}
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(value || feedUrl);
                                toast.success('Skopírované');
                              }}
                              className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            value={editConfig[field.key] || ''}
                            onChange={(e) => setEditConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                          />
                        )}
                        {field.hint && <p className="mt-1.5 text-xs text-gray-400">{field.hint}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <a
                  href={selectedModule.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Zobraziť dokumentáciu
                </a>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedModule(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-lg shadow-blue-500/20"
              >
                {saving ? 'Ukladám...' : 'Uložiť nastavenia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function ModuleCard({
  mod,
  setting,
  toggling,
  loading,
  onToggle,
  onSettings,
}: {
  mod: ModuleDef;
  setting?: ModuleSetting;
  toggling: boolean;
  loading: boolean;
  onToggle: () => void;
  onSettings: () => void;
}) {
  const isEnabled = setting?.is_enabled ?? false;
  const isConfigured = setting && Object.keys(setting.config || {}).length > 0;
  const Icon = mod.icon;

  return (
    <div
      className={`bg-white border rounded-xl p-5 transition-all ${
        isEnabled ? 'border-blue-200 shadow-sm shadow-blue-50' : 'border-gray-200/80'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mod.iconBg}`}>
          <Icon className={`w-6 h-6 ${mod.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{mod.name}</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mod.categoryColor}`}>
              {mod.category}
            </span>
            {!loading && isEnabled && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Aktívny
              </span>
            )}
            {!loading && !isEnabled && isConfigured && (
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                Nakonfigurovaný
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-3">{mod.description}</p>
          <div className="flex flex-wrap gap-2">
            {mod.features.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                <Check className="w-3 h-3 text-gray-400" />
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSettings}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Nastavenia"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onToggle}
            disabled={toggling || loading}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <button
            onClick={onSettings}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Konfigurovať
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
