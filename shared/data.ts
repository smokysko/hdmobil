export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  description: string;
  specs: Record<string, string>;
}

export const categories = [
  { id: "all", name: "Všetky produkty" },
  { id: "smartphones", name: "Smartfóny" },
  { id: "tablets", name: "Tablety" },
  { id: "laptops", name: "Notebooky" },
  { id: "audio", name: "Audio" },
  { id: "accessories", name: "Príslušenstvo" },
  { id: "spare-parts", name: "Náhradné diely" },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Xenon Pro Max",
    price: 1299,
    rating: 4.9,
    reviews: 128,
    image: "/images/products/smartphone_pro_max.png",
    category: "smartphones",
    isNew: true,
    description: "Ultimátny zážitok s OLED displejom od okraja po okraj a profesionálnym trojitým kamerovým systémom.",
    specs: {
      Displej: "6.7-palcový Super Retina XDR",
      Procesor: "A16 Bionic",
      Úložisko: "256GB / 512GB / 1TB",
      Fotoaparát: "48MP Hlavný, 12MP Ultraširoký, 12MP Teleobjektív"
    }
  },
  {
    id: 2,
    name: "Nebula Fold Z",
    price: 1799,
    rating: 4.7,
    reviews: 85,
    image: "/images/products/smartphone_fold.png",
    category: "smartphones",
    isNew: true,
    description: "Otvorte budúcnosť s revolučným ohybným displejom, ktorý sa v sekunde zmení z telefónu na tablet.",
    specs: {
      Displej: "7.6-palcový Skladací Dynamic AMOLED",
      Procesor: "Snapdragon 8 Gen 2",
      Úložisko: "512GB",
      Batéria: "4400mAh"
    }
  },
  {
    id: 3,
    name: "Horizon Lite",
    price: 699,
    rating: 4.5,
    reviews: 342,
    image: "/images/products/smartphone_lite.png",
    category: "smartphones",
    isSale: true,
    salePrice: 599,
    description: "Prémiové funkcie za dostupnú cenu. Dokonalá rovnováha medzi výkonom a štýlom.",
    specs: {
      Displej: "6.4-palcový AMOLED",
      Procesor: "Osemjadrový 2.4GHz",
      Úložisko: "128GB",
      Fotoaparát: "64MP Duálny systém"
    }
  },
  {
    id: 4,
    name: "EcoSmart Budget",
    price: 299,
    rating: 4.2,
    reviews: 510,
    image: "/images/products/smartphone_budget.png",
    category: "smartphones",
    description: "Spoľahlivý, odolný a cenovo dostupný. Všetko, čo potrebujete v smartfóne, bez zbytočných výdavkov.",
    specs: {
      Displej: "6.1-palcový LCD",
      Procesor: "Šesťjadrový 2.0GHz",
      Úložisko: "64GB",
      Batéria: "5000mAh Celodenná výdrž"
    }
  },
  {
    id: 5,
    name: "Tab Ultra Pro",
    price: 1099,
    rating: 4.8,
    reviews: 92,
    image: "/images/products/tablet_pro.png",
    category: "tablets",
    isNew: true,
    description: "Vaša mobilná pracovná stanica. Masívne 12.9-palcové plátno pre kreativitu a produktivitu.",
    specs: {
      Displej: "12.9-palcový Liquid Retina XDR",
      Procesor: "M2 Čip",
      Úložisko: "256GB",
      Konektivita: "Wi-Fi 6E + 5G"
    }
  },
  {
    id: 6,
    name: "Zenith Ultrabook",
    price: 1499,
    rating: 4.8,
    reviews: 64,
    image: "/images/products/laptop.png",
    category: "laptops",
    description: "Ultra tenký, ultra výkonný. Perfektný notebook pre profesionálov na cestách.",
    specs: {
      Displej: "14-palcový 4K OLED",
      Procesor: "Intel Core i7 13. gen",
      RAM: "16GB LPDDR5",
      Úložisko: "1TB NVMe SSD"
    }
  },
  {
    id: 7,
    name: "Aura Wireless Headphones",
    price: 349,
    rating: 4.6,
    reviews: 215,
    image: "/images/products/headphones.png",
    category: "audio",
    description: "Ponorte sa do čistého zvuku s prvotriednym potlačením hluku a hi-fi audiom.",
    specs: {
      Typ: "Bezdrôtové cez uši",
      Batéria: "30 hodín",
      Funkcie: "Aktívne potlačenie hluku, Režim priepustnosti",
      Konektivita: "Bluetooth 5.3"
    }
  },
  {
    id: 8,
    name: "Sonic Buds Pro",
    price: 249,
    rating: 4.5,
    reviews: 430,
    image: "/images/products/wireless_earbuds.png",
    category: "audio",
    description: "Krištáľovo čistý zvuk v kompaktnom balení. Vodeodolné a ideálne na cvičenie.",
    specs: {
      Typ: "True Wireless do uší",
      Batéria: "24 hodín s puzdrom",
      Vodeodolnosť: "IPX4",
      Funkcie: "Priestorový zvuk"
    }
  },
  {
    id: 9,
    name: "Chronos Smartwatch",
    price: 399,
    rating: 4.7,
    reviews: 180,
    image: "/images/products/smartwatch.png",
    category: "accessories",
    description: "Sledujte svoju kondíciu, upozornenia a zdravie štýlovo s prémiovým titánovým telom.",
    specs: {
      Displej: "1.4-palcový AMOLED Always-On",
      Senzory: "Tep, SpO2, EKG",
      Vodeodolnosť: "5ATM",
      Batéria: "3 dni"
    }
  },
  {
    id: 10,
    name: "MagCharge Pad",
    price: 49,
    rating: 4.3,
    reviews: 120,
    image: "/images/products/charger_wireless.png",
    category: "accessories",
    description: "Rýchle bezdrôtové nabíjanie s elegantným minimalistickým dizajnom, ktorý sa hodí na každý stôl.",
    specs: {
      Výstup: "15W Rýchle nabíjanie",
      Kompatibilita: "Zariadenia s Qi",
      Materiál: "Matný čierny povrch",
      Funkcie: "LED indikátor"
    }
  },
  {
    id: 11,
    name: "PowerCore 20K",
    price: 79,
    rating: 4.8,
    reviews: 560,
    image: "/images/products/power_bank.png",
    category: "accessories",
    description: "Už nikdy bez energie. Obrovská kapacita v prenosnom hliníkovom tele.",
    specs: {
      Kapacita: "20,000mAh",
      Porty: "2x USB-C, 1x USB-A",
      Výstup: "65W PD Rýchle nabíjanie",
      Materiál: "Letecký hliník"
    }
  },
  {
    id: 12,
    name: "Crystal Shield Case",
    price: 39,
    rating: 4.4,
    reviews: 230,
    image: "/images/products/phone_case.png",
    category: "accessories",
    description: "Ochrana vojenskej triedy, ktorá nechá vyniknúť dizajn vášho telefónu.",
    specs: {
      Materiál: "TPU + Polykarbonát",
      Ochrana: "Testované na pád z 3m",
      Funkcie: "Technológia proti žltnutiu",
      Kompatibilita: "Xenon Pro Max"
    }
  },
  {
    id: 13,
    name: "Dension USB-C Cable",
    price: 29,
    rating: 4.6,
    reviews: 150,
    image: "/images/products/usb_cable.png",
    category: "accessories",
    description: "Odolný opletený nylonový kábel pre rýchle nabíjanie a prenos dát.",
    specs: {
      Dĺžka: "2 metre",
      Materiál: "Opletený nylon",
      Rýchlosť: "480Mbps Dáta",
      Výkon: "Podpora 100W PD"
    }
  },
  {
    id: 14,
    name: "Ultra-Thin Glass Protector",
    price: 19,
    rating: 4.5,
    reviews: 310,
    image: "/images/products/screen_protector.png",
    category: "accessories",
    description: "Neviditeľná ochrana pre váš displej. Tvrdosť 9H odoláva škrabancom a nárazom.",
    specs: {
      Materiál: "Tvrdené sklo",
      Tvrdosť: "9H",
      Hrúbka: "0.33mm",
      Funkcie: "Oleofóbna vrstva"
    }
  },
  {
    id: 15,
    name: "iPhone 13 Náhradný Displej",
    price: 89,
    rating: 4.7,
    reviews: 45,
    image: "/images/products/screen_protector.png", // Using placeholder for now
    category: "spare-parts",
    description: "Vysokokvalitný náhradný OLED displej pre iPhone 13. Obsahuje digitizér a rám.",
    specs: {
      Kompatibilita: "iPhone 13",
      Typ: "OLED",
      Záruka: "6 mesiacov",
      Obtiažnosť: "Stredná"
    }
  },
  {
    id: 16,
    name: "Samsung S21 Náhradná Batéria",
    price: 35,
    rating: 4.8,
    reviews: 120,
    image: "/images/products/power_bank.png", // Using placeholder for now
    category: "spare-parts",
    description: "Náhradná batéria s originálnou kapacitou pre Samsung Galaxy S21. Obnovte výdrž svojho telefónu.",
    specs: {
      Kompatibilita: "Samsung Galaxy S21",
      Kapacita: "4000mAh",
      Typ: "Li-Ion",
      Záruka: "12 mesiacov"
    }
  }
];
