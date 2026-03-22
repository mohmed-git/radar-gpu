// ============================================================
// GPU RADAR — Database (api/db/priceDB.js)
// قاعدة بيانات JSON — لا تحتاج MongoDB أو PostgreSQL
// الملفات تُحفظ في api/db/
// ============================================================

const fs   = require('fs');
const path = require('path');

const DB_DIR      = __dirname;
const PRICES_FILE = path.join(DB_DIR, 'prices.json');
const HIST_FILE   = path.join(DB_DIR, 'history.json');
const ALERTS_FILE = path.join(DB_DIR, 'alerts.json');

// ── INIT ──────────────────────────────────────────────────
function initDB(catalog) {
  // Create prices.json if missing
  if (!fs.existsSync(PRICES_FILE)) {
    const data = {};
    catalog.forEach(p => {
      data[p.id] = {
        ...p,
        price:      p.basePrice,
        prev:       p.basePrice,
        high52:     Math.round(p.basePrice * 1.35),
        low52:      Math.round(p.basePrice * 0.72),
        updated_at: new Date().toISOString(),
      };
    });
    fs.writeFileSync(PRICES_FILE, JSON.stringify(data, null, 2));
    console.log('[DB] prices.json created');
  }

  // Create history.json if missing
  if (!fs.existsSync(HIST_FILE)) {
    const hist = {};
    const today = todayStr();
    catalog.forEach(p => {
      // Generate 12 months of synthetic history
      hist[p.id] = generateInitialHistory(p.basePrice);
    });
    fs.writeFileSync(HIST_FILE, JSON.stringify(hist, null, 2));
    console.log('[DB] history.json created with 12-month history');
  }

  // Create alerts.json if missing
  if (!fs.existsSync(ALERTS_FILE)) {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify([], null, 2));
    console.log('[DB] alerts.json created');
  }
}

function generateInitialHistory(basePrice) {
  const history = [];
  const now     = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const progress = (11 - i) / 11;
    // Prices generally decrease over time in electronics
    const trend  = basePrice * (1.3 - progress * 0.3);
    const noise  = (Math.random() - 0.5) * basePrice * 0.06;
    const price  = Math.max(Math.round((trend + noise) / 5) * 5, basePrice * 0.5);
    history.push({ date: d.toISOString().split('T')[0], price });
  }
  return history;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ── READ ──────────────────────────────────────────────────
function getAllPrices() {
  try   { return JSON.parse(fs.readFileSync(PRICES_FILE, 'utf8')); }
  catch { return {}; }
}

function getPrice(id) {
  return getAllPrices()[id] || null;
}

function getHistory(id, months = 12) {
  try {
    const hist = JSON.parse(fs.readFileSync(HIST_FILE, 'utf8'));
    return (hist[id] || []).slice(-months);
  } catch { return []; }
}

function getAllHistory() {
  try   { return JSON.parse(fs.readFileSync(HIST_FILE, 'utf8')); }
  catch { return {}; }
}

function getLastUpdateTime() {
  try {
    const prices = getAllPrices();
    const times  = Object.values(prices).map(p => new Date(p.updated_at || 0).getTime());
    return new Date(Math.max(...times)).toISOString();
  } catch { return null; }
}

// ── WRITE ─────────────────────────────────────────────────
function updatePrice(id, newPrice) {
  const all = getAllPrices();
  if (!all[id]) return false;

  const prev  = all[id].price;
  const today = todayStr();

  all[id] = {
    ...all[id],
    prev,
    price:      newPrice,
    high52:     Math.max(all[id].high52 || 0, newPrice),
    low52:      Math.min(all[id].low52  || newPrice, newPrice),
    change_pct: parseFloat(((newPrice - prev) / prev * 100).toFixed(2)),
    change_usd: newPrice - prev,
    updated_at: new Date().toISOString(),
  };

  fs.writeFileSync(PRICES_FILE, JSON.stringify(all, null, 2));
  appendHistory(id, today, newPrice);
  return { prev, newPrice, change: all[id].change_pct };
}

function appendHistory(id, date, price) {
  try {
    const hist  = JSON.parse(fs.readFileSync(HIST_FILE, 'utf8'));
    if (!hist[id]) hist[id] = [];

    const existing = hist[id].find(h => h.date === date);
    if (existing)  existing.price = price;
    else           hist[id].push({ date, price });

    // Keep max 365 entries
    if (hist[id].length > 365) hist[id] = hist[id].slice(-365);
    fs.writeFileSync(HIST_FILE, JSON.stringify(hist, null, 2));
  } catch (e) {
    console.error('[DB] appendHistory error:', e.message);
  }
}

// ── ALERTS ────────────────────────────────────────────────
function loadAlerts() {
  try   { return JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8')); }
  catch { return []; }
}

function saveAlerts(alerts) {
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

function addAlert(alert) {
  const alerts = loadAlerts();
  alerts.push(alert);
  saveAlerts(alerts);
}

function removeAlert(token) {
  const alerts = loadAlerts();
  const idx    = alerts.findIndex(a => a.token === token);
  if (idx === -1) return false;
  alerts.splice(idx, 1);
  saveAlerts(alerts);
  return true;
}

module.exports = {
  initDB, getAllPrices, getPrice, getHistory, getAllHistory,
  getLastUpdateTime, updatePrice, loadAlerts, saveAlerts,
  addAlert, removeAlert,
};
