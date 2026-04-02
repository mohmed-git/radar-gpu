// ============================================================
// GPU RADAR — Price Scraper (api/scrapers/priceScraper.js)
//
// يجلب الأسعار من مصادر متعددة:
// 1. Amazon Product Advertising API  (أسعار حقيقية)
// 2. Newegg via RapidAPI             (أسعار حقيقية)
// 3. PriceCharting API               (تاريخ الأسعار)
// 4. Fallback: محاكاة ذكية بناءً على السعر السابق
// ============================================================

const https = require('https');

// ── PRODUCT CATALOG ───────────────────────────────────────
// ASIN = معرّف المنتج على Amazon
// neweggId = معرّف المنتج على Newegg
const PRODUCT_CATALOG = [
  // GPUs — NVIDIA
  { id:'rtx4090',   name:'RTX 4090',         brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B0BG9XWGNG', neweggId:'N82E16814137781', basePrice:2199 },
  { id:'rtx4080s',  name:'RTX 4080 Super',    brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B0CSVNFKGQ', neweggId:'N82E16814137816', basePrice:999  },
  { id:'rtx4070ti', name:'RTX 4070 Ti Super', brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B0CRS8GZ7W', neweggId:'N82E16814137799', basePrice:779  },
  { id:'rtx4070s',  name:'RTX 4070 Super',    brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0CQNQLF3V', neweggId:'N82E16814137800', basePrice:599  },
  { id:'rtx4060ti', name:'RTX 4060 Ti',       brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0C5YTNBVT', neweggId:'N82E16814137768', basePrice:399  },
  { id:'rtx4060',   name:'RTX 4060',          brand:'NVIDIA', type:'GPU', tier:'budget',    asin:'B0C5YNKBT3', neweggId:'N82E16814137774', basePrice:299  },
  { id:'rtx3080',   name:'RTX 3080 12GB',     brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B09FMGPLL8', neweggId:'N82E16814137609', basePrice:449  },

  // GPUs — AMD
  { id:'rx7900xtx', name:'RX 7900 XTX',       brand:'AMD',    type:'GPU', tier:'flagship',  asin:'B0BLP619C5', neweggId:'N82E16814105612', basePrice:879  },
  { id:'rx7900xt',  name:'RX 7900 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  asin:'B0BLP619C4', neweggId:'N82E16814105613', basePrice:699  },
  { id:'rx7800xt',  name:'RX 7800 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', asin:'B0CF7MHR2H', neweggId:'N82E16814105661', basePrice:449  },
  { id:'rx7700xt',  name:'RX 7700 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', asin:'B0CF7MHR2G', neweggId:'N82E16814105662', basePrice:349  },
  { id:'rx7600',    name:'RX 7600',           brand:'AMD',    type:'GPU', tier:'budget',    asin:'B0C4KHXWK8', neweggId:'N82E16814105627', basePrice:269  },

  // CPUs — Intel
  { id:'i9-14900k', name:'Core i9-14900K', brand:'Intel', type:'CPU', tier:'flagship',  asin:'B0CGJ41N2N', neweggId:'N82E16819118428', basePrice:419 },
  { id:'i7-14700k', name:'Core i7-14700K', brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0CGJ3Y4M9', neweggId:'N82E16819118429', basePrice:329 },
  { id:'i5-14600k', name:'Core i5-14600K', brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CGJ3T7LH', neweggId:'N82E16819118430', basePrice:249 },
  { id:'i5-14400',  name:'Core i5-14400',  brand:'Intel', type:'CPU', tier:'budget',    asin:'B0CGJ41N1F', neweggId:'N82E16819118431', basePrice:189 },
  { id:'i3-14100',  name:'Core i3-14100',  brand:'Intel', type:'CPU', tier:'entry',     asin:'B0CGJ3Y4J8', neweggId:'N82E16819118432', basePrice:129 },

  // CPUs — AMD Ryzen
  { id:'r9-7950x',  name:'Ryzen 9 7950X',  brand:'AMD', type:'CPU', tier:'flagship',  asin:'B0BBHD5D8Y', neweggId:'N82E16819113778', basePrice:549 },
  { id:'r9-7900x',  name:'Ryzen 9 7900X',  brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0BBHHTBM4', neweggId:'N82E16819113779', basePrice:349 },
  { id:'r7-7700x',  name:'Ryzen 7 7700X',  brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0BBHD5D8Z', neweggId:'N82E16819113780', basePrice:249 },
  { id:'r5-7600x',  name:'Ryzen 5 7600X',  brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0BBHHTBM5', neweggId:'N82E16819113781', basePrice:179 },
  { id:'r5-7500f',  name:'Ryzen 5 7500F',  brand:'AMD', type:'CPU', tier:'budget',    asin:'B0C5T4LJMZ', neweggId:'N82E16819113795', basePrice:149 },
];

// ── AMAZON API SCRAPER ────────────────────────────────────
async function fetchFromAmazon(product) {
  // يتطلب: AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_PARTNER_TAG
  // الوثائق: https://webservices.amazon.com/paapi5/documentation/
  if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
    return null; // Skip if not configured
  }

  try {
    // Amazon PA-API v5 — GetItems endpoint
    const payload = JSON.stringify({
      ItemIds: [product.asin],
      Resources: ['Offers.Listings.Price', 'Offers.Listings.SavingBasis'],
      PartnerTag: process.env.AWS_PARTNER_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    });

    // NOTE: Amazon PA-API requires AWS Signature V4 signing
    // Use the 'paapi5-nodejs-sdk' npm package for production:
    // npm install paapi5-nodejs-sdk
    const response = await fetch('https://webservices.amazon.com/paapi5/getitems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
        'Content-Encoding': 'amz-1.0',
      },
      body: payload
    });

    const data = await response.json();
    const item = data?.ItemsResult?.Items?.[0];
    const listing = item?.Offers?.Listings?.[0];
    const price = listing?.Price?.Amount;

    if (price) {
      console.log(`[Amazon] ${product.name}: $${price}`);
      return parseFloat(price);
    }
  } catch (err) {
    console.error(`[Amazon] Error for ${product.name}:`, err.message);
  }
  return null;
}

// ── NEWEGG SCRAPER ────────────────────────────────────────
async function fetchFromNewegg(product) {
  // يتطلب: RAPIDAPI_KEY مع اشتراك Newegg API
  // https://rapidapi.com/newegg/api/newegg-product-api
  if (!process.env.RAPIDAPI_KEY) return null;

  try {
    const response = await fetch(
      `https://newegg-product-api.p.rapidapi.com/api/product/GetProductDetails?itemNumber=${product.neweggId}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'newegg-product-api.p.rapidapi.com'
        }
      }
    );
    const data = await response.json();
    const price = data?.FinalPrice || data?.UnitPrice;

    if (price) {
      console.log(`[Newegg] ${product.name}: $${price}`);
      return parseFloat(price);
    }
  } catch (err) {
    console.error(`[Newegg] Error for ${product.name}:`, err.message);
  }
  return null;
}

// ── GOOGLE SHOPPING SCRAPER ───────────────────────────────
async function fetchFromGoogleShopping(product) {
  // يتطلب: SERPAPI_KEY
  // https://serpapi.com/google-shopping-api
  if (!process.env.SERPAPI_KEY) return null;

  try {
    const query = encodeURIComponent(`${product.brand} ${product.name} buy`);
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&api_key=${process.env.SERPAPI_KEY}&gl=us&hl=en`;

    const response = await fetch(url);
    const data = await response.json();
    const results = data?.shopping_results;

    if (results && results.length > 0) {
      // Get the lowest price from top 5 results
      const prices = results
        .slice(0, 5)
        .map(r => parseFloat(r.price?.replace(/[^0-9.]/g, '')))
        .filter(p => !isNaN(p) && p > 50);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        console.log(`[GoogleShopping] ${product.name}: $${minPrice}`);
        return minPrice;
      }
    }
  } catch (err) {
    console.error(`[GoogleShopping] Error for ${product.name}:`, err.message);
  }
  return null;
}

// ── SMART SIMULATION (Fallback) ───────────────────────────
// يُستخدم عندما لا تتوفر API Keys
// يُحاكي تحركات السعر الواقعية بناءً على أنماط السوق
function simulateRealisticPrice(product, currentPrice) {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const dayOfWeek = now.getDay(); // 0=Sunday

  // Market patterns:
  // - أسعار GPU ترتفع في بداية الشهر (رواتب)
  // - خصومات نهاية الأسبوع أحياناً
  // - موجات انخفاض عند إطلاق منتجات جديدة (محاكاة)

  let changePercent = (Math.random() - 0.52) * 4; // Slight downward bias

  // Seasonal: Black Friday (Nov) = انخفاض 5-15%
  if (month === 10) changePercent -= Math.random() * 3;

  // Weekend slight discount
  if (dayOfWeek === 0 || dayOfWeek === 6) changePercent -= Math.random() * 0.5;

  // Market floor: لا ينخفض أكثر من 40% عن السعر الأساسي
  const floor = product.basePrice * 0.6;
  // Market ceiling: لا يرتفع أكثر من 50% عن السعر الأساسي
  const ceiling = product.basePrice * 1.5;

  let newPrice = currentPrice * (1 + changePercent / 100);
  newPrice = Math.max(floor, Math.min(ceiling, newPrice));
  newPrice = Math.round(newPrice / 5) * 5; // Round to nearest $5

  return newPrice;
}

// ── MAIN FETCH FUNCTION ───────────────────────────────────
async function fetchPrice(product, currentPrice) {
  console.log(`\n[Scraper] Fetching price for: ${product.name}`);

  // Try real sources in order of preference
  let price = null;

  price = await fetchFromAmazon(product);
  if (!price) price = await fetchFromNewegg(product);
  if (!price) price = await fetchFromGoogleShopping(product);

  // Fallback to smart simulation
  if (!price) {
    price = simulateRealisticPrice(product, currentPrice);
    console.log(`[Simulation] ${product.name}: $${price} (${calcChangePercent(currentPrice, price)}%)`);
  }

  return price;
}

function calcChangePercent(old, newVal) {
  return ((newVal - old) / old * 100).toFixed(2);
}

module.exports = { PRODUCT_CATALOG, fetchPrice, simulateRealisticPrice };
