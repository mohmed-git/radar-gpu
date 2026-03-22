// ============================================================
// GPU RADAR — API Server (api/server.js)
// بدون أي API Key مدفوع!
// ============================================================

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const {
  initDB, getAllPrices, getPrice,
  getHistory, getAllHistory, getLastUpdateTime,
  addAlert, removeAlert, loadAlerts,
} = require(path.join(__dirname, 'db/priceDB'));

const { PRODUCT_CATALOG } = require(path.join(__dirname, 'scrapers/freeScraper'));
const {
  startScheduler, runDailyUpdate,
  triggerManualUpdate, nextRunTime
} = require(path.join(__dirname, 'jobs/dailyUpdate'));

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../..')));

// Logger (API requests only)
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/')) {
    process.stdout.write(`[${new Date().toISOString().slice(11,19)}] ${req.method} ${req.url}\n`);
  }
  next();
});

// Init DB on startup (creates JSON files if missing)
initDB(PRODUCT_CATALOG);

// ── HELPERS ───────────────────────────────────────────────
function enrich(p) {
  return {
    ...p,
    change_pct:       p.prev ? parseFloat(((p.price - p.prev) / p.prev * 100).toFixed(2)) : 0,
    change_usd:       p.prev ? p.price - p.prev : 0,
    is_all_time_low:  p.price <= p.low52,
    is_all_time_high: p.price >= p.high52,
  };
}

function query(filters = {}) {
  let parts = Object.values(getAllPrices()).map(enrich);
  if (filters.type)   parts = parts.filter(p => p.type.toLowerCase()  === filters.type.toLowerCase());
  if (filters.brand)  parts = parts.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
  if (filters.tier)   parts = parts.filter(p => p.tier === filters.tier);
  if (filters.q)      parts = parts.filter(p =>
    p.name.toLowerCase().includes(filters.q)  ||
    p.brand.toLowerCase().includes(filters.q) ||
    p.type.toLowerCase().includes(filters.q)
  );
  if (filters.min)    parts = parts.filter(p => p.price >= Number(filters.min));
  if (filters.max)    parts = parts.filter(p => p.price <= Number(filters.max));
  return parts;
}

function getNextRun() {
  const now = new Date(), next = new Date();
  next.setUTCHours(9, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.toISOString();
}

// ══════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (_req, res) => res.json({
  status:      'ok',
  parts:       Object.keys(getAllPrices()).length,
  last_update: getLastUpdateTime(),
  next_update: getNextRun(),
}));

// ── /api/prices/live — الأهم: يُستخدم من الـ Frontend ──────
app.get('/api/prices/live', (_req, res) => {
  const all     = query();
  const history = getAllHistory();
  const data    = all.map(p => ({
    ...p,
    // آخر 12 شهر من تاريخ الأسعار
    series: (history[p.id] || []).slice(-12).map(h => h.price),
  }));
  res.json({
    data,
    count:       data.length,
    updated_at:  getLastUpdateTime(),
    next_update: getNextRun(),
  });
});

// كل القطع
app.get('/api/parts', (req, res) => {
  const { type, brand, tier, q, min_price, max_price, sort, order, limit, offset } = req.query;
  let parts = query({ type, brand, tier, q: q?.toLowerCase(), min: min_price, max: max_price });

  // Sort
  const dir = order === 'desc' ? -1 : 1;
  if (sort === 'price')  parts.sort((a,b) => (a.price - b.price) * dir);
  else if (sort === 'change') parts.sort((a,b) => (a.change_pct - b.change_pct) * dir);
  else parts.sort((a,b) => a.name.localeCompare(b.name) * dir);

  // Paginate
  const lim = Math.min(parseInt(limit)||20, 100);
  const off = parseInt(offset)||0;
  res.json({ data: parts.slice(off, off+lim), meta: { total: parts.length, limit: lim, offset: off } });
});

// قطعة واحدة
app.get('/api/parts/:id', (req, res) => {
  const p = getPrice(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(enrich(p));
});

// تاريخ الأسعار
app.get('/api/parts/:id/history', (req, res) => {
  const p = getPrice(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const months  = parseInt(req.query.months) || 12;
  const history = getHistory(req.params.id, months);
  res.json({ id: p.id, name: p.name, history });
});

// فلاتر سريعة
app.get('/api/gpus', (_req, res) => {
  const parts = query({ type: 'GPU' });
  res.json({ data: parts, count: parts.length, updated_at: getLastUpdateTime() });
});

app.get('/api/cpus', (_req, res) => {
  const parts = query({ type: 'CPU' });
  res.json({ data: parts, count: parts.length, updated_at: getLastUpdateTime() });
});

// ملخص السوق
app.get('/api/market/summary', (_req, res) => {
  const all  = query();
  const gpus = all.filter(p => p.type === 'GPU');
  const cpus = all.filter(p => p.type === 'CPU');
  const avg    = arr => arr.length ? Math.round(arr.reduce((s,p)=>s+p.price,0)/arr.length) : 0;
  const avgChg = arr => arr.length ? parseFloat((arr.reduce((s,p)=>s+(p.change_pct||0),0)/arr.length).toFixed(2)) : 0;
  const sorted = [...all].sort((a,b) => a.change_pct - b.change_pct);

  res.json({
    gpu:          { avg_price: avg(gpus), avg_change_pct: avgChg(gpus), count: gpus.length },
    cpu:          { avg_price: avg(cpus), avg_change_pct: avgChg(cpus), count: cpus.length },
    best_deals:   sorted.slice(0,5).map(p => ({ id:p.id, name:p.name, type:p.type, price:p.price, change_pct:p.change_pct })),
    biggest_rises:sorted.slice(-5).reverse().map(p => ({ id:p.id, name:p.name, price:p.price, change_pct:p.change_pct })),
    total:        all.length,
    updated_at:   getLastUpdateTime(),
    next_update:  getNextRun(),
  });
});

// مقارنة
app.get('/api/compare', (req, res) => {
  const ids   = (req.query.ids||'').split(',').filter(Boolean).slice(0,5);
  if (ids.length < 2) return res.status(400).json({ error: 'Need at least 2 IDs' });
  const parts = ids.map(id => { const p=getPrice(id); return p?enrich(p):null; }).filter(Boolean);
  res.json({ parts, count: parts.length });
});

// بحث
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(400).json({ error: 'Query too short' });
  const results = query({ q: q.toLowerCase() }).slice(0, 10);
  res.json({ results, count: results.length, query: q });
});

// ── ALERTS ────────────────────────────────────────────────
app.post('/api/alerts', (req, res) => {
  const { email, part_id, target_price } = req.body;
  if (!email || !part_id || !target_price)
    return res.status(400).json({ error: 'email, part_id, target_price required' });

  const part = getPrice(part_id);
  if (!part) return res.status(404).json({ error: 'Part not found' });

  const alert = {
    id:          `a_${Date.now()}`,
    token:       Math.random().toString(36).slice(2) + Date.now().toString(36),
    email,
    partId:      part_id,
    partName:    part.name,
    targetPrice: parseFloat(target_price),
    triggered:   false,
    createdAt:   new Date().toISOString(),
  };

  addAlert(alert);
  console.log(`[Alert] Registered: ${email} → ${part.name} @ $${target_price}`);
  res.status(201).json({ message: 'Alert created successfully', id: alert.id });
});

app.get('/api/alerts/unsubscribe', (req, res) => {
  const ok = removeAlert(req.query.token);
  res.send(`<html dir="rtl" lang="ar"><body style="font-family:sans-serif;text-align:center;padding:60px;background:#080C10;color:#E2E8F0">
    <h2 style="color:${ok?'#4ADE80':'#F87171'}">${ok?'✓ تم إلغاء اشتراكك بنجاح':'الرابط غير صالح'}</h2>
    <a href="/" style="color:#38BDF8">العودة لـ GPU Radar →</a>
  </body></html>`);
});

// ── ADMIN ─────────────────────────────────────────────────
app.post('/api/admin/update', triggerManualUpdate);

app.get('/api/admin/status', (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET)
    return res.status(401).json({ error: 'Unauthorized' });

  const db   = getAllPrices();
  const hist = getAllHistory();
  const today = new Date().toDateString();
  res.json({
    total_parts:         Object.keys(db).length,
    updated_today:       Object.values(db).filter(p => new Date(p.updated_at).toDateString() === today).length,
    history_days:        (Object.values(hist)[0]||[]).length,
    active_alerts:       loadAlerts().filter(a => !a.triggered).length,
    triggered_alerts:    loadAlerts().filter(a => a.triggered).length,
    last_update:         getLastUpdateTime(),
    next_update:         getNextRun(),
    email_configured:    !!(process.env.SMTP_USER && process.env.SMTP_PASS),
  });
});

// 404 & Error
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => { console.error(err.message); res.status(500).json({ error: 'Server error' }); });

// ── START ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
◈ GPU RADAR — Server Started
  URL:  http://localhost:${PORT}
  Mode: ${process.env.NODE_ENV || 'development'}

  Endpoints:
  GET  /api/prices/live      ← Frontend يجلب منه
  GET  /api/parts            ← كل القطع
  GET  /api/parts/:id/history
  GET  /api/gpus  /api/cpus
  GET  /api/market/summary
  GET  /api/compare?ids=...
  GET  /api/search?q=...
  POST /api/alerts           ← تسجيل تنبيه
  POST /api/admin/update     ← تشغيل يدوي
  GET  /api/admin/status
`);
  startScheduler();
});

module.exports = app;
