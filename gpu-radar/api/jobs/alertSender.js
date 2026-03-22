// ============================================================
// GPU RADAR — Alert Sender (api/jobs/alertSender.js)
//
// يتحقق من التنبيهات المسجلة ويرسل بريد إلكتروني
// عند وصول السعر للحد المطلوب
// ============================================================

const fs   = require('fs');
const path = require('path');

const ALERTS_FILE = path.join(__dirname, '../db/alerts.json');

// ── NODEMAILER SETUP ──────────────────────────────────────
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  try {
    const nodemailer = require('nodemailer');

    // Option 1: SMTP (Gmail, Outlook, etc.)
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransporter({
        host:   process.env.SMTP_HOST,
        port:   parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // Option 2: SendGrid
    else if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // Use sgMail directly (not nodemailer)
      return { sendgrid: sgMail };
    }

  } catch (e) {
    console.warn('[Alerts] Email not configured:', e.message);
  }

  return null;
}

// ── LOAD / SAVE ALERTS ────────────────────────────────────
function loadAlerts() {
  try {
    if (!fs.existsSync(ALERTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveAlerts(alerts) {
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

// ── EMAIL TEMPLATE ────────────────────────────────────────
function buildEmailHTML(alert, currentPrice) {
  const saving = alert.prevPrice - currentPrice;
  const savingPct = ((saving / alert.prevPrice) * 100).toFixed(1);
  const affiliateLink = `https://www.amazon.com/dp/${alert.asin}?tag=${process.env.AMAZON_AFFILIATE_TAG || 'gpuradar-20'}`;

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>تنبيه سعر — GPU Radar</title>
</head>
<body style="margin:0;padding:0;background:#080C10;font-family:'Arial',sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080C10;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0D1117;border-radius:12px;border:1px solid rgba(56,189,248,0.2);overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D1117,#161E28);padding:30px 32px;border-bottom:1px solid rgba(56,189,248,0.15);">
            <table width="100%"><tr>
              <td>
                <span style="color:#38BDF8;font-size:20px;font-weight:700;letter-spacing:1px;">◈ GPU<span style="font-weight:300">Radar</span></span>
              </td>
              <td align="left">
                <span style="background:rgba(74,222,128,0.15);color:#4ADE80;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">🔔 تنبيه سعر</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px;">

          <p style="color:#94A3B8;font-size:15px;margin:0 0 20px;">مرحباً،</p>
          <p style="color:#E2E8F0;font-size:15px;margin:0 0 24px;line-height:1.7;">
            وصل سعر <strong style="color:#38BDF8">${alert.partName}</strong> إلى حدك المستهدف!
          </p>

          <!-- Price Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#161E28;border-radius:10px;border:1px solid rgba(56,189,248,0.15);margin-bottom:24px;">
            <tr>
              <td style="padding:24px;text-align:center;">
                <div style="color:#64748B;font-size:13px;margin-bottom:8px;">السعر الحالي</div>
                <div style="color:#38BDF8;font-size:42px;font-weight:700;font-family:monospace;">$${currentPrice.toLocaleString()}</div>
                <div style="margin-top:12px;">
                  <span style="color:#94A3B8;font-size:13px;text-decoration:line-through;">السعر السابق: $${alert.prevPrice?.toLocaleString() || '—'}</span>
                  &nbsp;&nbsp;
                  <span style="background:rgba(74,222,128,0.15);color:#4ADE80;padding:3px 10px;border-radius:4px;font-size:13px;font-weight:700;">
                    وفّر $${saving.toFixed(0)} (${savingPct}% ↓)
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px;text-align:center;">
                <div style="color:#64748B;font-size:12px;margin-bottom:4px;">حدك المستهدف</div>
                <div style="color:#E2E8F0;font-size:18px;font-weight:600;">$${alert.targetPrice.toLocaleString()}</div>
              </td>
            </tr>
          </table>

          <!-- CTA Button -->
          <table width="100%"><tr><td align="center" style="padding-bottom:24px;">
            <a href="${affiliateLink}"
               style="display:inline-block;background:#38BDF8;color:#000;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">
              🛒 اشترِ الآن قبل انتهاء العرض
            </a>
          </td></tr></table>

          <p style="color:#64748B;font-size:12px;margin:0 0 8px;text-align:center;">
            لإيقاف هذا التنبيه:
            <a href="https://gpu-radar.com/unsubscribe?token=${alert.token}" style="color:#38BDF8;">إلغاء الاشتراك</a>
          </p>
          <p style="color:#475569;font-size:11px;margin:0;text-align:center;">
            GPU Radar · الأسعار للأغراض المعلوماتية · قد نحصل على عمولة عند الشراء عبر روابطنا
          </p>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── SEND SINGLE ALERT ─────────────────────────────────────
async function sendAlertEmail(alert, currentPrice) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Alert] Email not configured — would notify: ${alert.email} about ${alert.partName} at $${currentPrice}`);
    return false;
  }

  const subject = `🔔 تنبيه GPU Radar: ${alert.partName} وصل إلى $${currentPrice}!`;
  const html    = buildEmailHTML(alert, currentPrice);

  try {
    // SendGrid path
    if (mailer.sendgrid) {
      await mailer.sendgrid.send({
        to:      alert.email,
        from:    { email: process.env.EMAIL_FROM || 'alerts@gpu-radar.com', name: 'GPU Radar' },
        subject,
        html,
      });
    }
    // Nodemailer path
    else {
      await mailer.sendMail({
        from:    `"GPU Radar" <${process.env.EMAIL_FROM || 'alerts@gpu-radar.com'}>`,
        to:      alert.email,
        subject,
        html,
      });
    }

    console.log(`[Alert] ✓ Email sent to ${alert.email} — ${alert.partName} @ $${currentPrice}`);
    return true;
  } catch (err) {
    console.error(`[Alert] ✗ Failed to send to ${alert.email}:`, err.message);
    return false;
  }
}

// ── CHECK ALL ALERTS ──────────────────────────────────────
async function checkAndSendAlerts() {
  const { getAllPrices } = require('../db/priceDB');
  const alerts = loadAlerts();
  if (alerts.length === 0) {
    console.log('[Alerts] No active alerts to check');
    return;
  }

  const currentPrices = getAllPrices();
  let triggered = 0;

  for (const alert of alerts) {
    if (alert.triggered) continue;

    const part = currentPrices[alert.partId];
    if (!part) continue;

    const currentPrice = part.price;

    if (currentPrice <= alert.targetPrice) {
      console.log(`[Alert] TRIGGERED: ${alert.partName} → $${currentPrice} ≤ $${alert.targetPrice}`);
      const sent = await sendAlertEmail({ ...alert, prevPrice: part.prev }, currentPrice);
      if (sent) {
        alert.triggered    = true;
        alert.triggeredAt  = new Date().toISOString();
        alert.triggeredPrice = currentPrice;
        triggered++;
      }
    }
  }

  saveAlerts(alerts);
  console.log(`[Alerts] Check complete — ${triggered} triggered out of ${alerts.length} active`);
}

// ── REGISTER NEW ALERT ────────────────────────────────────
function registerAlert(email, partId, partName, targetPrice, asin) {
  const alerts = loadAlerts();
  const token  = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const newAlert = {
    id:          `alert_${Date.now()}`,
    token,
    email,
    partId,
    partName,
    asin:        asin || '',
    targetPrice: parseFloat(targetPrice),
    triggered:   false,
    createdAt:   new Date().toISOString(),
  };

  alerts.push(newAlert);
  saveAlerts(alerts);
  console.log(`[Alert] Registered: ${email} → ${partName} @ $${targetPrice}`);
  return newAlert;
}

// ── UNSUBSCRIBE ───────────────────────────────────────────
function unsubscribeAlert(token) {
  const alerts = loadAlerts();
  const idx    = alerts.findIndex(a => a.token === token);
  if (idx === -1) return false;
  alerts.splice(idx, 1);
  saveAlerts(alerts);
  return true;
}

module.exports = { checkAndSendAlerts, registerAlert, unsubscribeAlert, sendAlertEmail };
