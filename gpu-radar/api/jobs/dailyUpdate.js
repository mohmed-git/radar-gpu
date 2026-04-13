// ============================================================
// GPU RADAR — Daily Update Job (api/jobs/dailyUpdate.js)
//
// يعمل كل يوم 9:00 صباحاً UTC تلقائياً
// بدون أي API Key مدفوع!
// ============================================================

const cron = require('node-cron');
const { PRODUCT_CATALOG, fetchAllPrices } = require('../scrapers/freeScraper');
const {
  getAllPrices, updatePrice, loadAlerts, saveAlerts, getLastUpdateTime
} = require('../db/priceDB');

// ── EMAIL SETUP (Nodemailer — مجاني مع Gmail) ─────────────
function createMailer() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  try {
    const nodemailer = require('nodemailer');
    return nodemailer.createTransport({
      service: 'gmail',   // أو 'outlook' أو SMTP مخصص
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } catch { return null; }
}

// ── SEND ALERT EMAIL ──────────────────────────────────────
async function sendAlertEmail(mailer, alert, newPrice) {
  if (!mailer) {
    console.log(`[Email] Not configured — alert for ${alert.email}: ${alert.partName} @ $${newPrice}`);
    return false;
  }

  const saving    = alert.prevPrice - newPrice;
  const savingPct = Math.abs(((saving / alert.prevPrice) * 100)).toFixed(1);

  const html = `
<!DOCTYPE html><html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/></head>
<body style="background:#080C10;color:#E2E8F0;font-family:Arial,sans-serif;direction:rtl;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#0D1117;border-radius:12px;border:1px solid rgba(56,189,248,0.2);overflow:hidden">
  <div style="padding:24px 28px;border-bottom:1px solid rgba(56,189,248,0.15)">
    <span style="color:#38BDF8;font-size:18px;font-weight:700">◈ PriceBench — تنبيه سعر &#x1F514;</span>
  </div>
  <div style="padding:28px">
    <p style="margin:0 0 16px;color:#94A3B8">وصل سعر <strong style="color:#38BDF8">${alert.partName}</strong> إلى حدك المستهدف!</p>
    <div style="background:#161E28;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
      <div style="color:#64748B;font-size:13px;margin-bottom:6px">السعر الحالي</div>
      <div style="color:#38BDF8;font-size:40px;font-weight:700">$${newPrice.toLocaleString()}</div>
      <div style="margin-top:10px">
        <span style="color:#94A3B8;font-size:13px;text-decoration:line-through">كان: $${alert.prevPrice?.toLocaleString()}</span>
        &nbsp;
        <span style="background:rgba(74,222,128,0.15);color:#4ADE80;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:700">
          وفّر ${savingPct}% ↓
        </span>
      </div>
      <div style="margin-top:8px;color:#64748B;font-size:12px">حدك المستهدف: $${alert.targetPrice}</div>
    </div>
    <div style="text-align:center">
      <a href="https://www.newegg.com/global/ar-en/"
         style="display:inline-block;background:#38BDF8;color:#000;padding:12px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px">
        🛒 اشترِ الآن
      </a>
    </div>
    <p style="margin:20px 0 0;font-size:11px;color:#475569;text-align:center">
      <a href="https://pricebench.online/api/alerts/unsubscribe?token=${alert.token}" style="color:#38BDF8">إلغاء الاشتراك</a>
      &nbsp;·&nbsp; PriceBench · الأسعار للأغراض المعلوماتية
    </p>
  </div>
</div>
</body></html>`;

  try {
    await mailer.sendMail({
      from:    `"PriceBench" <${process.env.SMTP_USER}>`,
      to:      alert.email,
      subject: `PriceBench: ${alert.partName} وصل $${newPrice}!`,
      html,
    });
    console.log(`[Email] ✓ Sent to ${alert.email}`);
    return true;
  } catch (err) {
    console.error(`[Email] ✗ Failed: ${err.message}`);
    return false;
  }
}

// ── CHECK & TRIGGER ALERTS ────────────────────────────────
async function processAlerts(updatedPrices) {
  const alerts = loadAlerts();
  if (!alerts.length) return;

  const mailer   = createMailer();
  const current  = getAllPrices();
  let   triggered = 0;

  for (const alert of alerts) {
    if (alert.triggered) continue;
    const part = current[alert.partId];
    if (!part) continue;

    if (part.price <= alert.targetPrice) {
      console.log(`[Alert] TRIGGERED: ${alert.partName} $${part.price} ≤ $${alert.targetPrice}`);
      const sent = await sendAlertEmail(mailer, { ...alert, prevPrice: part.prev }, part.price);
      if (sent) {
        alert.triggered     = true;
        alert.triggeredAt   = new Date().toISOString();
        alert.triggeredPrice = part.price;
        triggered++;
      }
    }
  }

  saveAlerts(alerts);
  if (triggered) console.log(`[Alerts] ${triggered} alerts triggered and sent`);
}

// ── MAIN UPDATE FUNCTION ──────────────────────────────────
async function runDailyUpdate() {
  const start = Date.now();
  console.log('\n' + '═'.repeat(50));
  console.log('  GPU RADAR — Daily Price Update');
  console.log('  ' + new Date().toLocaleString());
  console.log('═'.repeat(50));

  const currentPrices = getAllPrices();
  const results = { updated: 0, unchanged: 0, failed: 0, changes: [] };

  // Fetch all new prices (free scraper)
  let newPrices;
  try {
    newPrices = await fetchAllPrices(currentPrices);
  } catch (err) {
    console.error('[Update] Scraper failed entirely:', err.message);
    return results;
  }

  // Save each updated price
  for (const product of PRODUCT_CATALOG) {
    const newPrice     = newPrices[product.id];
    const currentPrice = currentPrices[product.id]?.price || product.basePrice;

    if (!newPrice) { results.failed++; continue; }
    if (newPrice === currentPrice) { results.unchanged++; continue; }

    const update = updatePrice(product.id, newPrice);
    if (update) {
      results.updated++;
      results.changes.push({
        name:       product.name,
        oldPrice:   currentPrice,
        newPrice,
        changePct:  update.change,
      });
    }
  }

  // Process price alerts
  await processAlerts(newPrices);

  const duration = ((Date.now() - start) / 1000).toFixed(1);

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log(`  ✓ Updated:   ${results.updated}`);
  console.log(`  = Unchanged: ${results.unchanged}`);
  console.log(`  ✗ Failed:    ${results.failed}`);
  console.log(`  ⏱ Duration:  ${duration}s`);

  if (results.changes.length) {
    console.log('\n  Top changes:');
    results.changes
      .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
      .slice(0, 5)
      .forEach(c => {
        const dir = c.changePct < 0 ? 'DOWN' : 'UP';
        console.log(`    [${dir}] ${c.name}: $${c.oldPrice} -> $${c.newPrice} (${c.changePct}%)`);
      });
  }
  console.log('─'.repeat(50));

  return results;
}

// ── SCHEDULER ─────────────────────────────────────────────
function startScheduler() {
  // كل يوم 9:00 صباحاً UTC = 12:00 ظهراً بتوقيت الرياض
  cron.schedule('0 9 * * *', () => {
    console.log('\n[Cron] Daily update triggered by scheduler');
    runDailyUpdate().catch(console.error);
  }, { timezone: 'UTC' });

  const next = nextRunTime();
  console.log(`[Scheduler] ✓ Daily update: every day at 09:00 UTC`);
  console.log(`[Scheduler]   Next run: ${next}`);
}

function nextRunTime() {
  const now  = new Date();
  const next = new Date();
  next.setUTCHours(9, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' }) + ' (بتوقيت الرياض)';
}

// Admin manual trigger
function triggerManualUpdate(req, res) {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — set ADMIN_SECRET in .env' });
  }
  console.log('[Admin] Manual update triggered');
  res.json({ message: 'Update started in background', time: new Date().toISOString() });
  runDailyUpdate().catch(console.error);
}

module.exports = { startScheduler, runDailyUpdate, triggerManualUpdate, nextRunTime };
