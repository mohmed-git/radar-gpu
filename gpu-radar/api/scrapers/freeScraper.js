// freeScraper.js
// Lightweight FREE Price Scraper (Newegg API Only)
// Stable Version – No HTML Scraping – No jsdom

const https = require("https");
const fs = require("fs");

const DATA_FILE = "../../js/data.js";

// ─────────────────────────────────────────────
// 🔹 Simple HTTPS Fetch
// ─────────────────────────────────────────────
function fetchURL(url, options = {}) {
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        ...options.headers,
      },
    });

    let data = "";

    req.on("response", (res) => {
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () =>
        resolve({
          status: res.statusCode,
          body: data,
        })
      );
    });

    req.on("error", () => resolve({ status: 500, body: "" }));
    req.end();
  });
}

// ─────────────────────────────────────────────
// 🔹 Newegg Internal API
// ─────────────────────────────────────────────
async function fetchNewegg(product) {
  if (!product.newegg) return null;

  try {
    const match = product.newegg.match(/N82E(\d+)/);
    if (!match) return null;

    const itemNumber = match[1];

    const url = `https://www.newegg.com/api/Product/ProductRealtime?ItemNumber=${itemNumber}`;

    const { status, body } = await fetchURL(url, {
      headers: { Referer: product.newegg },
    });

    if (status !== 200) return null;

    const json = JSON.parse(body);

    const price =
      json?.MainItem?.FinalPrice ||
      json?.MainItem?.SalePrice ||
      json?.MainItem?.MapPrice;

    if (!price) return null;

    const numericPrice = parseFloat(price);

    // 🔒 Sanity Filter (prevents wrong product price)
    const min = product.basePrice * 0.5;
    const max = product.basePrice * 1.6;

    if (numericPrice < min || numericPrice > max) {
      console.warn(`⚠ Suspicious price ignored: ${product.name}`);
      return null;
    }

    console.log(`✓ ${product.name}: $${numericPrice}`);
    return numericPrice;
  } catch (err) {
    console.warn(`Newegg error (${product.name})`);
  }

  return null;
}

// ─────────────────────────────────────────────
// 🔹 Smart Fallback (Small Controlled Drift)
// ─────────────────────────────────────────────
function smartSimulate(product, currentPrice) {
  const base = currentPrice || product.basePrice;
  const change = (Math.random() - 0.5) * 0.02; // ±2%
  const newPrice = base + base * change;
  return Math.round(newPrice);
}

// ─────────────────────────────────────────────
// 🔹 Main Update Logic
// ─────────────────────────────────────────────
async function updatePrices() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error("data.json not found");
    return;
  }

  const raw = fs.readFileSync(DATA_FILE);
  const products = JSON.parse(raw);

  console.log("\n🚀 Starting Price Update...\n");

  for (const product of products) {
    console.log(`Checking: ${product.name}`);

    let price = await fetchNewegg(product);

    if (!price) {
      price = smartSimulate(product, product.price);
      console.log(`↺ Simulated: $${price}`);
    }

    product.price = price;
    product.lastUpdated = new Date().toISOString();
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));

  console.log("\n✅ Price Update Completed\n");
}

// ─────────────────────────────────────────────
updatePrices();
