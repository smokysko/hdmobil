import { supabase } from './supabase';

export interface ShopSettings {
  shopName: string;
  email: string;
  phone: string;
  address: string;
  companyName: string;
  ico: string;
  dic: string;
  icDph: string;
  freeShippingThreshold: number;
  defaultVatRate: number;
  currency: string;
  language: string;
}

const DEFAULTS: ShopSettings = {
  shopName: 'HDmobil',
  email: 'info@hdmobil.sk',
  phone: '+421 900 000 000',
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

export async function loadSettings(): Promise<ShopSettings> {
  const { data, error } = await supabase.from('settings').select('key, value');

  if (error || !data) return DEFAULTS;

  const map: Record<string, unknown> = {};
  for (const row of data) {
    map[row.key] = row.value;
  }

  const addr = map['shop_address'] as { street?: string; city?: string; zip?: string } | null;
  const addressStr = addr ? [addr.street, addr.city, addr.zip].filter(Boolean).join(', ') : '';

  const company = map['company_info'] as { name?: string; ico?: string; dic?: string; ic_dph?: string } | null;

  return {
    shopName: (map['shop_name'] as string) ?? DEFAULTS.shopName,
    email: (map['shop_email'] as string) ?? DEFAULTS.email,
    phone: (map['shop_phone'] as string) ?? DEFAULTS.phone,
    address: addressStr,
    companyName: company?.name ?? DEFAULTS.companyName,
    ico: company?.ico ?? DEFAULTS.ico,
    dic: company?.dic ?? DEFAULTS.dic,
    icDph: company?.ic_dph ?? DEFAULTS.icDph,
    freeShippingThreshold: (map['free_shipping_threshold'] as number) ?? DEFAULTS.freeShippingThreshold,
    defaultVatRate: (map['default_vat_rate'] as number) ?? DEFAULTS.defaultVatRate,
    currency: (map['currency'] as string) ?? DEFAULTS.currency,
    language: (map['language'] as string) ?? DEFAULTS.language,
  };
}

export async function saveSettings(s: ShopSettings): Promise<void> {
  const parts = s.address.split(',').map((p) => p.trim());

  const rows = [
    { key: 'shop_name', value: s.shopName },
    { key: 'shop_email', value: s.email },
    { key: 'shop_phone', value: s.phone },
    {
      key: 'shop_address',
      value: {
        street: parts[0] ?? '',
        city: parts[1] ?? '',
        zip: parts[2] ?? '',
        country: 'SK',
      },
    },
    {
      key: 'company_info',
      value: {
        name: s.companyName,
        ico: s.ico,
        dic: s.dic,
        ic_dph: s.icDph,
      },
    },
    { key: 'free_shipping_threshold', value: s.freeShippingThreshold },
    { key: 'default_vat_rate', value: s.defaultVatRate },
    { key: 'currency', value: s.currency },
    { key: 'language', value: s.language },
  ];

  for (const row of rows) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: row.key, value: row.value }, { onConflict: 'key' });

    if (error) throw error;
  }
}
