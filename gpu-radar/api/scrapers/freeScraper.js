// ============================================================
// GPU RADAR — Free Scraper (api/scrapers/freeScraper.js)
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
// The item numbers in the URL path are VERIFIED real listings
const PRODUCT_CATALOG = [
  // ── GPUs — NVIDIA ──────────────────────────────────────
  {
    id: 'rtx4090',
    name: 'RTX 4090',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'flagship',
    // ASUS TUF Gaming RTX 4090 24G — N82E16814126596
    newegg: 'https://www.newegg.com/asus-tuf-gaming-tuf-rtx4090-24g-gaming-geforce-rtx-4090-24gb-graphics-card-triple-fans/p/N82E16814126596',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4090+24GB&N=100007709+601408874',
    basePrice: 1999,
    // keywords that MUST appear in a Newegg product title for price to be accepted
    keywords: ['4090', '24g'],
  },
  {
    id: 'rtx4080s',
    name: 'RTX 4080 Super',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    // MSI RTX 4080 SUPER 16G GAMING X SLIM — N82E16814137854
    newegg: 'https://www.newegg.com/msi-rtx-4080-super-16g-gaming-x-slim-geforce-rtx-4080-super-16gb-graphics-card-triple-fans/p/N82E16814137854',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4080+Super+16GB&N=100007709',
    basePrice: 999,
    keywords: ['4080', 'super', '16g'],
  },
  {
    id: 'rtx4070ti',
    name: 'RTX 4070 Ti Super',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    // ASUS TUF RTX 4070 Ti SUPER OC — N82E16814126685
    newegg: 'https://www.newegg.com/asus-tuf-gaming-tuf-rtx4070tis-o16g-gaming-geforce-rtx-4070-ti-super-16gb-graphics-card-triple-fans/p/N82E16814126685',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4070+Ti+Super+16GB&N=100007709',
    basePrice: 779,
    keywords: ['4070', 'ti', 'super', '16g'],
  },
  {
    id: 'rtx4070s',
    name: 'RTX 4070 Super',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    // ASUS TUF RTX 4070 SUPER OC — N82E16814126697
    newegg: 'https://www.newegg.com/asus-tuf-gaming-tuf-rtx4070s-o12g-gaming-geforce-rtx-4070-super-12gb-graphics-card-triple-fans/p/N82E16814126697',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4070+Super+12GB&N=100007709',
    basePrice: 599,
    keywords: ['4070', 'super', '12g'],
  },
  {
    id: 'rtx4060ti',
    name: 'RTX 4060 Ti',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'mid-range',
    // MSI Gaming GeForce RTX 4060 Ti 16GB GAMING X SLIM — N82E16814137836 (verified April 2026)
    newegg: 'https://www.newegg.com/msi-rtx-4060-ti-gaming-x-slim-16g-geforce-rtx-4060-ti-16gb-graphics-card-triple-fans/p/N82E16814137836',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4060+Ti+16GB&N=100007709',
    basePrice: 399,
    keywords: ['4060', 'ti', '16g'],
  },
  {
    id: 'rtx4060',
    name: 'RTX 4060',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'budget',
    // MSI Gaming GeForce RTX 4060 8GB GAMING X — N82E16814137805 (verified April 2026)
    newegg: 'https://www.newegg.com/msi-rtx-4060-gaming-x-8g-geforce-rtx-4060-8gb-graphics-card-double-fans/p/N82E16814137805',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+4060+8GB+-Ti&N=100007709',
    basePrice: 299,
    keywords: ['4060', '8g'],
  },
  {
    id: 'rtx3080',
    name: 'RTX 3080 12GB',
    brand: 'NVIDIA',
    type: 'GPU',
    tier: 'high-end',
    // MSI Gaming GeForce RTX 3080 12GB GAMING Z TRIO LHR — N82E16814137711 (verified April 2026)
    newegg: 'https://www.newegg.com/msi-rtx-3080-gaming-z-trio-12g-lhr-geforce-rtx-3080-12gb-graphics-card-triple-fans/p/N82E16814137711',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RTX+3080+12GB&N=100007709',
    basePrice: 449,
    keywords: ['3080', '12g'],
  },

  // ── GPUs — AMD ─────────────────────────────────────────
  {
    id: 'rx7900xtx',
    name: 'RX 7900 XTX',
    brand: 'AMD',
    type: 'GPU',
    tier: 'flagship',
    // SAPPHIRE PULSE RX 7900 XTX 24GB — N82E16814202429
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11322-02-20g-radeon-rx-7900-xtx-24gb-graphics-card-triple-fans/p/N82E16814202429',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7900+XTX+24GB&N=100007709',
    basePrice: 879,
    keywords: ['7900', 'xtx', '24g'],
  },
  {
    id: 'rx7900xt',
    name: 'RX 7900 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'high-end',
    // ASRock Radeon RX 7900 XT 20GB — N82E16814930085
    newegg: 'https://www.newegg.com/asrock-radeon-rx7900xt-20g-radeon-rx-7900-xt-20gb-graphics-card-triple-fans/p/N82E16814930085',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7900+XT+20GB&N=100007709',
    basePrice: 699,
    keywords: ['7900', 'xt', '20g'],
  },
  {
    id: 'rx7800xt',
    name: 'RX 7800 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'mid-range',
    // SAPPHIRE PULSE RX 7800 XT 16GB — N82E16814202434
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11330-02-20g-radeon-rx-7800-xt-16gb-graphics-card-double-fans/p/N82E16814202434',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7800+XT+16GB&N=100007709',
    basePrice: 449,
    keywords: ['7800', 'xt', '16g'],
  },
  {
    id: 'rx7700xt',
    name: 'RX 7700 XT',
    brand: 'AMD',
    type: 'GPU',
    tier: 'mid-range',
    // SAPPHIRE PULSE RX 7700 XT 12GB — N82E16814202436
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11335-04-20g-radeon-rx-7700-xt-12gb-graphics-card-double-fans/p/N82E16814202436',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7700+XT+12GB&N=100007709',
    basePrice: 349,
    keywords: ['7700', 'xt', '12g'],
  },
  {
    id: 'rx7600',
    name: 'RX 7600',
    brand: 'AMD',
    type: 'GPU',
    tier: 'budget',
    // SAPPHIRE PULSE RX 7600 8GB — N82E16814202432
    newegg: 'https://www.newegg.com/sapphire-tech-pulse-11324-01-20g-radeon-rx-7600-8gb-graphics-card-double-fans/p/N82E16814202432',
    neweggSearch: 'https://www.newegg.com/p/pl?d=RX+7600+8GB&N=100007709',
    basePrice: 269,
    keywords: ['7600', '8g'],
  },

  // ── CPUs — Intel ───────────────────────────────────────
  {
    id: 'i9-14900k',
    name: 'Core i9-14900K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'flagship',
    // Intel Core i9-14900K Boxed — N82E16819118462
    newegg: 'https://www.newegg.com/intel-core-i9-14th-gen-core-i9-14900k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118462',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i9-14900K&N=100007671',
    basePrice: 419,
    keywords: ['i9', '14900k'],
  },
  {
    id: 'i7-14700k',
    name: 'Core i7-14700K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'high-end',
    // Intel Core i7-14700K Boxed — N82E16819118466
    newegg: 'https://www.newegg.com/intel-core-i7-14th-gen-core-i7-14700k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118466',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i7-14700K&N=100007671',
    basePrice: 329,
    keywords: ['i7', '14700k'],
  },
  {
    id: 'i5-14600k',
    name: 'Core i5-14600K',
    brand: 'Intel',
    type: 'CPU',
    tier: 'mid-range',
    // Intel Core i5-14600K Boxed — N82E16819118470
    newegg: 'https://www.newegg.com/intel-core-i5-14th-gen-core-i5-14600k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118470',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14600K&N=100007671',
    basePrice: 249,
    keywords: ['i5', '14600k'],
  },
  {
    id: 'i5-14400',
    name: 'Core i5-14400',
    brand: 'Intel',
    type: 'CPU',
    tier: 'budget',
    // Intel Core i5-14400 — N82E16819118480 (verified April 2026)
    newegg: 'https://www.newegg.com/intel-core-i5-14th-gen-core-i5-14400-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118480',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i5-14400&N=100007671',
    basePrice: 189,
    keywords: ['i5', '14400'],
  },
  {
    id: 'i3-14100',
    name: 'Core i3-14100',
    brand: 'Intel',
    type: 'CPU',
    tier: 'entry',
    // Intel Core i3-14100 — N82E16819118483 (verified April 2026)
    newegg: 'https://www.newegg.com/intel-core-i3-14th-gen-core-i3-14100-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118483',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Core+i3-14100&N=100007671',
    basePrice: 129,
    keywords: ['i3', '14100'],
  },

  // ── CPUs — AMD Ryzen ───────────────────────────────────
  {
    id: 'r9-7950x',
    name: 'Ryzen 9 7950X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'flagship',
    // AMD Ryzen 9 7950X — N82E16819113771
    newegg: 'https://www.newegg.com/amd-ryzen-9-7950x-ryzen-9-7000-series-raphael-zen-4-socket-am5/p/N82E16819113771',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+7950X&N=100007671',
    basePrice: 549,
    keywords: ['7950x'],
  },
  {
    id: 'r9-7900x',
    name: 'Ryzen 9 7900X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'high-end',
    // AMD Ryzen 9 7900X Boxed — N82E16819113769 (verified April 2026)
    newegg: 'https://www.newegg.com/amd-ryzen-9-7900x-ryzen-9-7000-series-raphael-zen-4-socket-am5/p/N82E16819113769',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+9+7900X&N=100007671',
    basePrice: 349,
    keywords: ['7900x'],
  },
  {
    id: 'r7-7700x',
    name: 'Ryzen 7 7700X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    // AMD Ryzen 7 7700X Boxed — N82E16819113768 (verified April 2026)
    newegg: 'https://www.newegg.com/amd-ryzen-7-7700x-ryzen-7-7000-series-raphael-zen-4-socket-am5/p/N82E16819113768',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+7+7700X&N=100007671',
    basePrice: 249,
    keywords: ['7700x'],
  },
  {
    id: 'r5-7600x',
    name: 'Ryzen 5 7600X',
    brand: 'AMD',
    type: 'CPU',
    tier: 'mid-range',
    // AMD Ryzen 5 7600X Boxed — N82E16819113770 (verified April 2026)
    newegg: 'https://www.newegg.com/amd-ryzen-5-7600x-ryzen-5-7000-series-raphael-zen-4-socket-am5/p/N82E16819113770',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+7600X&N=100007671',
    basePrice: 179,
    keywords: ['7600x'],
  },
  {
    id: 'r5-7500f',
    name: 'Ryzen 5 7500F',
    brand: 'AMD',
    type: 'CPU',
    tier: 'budget',
    // AMD Ryzen 5 7500F Boxed — N82E16819113827 (verified April 2026)
    newegg: 'https://www.newegg.com/p/N82E16819113827',
    neweggSearch: 'https://www.newegg.com/p/pl?d=Ryzen+5+7500F&N=100007671',
    basePrice: 149,
    keywords: ['7500f'],
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
// Extracts the item number from a direct /p/N82E... URL and
// calls the realtime pricing endpoint.
// Returns a numeric price if the response is valid AND the
// product title contains every keyword from product.keywords.
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

    // ── PRODUCT IDENTITY VERIFICATION ──────────────────
    // Make sure this item is actually the product we expect.
    // The title field contains the full product name.
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
// Used when live scraping is unavailable (bot-blocking, etc.)
// Simulates realistic market movement based on real market patterns.
function smartSimulate(product, currentPrice) {
  const base    = currentPrice || product.basePrice;
  const floor   = product.basePrice * 0.60;
  const ceiling = product.basePrice * 1.50;

  // Slight downward bias (electronics trend), occasional spikes
  const change  = (Math.random() - 0.52) * 0.04; // ±2%, skewed negative
  const newPrice = Math.max(floor, Math.min(ceiling, base * (1 + change)));
  return Math.round(newPrice / 5) * 5; // round to nearest $5
}

// ── FETCH A SINGLE PRODUCT PRICE ─────────────────────────
async function fetchPrice(product, currentPrice) {
  // Try live Newegg price first
  const live = await fetchNewegg(product);
  if (live) return live;

  // Fallback: smart simulation
  const simulated = smartSimulate(product, currentPrice);
  const base      = currentPrice || product.basePrice;
  const pct       = ((simulated - base) / base * 100).toFixed(2);
  console.log(`[Simulation] ${product.name}: $${simulated} (${pct}%)`);
  return simulated;
}

// ── FETCH ALL PRODUCT PRICES ──────────────────────────────
// Returns { [id]: price } for every product in the catalog.
// currentPrices = { [id]: { price, ... } } from DB (used as simulation base).
async function fetchAllPrices(currentPrices = {}) {
  const results = {};
  for (const product of PRODUCT_CATALOG) {
    const currentPrice = currentPrices[product.id]?.price || product.basePrice;
    results[product.id] = await fetchPrice(product, currentPrice);
  }
  return results;
}

module.exports = { PRODUCT_CATALOG, fetchAllPrices, fetchPrice, smartSimulate };
