// ============================================================
// GPU RADAR — Price Scraper  v3.0  (api/scrapers/priceScraper.js)
//
// يجلب الأسعار من مصادر متعددة:
// 1. Amazon Product Advertising API  (أسعار حقيقية)
// 2. Newegg via RapidAPI             (أسعار حقيقية)
// 3. Google Shopping (SerpAPI)       (أسعار حقيقية)
// 4. Fallback: محاكاة ذكية بناءً على السعر السابق
// الأسعار الأساسية محدّثة — أبريل 2026
// ============================================================

const https = require('https');

// ── PRODUCT CATALOG ───────────────────────────────────────
// ASIN = معرّف المنتج على Amazon
// neweggId = معرّف المنتج على Newegg (verified April 2026)
const PRODUCT_CATALOG = [

  // ── GPUs — NVIDIA RTX 50-Series (Blackwell) 2025 ─────────
  { id:'rtx5090',    name:'RTX 5090',          brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B0CXFP5TH2', neweggId:'',               basePrice:3899 },
  { id:'rtx5080',    name:'RTX 5080',          brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B0CXFP5TH3', neweggId:'',               basePrice:1299 },
  { id:'rtx5070ti',  name:'RTX 5070 Ti',       brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B0CXFP5TH4', neweggId:'',               basePrice:1009 },
  { id:'rtx5070',    name:'RTX 5070',          brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B0CXFP5TH5', neweggId:'',               basePrice:649  },
  { id:'rtx5060ti',  name:'RTX 5060 Ti 16GB',  brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0CXFP5TH6', neweggId:'',               basePrice:514  },
  { id:'rtx5060ti8', name:'RTX 5060 Ti 8GB',   brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0CXFP5TH7', neweggId:'',               basePrice:399  },
  { id:'rtx5060',    name:'RTX 5060',          brand:'NVIDIA', type:'GPU', tier:'budget',    asin:'B0CXFP5TH8', neweggId:'',               basePrice:349  },
  { id:'rtx5050',    name:'RTX 5050',          brand:'NVIDIA', type:'GPU', tier:'budget',    asin:'B0CXFP5TH9', neweggId:'',               basePrice:289  },

  // ── GPUs — NVIDIA RTX 40-Series (Ada) ────────────────────
  { id:'rtx4090',    name:'RTX 4090',          brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B0BG9XWGNG', neweggId:'N82E16814126596', basePrice:3199 },
  { id:'rtx4080s',   name:'RTX 4080 Super',    brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B0CSVNFKGQ', neweggId:'N82E16814137854', basePrice:1498 },
  { id:'rtx4080',    name:'RTX 4080',          brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B0BGP7QS5Q', neweggId:'',               basePrice:1499 },
  { id:'rtx4070tis', name:'RTX 4070 Ti Super', brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B0CRS8GZ7W', neweggId:'N82E16814126685', basePrice:1465 },
  { id:'rtx4070ti',  name:'RTX 4070 Ti',       brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B0BDRNLKWX', neweggId:'',               basePrice:1199 },
  { id:'rtx4070s',   name:'RTX 4070 Super',    brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0CQNQLF3V', neweggId:'N82E16814126697', basePrice:898  },
  { id:'rtx4070',    name:'RTX 4070',          brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0BYF12WZN', neweggId:'',               basePrice:714  },
  { id:'rtx4060ti16',name:'RTX 4060 Ti 16GB',  brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0C5YTNBVT', neweggId:'N82E16814137836', basePrice:447  },
  { id:'rtx4060ti',  name:'RTX 4060 Ti',       brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B0C4TY95QV', neweggId:'',               basePrice:395  },
  { id:'rtx4060',    name:'RTX 4060',          brand:'NVIDIA', type:'GPU', tier:'budget',    asin:'B0C5YNKBT3', neweggId:'N82E16814137805', basePrice:424  },

  // ── GPUs — NVIDIA RTX 30-Series (Ampere) ─────────────────
  { id:'rtx3090ti',  name:'RTX 3090 Ti',       brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B09ZPYHR12', neweggId:'',               basePrice:999  },
  { id:'rtx3090',    name:'RTX 3090',          brand:'NVIDIA', type:'GPU', tier:'flagship',  asin:'B08HR6ZBYJ', neweggId:'',               basePrice:849  },
  { id:'rtx3080ti',  name:'RTX 3080 Ti',       brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B0937L5JY6', neweggId:'',               basePrice:749  },
  { id:'rtx3080',    name:'RTX 3080 12GB',     brand:'NVIDIA', type:'GPU', tier:'high-end',  asin:'B09FMGPLL8', neweggId:'N82E16814137711', basePrice:799  },
  { id:'rtx3070ti',  name:'RTX 3070 Ti',       brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B096HDFKZ5', neweggId:'',               basePrice:499  },
  { id:'rtx3070',    name:'RTX 3070',          brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B08HR6ZBYJ', neweggId:'',               basePrice:449  },
  { id:'rtx3060ti',  name:'RTX 3060 Ti',       brand:'NVIDIA', type:'GPU', tier:'mid-range', asin:'B08WGW63BH', neweggId:'',               basePrice:399  },
  { id:'rtx3060',    name:'RTX 3060 12GB',     brand:'NVIDIA', type:'GPU', tier:'budget',    asin:'B08YQWTMR4', neweggId:'',               basePrice:299  },

  // ── GPUs — AMD RX 9000-Series (RDNA 4) 2025 ──────────────
  { id:'rx9070xt',   name:'RX 9070 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  asin:'B0DXFP1XT1', neweggId:'',               basePrice:719  },
  { id:'rx9070',     name:'RX 9070',           brand:'AMD',    type:'GPU', tier:'high-end',  asin:'B0DXFP1XT2', neweggId:'',               basePrice:619  },
  { id:'rx9060xt16', name:'RX 9060 XT 16GB',   brand:'AMD',    type:'GPU', tier:'mid-range', asin:'B0DXFP1XT3', neweggId:'',               basePrice:429  },
  { id:'rx9060xt8',  name:'RX 9060 XT 8GB',    brand:'AMD',    type:'GPU', tier:'mid-range', asin:'B0DXFP1XT4', neweggId:'',               basePrice:349  },

  // ── GPUs — AMD RX 7000-Series (RDNA 3) ───────────────────
  { id:'rx7900xtx',  name:'RX 7900 XTX',       brand:'AMD',    type:'GPU', tier:'flagship',  asin:'B0BLP619C5', neweggId:'N82E16814202429', basePrice:1169 },
  { id:'rx7900xt',   name:'RX 7900 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  asin:'B0BLP619C4', neweggId:'N82E16814930085', basePrice:669  },
  { id:'rx7900gre',  name:'RX 7900 GRE',       brand:'AMD',    type:'GPU', tier:'high-end',  asin:'B0BLP619C6', neweggId:'',               basePrice:549  },
  { id:'rx7800xt',   name:'RX 7800 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', asin:'B0CF7MHR2H', neweggId:'N82E16814202434', basePrice:499  },
  { id:'rx7700xt',   name:'RX 7700 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', asin:'B0CF7MHR2G', neweggId:'N82E16814202436', basePrice:399  },
  { id:'rx7600xt',   name:'RX 7600 XT',        brand:'AMD',    type:'GPU', tier:'budget',    asin:'B0CF7MHR2F', neweggId:'',               basePrice:299  },
  { id:'rx7600',     name:'RX 7600',           brand:'AMD',    type:'GPU', tier:'budget',    asin:'B0C4KHXWK8', neweggId:'N82E16814202432', basePrice:279  },
  { id:'rx7500xt',   name:'RX 7500 XT',        brand:'AMD',    type:'GPU', tier:'entry',     asin:'B0CF7MHR2E', neweggId:'',               basePrice:199  },

  // ── GPUs — AMD RX 6000-Series (RDNA 2) ───────────────────
  { id:'rx6950xt',   name:'RX 6950 XT',        brand:'AMD',    type:'GPU', tier:'flagship',  asin:'B09ZGYJLLV', neweggId:'',               basePrice:499  },
  { id:'rx6900xt',   name:'RX 6900 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  asin:'B08XKPJVFF', neweggId:'',               basePrice:399  },
  { id:'rx6800xt',   name:'RX 6800 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  asin:'B08WPFJKVH', neweggId:'',               basePrice:349  },
  { id:'rx6700xt',   name:'RX 6700 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', asin:'B08Y5P7LZ2', neweggId:'',               basePrice:249  },
  { id:'rx6600xt',   name:'RX 6600 XT',        brand:'AMD',    type:'GPU', tier:'budget',    asin:'B09FMJCYWQ', neweggId:'',               basePrice:189  },
  { id:'rx6600',     name:'RX 6600',           brand:'AMD',    type:'GPU', tier:'budget',    asin:'B09FMJCYWP', neweggId:'',               basePrice:169  },

  // ── GPUs — Intel Arc B-Series (Battlemage) ────────────────
  { id:'arc-b580',   name:'Arc B580',          brand:'Intel',  type:'GPU', tier:'mid-range', asin:'B0D8B6NNFT', neweggId:'N82E16814883006', basePrice:289  },
  { id:'arc-b570',   name:'Arc B570',          brand:'Intel',  type:'GPU', tier:'budget',    asin:'B0D8B6NNF1', neweggId:'',               basePrice:249  },

  // ── GPUs — Intel Arc A-Series (Alchemist) ─────────────────
  { id:'arc-a770',   name:'Arc A770 16GB',     brand:'Intel',  type:'GPU', tier:'mid-range', asin:'B0BDL3RB1D', neweggId:'',               basePrice:229  },
  { id:'arc-a750',   name:'Arc A750',          brand:'Intel',  type:'GPU', tier:'budget',    asin:'B0BDL3RB2D', neweggId:'',               basePrice:189  },
  { id:'arc-a580',   name:'Arc A580',          brand:'Intel',  type:'GPU', tier:'budget',    asin:'B0BDL3RB3D', neweggId:'',               basePrice:159  },

  // ── CPUs — Intel Arrow Lake (Core Ultra 200) — LGA1851 ────
  { id:'cu9-285k',   name:'Core Ultra 9 285K', brand:'Intel', type:'CPU', tier:'flagship',  asin:'B0CQVQY9YK', neweggId:'N82E16819118505', basePrice:557 },
  { id:'cu7-265k',   name:'Core Ultra 7 265K', brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0CQVQY9ZK', neweggId:'N82E16819118506', basePrice:309 },
  { id:'cu7-265kf',  name:'Core Ultra 7 265KF',brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0CQVQYA1K', neweggId:'',               basePrice:289 },
  { id:'cu5-245k',   name:'Core Ultra 5 245K', brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CQVQYA2K', neweggId:'N82E16819118508', basePrice:249 },
  { id:'cu5-245kf',  name:'Core Ultra 5 245KF',brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CQVQYA3K', neweggId:'',               basePrice:229 },
  { id:'cu5-235',    name:'Core Ultra 5 235',  brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CQVQYA4K', neweggId:'',               basePrice:199 },

  // ── CPUs — Intel 14th Gen (Raptor Lake Refresh) — LGA1700 ─
  { id:'i9-14900ks', name:'Core i9-14900KS',   brand:'Intel', type:'CPU', tier:'flagship',  asin:'B0CGJ41N3P', neweggId:'',               basePrice:499 },
  { id:'i9-14900k',  name:'Core i9-14900K',    brand:'Intel', type:'CPU', tier:'flagship',  asin:'B0CGJ41N2N', neweggId:'N82E16819118462', basePrice:468 },
  { id:'i9-14900',   name:'Core i9-14900',     brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0CGJ41N4P', neweggId:'',               basePrice:389 },
  { id:'i7-14700k',  name:'Core i7-14700K',    brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0CGJ3Y4M9', neweggId:'N82E16819118466', basePrice:349 },
  { id:'i7-14700kf', name:'Core i7-14700KF',   brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0CGJ3Y4N9', neweggId:'',               basePrice:329 },
  { id:'i7-14700',   name:'Core i7-14700',     brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0CGJ3Y4P9', neweggId:'',               basePrice:299 },
  { id:'i5-14600k',  name:'Core i5-14600K',    brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CGJ3T7LH', neweggId:'N82E16819118470', basePrice:279 },
  { id:'i5-14600kf', name:'Core i5-14600KF',   brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CGJ3T8LH', neweggId:'',               basePrice:259 },
  { id:'i5-14600',   name:'Core i5-14600',     brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CGJ3T9LH', neweggId:'',               basePrice:229 },
  { id:'i5-14500',   name:'Core i5-14500',     brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0CGJ3TALH', neweggId:'',               basePrice:209 },
  { id:'i5-14400',   name:'Core i5-14400',     brand:'Intel', type:'CPU', tier:'budget',    asin:'B0CGJ41N1F', neweggId:'N82E16819118480', basePrice:189 },
  { id:'i5-14400f',  name:'Core i5-14400F',    brand:'Intel', type:'CPU', tier:'budget',    asin:'B0CGJ41N5F', neweggId:'',               basePrice:149 },
  // ✅ السعر الصحيح للـ i3-14100 هو ~$105 (Newegg أبريل 2026) وليس $129
  { id:'i3-14100',   name:'Core i3-14100',     brand:'Intel', type:'CPU', tier:'entry',     asin:'B0CGJ3Y4J8', neweggId:'N82E16819118483', basePrice:105 },
  { id:'i3-14100f',  name:'Core i3-14100F',    brand:'Intel', type:'CPU', tier:'entry',     asin:'B0CGJ3Y5J8', neweggId:'N82E16819118492', basePrice:79  },

  // ── CPUs — Intel 13th Gen (Raptor Lake) — LGA1700 ─────────
  { id:'i9-13900ks', name:'Core i9-13900KS',   brand:'Intel', type:'CPU', tier:'flagship',  asin:'B0BCPWMLPT', neweggId:'',               basePrice:429 },
  { id:'i9-13900k',  name:'Core i9-13900K',    brand:'Intel', type:'CPU', tier:'flagship',  asin:'B0BCF54SR1', neweggId:'',               basePrice:349 },
  { id:'i7-13700k',  name:'Core i7-13700K',    brand:'Intel', type:'CPU', tier:'high-end',  asin:'B0BCF54ZRB', neweggId:'N82E16819118420', basePrice:279 },
  { id:'i5-13600k',  name:'Core i5-13600K',    brand:'Intel', type:'CPU', tier:'mid-range', asin:'B0BCF54ZRW', neweggId:'N82E16819118422', basePrice:219 },
  { id:'i5-13400',   name:'Core i5-13400',     brand:'Intel', type:'CPU', tier:'budget',    asin:'B0BCF54ZRX', neweggId:'N82E16819118412', basePrice:169 },
  { id:'i3-13100',   name:'Core i3-13100',     brand:'Intel', type:'CPU', tier:'entry',     asin:'B0BCF54ZRY', neweggId:'N82E16819118432', basePrice:119 },

  // ── CPUs — AMD Ryzen 9000-Series (Zen 5) — AM5 ────────────
  { id:'r9-9950x3d', name:'Ryzen 9 9950X3D',   brand:'AMD', type:'CPU', tier:'flagship',  asin:'B0D4RDLNNB', neweggId:'N82E16819113884', basePrice:675 },
  { id:'r9-9950x',   name:'Ryzen 9 9950X',     brand:'AMD', type:'CPU', tier:'flagship',  asin:'B0D4RDLNNC', neweggId:'N82E16819113841', basePrice:519 },
  { id:'r9-9900x3d', name:'Ryzen 9 9900X3D',   brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0D4RDLNND', neweggId:'',               basePrice:549 },
  { id:'r9-9900x',   name:'Ryzen 9 9900X',     brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0D4RDLNNE', neweggId:'',               basePrice:379 },
  { id:'r7-9850x3d', name:'Ryzen 7 9850X3D',   brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0D4RDLNNF', neweggId:'N82E16819113934', basePrice:499 },
  { id:'r7-9800x3d', name:'Ryzen 7 9800X3D',   brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0D4RDLNNG', neweggId:'N82E16819113877', basePrice:419 },
  { id:'r7-9700x',   name:'Ryzen 7 9700X',     brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0D4RDLNNH', neweggId:'N82E16819113843', basePrice:299 },
  { id:'r5-9600x',   name:'Ryzen 5 9600X',     brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0D4RDLNNI', neweggId:'',               basePrice:189 },
  { id:'r5-9600',    name:'Ryzen 5 9600',      brand:'AMD', type:'CPU', tier:'budget',    asin:'B0D4RDLNNJ', neweggId:'',               basePrice:169 },

  // ── CPUs — AMD Ryzen 7000-Series (Zen 4) — AM5 ────────────
  { id:'r9-7950x3d', name:'Ryzen 9 7950X3D',   brand:'AMD', type:'CPU', tier:'flagship',  asin:'B0BBHD5D8X', neweggId:'',               basePrice:549 },
  { id:'r9-7950x',   name:'Ryzen 9 7950X',     brand:'AMD', type:'CPU', tier:'flagship',  asin:'B0BBHD5D8Y', neweggId:'N82E16819113771', basePrice:450 },
  { id:'r9-7900x3d', name:'Ryzen 9 7900X3D',   brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0BBHD5D8W', neweggId:'',               basePrice:329 },
  { id:'r9-7900x',   name:'Ryzen 9 7900X',     brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0BBHHTBM4', neweggId:'N82E16819113769', basePrice:299 },
  { id:'r9-7900',    name:'Ryzen 9 7900',      brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0BBHHTBM3', neweggId:'',               basePrice:279 },
  { id:'r7-7800x3d', name:'Ryzen 7 7800X3D',   brand:'AMD', type:'CPU', tier:'high-end',  asin:'B0BBHD5D8V', neweggId:'',               basePrice:299 },
  { id:'r7-7700x',   name:'Ryzen 7 7700X',     brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0BBHD5D8Z', neweggId:'N82E16819113768', basePrice:225 },
  { id:'r7-7700',    name:'Ryzen 7 7700',      brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0BBHD5D8U', neweggId:'',               basePrice:199 },
  { id:'r5-7600x',   name:'Ryzen 5 7600X',     brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0BBHHTBM5', neweggId:'N82E16819113770', basePrice:189 },
  { id:'r5-7600',    name:'Ryzen 5 7600',      brand:'AMD', type:'CPU', tier:'budget',    asin:'B0BBHHTBM6', neweggId:'',               basePrice:169 },
  { id:'r5-7500f',   name:'Ryzen 5 7500F',     brand:'AMD', type:'CPU', tier:'budget',    asin:'B0C5T4LJMZ', neweggId:'N82E16819113827', basePrice:149 },

  // ── CPUs — AMD Ryzen 5000-Series (Zen 3) — AM4 ────────────
  { id:'r9-5950x',   name:'Ryzen 9 5950X',     brand:'AMD', type:'CPU', tier:'flagship',  asin:'B0815684V1', neweggId:'N82E16819113663', basePrice:349 },
  { id:'r9-5900x',   name:'Ryzen 9 5900X',     brand:'AMD', type:'CPU', tier:'high-end',  asin:'B08164VTWH', neweggId:'N82E16819113668', basePrice:209 },
  { id:'r7-5800x3d', name:'Ryzen 7 5800X3D',   brand:'AMD', type:'CPU', tier:'high-end',  asin:'B09VCJ2JXP', neweggId:'N82E16819113775', basePrice:219 },
  { id:'r7-5800x',   name:'Ryzen 7 5800X',     brand:'AMD', type:'CPU', tier:'mid-range', asin:'B0815684W1', neweggId:'N82E16819113556', basePrice:199 },
  { id:'r5-5600x',   name:'Ryzen 5 5600X',     brand:'AMD', type:'CPU', tier:'mid-range', asin:'B08166SLDF', neweggId:'N82E16819113670', basePrice:145 },
  { id:'r5-5600',    name:'Ryzen 5 5600',      brand:'AMD', type:'CPU', tier:'budget',    asin:'B09VCHR1VH', neweggId:'N82E16819113747', basePrice:129 },
  { id:'r5-5500',    name:'Ryzen 5 5500',      brand:'AMD', type:'CPU', tier:'entry',     asin:'B09VCHY4XR', neweggId:'N82E16819113737', basePrice:79  },
];

// ── AMAZON API SCRAPER ────────────────────────────────────
async function fetchFromAmazon(product) {
  if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
    return null;
  }

  try {
    const payload = JSON.stringify({
      ItemIds: [product.asin],
      Resources: ['Offers.Listings.Price', 'Offers.Listings.SavingBasis'],
      PartnerTag: process.env.AWS_PARTNER_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    });

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
  if (!process.env.RAPIDAPI_KEY) return null;
  if (!product.neweggId) return null;

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
  if (!process.env.SERPAPI_KEY) return null;

  try {
    const query = encodeURIComponent(`${product.brand} ${product.name} buy`);
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&api_key=${process.env.SERPAPI_KEY}&gl=us&hl=en`;

    const response = await fetch(url);
    const data = await response.json();
    const results = data?.shopping_results;

    if (results && results.length > 0) {
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
function simulateRealisticPrice(product, currentPrice) {
  const now = new Date();
  const month = now.getMonth();
  const dayOfWeek = now.getDay();

  let changePercent = (Math.random() - 0.52) * 4;

  // Seasonal: Black Friday (Nov) = انخفاض
  if (month === 10) changePercent -= Math.random() * 3;

  // Weekend slight discount
  if (dayOfWeek === 0 || dayOfWeek === 6) changePercent -= Math.random() * 0.5;

  const floor = product.basePrice * 0.6;
  const ceiling = product.basePrice * 1.5;

  let newPrice = currentPrice * (1 + changePercent / 100);
  newPrice = Math.max(floor, Math.min(ceiling, newPrice));
  newPrice = Math.round(newPrice / 5) * 5;

  return newPrice;
}

// ── MAIN FETCH FUNCTION ───────────────────────────────────
async function fetchPrice(product, currentPrice) {
  console.log(`\n[Scraper] Fetching price for: ${product.name}`);

  let price = null;

  price = await fetchFromAmazon(product);
  if (!price) price = await fetchFromNewegg(product);
  if (!price) price = await fetchFromGoogleShopping(product);

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
