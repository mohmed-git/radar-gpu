// ============================================================
// PRICEBENCH — AI Pricing Intelligence Engine
// api/scrapers/aiPricingEngine.js
//
// يستخدم Claude AI لتحليل العروض المُجمَّعة من المتاجر
// واختيار أفضل سعر حقيقي وموثوق لكل منتج
// ============================================================

const https = require('https');

// ── CLAUDE API CALLER ─────────────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json?.content?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Claude parse error: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Claude timeout')); });
    req.write(body);
    req.end();
  });
}

// ── SYSTEM PROMPT ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are a pricing intelligence engine for PC hardware.
Your task is to analyze multiple product offers from different retailers (Amazon, Newegg, B&H, BestBuy, etc.) and return the BEST and MOST RELIABLE price for a specific product.

IMPORTANT RULES:
1. Only consider NEW products.
2. Exclude Used, Refurbished, Open-box, or Marketplace sellers with low ratings.
3. Ensure all offers match the exact product model (no similar variants like F vs non-F CPUs unless explicitly allowed).
4. Prefer trusted retailers: Amazon, Newegg (sold by Newegg), B&H, BestBuy (sold by BestBuy).
5. If a price is significantly lower than others, verify it is legitimate and not misleading.

OUTPUT FORMAT (JSON ONLY — no markdown, no explanation):
{
  "product_name": "",
  "best_price": {
    "price": number,
    "store": "",
    "link": ""
  },
  "lowest_valid_price": {
    "price": number,
    "store": "",
    "link": ""
  },
  "average_market_price": number,
  "price_trend": "rising | stable | dropping",
  "deal_status": "good deal | normal price | overpriced",
  "notes": ""
}

If data is insufficient or unreliable, return:
{"error": "insufficient reliable data"}`;

// ── BUILD USER MESSAGE ────────────────────────────────────
function buildUserMessage(productName, offers) {
  const offersText = offers.map((o, i) =>
    `${i + 1}. Store: ${o.store} | Price: $${o.price} | Condition: ${o.condition || 'New'} | Seller: ${o.seller || o.store} | Link: ${o.link || 'N/A'}`
  ).join('\n');

  return `Product: ${productName}\n\nOffers:\n${offersText}`;
}

// ── MAIN: ANALYZE PRICE WITH AI ──────────────────────────
async function analyzePriceWithAI(product, offers) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[AI] No ANTHROPIC_API_KEY — skipping AI analysis');
    return null;
  }

  if (!offers || offers.length === 0) {
    console.warn(`[AI] No offers for ${product.name}`);
    return null;
  }

  try {
    console.log(`[AI] Analyzing ${offers.length} offers for: ${product.name}`);
    const userMsg = buildUserMessage(product.name, offers);
    const response = await callClaude(SYSTEM_PROMPT, userMsg);

    // Parse JSON response
    const cleaned = response.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    if (result.error) {
      console.warn(`[AI] ${product.name}: ${result.error}`);
      return null;
    }

    console.log(`[AI] ✓ ${product.name}: $${result.best_price?.price} (${result.deal_status})`);
    return result;

  } catch (err) {
    console.error(`[AI] Error for ${product.name}:`, err.message);
    return null;
  }
}

// ── SCRAPE OFFERS FOR A PRODUCT ───────────────────────────
// يجمع عروض من مصادر متعددة ثم يُحللها بـ AI
async function scrapeAndAnalyze(product, scrapeOffers) {
  // 1. جمع العروض الخام من المتاجر
  const offers = await scrapeOffers(product);

  // 2. تحليل بـ AI
  const aiResult = await analyzePriceWithAI(product, offers);

  if (aiResult?.best_price?.price) {
    return {
      price:        aiResult.best_price.price,
      store:        aiResult.best_price.store,
      link:         aiResult.best_price.link,
      deal_status:  aiResult.deal_status,
      price_trend:  aiResult.price_trend,
      avg_market:   aiResult.average_market_price,
      ai_notes:     aiResult.notes,
      source:       'ai',
    };
  }

  return null;
}

// ── BATCH ANALYZE (للتحديث اليومي) ───────────────────────
async function batchAnalyze(products, scrapeOffers, delayMs = 2000) {
  const results = {};

  for (const product of products) {
    try {
      const result = await scrapeAndAnalyze(product, scrapeOffers);
      if (result) results[product.id] = result;

      // تأخير بين الطلبات لتجنب Rate Limiting
      if (products.indexOf(product) < products.length - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    } catch (err) {
      console.error(`[AI Batch] Error for ${product.id}:`, err.message);
    }
  }

  return results;
}

module.exports = { analyzePriceWithAI, scrapeAndAnalyze, batchAnalyze, buildUserMessage };
