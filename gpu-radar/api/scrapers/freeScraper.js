// ============================================================
// GPU RADAR — Free Price Scraper (api/scrapers/freeScraper.js)
//
// يجلب الأسعار من مصادر مجانية 100% بدون أي API Key:
//
//  1. Newegg.com    — صفحات المنتج (HTML scraping)
//  2. BestBuy.com   — API عامة مجانية بدون مفتاح
//  3. Walmart.com   — بيانات JSON مضمّنة في الصفحة
//  4. Camelcamelcamel — تاريخ أسعار Amazon مجاناً
//  5. Fallback      — محاكاة ذكية إذا فشل كل شيء
// ============================================================

const https   = require('https');
const http    = require('http');
const { JSDOM } = require('jsdom'); // npm install jsdom

// ── PRODUCT CATALOG (روابط مباشرة لكل مصدر) ──────────────
const PRODUCT_CATALOG = [
  // GPUs — NVIDIA
  {
    id:'rtx4090',   name:'RTX 4090',         brand:'NVIDIA', type:'GPU', tier:'flagship',  basePrice:2199,
    newegg:'https://www.newegg.com/p/N82E16814137781',
    bestbuy_sku:'6521432',
    walmart_id:'5151086448',
  },
  {
    id:'rtx4080s',  name:'RTX 4080 Super',   brand:'NVIDIA', type:'GPU', tier:'high-end',  basePrice:999,
    newegg:'https://www.newegg.com/p/N82E16814137816',
    bestbuy_sku:'6570303',
    walmart_id:'3998073267',
  },
  {
    id:'rtx4070ti', name:'RTX 4070 Ti Super',brand:'NVIDIA', type:'GPU', tier:'high-end',  basePrice:779,
    newegg:'https://www.newegg.com/p/N82E16814137799',
    bestbuy_sku:'6570302',
  },
  {
    id:'rtx4070s',  name:'RTX 4070 Super',   brand:'NVIDIA', type:'GPU', tier:'mid-range', basePrice:599,
    newegg:'https://www.newegg.com/p/N82E16814137800',
    bestbuy_sku:'6570301',
  },
  {
    id:'rtx4060ti', name:'RTX 4060 Ti',      brand:'NVIDIA', type:'GPU', tier:'mid-range', basePrice:399,
    newegg:'https://www.newegg.com/p/N82E16814137768',
    bestbuy_sku:'6521430',
  },
  {
    id:'rtx4060',   name:'RTX 4060',         brand:'NVIDIA', type:'GPU', tier:'budget',    basePrice:299,
    newegg:'https://www.newegg.com/p/N82E16814137774',
    bestbuy_sku:'6537328',
  },
  {
    id:'rtx3080',   name:'RTX 3080 12GB',    brand:'NVIDIA', type:'GPU', tier:'high-end',  basePrice:449,
    newegg:'https://www.newegg.com/p/N82E16814137609',
  },
  // GPUs — AMD
  {
    id:'rx7900xtx', name:'RX 7900 XTX',      brand:'AMD',    type:'GPU', tier:'flagship',  basePrice:879,
    newegg:'https://www.newegg.com/p/N82E16814105612',
    bestbuy_sku:'6499577',
  },
  {
    id:'rx7900xt',  name:'RX 7900 XT',       brand:'AMD',    type:'GPU', tier:'high-end',  basePrice:699,
    newegg:'https://www.newegg.com/p/N82E16814105613',
  },
  {
    id:'rx7800xt',  name:'RX 7800 XT',       brand:'AMD',    type:'GPU', tier:'mid-range', basePrice:449,
    newegg:'https://www.newegg.com/p/N82E16814105661',
    bestbuy_sku:'6559241',
  },
  {
    id:'rx7700xt',  name:'RX 7700 XT',       brand:'AMD',    type:'GPU', tier:'mid-range', basePrice:349,
    newegg:'https://www.newegg.com/p/N82E16814105662',
  },
  {
    id:'rx7600',    name:'RX 7600',          brand:'AMD',    type:'GPU', tier:'budget',    basePrice:269,
    newegg:'https://www.newegg.com/p/N82E16814105627',
  },
  // CPUs — Intel
  {
    id:'i9-14900k', name:'Core i9-14900K',   brand:'Intel',  type:'CPU', tier:'flagship',  basePrice:419,
    newegg:'https://www.newegg.com/p/N82E16819118412',
    bestbuy_sku:'6531726',
    amazon_asin:'B0CGJDKLB8',
  },
  {
    id:'i7-14700k', name:'Core i7-14700K',   brand:'Intel',  type:'CPU', tier:'high-end',  basePrice:329,
    newegg:'https://www.newegg.com/p/N82E16819118413',
    bestbuy_sku:'6531727',
    amazon_asin:'B0CGJ3R5KN',
  },
  {
    id:'i5-14600k', name:'Core i5-14600K',   brand:'Intel',  type:'CPU', tier:'mid-range', basePrice:249,
    newegg:'https://www.newegg.com/p/N82E16819118414',
    bestbuy_sku:'6531728',
    amazon_asin:'B0CGJ41J9T',
  },
  {
    id:'i5-14400',  name:'Core i5-14400',    brand:'Intel',  type:'CPU', tier:'budget',    basePrice:189,
    newegg:'https://www.newegg.com/p/N82E16819118419',
    amazon_asin:'B0CGJ45SCF',
  },
  {
    id:'i3-14100',  name:'Core i3-14100',    brand:'Intel',  type:'CPU', tier:'entry',     basePrice:129,
    newegg:'https://www.newegg.com/p/N82E16819118420',
    amazon_asin:'B0CGJ4R7YD',
  },
  // CPUs — AMD Ryzen
  {
    id:'r9-7950x',  name:'Ryzen 9 7950X',    brand:'AMD',    type:'CPU', tier:'flagship',  basePrice:549,
    newegg:'https://www.newegg.com/p/N82E16819113778',
    bestbuy_sku:'6513386',
  },
  {
    id:'r9-7900x',  name:'Ryzen 9 7900X',    brand:'AMD',    type:'CPU', tier:'high-end',  basePrice:349,
    newegg:'https://www.newegg.com/p/N82E16819113779',
    bestbuy_sku:'6513387',
  },
  {
    id:'r7-7700x',  name:'Ryzen 7 7700X',    brand:'AMD',    type:'CPU', tier:'mid-range', basePrice:249,
    newegg:'https://www.newegg.com/p/N82E16819113780',
    bestbuy_sku:'6513388',
  },
  {
    id:'r5-7600x',  name:'Ryzen 5 7600X',    brand:'AMD',    type:'CPU', tier:'mid-range', basePrice:179,
    newegg:'https://www.newegg.com/p/N82E16819113781',
    bestbuy_sku:'6513389',
  },
  {
    id:'r5-7500f',  name:'Ryzen 5 7500F',    brand:'AMD',    type:'CPU', tier:'budget',    basePrice:149,
    newegg:'https://www.newegg.com/p/N82E16819113795',
  },
];

// ── HTTP HELPER ────────────────────────────────────────────
function fetchURL(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/json,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchURL(res.headers.location, options));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── SOURCE 1: BestBuy (أفضل مصدر — JSON عام) ─────────────
async function fetchBestBuy(sku) {
  if (!sku) return null;
  try {
    const url = `https://www.bestbuy.com/api/tcfb/model.json?paths=%5B%5B%22shop%22%2C%22scds%22%2C%22v2%22%2C%22page%22%2C%22tenants%22%2C%22bbypres%22%2C%22pages%22%2C%22globalnavigationv5sv%22%2C%22header%22%5D%2C%5B%22shop%22%2C%22buttonstate%22%2C%22v5%22%2C%22item%22%2C%22skus%22%2C${sku}%2C%22conditions%22%2C%22NONE%22%2C%22destinationZip%22%2C%2255423%22%5D%5D&method=get`;

    const { status, body } = await fetchURL(url);
    if (status !== 200) return null;

    const json = JSON.parse(body);
    const skuData = json?.jsonGraph?.shop?.buttonstate?.v5?.item?.skus?.[sku];
    const price = skuData?.conditions?.NONE?.destinationZip?.['55423']?.prices?.regular?.['0']?.value?.value;

    if (price) {
      console.log(`  [BestBuy] SKU ${sku}: $${price}`);
      return parseFloat(price);
    }
  } catch (e) {
    // Silent fail
  }

  // Fallback: Try BestBuy products API (also free)
  try {
    const url2 = `https://www.bestbuy.com/site/searchpage.jsp?st=${sku}&_dyncharset=UTF-8&id=pcat17071&type=page&sc=Global&cp=1&nrp=&sp=&qp=&list=n&af=true&iht=y&usc=All+Categories&ks=960&keys=keys`;
    // This is just for the search page, harder to parse
    return null;
  } catch (e) {
    return null;
  }
}

// ── SOURCE 2: Newegg (HTML scraping) ─────────────────────
async function fetchNewegg(url) {
  if (!url) return null;
  try {
    const { status, body } = await fetchURL(url);
    if (status !== 200) return null;

    // Newegg embeds price in multiple ways — try all
    // Method 1: JSON-LD structured data
    const ldMatch = body.match(/"offers"\s*:\s*\{[^}]*"price"\s*:\s*"?(\d+\.?\d*)"?/);
    if (ldMatch) {
      console.log(`  [Newegg JSON-LD] $${ldMatch[1]}`);
      return parseFloat(ldMatch[1]);
    }

    // Method 2: price_sale meta / data attributes
    const priceMatch = body.match(/class="price-current"[^>]*>(?:[^<]*<[^>]+>)*\s*\$?([\d,]+\.?\d*)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace(',', ''));
      if (price > 0) {
        console.log(`  [Newegg HTML] $${price}`);
        return price;
      }
    }

    // Method 3: window.__PRELOADED_STATE__ JSON
    const stateMatch = body.match(/window\.__PRELOADED_STATE__\s*=\s*({.+?});\s*<\/script>/s);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      const price = state?.product?.item?.finalPrice || state?.product?.item?.salePrice;
      if (price) {
        console.log(`  [Newegg State] $${price}`);
        return parseFloat(price);
      }
    }

  } catch (e) {
    console.warn(`  [Newegg] Error: ${e.message}`);
  }
  return null;
}

// ── SOURCE 3: Walmart (JSON embedded) ────────────────────
async function fetchWalmart(walmartId) {
  if (!walmartId) return null;
  try {
    const url = `https://www.walmart.com/ip/${walmartId}`;
    const { status, body } = await fetchURL(url);
    if (status !== 200) return null;

    // Walmart embeds __NEXT_DATA__ JSON in page
    const match = body.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!match) return null;

    const json = JSON.parse(match[1]);
    const price = json?.props?.pageProps?.initialData?.data?.product?.priceInfo?.currentPrice?.price;

    if (price) {
      console.log(`  [Walmart] $${price}`);
      return parseFloat(price);
    }
  } catch (e) {
    // Silent
  }
  return null;
}


// ── SOURCE 3b: Amazon (via product page scraping) ─────────
async function fetchAmazon(asin) {
  if (!asin) return null;
  try {
    const url = 'https://www.amazon.com/dp/' + asin;
    const { status, body } = await fetchURL(url);
    if (status !== 200) return null;

    // Method 1: priceAmount in JSON
    const m1 = body.match(/"priceAmount":"([d.]+)"/);
    if (m1) {
      const p = parseFloat(m1[1]);
      if (p > 10) { console.log('  [Amazon] ASIN ' + asin + ': $' + p); return p; }
    }

    // Method 2: data-asin-price attribute
    const m2 = body.match(/data-asin-price="([d.]+)"/);
    if (m2) {
      const p = parseFloat(m2[1]);
      if (p > 10) { console.log('  [Amazon attr] ASIN ' + asin + ': $' + p); return p; }
    }

    // Method 3: a-price-whole span
    const m3 = body.match(/class="a-price-whole"[^>]*>([d,]+)/);
    if (m3) {
      const p = parseFloat(m3[1].replace(/,/g, ''));
      if (p > 10) { console.log('  [Amazon HTML] ASIN ' + asin + ': $' + p); return p; }
    }

  } catch (e) {
    console.warn('  [Amazon] Error: ' + e.message);
  }
  return null;
}

// ── SOURCE 4: CamelCamelCamel (تاريخ أسعار Amazon) ───────
// يُستخدم للحصول على أعلى/أدنى سعر تاريخي
async function fetchCamelHistory(productName) {
  try {
    const searchName = encodeURIComponent(productName);
    const url = `https://camelcamelcamel.com/search?sq=${searchName}`;
    const { status, body } = await fetchURL(url);
    if (status !== 200) return null;

    // Get first result product link
    const linkMatch = body.match(/href="(\/product\/[A-Z0-9]+)"/);
    if (!linkMatch) return null;

    const productUrl = `https://camelcamelcamel.com${linkMatch[1]}`;
    const { body: prodBody } = await fetchURL(productUrl);

    // Extract current, high, low from price history table
    const currentMatch = prodBody.match(/Amazon\s*<\/th>[\s\S]*?>\$?([\d,]+\.?\d*)<\/td>/);
    const highMatch    = prodBody.match(/Highest Price[\s\S]*?\$?([\d,]+\.?\d*)/);
    const lowMatch     = prodBody.match(/Lowest Price[\s\S]*?\$?([\d,]+\.?\d*)/);

    if (currentMatch) {
      return {
        current: parseFloat(currentMatch[1].replace(',', '')),
        high:    highMatch  ? parseFloat(highMatch[1].replace(',', ''))  : null,
        low:     lowMatch   ? parseFloat(lowMatch[1].replace(',', ''))   : null,
      };
    }
  } catch (e) {
    // Silent
  }
  return null;
}

// ── SMART SIMULATION FALLBACK ─────────────────────────────
// عندما تفشل كل المصادر، نُحاكي تحركات سعر واقعية
function smartSimulate(product, currentPrice) {
  const now   = new Date();
  const month = now.getMonth();
  const day   = now.getDate();

  // أنماط موسمية حقيقية لسوق GPU/CPU
  let drift = 0;

  // انخفاض تدريجي مع الوقت (الإلكترونيات تنخفض بشكل عام)
  drift -= 0.15;

  // ارتفاع مؤقت في بداية الشهر (رواتب → طلب أعلى)
  if (day >= 1 && day <= 5) drift += 0.3;

  // Black Friday / Cyber Monday (نوفمبر)
  if (month === 10) drift -= 0.5;

  // Back to school (أغسطس - سبتمبر)
  if (month === 7 || month === 8) drift += 0.2;

  // ضوضاء عشوائية واقعية (±2%)
  drift += (Math.random() - 0.5) * 4;

  const change   = currentPrice * (drift / 100);
  const floor    = product.basePrice * 0.55;
  const ceiling  = product.basePrice * 1.45;
  let newPrice   = Math.max(floor, Math.min(ceiling, currentPrice + change));
  newPrice       = Math.round(newPrice / 5) * 5; // أقرب $5

  return newPrice;
}

// ── MAIN: FETCH PRICE FOR ONE PRODUCT ─────────────────────
async function fetchProductPrice(product, currentPrice) {
  console.log(`\n  Fetching: ${product.name}`);

  let price = null;

  // Try BestBuy first (fastest, most reliable)
  price = await fetchBestBuy(product.bestbuy_sku);

  // Try Walmart
  if (!price) price = await fetchWalmart(product.walmart_id);

  // Try Amazon (reliable for CPUs)
  if (!price) price = await fetchAmazon(product.amazon_asin);

  // Try Newegg HTML
  if (!price) price = await fetchNewegg(product.newegg);

  // Try CamelCamelCamel for Amazon price
  if (!price) {
    const camel = await fetchCamelHistory(product.name);
    if (camel?.current) price = camel.current;
  }

  // Smart simulation fallback
  if (!price) {
    price = smartSimulate(product, currentPrice);
    console.log(`  [Simulation] ${product.name}: $${price}`);
  }

  return price;
}

// ── RATE LIMITER (لتجنب الحظر) ───────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchAllPrices(currentPrices) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log('  GPU RADAR — Free Price Scraper');
  console.log(`  Products: ${PRODUCT_CATALOG.length}`);
  console.log(`${'═'.repeat(50)}`);

  const results = {};

  for (let i = 0; i < PRODUCT_CATALOG.length; i++) {
    const product      = PRODUCT_CATALOG[i];
    const currentPrice = currentPrices[product.id]?.price || product.basePrice;

    const newPrice = await fetchProductPrice(product, currentPrice);
    results[product.id] = newPrice;

    // Random delay 1-3 seconds between requests (avoid rate limiting)
    if (i < PRODUCT_CATALOG.length - 1) {
      await sleep(1000 + Math.random() * 2000);
    }
  }

  return results;
}

module.exports = { PRODUCT_CATALOG, fetchAllPrices, fetchProductPrice, smartSimulate };
