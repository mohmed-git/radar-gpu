// ============================================================
// GPU RADAR — Pricing Intelligence Engine  v1.0
// api/priceAnalyzer.js
//
// Implements the pricing intelligence prompt:
//   - Evaluates multiple retailer offers for a product
//   - Filters out Used / Refurbished / Open-Box
//   - Validates against internal catalog pricing history
//   - Returns structured JSON verdict (best_price, deal_status, etc.)
// ============================================================

const { PRODUCT_CATALOG } = require('./scrapers/freeScraper');

// ── TRUSTED RETAILERS ─────────────────────────────────────
const TRUSTED_RETAILERS = [
  { name: 'amazon',   aliases: ['amazon', 'amazon.com', 'amzn']          },
  { name: 'newegg',   aliases: ['newegg', 'newegg.com', 'www.newegg.com'] },
  { name: 'bhphoto',  aliases: ["b&h", 'bhphoto', 'bhphotovideo', 'b&h photo'] },
  { name: 'bestbuy',  aliases: ['bestbuy', 'best buy', 'bestbuy.com']     },
  { name: 'walmart',  aliases: ['walmart', 'walmart.com']                  },
  { name: 'adorama',  aliases: ['adorama', 'adorama.com']                  },
  { name: 'microcenter', aliases: ['microcenter', 'micro center']          },
  { name: 'costco',   aliases: ['costco', 'costco.com']                    },
];

const CONDITION_BLACKLIST = [
  'used', 'refurbished', 'refurb', 'open box', 'open-box',
  'openbox', 'renewed', 'pre-owned', 'marketplace', 'seller:',
  'third party', 'third-party', 'جديد مستعمل', 'مجدد', 'مستعمل',
];

// Minimum rating threshold for marketplace sellers
const MIN_SELLER_RATING = 95; // percent

// ── HELPERS ───────────────────────────────────────────────

/**
 * Normalize a store name string to a canonical name
 */
function normalizeStore(store) {
  if (!store) return store;
  const lower = store.toLowerCase().trim();
  for (const r of TRUSTED_RETAILERS) {
    if (r.aliases.some(a => lower.includes(a))) return r.name;
  }
  return lower;
}

/**
 * Check if an offer description contains blacklisted condition keywords
 */
function isBlacklistedCondition(offer) {
  const text = [
    offer.condition || '',
    offer.title     || '',
    offer.notes     || '',
    offer.seller    || '',
  ].join(' ').toLowerCase();

  return CONDITION_BLACKLIST.some(kw => text.includes(kw));
}

/**
 * Determine if a retailer is trusted
 */
function isTrustedRetailer(store) {
  if (!store) return false;
  const lower = store.toLowerCase().trim();
  return TRUSTED_RETAILERS.some(r => r.aliases.some(a => lower.includes(a)));
}

/**
 * Find catalog product by name match
 */
function findCatalogProduct(productName) {
  if (!productName) return null;
  const lower = productName.toLowerCase();
  // Exact match first
  let match = PRODUCT_CATALOG.find(p => p.name.toLowerCase() === lower);
  if (match) return match;
  // Partial match
  match = PRODUCT_CATALOG.find(p => lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower));
  if (match) return match;
  // Keyword match
  for (const p of PRODUCT_CATALOG) {
    if (p.keywords && p.keywords.every(kw => lower.includes(kw.toLowerCase()))) {
      return p;
    }
  }
  return null;
}

/**
 * Calculate price trend based on catalog history context
 */
function determineTrend(currentBestPrice, catalogProduct) {
  if (!catalogProduct) return 'stable';
  const base  = catalogProduct.basePrice;
  const ratio = currentBestPrice / base;
  if (ratio < 0.92)  return 'dropping';
  if (ratio > 1.08)  return 'rising';
  return 'stable';
}

/**
 * Determine deal status relative to reference price
 */
function determineDealStatus(bestPrice, referencePrice, avgPrice) {
  const vsRef = (bestPrice / referencePrice) - 1;  // negative = below reference
  const vsAvg = avgPrice ? (bestPrice / avgPrice) - 1 : vsRef;

  if (vsRef <= -0.08 || vsAvg <= -0.08) return 'good deal';
  if (vsRef >= 0.08  || vsAvg >= 0.08)  return 'overpriced';
  return 'normal price';
}

/**
 * Validate that a price makes sense for the product
 * Returns false if price seems fake/outlier
 */
function isPriceSane(price, catalogProduct) {
  if (!price || isNaN(price) || price <= 0) return false;
  if (!catalogProduct) return price > 0 && price < 100000;

  const base = catalogProduct.basePrice;
  const min  = base * 0.40;  // allow up to 60% discount (clearance)
  const max  = base * 2.20;  // allow up to 120% premium (scalper)
  return price >= min && price <= max;
}

// ── MAIN ANALYZER FUNCTION ────────────────────────────────

/**
 * Analyzes a list of offers and returns a pricing intelligence verdict.
 *
 * @param {string} productName   - Product name string (e.g. "RTX 5090")
 * @param {Array}  offers        - Array of offer objects:
 *   {
 *     store:     string,   // retailer name
 *     price:     number,   // price in USD
 *     condition: string,   // "new"|"used"|"refurbished"|... (optional)
 *     link:      string,   // product URL (optional)
 *     seller:    string,   // marketplace seller name (optional)
 *     rating:    number,   // seller rating 0-100 (optional)
 *     title:     string,   // full product title (optional)
 *     notes:     string,   // any extra info (optional)
 *   }
 * @param {object} options
 *   {
 *     currentDbPrice: number,  // current price from our DB (optional)
 *     dbHistory:      array,   // price history from DB (optional)
 *   }
 * @returns {object} Pricing intelligence verdict
 */
function analyzeOffers(productName, offers, options = {}) {

  // ── 1. Validate inputs ───────────────────────────────────
  if (!productName || !Array.isArray(offers) || offers.length === 0) {
    return { error: 'insufficient reliable data' };
  }

  // ── 2. Find catalog reference product ───────────────────
  const catalogProduct = findCatalogProduct(productName);

  // ── 3. Filter valid offers ───────────────────────────────
  const filtered = [];
  const rejectedReasons = [];

  for (const offer of offers) {
    const price = parseFloat(offer.price);

    // Rule 1: Must have a valid numeric price
    if (!price || isNaN(price) || price <= 0) {
      rejectedReasons.push(`${offer.store || 'unknown'}: invalid price`);
      continue;
    }

    // Rule 2: Exclude blacklisted conditions
    if (isBlacklistedCondition(offer)) {
      rejectedReasons.push(`${offer.store || 'unknown'}: non-new condition`);
      continue;
    }

    // Rule 3: Exclude low-rated marketplace sellers
    if (offer.rating !== undefined && offer.rating < MIN_SELLER_RATING) {
      rejectedReasons.push(`${offer.store || 'unknown'}: low seller rating (${offer.rating}%)`);
      continue;
    }

    // Rule 4: Price sanity check
    if (!isPriceSane(price, catalogProduct)) {
      rejectedReasons.push(`${offer.store || 'unknown'}: price $${price} out of valid range`);
      continue;
    }

    // Mark trust level
    const trusted = isTrustedRetailer(offer.store);
    filtered.push({
      ...offer,
      price,
      store_normalized: normalizeStore(offer.store),
      trusted,
    });
  }

  // Need at least one valid offer
  if (filtered.length === 0) {
    return {
      error: 'insufficient reliable data',
      details: `All ${offers.length} offer(s) rejected. Reasons: ${rejectedReasons.join('; ')}`,
    };
  }

  // ── 4. Sort by price ──────────────────────────────────────
  filtered.sort((a, b) => a.price - b.price);

  // ── 5. Identify best & lowest valid prices ───────────────
  // "best_price" = lowest price from a TRUSTED retailer
  // "lowest_valid_price" = absolute lowest from any valid offer
  const trustedOffers = filtered.filter(o => o.trusted);
  const bestOffer     = trustedOffers.length > 0 ? trustedOffers[0] : filtered[0];
  const lowestOffer   = filtered[0];

  // ── 6. Compute average market price ──────────────────────
  // Use all valid offers for average; weight trusted stores more
  const weightedPrices = filtered.map(o => o.trusted ? [o.price, o.price] : [o.price]).flat();
  const avgPrice = Math.round(
    weightedPrices.reduce((s, p) => s + p, 0) / weightedPrices.length
  );

  // ── 7. Reference price for deal status ───────────────────
  // Priority: DB current price > catalog base price > avg of offers
  const referencePrice =
    options.currentDbPrice ||
    catalogProduct?.basePrice ||
    avgPrice;

  // ── 8. Determine trend ────────────────────────────────────
  const trend = determineTrend(bestOffer.price, catalogProduct);

  // ── 9. Determine deal status ──────────────────────────────
  const dealStatus = determineDealStatus(bestOffer.price, referencePrice, avgPrice);

  // ── 10. Build notes ───────────────────────────────────────
  const notesParts = [];

  if (catalogProduct) {
    notesParts.push(`السعر المرجعي للكتالوج: $${catalogProduct.basePrice.toLocaleString()}`);
  }
  if (options.currentDbPrice) {
    notesParts.push(`آخر سعر موثق في قاعدة البيانات: $${options.currentDbPrice.toLocaleString()}`);
  }
  if (rejectedReasons.length > 0) {
    notesParts.push(`عروض مستبعدة (${rejectedReasons.length}): ${rejectedReasons.join('; ')}`);
  }
  if (!bestOffer.trusted && trustedOffers.length === 0) {
    notesParts.push('⚠️ لا توجد عروض من متاجر موثوقة. التحقق اليدوي موصى به.');
  }
  if (bestOffer.price < referencePrice * 0.75) {
    notesParts.push('⚠️ السعر منخفض بشكل لافت. تحقق من صحة العرض قبل الشراء.');
  }
  const savings = referencePrice - bestOffer.price;
  if (savings > 0) {
    const pct = ((savings / referencePrice) * 100).toFixed(1);
    notesParts.push(`توفير محتمل: $${savings.toLocaleString()} (${pct}% أقل من السعر المرجعي)`);
  }

  // ── 11. Return verdict ────────────────────────────────────
  return {
    product_name: catalogProduct ? catalogProduct.name : productName,
    best_price: {
      price: bestOffer.price,
      store: bestOffer.store_normalized || bestOffer.store,
      link:  bestOffer.link || null,
    },
    lowest_valid_price: {
      price: lowestOffer.price,
      store: lowestOffer.store_normalized || lowestOffer.store,
      link:  lowestOffer.link || null,
    },
    average_market_price: avgPrice,
    reference_price:      referencePrice,
    price_trend:          trend,
    deal_status:          dealStatus,
    valid_offers_count:   filtered.length,
    total_offers_count:   offers.length,
    notes:                notesParts.join(' | '),
    analyzed_at:          new Date().toISOString(),
  };
}

// ── QUICK ANALYZE (single product from DB) ───────────────
/**
 * Quick analyze a single product by ID using only our DB data.
 * Returns a verdict about the current DB price vs historical data.
 */
function analyzeFromDB(partId, dbEntry, history) {
  if (!dbEntry) return { error: 'insufficient reliable data' };

  const catalogProduct = PRODUCT_CATALOG.find(p => p.id === partId);
  const currentPrice   = dbEntry.price;
  const basePrice      = catalogProduct?.basePrice || currentPrice;

  // Compute trend from history
  let trend = 'stable';
  if (history && history.length >= 2) {
    const recent = history.slice(-3).map(h => h.price);
    const older  = history.slice(-7, -3).map(h => h.price);
    if (recent.length && older.length) {
      const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
      const avgOlder  = older.reduce((a, b) => a + b, 0) / older.length;
      const diff = (avgRecent - avgOlder) / avgOlder;
      if (diff < -0.04) trend = 'dropping';
      else if (diff > 0.04) trend = 'rising';
    }
  }

  const dealStatus = determineDealStatus(currentPrice, basePrice, dbEntry.low52 ? (basePrice + dbEntry.low52) / 2 : null);
  const isLow52    = currentPrice <= (dbEntry.low52 || basePrice * 0.72);

  const notesParts = [];
  if (isLow52) notesParts.push('🔥 السعر عند أدنى مستوياته في 52 أسبوعاً!');
  if (dealStatus === 'good deal') notesParts.push(`وفر $${(basePrice - currentPrice).toFixed(0)} مقارنة بالسعر الأساسي`);
  if (trend === 'dropping') notesParts.push('📉 الأسعار في انخفاض — قد يكون الانتظار مجدياً');
  if (trend === 'rising')   notesParts.push('📈 الأسعار في ارتفاع — الشراء الآن قد يكون أفضل');

  return {
    product_name:           dbEntry.name,
    best_price: {
      price: currentPrice,
      store: 'gpu-radar-db',
      link:  dbEntry.newegg || null,
    },
    lowest_valid_price: {
      price: dbEntry.low52 || currentPrice,
      store: 'historical-low',
      link:  null,
    },
    average_market_price:   Math.round(basePrice),
    reference_price:        basePrice,
    price_trend:            trend,
    deal_status:            dealStatus,
    is_52week_low:          isLow52,
    is_52week_high:         currentPrice >= (dbEntry.high52 || basePrice * 1.35),
    change_pct:             dbEntry.prev ? parseFloat(((currentPrice - dbEntry.prev) / dbEntry.prev * 100).toFixed(2)) : 0,
    notes:                  notesParts.join(' | '),
    analyzed_at:            new Date().toISOString(),
  };
}

module.exports = { analyzeOffers, analyzeFromDB, findCatalogProduct, normalizeStore };
