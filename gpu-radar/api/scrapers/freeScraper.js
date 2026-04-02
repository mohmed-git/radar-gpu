// ============================================================
// GPU RADAR — Free Scraper (api/scrapers/freeScraper.js)
//
// Exports:
//   PRODUCT_CATALOG  — master list of products with basePrice
//   fetchAllPrices   — returns { [id]: price } for every product
//   fetchPrice       — fetch / simulate a single product price
// ============================================================

const https = require('https');

// ── PRODUCT CATALOG ───────────────────────────────────────
const PRODUCT_CATALOG = [
  // GPUs — NVIDIA
  { id:'rtx4090',   name:'RTX 4090',          brand:'NVIDIA', type:'GPU', tier:'flagship',  newegg:'https://www.newegg.com/p/N82E16814137781', basePrice:2199 },
  { id:'rtx4080s',  name:'RTX 4080 Super',    brand:'NVIDIA', type:'GPU', tier:'high-end',  newegg:'https://www.newegg.com/p/N82E16814137816', basePrice:999  },
  { id:'rtx4070ti', name:'RTX 4070 Ti Super', brand:'NVIDIA', type:'GPU', tier:'high-end',  newegg:'https://www.newegg.com/p/N82E16814137799', basePrice:779  },
  { id:'rtx4070s',  name:'RTX 4070 Super',    brand:'NVIDIA', type:'GPU', tier:'mid-range', newegg:'https://www.newegg.com/p/N82E16814137800', basePrice:599  },
  { id:'rtx4060ti', name:'RTX 4060 Ti',       brand:'NVIDIA', type:'GPU', tier:'mid-range', newegg:'https://www.newegg.com/p/N82E16814137768', basePrice:399  },
  { id:'rtx4060',   name:'RTX 4060',          brand:'NVIDIA', type:'GPU', tier:'budget',    newegg:'https://www.newegg.com/p/N82E16814137774', basePrice:299  },
  { id:'rtx3080',   name:'RTX 3080 12GB',     brand:'NVIDIA', type:'GPU', tier:'high-end',  newegg:'https://www.newegg.com/p/N82E16814137609', basePrice:449  },

  // GPUs — AMD
  { id:'rx7900xtx', name:'RX 7900 XTX',       brand:'AMD',    type:'GPU', tier:'flagship',  newegg:'https://www.newegg.com/p/N82E16814105612', basePrice:879  },
  { id:'rx7900xt',  name:'RX 7900 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  newegg:'https://www.newegg.com/p/N82E16814105613', basePrice:699  },
  { id:'rx7800xt',  name:'RX 7800 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', newegg:'https://www.newegg.com/p/N82E16814105661', basePrice:449  },
  { id:'rx7700xt',  name:'RX 7700 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', newegg:'https://www.newegg.com/p/N82E16814105662', basePrice:349  },
  { id:'rx7600',    name:'RX 7600',           brand:'AMD',    type:'GPU', tier:'budget',    newegg:'https://www.newegg.com/p/N82E16814105627', basePrice:269  },

  // CPUs — Intel
  { id:'i9-14900k', name:'Core i9-14900K',    brand:'Intel',  type:'CPU', tier:'flagship',  newegg:'https://www.newegg.com/p/N82E16819118428', basePrice:419  },
  { id:'i7-14700k', name:'Core i7-14700K',    brand:'Intel',  type:'CPU', tier:'high-end',  newegg:'https://www.newegg.com/p/N82E16819118429', basePrice:329  },
  { id:'i5-14600k', name:'Core i5-14600K',    brand:'Intel',  type:'CPU', tier:'mid-range', newegg:'https://www.newegg.com/p/N82E16819118430', basePrice:249  },
  { id:'i5-14400',  name:'Core i5-14400',     brand:'Intel',  type:'CPU', tier:'budget',    newegg:'https://www.newegg.com/p/N82E16819118431', basePrice:189  },
  { id:'i3-14100',  name:'Core i3-14100',     brand:'Intel',  type:'CPU', tier:'entry',     newegg:'https://www.newegg.com/p/N82E16819118432', basePrice:129  },

  // CPUs — AMD Ryzen
  { id:'r9-7950x',  name:'Ryzen 9 7950X',     brand:'AMD',    type:'CPU', tier:'flagship',  newegg:'https://www.newegg.com/p/N82E16819113778', basePrice:549  },
  { id:'r9-7900x',  name:'Ryzen 9 7900X',     brand:'AMD',    type:'CPU', tier:'high-end',  newegg:'https://www.newegg.com/p/N82E16819113779', basePrice:349  },
  { id:'r7-7700x',  name:'Ryzen 7 7700X',     brand:'AMD',    type:'CPU', tier:'mid-range', newegg:'https://www.newegg.com/p/N82E16819113780', basePrice:249  },
  { id:'r5-7600x',  name:'Ryzen 5 7600X',     brand:'AMD',    type:'CPU', tier:'mid-range', newegg:'https://www.newegg.com/p/N82E16819113781', basePrice:179  },
  { id:'r5-7500f',  name:'Ryzen 5 7500F',     brand:'AMD',    type:'CPU', tier:'budget',    newegg:'https://www.newegg.com/p/N82E16819113795', basePrice:149  },
];

// ── SIMPLE HTTPS FETCH ────────────────────────────────────
function fetchURL(url, options = {}) {
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    let data = '';
    req.on('response', (res) => {
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', () => resolve({ status: 500, body: '' }));
    req.end();
  });
}

// ── NEWEGG INTERNAL API ───────────────────────────────────
async function fetchNewegg(product) {
  if (!product.newegg) return null;

  try {
    const match = product.newegg.match(/N82E(\d+)/);
    if (!match) return null;

    const itemNumber = match[1];
    const url = `https://www.newegg.com/api/Product/ProductRealtime?ItemNumber=${itemNumber}`;
    const { status, body } = await fetchURL(url, { headers: { Referer: product.newegg } });

    if (status !== 200) return null;

    const json = JSON.parse(body);
    const price =
      json?.MainItem?.FinalPrice ||
      json?.MainItem?.SalePrice  ||
      json?.MainItem?.MapPrice;

    if (!price) return null;

    const numericPrice = parseFloat(price);

    // Sanity filter — reject prices outside 50%–160% of base price
    const min = product.basePrice * 0.5;
    const max = product.basePrice * 1.6;
    if (numericPrice < min || numericPrice > max) {
      console.warn(`[Newegg] Suspicious price ignored for ${product.name}: $${numericPrice}`);
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
// Used when no live source returns a price.
// Simulates realistic market movement: ±2% with a slight downward bias.
function smartSimulate(product, currentPrice) {
  const base      = currentPrice || product.basePrice;
  const floor     = product.basePrice * 0.6;
  const ceiling   = product.basePrice * 1.5;
  const change    = (Math.random() - 0.52) * 0.04; // ±2%, slight -ve bias
  const newPrice  = Math.max(floor, Math.min(ceiling, base * (1 + change)));
  return Math.round(newPrice / 5) * 5; // round to nearest $5
}

// ── FETCH A SINGLE PRODUCT PRICE ─────────────────────────
async function fetchPrice(product, currentPrice) {
  const price = await fetchNewegg(product);
  if (price) return price;

  const simulated = smartSimulate(product, currentPrice);
  const pct = ((simulated - (currentPrice || product.basePrice)) / (currentPrice || product.basePrice) * 100).toFixed(2);
  console.log(`[Simulation] ${product.name}: $${simulated} (${pct}%)`);
  return simulated;
}

// ── FETCH ALL PRODUCT PRICES ──────────────────────────────
// Returns { [id]: price } for every product in the catalog.
// currentPrices is { [id]: { price, ... } } from the DB (used as fallback base).
async function fetchAllPrices(currentPrices = {}) {
  const results = {};
  for (const product of PRODUCT_CATALOG) {
    const currentPrice = currentPrices[product.id]?.price || product.basePrice;
    results[product.id] = await fetchPrice(product, currentPrice);
  }
  return results;
}

module.exports = { PRODUCT_CATALOG, fetchAllPrices, fetchPrice, smartSimulate };
