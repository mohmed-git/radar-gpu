// ============================================================
// GPU RADAR — ZenRows Scraper  v1.0
// (api/scrapers/zenrowsScraper.js)
//
// يستخدم ZenRows API لاستخراج الأسعار الحقيقية من:
//   1. Amazon.com
//   2. Newegg.com
//   3. BestBuy.com
//
// ZenRows API Key: 1dfdd4e2ecd3ff0174b1715c8b6af0809fb5e9c1
// ============================================================

const https = require('https');

const ZENROWS_API_KEY = process.env.ZENROWS_API_KEY || '1dfdd4e2ecd3ff0174b1715c8b6af0809fb5e9c1';
const ZENROWS_BASE    = 'https://api.zenrows.com/v1/';

// ── PRODUCT SEARCH CATALOG ────────────────────────────────
// كل منتج يحتوي على روابط مباشرة للبحث على المتاجر الثلاثة
const PRODUCT_CATALOG = [
  // ── NVIDIA RTX 50-Series ─────────────────────────────────
  { id: 'rtx5090',    name: 'NVIDIA RTX 5090',         asin: 'B0CXFP5TH2', neweggQ: 'RTX+5090',         bbQ: 'rtx+5090',         basePrice: 3899 },
  { id: 'rtx5080',    name: 'NVIDIA RTX 5080',         asin: 'B0CXFP5TH3', neweggQ: 'RTX+5080',         bbQ: 'rtx+5080',         basePrice: 1299 },
  { id: 'rtx5070ti',  name: 'NVIDIA RTX 5070 Ti',      asin: 'B0CXFP5TH4', neweggQ: 'RTX+5070+Ti',      bbQ: 'rtx+5070+ti',      basePrice: 1009 },
  { id: 'rtx5070',    name: 'NVIDIA RTX 5070',         asin: 'B0CXFP5TH5', neweggQ: 'RTX+5070',         bbQ: 'rtx+5070',         basePrice: 649  },
  { id: 'rtx5060ti',  name: 'NVIDIA RTX 5060 Ti 16GB', asin: 'B0CXFP5TH6', neweggQ: 'RTX+5060+Ti+16GB', bbQ: 'rtx+5060+ti',      basePrice: 514  },
  { id: 'rtx5060',    name: 'NVIDIA RTX 5060',         asin: 'B0CXFP5TH8', neweggQ: 'RTX+5060',         bbQ: 'rtx+5060',         basePrice: 349  },

  // ── NVIDIA RTX 40-Series ─────────────────────────────────
  { id: 'rtx4090',    name: 'NVIDIA RTX 4090',         asin: 'B0BG9XWGNG', neweggQ: 'RTX+4090+24GB',    bbQ: 'rtx+4090',         basePrice: 3199 },
  { id: 'rtx4080s',   name: 'NVIDIA RTX 4080 Super',   asin: 'B0CSVNFKGQ', neweggQ: 'RTX+4080+Super',   bbQ: 'rtx+4080+super',   basePrice: 1099 },
  { id: 'rtx4070tis', name: 'NVIDIA RTX 4070 Ti Super',asin: 'B0CRS8GZ7W', neweggQ: 'RTX+4070+Ti+Super',bbQ: 'rtx+4070+ti+super',basePrice: 799  },
  { id: 'rtx4070s',   name: 'NVIDIA RTX 4070 Super',   asin: 'B0CQNQLF3V', neweggQ: 'RTX+4070+Super',   bbQ: 'rtx+4070+super',   basePrice: 599  },
  { id: 'rtx4070',    name: 'NVIDIA RTX 4070',         asin: 'B0BYF12WZN', neweggQ: 'RTX+4070+12GB',    bbQ: 'rtx+4070',         basePrice: 549  },
  { id: 'rtx4060ti',  name: 'NVIDIA RTX 4060 Ti',      asin: 'B0C4TY95QV', neweggQ: 'RTX+4060+Ti',      bbQ: 'rtx+4060+ti',      basePrice: 399  },
  { id: 'rtx4060',    name: 'NVIDIA RTX 4060',         asin: 'B0C5YNKBT3', neweggQ: 'RTX+4060+8GB',     bbQ: 'rtx+4060',         basePrice: 299  },

  // ── AMD RX 9000-Series ───────────────────────────────────
  { id: 'rx9070xt',   name: 'AMD RX 9070 XT',          asin: 'B0DXFP1XT1', neweggQ: 'RX+9070+XT',       bbQ: 'rx+9070+xt',       basePrice: 599  },
  { id: 'rx9070',     name: 'AMD RX 9070',              asin: 'B0DXFP1XT2', neweggQ: 'RX+9070',          bbQ: 'rx+9070',          basePrice: 499  },

  // ── AMD RX 7000-Series ───────────────────────────────────
  { id: 'rx7900xtx',  name: 'AMD RX 7900 XTX',         asin: 'B0BLP619C5', neweggQ: 'RX+7900+XTX',      bbQ: 'rx+7900+xtx',      basePrice: 849  },
  { id: 'rx7900xt',   name: 'AMD RX 7900 XT',          asin: 'B0BLP619C4', neweggQ: 'RX+7900+XT',       bbQ: 'rx+7900+xt',       basePrice: 599  },
  { id: 'rx7800xt',   name: 'AMD RX 7800 XT',          asin: 'B0CF7MHR2H', neweggQ: 'RX+7800+XT',       bbQ: 'rx+7800+xt',       basePrice: 399  },
  { id: 'rx7700xt',   name: 'AMD RX 7700 XT',          asin: 'B0CF7MHR2G', neweggQ: 'RX+7700+XT',       bbQ: 'rx+7700+xt',       basePrice: 329  },
  { id: 'rx7600',     name: 'AMD RX 7600',              asin: 'B0C4KHXWK8', neweggQ: 'RX+7600+8GB',      bbQ: 'rx+7600',          basePrice: 239  },

  // ── Intel Arc ────────────────────────────────────────────
  { id: 'arc-b580',   name: 'Intel Arc B580',           asin: 'B0D8B6NNFT', neweggQ: 'Arc+B580',         bbQ: 'intel+arc+b580',   basePrice: 249  },
  { id: 'arc-b570',   name: 'Intel Arc B570',           asin: 'B0D8B6NNF1', neweggQ: 'Arc+B570',         bbQ: 'intel+arc+b570',   basePrice: 219  },

  // ── Intel CPUs — Arrow Lake ──────────────────────────────
  { id: 'cu9-285k',   name: 'Intel Core Ultra 9 285K',  asin: 'B0CQVQY9YK', neweggQ: 'Core+Ultra+9+285K',bbQ: 'core+ultra+9+285k', basePrice: 499 },
  { id: 'cu7-265k',   name: 'Intel Core Ultra 7 265K',  asin: 'B0CQVQY9ZK', neweggQ: 'Core+Ultra+7+265K',bbQ: 'core+ultra+7+265k', basePrice: 349 },
  { id: 'cu5-245k',   name: 'Intel Core Ultra 5 245K',  asin: 'B0CQVQYA2K', neweggQ: 'Core+Ultra+5+245K',bbQ: 'core+ultra+5+245k', basePrice: 259 },

  // ── Intel CPUs — 14th Gen ────────────────────────────────
  { id: 'i9-14900k',  name: 'Intel Core i9-14900K',     asin: 'B0CGJ41N2N', neweggQ: 'i9-14900K',        bbQ: 'i9-14900k',         basePrice: 399 },
  { id: 'i7-14700k',  name: 'Intel Core i7-14700K',     asin: 'B0CGJ3Y4M9', neweggQ: 'i7-14700K',        bbQ: 'i7-14700k',         basePrice: 319 },
  { id: 'i5-14600k',  name: 'Intel Core i5-14600K',     asin: 'B0CGJ3T7LH', neweggQ: 'i5-14600K',        bbQ: 'i5-14600k',         basePrice: 249 },

  // ── AMD CPUs — Ryzen 9000-Series ────────────────────────
  { id: 'r9-9950x',   name: 'AMD Ryzen 9 9950X',        asin: 'B0CTPNRGCM', neweggQ: 'Ryzen+9+9950X',    bbQ: 'ryzen+9+9950x',     basePrice: 649 },
  { id: 'r9-9900x',   name: 'AMD Ryzen 9 9900X',        asin: 'B0CTPNRGCL', neweggQ: 'Ryzen+9+9900X',    bbQ: 'ryzen+9+9900x',     basePrice: 449 },
  { id: 'r7-9700x',   name: 'AMD Ryzen 7 9700X',        asin: 'B0CTPNRGCK', neweggQ: 'Ryzen+7+9700X',    bbQ: 'ryzen+7+9700x',     basePrice: 329 },
  { id: 'r5-9600x',   name: 'AMD Ryzen 5 9600X',        asin: 'B0CTPNRGCJ', neweggQ: 'Ryzen+5+9600X',    bbQ: 'ryzen+5+9600x',     basePrice: 249 },

  // ── AMD CPUs — Ryzen 7000-Series ────────────────────────
  { id: 'r9-7950x',   name: 'AMD Ryzen 9 7950X',        asin: 'B0BBHHT8LY', neweggQ: 'Ryzen+9+7950X',    bbQ: 'ryzen+9+7950x',     basePrice: 549 },
  { id: 'r9-7900x',   name: 'AMD Ryzen 9 7900X',        asin: 'B0BBJ3V4TC', neweggQ: 'Ryzen+9+7900X',    bbQ: 'ryzen+9+7900x',     basePrice: 349 },
  { id: 'r7-7700x',   name: 'AMD Ryzen 7 7700X',        asin: 'B0BBJ9W5QY', neweggQ: 'Ryzen+7+7700X',    bbQ: 'ryzen+7+7700x',     basePrice: 279 },
  { id: 'r5-7600x',   name: 'AMD Ryzen 5 7600X',        asin: 'B0BBJDS62N', neweggQ: 'Ryzen+5+7600X',    bbQ: 'ryzen+5+7600x',     basePrice: 199 },
];

// ── UTILITY: HTTP GET ─────────────────────────────────────
function httpGet(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
  });
}

// ── ZENROWS FETCH ─────────────────────────────────────────
// يجلب صفحة ويب باستخدام ZenRows مع دعم JavaScript وAntiBot
async function zenrowsFetch(targetUrl, options = {}) {
  const params = new URLSearchParams({
    apikey:         ZENROWS_API_KEY,
    url:            targetUrl,
    js_render:      options.js_render      || 'false',
    antibot:        options.antibot        || 'true',
    premium_proxy:  options.premium_proxy  || 'true',
    wait:           options.wait           || '3000',
  });

  if (options.css_extractor) {
    params.set('css_extractor', JSON.stringify(options.css_extractor));
  }

  const zenUrl = `${ZENROWS_BASE}?${params.toString()}`;

  try {
    const { status, body } = await httpGet(zenUrl, 45000);
    if (status === 200) {
      try { return { ok: true, data: JSON.parse(body) }; }
      catch { return { ok: true, data: body }; }
    }
    return { ok: false, error: `HTTP ${status}`, body };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════
// AMAZON SCRAPER
// ══════════════════════════════════════════════════════════
async function scrapeAmazon(product) {
  const url = `https://www.amazon.com/dp/${product.asin}`;

  const result = await zenrowsFetch(url, {
    js_render:     'true',
    antibot:       'true',
    premium_proxy: 'true',
    wait:          '3000',
    css_extractor: {
      price_whole:    '#priceblock_ourprice .a-price-whole, .a-price[data-a-color="price"] .a-price-whole, #apex_desktop_newAccordionRow .a-price .a-price-whole, .a-price.a-text-price .a-price-whole',
      price_fraction: '.a-price[data-a-color="price"] .a-price-fraction, #apex_desktop_newAccordionRow .a-price .a-price-fraction',
      title:          '#productTitle',
      availability:   '#availability span',
      rating:         '#acrPopover .a-size-base',
      reviews:        '#acrCustomerReviewLink span',
      prime:          '#isPrimeBadge',
    },
  });

  if (!result.ok) {
    return { store: 'amazon', id: product.id, price: null, error: result.error, url };
  }

  const d = result.data || {};
  let price = null;

  // محاولة استخراج السعر من CSS extractor
  if (d.price_whole) {
    const whole    = String(Array.isArray(d.price_whole)    ? d.price_whole[0]    : d.price_whole).replace(/[^0-9]/g, '');
    const fraction = String(Array.isArray(d.price_fraction) ? d.price_fraction[0] : (d.price_fraction || '00')).replace(/[^0-9]/g, '');
    if (whole) price = parseFloat(`${whole}.${fraction || '00'}`);
  }

  // fallback: البحث في HTML الخام
  if (!price && typeof result.data === 'string') {
    price = extractPriceFromHTML(result.data, 'amazon');
  }

  return {
    store:        'amazon',
    id:           product.id,
    name:         product.name,
    price,
    url,
    asin:         product.asin,
    availability: Array.isArray(d.availability) ? d.availability[0] : d.availability,
    rating:       Array.isArray(d.rating)        ? d.rating[0]       : d.rating,
    reviews:      Array.isArray(d.reviews)       ? d.reviews[0]      : d.reviews,
    prime:        !!(d.prime),
    scraped_at:   new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════
// NEWEGG SCRAPER
// ══════════════════════════════════════════════════════════
async function scrapeNewegg(product) {
  const url = `https://www.newegg.com/p/pl?d=${product.neweggQ}&N=100007709`;

  const result = await zenrowsFetch(url, {
    js_render:     'true',
    antibot:       'true',
    premium_proxy: 'true',
    wait:          '4000',
    css_extractor: {
      prices:        '.price-current strong, .item-cell .price-current strong',
      titles:        '.item-title, .item-cell .item-title',
      links:         '.item-title[href], .item-cell .item-title[href]',
      ratings:       '.item-rating .rating, .item-cell .item-rating .rating',
      availability:  '.item-promo, .item-cell .item-promo',
    },
  });

  if (!result.ok) {
    return { store: 'newegg', id: product.id, price: null, error: result.error, url };
  }

  const d = result.data || {};
  let price = null;
  let productTitle = null;
  let productUrl = null;

  // استخراج أول سعر من القائمة
  if (d.prices) {
    const pricesArr = Array.isArray(d.prices) ? d.prices : [d.prices];
    for (const p of pricesArr) {
      const val = parseFloat(String(p).replace(/[^0-9.]/g, ''));
      if (val > 50) { price = val; break; }
    }
  }

  if (d.titles) {
    productTitle = Array.isArray(d.titles) ? d.titles[0] : d.titles;
  }
  if (d.links) {
    productUrl = Array.isArray(d.links) ? d.links[0] : d.links;
    if (productUrl && !productUrl.startsWith('http')) {
      productUrl = 'https://www.newegg.com' + productUrl;
    }
  }

  // fallback HTML
  if (!price && typeof result.data === 'string') {
    price = extractPriceFromHTML(result.data, 'newegg');
  }

  return {
    store:       'newegg',
    id:          product.id,
    name:        product.name,
    price,
    url:         productUrl || url,
    search_url:  url,
    title:       productTitle,
    scraped_at:  new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════
// BEST BUY SCRAPER
// ══════════════════════════════════════════════════════════
async function scrapeBestBuy(product) {
  const url = `https://www.bestbuy.com/site/searchpage.jsp?st=${product.bbQ}`;

  const result = await zenrowsFetch(url, {
    js_render:     'true',
    antibot:       'true',
    premium_proxy: 'true',
    wait:          '5000',
    css_extractor: {
      prices:       '.priceView-customer-price span[aria-hidden="true"], .sku-list-item-price .priceView-customer-price span',
      titles:       '.sku-header a, .sku-list-item-header a',
      links:        '.sku-header a[href], .sku-list-item-header a[href]',
      ratings:      '.c-ratings-reviews p, .customer-rating',
      availability: '.availability-status, .fulfillment-add-to-cart',
    },
  });

  if (!result.ok) {
    return { store: 'bestbuy', id: product.id, price: null, error: result.error, url };
  }

  const d = result.data || {};
  let price = null;
  let productTitle = null;
  let productUrl = null;

  if (d.prices) {
    const pricesArr = Array.isArray(d.prices) ? d.prices : [d.prices];
    for (const p of pricesArr) {
      const val = parseFloat(String(p).replace(/[,$]/g, ''));
      if (val > 50) { price = val; break; }
    }
  }

  if (d.titles) {
    productTitle = Array.isArray(d.titles) ? d.titles[0] : d.titles;
  }
  if (d.links) {
    let link = Array.isArray(d.links) ? d.links[0] : d.links;
    if (link && !link.startsWith('http')) {
      link = 'https://www.bestbuy.com' + link;
    }
    productUrl = link;
  }

  // fallback HTML
  if (!price && typeof result.data === 'string') {
    price = extractPriceFromHTML(result.data, 'bestbuy');
  }

  return {
    store:       'bestbuy',
    id:          product.id,
    name:        product.name,
    price,
    url:         productUrl || url,
    search_url:  url,
    title:       productTitle,
    scraped_at:  new Date().toISOString(),
  };
}

// ── PRICE EXTRACTION FROM RAW HTML ───────────────────────
function extractPriceFromHTML(html, store) {
  if (typeof html !== 'string') return null;

  const patterns = {
    amazon: [
      /"price":\s*"?\$?([\d,]+\.?\d*)"?/i,
      /class="a-price-whole"[^>]*>([0-9,]+)/,
      /"priceAmount":\s*([\d.]+)/,
      /\$\s*([\d,]+\.\d{2})/g,
    ],
    newegg: [
      /<strong[^>]*>\$([\d,]+)<\/strong>/,
      /"finalPrice":\s*([\d.]+)/,
      /price-current[^"]*"[^>]*>\$?([\d,]+\.?\d*)/i,
      /\$\s*([\d,]+\.\d{2})/g,
    ],
    bestbuy: [
      /"currentPrice":\s*([\d.]+)/,
      /"salePrice":\s*([\d.]+)/,
      /priceView-customer-price[^>]*>.*?\$([\d,]+\.?\d*)/is,
      /\$\s*([\d,]+\.\d{2})/g,
    ],
  };

  const storePatterns = patterns[store] || patterns.amazon;

  for (const pattern of storePatterns) {
    try {
      if (pattern.flags && pattern.flags.includes('g')) {
        const matches = [...html.matchAll(pattern)];
        if (matches.length > 0) {
          const prices = matches
            .map(m => parseFloat(m[1].replace(/,/g, '')))
            .filter(p => p > 50 && p < 50000)
            .sort((a, b) => a - b);
          if (prices.length > 0) return prices[0];
        }
      } else {
        const match = html.match(pattern);
        if (match) {
          const val = parseFloat(match[1].replace(/,/g, ''));
          if (val > 50 && val < 50000) return val;
        }
      }
    } catch { /* ignore */ }
  }
  return null;
}

// ══════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════

/**
 * جلب سعر منتج واحد من متجر واحد
 * @param {string} productId - معرّف المنتج (e.g. 'rtx4090')
 * @param {string} store     - 'amazon' | 'newegg' | 'bestbuy'
 */
async function fetchPrice(productId, store = 'amazon') {
  const product = PRODUCT_CATALOG.find(p => p.id === productId);
  if (!product) return { error: 'Product not found', id: productId };

  switch (store.toLowerCase()) {
    case 'amazon':  return scrapeAmazon(product);
    case 'newegg':  return scrapeNewegg(product);
    case 'bestbuy': return scrapeBestBuy(product);
    default:        return { error: `Unknown store: ${store}` };
  }
}

/**
 * جلب أسعار منتج واحد من جميع المتاجر الثلاثة
 * @param {string} productId
 */
async function fetchAllStores(productId) {
  const product = PRODUCT_CATALOG.find(p => p.id === productId);
  if (!product) return { error: 'Product not found', id: productId };

  const [amazon, newegg, bestbuy] = await Promise.allSettled([
    scrapeAmazon(product),
    scrapeNewegg(product),
    scrapeBestBuy(product),
  ]);

  const results = {
    id:         productId,
    name:       product.name,
    basePrice:  product.basePrice,
    stores: {
      amazon:  amazon.status  === 'fulfilled' ? amazon.value  : { error: amazon.reason?.message },
      newegg:  newegg.status  === 'fulfilled' ? newegg.value  : { error: newegg.reason?.message },
      bestbuy: bestbuy.status === 'fulfilled' ? bestbuy.value : { error: bestbuy.reason?.message },
    },
    scraped_at: new Date().toISOString(),
  };

  // أفضل سعر
  const prices = Object.values(results.stores)
    .map(s => s.price)
    .filter(p => p && p > 0);

  results.best_price = prices.length ? Math.min(...prices) : null;
  results.avg_price  = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;

  return results;
}

/**
 * جلب أسعار مجموعة من المنتجات من متجر واحد
 * @param {string[]} productIds - قائمة المعرّفات (أو 'all')
 * @param {string}   store      - 'amazon' | 'newegg' | 'bestbuy'
 * @param {number}   delay      - تأخير بين الطلبات (ms)
 */
async function fetchBatch(productIds = 'all', store = 'amazon', delay = 2000) {
  const ids = productIds === 'all'
    ? PRODUCT_CATALOG.map(p => p.id)
    : productIds;

  const results = [];
  for (const id of ids) {
    const result = await fetchPrice(id, store);
    results.push(result);
    if (delay > 0 && id !== ids[ids.length - 1]) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return results;
}

/**
 * جلب أسعار قائمة من المنتجات من جميع المتاجر (مع تأخير)
 * @param {string[]} productIds
 * @param {number}   delay
 */
async function fetchBatchAllStores(productIds = [], delay = 3000) {
  const results = [];
  for (const id of productIds) {
    const result = await fetchAllStores(id);
    results.push(result);
    if (delay > 0 && id !== productIds[productIds.length - 1]) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return results;
}

/**
 * اختبار ZenRows API
 */
async function testZenRows() {
  console.log('[ZenRows] Testing API connection...');
  // نستخدم example.com لأنها تعمل بدون JS rendering
  const testUrl = 'https://www.example.com';
  const params = new URLSearchParams({
    apikey: ZENROWS_API_KEY,
    url:    testUrl,
  });
  try {
    const { status, body } = await httpGet(`${ZENROWS_BASE}?${params.toString()}`, 15000);
    if (status === 200) {
      console.log('[ZenRows] ✓ API connection successful');
      return {
        ok:      true,
        status,
        message: 'ZenRows API متصل وجاهز',
        api_key: ZENROWS_API_KEY.slice(0, 8) + '...',
      };
    }
    // status 422 = يعمل لكن الصفحة تحتاج JS — المفتاح صالح
    if (status === 422) {
      console.log('[ZenRows] ✓ API key valid (site needs JS render)');
      return {
        ok:      true,
        status,
        message: 'ZenRows API متصل — المفتاح صالح',
        api_key: ZENROWS_API_KEY.slice(0, 8) + '...',
      };
    }
    // 401 = مفتاح غير صالح
    if (status === 401) {
      return { ok: false, status, error: 'مفتاح API غير صالح' };
    }
    console.log(`[ZenRows] ✗ API returned status ${status}: ${body.slice(0, 200)}`);
    return { ok: false, status, error: body.slice(0, 200) };
  } catch (err) {
    console.error('[ZenRows] ✗ Connection error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = {
  PRODUCT_CATALOG,
  fetchPrice,
  fetchAllStores,
  fetchBatch,
  fetchBatchAllStores,
  testZenRows,
  ZENROWS_API_KEY,
};
