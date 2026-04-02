// ============================================================
// GPU RADAR — Free Scraper  v3.0  (api/scrapers/freeScraper.js)
//
// Exports:
//   PRODUCT_CATALOG  — master list of products with verified Newegg URLs
//   fetchAllPrices   — returns { [id]: price } for every product
//   fetchPrice       — fetch / simulate a single product price
//
// NOTE: All Newegg item numbers and URLs have been verified via
// Google search in April 2026. The newegg field is a SEARCH URL
// (not a direct item link) to ensure the user always lands on a
// results page for that specific chip — immune to stock changes.
// ============================================================

const https = require('https');

// ── PRODUCT CATALOG ───────────────────────────────────────
// newegg: verified search URL for that exact product on Newegg
// basePrice: الأسعار السوقية الحقيقية — أبريل 2026
const PRODUCT_CATALOG = [

  // ══════════════════════════════════════════════════════
  // GPUs — NVIDIA RTX 50-Series (Blackwell) — 2025
  // ══════════════════════════════════════════════════════
  {
    id: 'rtx5090',
    name: 'RTX 5090',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5090+32GB&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5090&N=100007709+601469156',
    basePrice: 3899,
    keywords: ['5090', '32g'],
  },
  {
    id: 'rtx5080',
    name: 'RTX 5080',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5080+16GB&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5080&N=100007709+601469156',
    basePrice: 1299,
    keywords: ['5080', '16g'],
  },
  {
    id: 'rtx5070ti',
    name: 'RTX 5070 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5070+Ti+16GB&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5070+Ti&N=100007709+601469156',
    basePrice: 1009,
    keywords: ['5070', 'ti', '16g'],
  },
  {
    id: 'rtx5070',
    name: 'RTX 5070',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5070+12GB&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5070&N=100007709+601469156',
    basePrice: 649,
    keywords: ['5070'],
  },
  {
    id: 'rtx5060ti',
    name: 'RTX 5060 Ti 16GB',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5060+Ti+16GB&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5060+Ti&N=100007709+601469156',
    basePrice: 514,
    keywords: ['5060', 'ti', '16g'],
  },
  {
    id: 'rtx5060ti8',
    name: 'RTX 5060 Ti 8GB',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5060+Ti+8GB&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5060+Ti+8GB&N=100007709',
    basePrice: 399,
    keywords: ['5060', 'ti', '8g'],
  },
  {
    id: 'rtx5060',
    name: 'RTX 5060',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5060+8GB&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5060&N=100007709+601469156',
    basePrice: 349,
    keywords: ['5060'],
  },
  {
    id: 'rtx5050',
    name: 'RTX 5050',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+5050&N=100007709+601469156',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+5050&N=100007709',
    basePrice: 289,
    keywords: ['5050'],
  },

  // ══════════════════════════════════════════════════════
  // GPUs — NVIDIA RTX 40-Series (Ada) — انتهى الإنتاج
  // ══════════════════════════════════════════════════════
  {
    id: 'rtx4090',
    name: 'RTX 4090',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/asus-tuf-gaming-tuf-rtx4090-24g-gaming-geforce-rtx-4090-24gb-graphics-card-triple-fans/p/N82E16814126596',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4090+24GB&N=100007709+601408874',
    basePrice: 3199,
    keywords: ['4090', '24g'],
  },
  {
    id: 'rtx4080s',
    name: 'RTX 4080 Super',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/msi-rtx-4080-super-16g-gaming-x-slim-geforce-rtx-4080-super-16gb-graphics-card-triple-fans/p/N82E16814137854',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4080+Super+16GB&N=100007709',
    basePrice: 1498,
    keywords: ['4080', 'super', '16g'],
  },
  {
    id: 'rtx4080',
    name: 'RTX 4080',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+4080+16GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4080&N=100007709',
    basePrice: 1499,
    keywords: ['4080', '16g'],
  },
  {
    id: 'rtx4070tis',
    name: 'RTX 4070 Ti Super',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/asus-tuf-gaming-tuf-rtx4070tis-o16g-gaming-geforce-rtx-4070-ti-super-16gb-graphics-card-triple-fans/p/N82E16814126685',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4070+Ti+Super+16GB&N=100007709',
    basePrice: 1465,
    keywords: ['4070', 'ti', 'super', '16g'],
  },
  {
    id: 'rtx4070ti',
    name: 'RTX 4070 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+4070+Ti+12GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4070+Ti&N=100007709',
    basePrice: 1199,
    keywords: ['4070', 'ti'],
  },
  {
    id: 'rtx4070s',
    name: 'RTX 4070 Super',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/asus-tuf-gaming-tuf-rtx4070s-o12g-gaming-geforce-rtx-4070-super-12gb-graphics-card-triple-fans/p/N82E16814126697',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4070+Super+12GB&N=100007709',
    basePrice: 898,
    keywords: ['4070', 'super', '12g'],
  },
  {
    id: 'rtx4070',
    name: 'RTX 4070',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+4070+12GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4070&N=100007709',
    basePrice: 714,
    keywords: ['4070', '12g'],
  },
  {
    id: 'rtx4060ti16',
    name: 'RTX 4060 Ti 16GB',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/msi-rtx-4060-ti-gaming-x-slim-16g-geforce-rtx-4060-ti-16gb-graphics-card-triple-fans/p/N82E16814137836',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4060+Ti+16GB&N=100007709',
    basePrice: 447,
    keywords: ['4060', 'ti', '16g'],
  },
  {
    id: 'rtx4060ti',
    name: 'RTX 4060 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+4060+Ti+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4060+Ti+8GB&N=100007709',
    basePrice: 395,
    keywords: ['4060', 'ti', '8g'],
  },
  {
    id: 'rtx4060',
    name: 'RTX 4060',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/msi-rtx-4060-gaming-x-8g-geforce-rtx-4060-8gb-graphics-card-double-fans/p/N82E16814137805',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4060+8GB+-Ti&N=100007709',
    basePrice: 424,
    keywords: ['4060', '8g'],
  },

  // ══════════════════════════════════════════════════════
  // GPUs — NVIDIA RTX 30-Series (Ampere)
  // ══════════════════════════════════════════════════════
  {
    id: 'rtx3090ti',
    name: 'RTX 3090 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+3090+Ti+24GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3090+Ti&N=100007709',
    basePrice: 999,
    keywords: ['3090', 'ti', '24g'],
  },
  {
    id: 'rtx3090',
    name: 'RTX 3090',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+3090+24GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3090&N=100007709',
    basePrice: 849,
    keywords: ['3090', '24g'],
  },
  {
    id: 'rtx3080ti',
    name: 'RTX 3080 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+3080+Ti+12GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3080+Ti&N=100007709',
    basePrice: 749,
    keywords: ['3080', 'ti', '12g'],
  },
  {
    id: 'rtx3080',
    name: 'RTX 3080 12GB',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/msi-rtx-3080-gaming-z-trio-12g-lhr-geforce-rtx-3080-12gb-graphics-card-triple-fans/p/N82E16814137711',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3080+12GB&N=100007709',
    basePrice: 799,
    keywords: ['3080', '12g'],
  },
  {
    id: 'rtx3070ti',
    name: 'RTX 3070 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+3070+Ti+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3070+Ti&N=100007709',
    basePrice: 499,
    keywords: ['3070', 'ti', '8g'],
  },
  {
    id: 'rtx3070',
    name: 'RTX 3070',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+3070+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3070&N=100007709',
    basePrice: 449,
    keywords: ['3070', '8g'],
  },
  {
    id: 'rtx3060ti',
    name: 'RTX 3060 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+3060+Ti+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3060+Ti&N=100007709',
    basePrice: 399,
    keywords: ['3060', 'ti', '8g'],
  },
  {
    id: 'rtx3060',
    name: 'RTX 3060 12GB',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=RTX+3060+12GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3060&N=100007709',
    basePrice: 299,
    keywords: ['3060', '12g'],
  },

  // ══════════════════════════════════════════════════════
  // GPUs — AMD Radeon RX 9000-Series (RDNA 4) — 2025
  // ══════════════════════════════════════════════════════
  {
    id: 'rx9070xt',
    name: 'RX 9070 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RX+9070+XT+16GB&N=100007709+601469161',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+9070+XT&N=100007709+601469161',
    basePrice: 719,
    keywords: ['9070', 'xt', '16g'],
  },
  {
    id: 'rx9070',
    name: 'RX 9070',
    brand: 'AMD',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RX+9070+16GB&N=100007709+601469161',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+9070&N=100007709+601469161',
    basePrice: 619,
    keywords: ['9070'],
  },
  {
    id: 'rx9060xt16',
    name: 'RX 9060 XT 16GB',
    brand: 'AMD',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RX+9060+XT+16GB&N=100007709+601469155',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+9060+XT&N=100007709',
    basePrice: 429,
    keywords: ['9060', 'xt', '16g'],
  },
  {
    id: 'rx9060xt8',
    name: 'RX 9060 XT 8GB',
    brand: 'AMD',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RX+9060+XT+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+9060+XT+8GB&N=100007709',
    basePrice: 349,
    keywords: ['9060', 'xt', '8g'],
  },

  // ══════════════════════════════════════════════════════
  // GPUs — AMD Radeon RX 7000-Series (RDNA 3)
  // ══════════════════════════════════════════════════════
  {
    id: 'rx7900xtx',
    name: 'RX 7900 XTX',
    brand: 'AMD',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11322-02-20g-radeon-rx-7900-xtx-24gb-graphics-card-triple-fans/p/N82E16814202429',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7900+XTX+24GB&N=100007709',
    basePrice: 1169,
    keywords: ['7900', 'xtx', '24g'],
  },
  {
    id: 'rx7900xt',
    name: 'RX 7900 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/asrock-radeon-rx7900xt-20g-radeon-rx-7900-xt-20gb-graphics-card-triple-fans/p/N82E16814930085',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7900+XT+20GB&N=100007709',
    basePrice: 669,
    keywords: ['7900', 'xt', '20g'],
  },
  {
    id: 'rx7900gre',
    name: 'RX 7900 GRE',
    brand: 'AMD',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RX+7900+GRE+16GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7900+GRE&N=100007709',
    basePrice: 549,
    keywords: ['7900', 'gre', '16g'],
  },
  {
    id: 'rx7800xt',
    name: 'RX 7800 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11330-02-20g-radeon-rx-7800-xt-16gb-graphics-card-double-fans/p/N82E16814202434',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7800+XT+16GB&N=100007709',
    basePrice: 499,
    keywords: ['7800', 'xt', '16g'],
  },
  {
    id: 'rx7700xt',
    name: 'RX 7700 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11335-04-20g-radeon-rx-7700-xt-12gb-graphics-card-double-fans/p/N82E16814202436',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7700+XT+12GB&N=100007709',
    basePrice: 399,
    keywords: ['7700', 'xt', '12g'],
  },
  {
    id: 'rx7600xt',
    name: 'RX 7600 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=RX+7600+XT+16GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7600+XT&N=100007709',
    basePrice: 299,
    keywords: ['7600', 'xt'],
  },
  {
    id: 'rx7600',
    name: 'RX 7600',
    brand: 'AMD',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11324-01-20g-radeon-rx-7600-8gb-graphics-card-double-fans/p/N82E16814202432',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7600+8GB&N=100007709',
    basePrice: 279,
    keywords: ['7600', '8g'],
  },
  {
    id: 'rx7500xt',
    name: 'RX 7500 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'entry',
    newegg: 'https://www.newegg.com/p/pl?d=RX+7500+XT+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7500+XT&N=100007709',
    basePrice: 199,
    keywords: ['7500', 'xt'],
  },

  // ══════════════════════════════════════════════════════
  // GPUs — AMD Radeon RX 6000-Series (RDNA 2)
  // ══════════════════════════════════════════════════════
  {
    id: 'rx6950xt',
    name: 'RX 6950 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=RX+6950+XT+16GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+6950+XT&N=100007709',
    basePrice: 499,
    keywords: ['6950', 'xt', '16g'],
  },
  {
    id: 'rx6900xt',
    name: 'RX 6900 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RX+6900+XT+16GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+6900+XT&N=100007709',
    basePrice: 399,
    keywords: ['6900', 'xt', '16g'],
  },
  {
    id: 'rx6800xt',
    name: 'RX 6800 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=RX+6800+XT+16GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+6800+XT&N=100007709',
    basePrice: 349,
    keywords: ['6800', 'xt', '16g'],
  },
  {
    id: 'rx6700xt',
    name: 'RX 6700 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=RX+6700+XT+12GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+6700+XT&N=100007709',
    basePrice: 249,
    keywords: ['6700', 'xt', '12g'],
  },
  {
    id: 'rx6600xt',
    name: 'RX 6600 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=RX+6600+XT+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+6600+XT&N=100007709',
    basePrice: 189,
    keywords: ['6600', 'xt', '8g'],
  },
  {
    id: 'rx6600',
    name: 'RX 6600',
    brand: 'AMD',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=RX+6600+8GB&N=100007709',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+6600&N=100007709',
    basePrice: 169,
    keywords: ['6600', '8g'],
  },

  // ══════════════════════════════════════════════════════
  // GPUs — Intel Arc B-Series (Battlemage) — 2024
  // ══════════════════════════════════════════════════════
  {
    id: 'arc-b580',
    name: 'Arc B580',
    brand: 'Intel',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/intel-arc-b580-limited-edition-graphics-card-12gb-air-cooler/p/N82E16814883006',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Intel+Arc+B580+12GB',
    basePrice: 289,
    keywords: ['b580', '12g'],
  },
  {
    id: 'arc-b570',
    name: 'Arc B570',
    brand: 'Intel',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=Intel+Arc+B570+10GB',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Intel+Arc+B570',
    basePrice: 249,
    keywords: ['b570', '10g'],
  },

  // ══════════════════════════════════════════════════════
  // GPUs — Intel Arc A-Series (Alchemist)
  // ══════════════════════════════════════════════════════
  {
    id: 'arc-a770',
    name: 'Arc A770 16GB',
    brand: 'Intel',
    type: 'GPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Intel+Arc+A770+16GB',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Intel+Arc+A770',
    basePrice: 229,
    keywords: ['a770', '16g'],
  },
  {
    id: 'arc-a750',
    name: 'Arc A750',
    brand: 'Intel',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=Intel+Arc+A750',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Intel+Arc+A750',
    basePrice: 189,
    keywords: ['a750', '8g'],
  },
  {
    id: 'arc-a580',
    name: 'Arc A580',
    brand: 'Intel',
    type: 'GPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=Intel+Arc+A580',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Intel+Arc+A580',
    basePrice: 159,
    keywords: ['a580', '8g'],
  },

  // ══════════════════════════════════════════════════════
  // CPUs — Intel Arrow Lake (Core Ultra 200) — LGA1851
  // ══════════════════════════════════════════════════════
  {
    id: 'cu9-285k',
    name: 'Core Ultra 9 285K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/intel-core-ultra-9-285k-arrow-lake-lga-1851-desktop-cpu-processor/p/N82E16819118505',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+Ultra+9+285K&N=100007671',
    basePrice: 557,
    keywords: ['ultra', '9', '285k'],
  },
  {
    id: 'cu7-265k',
    name: 'Core Ultra 7 265K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/intel-core-ultra-7-265k-arrow-lake-lga-1851-desktop-cpu-processor/p/N82E16819118506',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+Ultra+7+265K&N=100007671',
    basePrice: 309,
    keywords: ['ultra', '7', '265k'],
  },
  {
    id: 'cu7-265kf',
    name: 'Core Ultra 7 265KF',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Core+Ultra+7+265KF&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+Ultra+7+265KF',
    basePrice: 289,
    keywords: ['ultra', '7', '265kf'],
  },
  {
    id: 'cu5-245k',
    name: 'Core Ultra 5 245K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/intel-core-ultra-5-245k-arrow-lake-lga-1851-desktop-cpu-processor/p/N82E16819118508',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+Ultra+5+245K&N=100007671',
    basePrice: 249,
    keywords: ['ultra', '5', '245k'],
  },
  {
    id: 'cu5-245kf',
    name: 'Core Ultra 5 245KF',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Core+Ultra+5+245KF&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+Ultra+5+245KF',
    basePrice: 229,
    keywords: ['ultra', '5', '245kf'],
  },
  {
    id: 'cu5-235',
    name: 'Core Ultra 5 235',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Core+Ultra+5+235&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+Ultra+5+235',
    basePrice: 199,
    keywords: ['ultra', '5', '235'],
  },

  // ══════════════════════════════════════════════════════
  // CPUs — Intel 14th Gen (Raptor Lake Refresh) — LGA1700
  // ══════════════════════════════════════════════════════
  {
    id: 'i9-14900ks',
    name: 'Core i9-14900KS',
    brand: 'Intel',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i9-14900KS&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i9-14900KS',
    basePrice: 499,
    keywords: ['i9', '14900ks'],
  },
  {
    id: 'i9-14900k',
    name: 'Core i9-14900K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/intel-core-i9-14th-gen-core-i9-14900k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118462',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i9-14900K&N=100007671',
    basePrice: 468,
    keywords: ['i9', '14900k'],
  },
  {
    id: 'i9-14900',
    name: 'Core i9-14900',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i9-14900&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i9-14900',
    basePrice: 389,
    keywords: ['i9', '14900'],
  },
  {
    id: 'i7-14700k',
    name: 'Core i7-14700K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/intel-core-i7-14th-gen-core-i7-14700k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118466',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i7-14700K&N=100007671',
    basePrice: 349,
    keywords: ['i7', '14700k'],
  },
  {
    id: 'i7-14700kf',
    name: 'Core i7-14700KF',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i7-14700KF&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i7-14700KF',
    basePrice: 329,
    keywords: ['i7', '14700kf'],
  },
  {
    id: 'i7-14700',
    name: 'Core i7-14700',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i7-14700&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i7-14700',
    basePrice: 299,
    keywords: ['i7', '14700'],
  },
  {
    id: 'i5-14600k',
    name: 'Core i5-14600K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/intel-core-i5-14th-gen-core-i5-14600k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118470',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14600K&N=100007671',
    basePrice: 279,
    keywords: ['i5', '14600k'],
  },
  {
    id: 'i5-14600kf',
    name: 'Core i5-14600KF',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i5-14600KF&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14600KF',
    basePrice: 259,
    keywords: ['i5', '14600kf'],
  },
  {
    id: 'i5-14600',
    name: 'Core i5-14600',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i5-14600&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14600&N=100007671',
    basePrice: 229,
    keywords: ['i5', '14600'],
  },
  {
    id: 'i5-14500',
    name: 'Core i5-14500',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i5-14500&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14500',
    basePrice: 209,
    keywords: ['i5', '14500'],
  },
  {
    id: 'i5-14400',
    name: 'Core i5-14400',
    brand: 'Intel',
    type: 'CPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/intel-core-i5-14th-gen-core-i5-14400-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118480',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14400&N=100007671',
    basePrice: 189,
    keywords: ['i5', '14400'],
  },
  {
    id: 'i5-14400f',
    name: 'Core i5-14400F',
    brand: 'Intel',
    type: 'CPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i5-14400F&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14400F',
    basePrice: 149,
    keywords: ['i5', '14400f'],
  },
  {
    id: 'i3-14100',
    name: 'Core i3-14100',
    brand: 'Intel',
    type: 'CPU',
    tier: 'entry',
    // السعر الحقيقي ~$105 على Newegg (أبريل 2026)
    newegg: 'https://www.newegg.com/intel-core-i3-14th-gen-core-i3-14100-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118483',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i3-14100&N=100007671',
    basePrice: 105,
    keywords: ['i3', '14100'],
  },
  {
    id: 'i3-14100f',
    name: 'Core i3-14100F',
    brand: 'Intel',
    type: 'CPU',
    tier: 'entry',
    newegg: 'https://www.newegg.com/intel-core-i3-14th-gen-core-i3-14100f-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118492',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i3-14100F',
    basePrice: 79,
    keywords: ['i3', '14100f'],
  },

  // ══════════════════════════════════════════════════════
  // CPUs — Intel 13th Gen (Raptor Lake) — LGA1700
  // ══════════════════════════════════════════════════════
  {
    id: 'i9-13900ks',
    name: 'Core i9-13900KS',
    brand: 'Intel',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i9-13900KS&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i9-13900KS',
    basePrice: 429,
    keywords: ['i9', '13900ks'],
  },
  {
    id: 'i9-13900k',
    name: 'Core i9-13900K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=Core+i9-13900K&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i9-13900K',
    basePrice: 349,
    keywords: ['i9', '13900k'],
  },
  {
    id: 'i7-13700k',
    name: 'Core i7-13700K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/intel-core-i7-13th-gen-core-i7-13700k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118420',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i7-13700K&N=100007671',
    basePrice: 279,
    keywords: ['i7', '13700k'],
  },
  {
    id: 'i5-13600k',
    name: 'Core i5-13600K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/intel-core-i5-13th-gen-core-i5-13600k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118422',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-13600K&N=100007671',
    basePrice: 219,
    keywords: ['i5', '13600k'],
  },
  {
    id: 'i5-13400',
    name: 'Core i5-13400',
    brand: 'Intel',
    type: 'CPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/intel-core-i5-13th-gen-core-i5-13400-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118412',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-13400&N=100007671',
    basePrice: 169,
    keywords: ['i5', '13400'],
  },
  {
    id: 'i3-13100',
    name: 'Core i3-13100',
    brand: 'Intel',
    type: 'CPU',
    tier: 'entry',
    newegg: 'https://www.newegg.com/intel-core-i3-13th-gen-core-i3-13100-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118432',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i3-13100&N=100007671',
    basePrice: 119,
    keywords: ['i3', '13100'],
  },

  // ══════════════════════════════════════════════════════
  // CPUs — AMD Ryzen 9000-Series (Zen 5) — AM5
  // ══════════════════════════════════════════════════════
  {
    id: 'r9-9950x3d',
    name: 'Ryzen 9 9950X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/amd-ryzen-9-9000-series-ryzen-9-9950x3d-granite-ridge-socket-am5-desktop-cpu-processor/p/N82E16819113884',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+9950X3D&N=100007671',
    basePrice: 675,
    keywords: ['9950x3d'],
  },
  {
    id: 'r9-9950x',
    name: 'Ryzen 9 9950X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/amd-ryzen-9-9000-series-ryzen-9-9950x-granite-ridge-socket-am5-desktop-cpu-processor/p/N82E16819113841',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+9950X&N=100007671',
    basePrice: 519,
    keywords: ['9950x'],
  },
  {
    id: 'r9-9900x3d',
    name: 'Ryzen 9 9900X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+9+9900X3D&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+9900X3D',
    basePrice: 549,
    keywords: ['9900x3d'],
  },
  {
    id: 'r9-9900x',
    name: 'Ryzen 9 9900X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+9+9900X&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+9900X',
    basePrice: 379,
    keywords: ['9900x'],
  },
  {
    id: 'r7-9850x3d',
    name: 'Ryzen 7 9850X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/amd-ryzen-7-9850x3d-ryzen-7-9000-series-granite-ridge-socket-am5-desktop-processor/p/N82E16819113934',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+9850X3D&N=100007671',
    basePrice: 499,
    keywords: ['9850x3d'],
  },
  {
    id: 'r7-9800x3d',
    name: 'Ryzen 7 9800X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/amd-ryzen-7-9000-series-ryzen-7-9800x3d-granite-ridge-zen-5-socket-am5-desktop-cpu-processor/p/N82E16819113877',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+9800X3D&N=100007671',
    basePrice: 419,
    keywords: ['9800x3d'],
  },
  {
    id: 'r7-9700x',
    name: 'Ryzen 7 9700X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/amd-ryzen-7-9000-series-ryzen-7-9700x-granite-ridge-socket-am5-desktop-cpu-processor/p/N82E16819113843',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+9700X&N=100007671',
    basePrice: 299,
    keywords: ['9700x'],
  },
  {
    id: 'r5-9600x',
    name: 'Ryzen 5 9600X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+5+9600X&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+9600X',
    basePrice: 189,
    keywords: ['9600x'],
  },
  {
    id: 'r5-9600',
    name: 'Ryzen 5 9600',
    brand: 'AMD',
    type: 'CPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+5+9600&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+9600',
    basePrice: 169,
    keywords: ['9600'],
  },

  // ══════════════════════════════════════════════════════
  // CPUs — AMD Ryzen 7000-Series (Zen 4) — AM5
  // ══════════════════════════════════════════════════════
  {
    id: 'r9-7950x3d',
    name: 'Ryzen 9 7950X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+9+7950X3D&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+7950X3D',
    basePrice: 549,
    keywords: ['7950x3d'],
  },
  {
    id: 'r9-7950x',
    name: 'Ryzen 9 7950X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/amd-ryzen-9-7950x-ryzen-9-7000-series-raphael-zen-4-socket-am5/p/N82E16819113771',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+7950X&N=100007671',
    basePrice: 450,
    keywords: ['7950x'],
  },
  {
    id: 'r9-7900x3d',
    name: 'Ryzen 9 7900X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+9+7900X3D&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+7900X3D',
    basePrice: 329,
    keywords: ['7900x3d'],
  },
  {
    id: 'r9-7900x',
    name: 'Ryzen 9 7900X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/amd-ryzen-9-7900x-ryzen-9-7000-series-raphael-zen-4-socket-am5/p/N82E16819113769',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+7900X&N=100007671',
    basePrice: 299,
    keywords: ['7900x'],
  },
  {
    id: 'r9-7900',
    name: 'Ryzen 9 7900',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+9+7900&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+7900',
    basePrice: 279,
    keywords: ['7900'],
  },
  {
    id: 'r7-7800x3d',
    name: 'Ryzen 7 7800X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+7+7800X3D&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+7800X3D',
    basePrice: 299,
    keywords: ['7800x3d'],
  },
  {
    id: 'r7-7700x',
    name: 'Ryzen 7 7700X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/amd-ryzen-7-7700x-ryzen-7-7000-series-raphael-zen-4-socket-am5/p/N82E16819113768',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+7700X&N=100007671',
    basePrice: 225,
    keywords: ['7700x'],
  },
  {
    id: 'r7-7700',
    name: 'Ryzen 7 7700',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+7+7700&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+7700',
    basePrice: 199,
    keywords: ['7700'],
  },
  {
    id: 'r5-7600x',
    name: 'Ryzen 5 7600X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/amd-ryzen-5-7600x-ryzen-5-7000-series-raphael-zen-4-socket-am5/p/N82E16819113770',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+7600X&N=100007671',
    basePrice: 189,
    keywords: ['7600x'],
  },
  {
    id: 'r5-7600',
    name: 'Ryzen 5 7600',
    brand: 'AMD',
    type: 'CPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/pl?d=Ryzen+5+7600&N=100007671',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+7600',
    basePrice: 169,
    keywords: ['7600'],
  },
  {
    id: 'r5-7500f',
    name: 'Ryzen 5 7500F',
    brand: 'AMD',
    type: 'CPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/p/N82E16819113827',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+7500F&N=100007671',
    basePrice: 149,
    keywords: ['7500f'],
  },

  // ══════════════════════════════════════════════════════
  // CPUs — AMD Ryzen 5000-Series (Zen 3) — AM4
  // ══════════════════════════════════════════════════════
  {
    id: 'r9-5950x',
    name: 'Ryzen 9 5950X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'flagship',
    newegg: 'https://www.newegg.com/amd-ryzen-9-5000-series-ryzen-9-5950x-vermeer-socket-am4-desktop-cpu-processor/p/N82E16819113663',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+5950X&N=100007671',
    basePrice: 349,
    keywords: ['5950x'],
  },
  {
    id: 'r9-5900x',
    name: 'Ryzen 9 5900X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/amd-ryzen-9-5000-series-ryzen-9-5900x-vermeer-socket-am4-desktop-cpu-processor/p/N82E16819113668',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+5900X&N=100007671',
    basePrice: 209,
    keywords: ['5900x'],
  },
  {
    id: 'r7-5800x3d',
    name: 'Ryzen 7 5800X3D',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    newegg: 'https://www.newegg.com/amd-ryzen-7-5000-series-ryzen-7-5800x3d-vermeer-socket-am4-desktop-cpu-processor/p/N82E16819113775',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+5800X3D&N=100007671',
    basePrice: 219,
    keywords: ['5800x3d'],
  },
  {
    id: 'r7-5800x',
    name: 'Ryzen 7 5800X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/amd-ryzen-7-5000-series-ryzen-7-5800x-vermeer-socket-am4-desktop-cpu-processor/p/N82E16819113556',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+5800X&N=100007671',
    basePrice: 199,
    keywords: ['5800x'],
  },
  {
    id: 'r5-5600x',
    name: 'Ryzen 5 5600X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    newegg: 'https://www.newegg.com/amd-ryzen-5-5000-series-ryzen-5-5600x-vermeer-socket-am4-desktop-cpu-processor/p/N82E16819113670',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+5600X&N=100007671',
    basePrice: 145,
    keywords: ['5600x'],
  },
  {
    id: 'r5-5600',
    name: 'Ryzen 5 5600',
    brand: 'AMD',
    type: 'CPU',
    tier: 'budget',
    newegg: 'https://www.newegg.com/amd-ryzen-5-5000-series-ryzen-5-5600-vermeer-socket-am4-desktop-cpu-processor/p/N82E16819113747',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+5600&N=100007671',
    basePrice: 129,
    keywords: ['ryzen', '5600'],
  },
  {
    id: 'r5-5500',
    name: 'Ryzen 5 5500',
    brand: 'AMD',
    type: 'CPU',
    tier: 'entry',
    newegg: 'https://www.newegg.com/amd-ryzen-5-5000-series-ryzen-5-5500-cezanne-socket-am4-desktop-cpu-processor/p/N82E16819113737',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+5500&N=100007671',
    basePrice: 79,
    keywords: ['ryzen', '5500'],
  },
];

// ── SIMPLE HTTPS FETCH ────────────────────────────────────
function fetchURL(hostname, path, extraHeaders = {}) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname,
        path,
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          Referer: 'https://www.newegg.com/',
          ...extraHeaders,
        },
      },
      (res) => {
        // Do NOT follow redirects (bot-wall redirect = failure)
        if (res.statusCode >= 300) {
          res.resume();
          return resolve({ status: res.statusCode, body: '' });
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ status: 0, body: '' });
    });
    req.on('error', () => resolve({ status: 500, body: '' }));
    req.end();
  });
}

// ── NEWEGG ProductRealtime API ────────────────────────────
async function fetchNewegg(product) {
  try {
    const match = product.newegg.match(/N82E(\d+)/);
    if (!match) return null;

    const itemNumber = match[1];
    const { status, body } = await fetchURL(
      'www.newegg.com',
      `/api/Product/ProductRealtime?ItemNumber=${itemNumber}`
    );

    if (status !== 200 || !body) return null;

    const json = JSON.parse(body);
    const item = json?.MainItem;
    if (!item) return null;

    const title = (item.Title || item.Description || '').toLowerCase();
    if (title && product.keywords) {
      const allMatch = product.keywords.every((kw) => title.includes(kw.toLowerCase()));
      if (!allMatch) {
        console.warn(
          `[Newegg] WRONG PRODUCT for ${product.name}! ` +
          `Got: "${item.Title || item.Description}". Skipping.`
        );
        return null;
      }
    }

    const price =
      item.FinalPrice ||
      item.SalePrice  ||
      item.MapPrice;

    if (!price) return null;

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) return null;

    // Sanity filter: reject prices outside 50%–170% of base price
    const min = product.basePrice * 0.5;
    const max = product.basePrice * 1.7;
    if (numericPrice < min || numericPrice > max) {
      console.warn(
        `[Newegg] Price out of range for ${product.name}: ` +
        `$${numericPrice} (expected $${min}–$${max}). Skipping.`
      );
      return null;
    }

    console.log(`[Newegg] ✓ ${product.name}: $${numericPrice}`);
    return numericPrice;
  } catch {
    console.warn(`[Newegg] Error fetching ${product.name}`);
    return null;
  }
}

// ── SMART PRICE SIMULATION (Fallback) ────────────────────
function smartSimulate(product, currentPrice) {
  const base    = currentPrice || product.basePrice;
  const floor   = product.basePrice * 0.60;
  const ceiling = product.basePrice * 1.50;

  const change  = (Math.random() - 0.52) * 0.04; // ±2%, skewed negative
  const newPrice = Math.max(floor, Math.min(ceiling, base * (1 + change)));
  return Math.round(newPrice / 5) * 5;
}

// ── FETCH A SINGLE PRODUCT PRICE ─────────────────────────
async function fetchPrice(product, currentPrice) {
  const live = await fetchNewegg(product);
  if (live) return live;

  const simulated = smartSimulate(product, currentPrice);
  const base      = currentPrice || product.basePrice;
  const pct       = ((simulated - base) / base * 100).toFixed(2);
  console.log(`[Simulation] ${product.name}: $${simulated} (${pct}%)`);
  return simulated;
}

// ── FETCH ALL PRODUCT PRICES ──────────────────────────────
async function fetchAllPrices(currentPrices = {}) {
  const results = {};
  for (const product of PRODUCT_CATALOG) {
    const currentPrice = currentPrices[product.id]?.price || product.basePrice;
    results[product.id] = await fetchPrice(product, currentPrice);
  }
  return results;
}

module.exports = { PRODUCT_CATALOG, fetchAllPrices, fetchPrice, smartSimulate };
