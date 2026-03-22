// ============================================================
// GPU RADAR — Shared Data Layer
// المصدر الوحيد لبيانات الأسعار — يُحمَّل في كل الصفحات
// ============================================================

const MONTHS_AR = ['أبر','مايو','يون','يول','أغس','سبت','أكت','نوف','ديس','يناير','فبر','مارس'];

const GPU_DATA = [
  { id:'rtx4090',   name:'RTX 4090',         brand:'NVIDIA', type:'GPU', tier:'flagship',  price:2199, prev:2299, high52:2799, low52:1999, color:'#76B900', series:[2400,2350,2320,2299,2280,2310,2250,2230,2300,2280,2299,2199] },
  { id:'rtx4080s',  name:'RTX 4080 Super',    brand:'NVIDIA', type:'GPU', tier:'high-end',  price:999,  prev:1049, high52:1199, low52:899,  color:'#76B900', series:[1150,1100,1080,1060,1050,1020,1000,1010,1049,1040,1049,999] },
  { id:'rtx4070ti', name:'RTX 4070 Ti Super', brand:'NVIDIA', type:'GPU', tier:'high-end',  price:779,  prev:799,  high52:899,  low52:749,  color:'#76B900', series:[880,860,840,820,800,810,799,790,785,800,799,779] },
  { id:'rtx4070s',  name:'RTX 4070 Super',    brand:'NVIDIA', type:'GPU', tier:'mid-range', price:599,  prev:619,  high52:699,  low52:549,  color:'#76B900', series:[680,660,640,630,620,625,619,612,608,615,619,599] },
  { id:'rtx4060ti', name:'RTX 4060 Ti',       brand:'NVIDIA', type:'GPU', tier:'mid-range', price:399,  prev:429,  high52:499,  low52:349,  color:'#76B900', series:[480,460,450,440,430,428,425,420,429,432,429,399] },
  { id:'rtx4060',   name:'RTX 4060',          brand:'NVIDIA', type:'GPU', tier:'budget',    price:299,  prev:299,  high52:329,  low52:269,  color:'#76B900', series:[320,310,305,302,299,298,299,300,299,299,299,299] },
  { id:'rtx3080',   name:'RTX 3080 12GB',     brand:'NVIDIA', type:'GPU', tier:'high-end',  price:449,  prev:489,  high52:699,  low52:399,  color:'#76B900', series:[699,650,600,570,540,510,490,475,460,470,489,449] },
  { id:'rx7900xtx', name:'RX 7900 XTX',       brand:'AMD',    type:'GPU', tier:'flagship',  price:879,  prev:949,  high52:1099, low52:799,  color:'#ED1C24', series:[1050,1020,990,970,950,945,949,930,910,950,949,879] },
  { id:'rx7900xt',  name:'RX 7900 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  price:699,  prev:749,  high52:899,  low52:649,  color:'#ED1C24', series:[880,850,820,790,760,755,749,740,730,745,749,699] },
  { id:'rx7800xt',  name:'RX 7800 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', price:449,  prev:479,  high52:549,  low52:399,  color:'#ED1C24', series:[530,510,495,480,475,479,479,465,455,475,479,449] },
  { id:'rx7700xt',  name:'RX 7700 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', price:349,  prev:369,  high52:429,  low52:319,  color:'#ED1C24', series:[420,405,390,380,372,369,365,360,355,365,369,349] },
  { id:'rx7600',    name:'RX 7600',           brand:'AMD',    type:'GPU', tier:'budget',    price:269,  prev:279,  high52:329,  low52:239,  color:'#ED1C24', series:[329,315,299,285,279,275,279,272,268,272,279,269] },
];

const CPU_DATA = [
  { id:'i9-14900k', name:'Core i9-14900K', brand:'Intel', type:'CPU', tier:'flagship',  price:419, prev:499, high52:589, low52:399, color:'#0071C5', series:[589,565,540,520,505,499,489,475,460,475,499,419] },
  { id:'i7-14700k', name:'Core i7-14700K', brand:'Intel', type:'CPU', tier:'high-end',  price:329, prev:389, high52:419, low52:299, color:'#0071C5', series:[419,405,395,390,389,385,379,365,349,369,389,329] },
  { id:'i5-14600k', name:'Core i5-14600K', brand:'Intel', type:'CPU', tier:'mid-range', price:249, prev:289, high52:319, low52:229, color:'#0071C5', series:[319,309,299,295,289,285,280,275,269,280,289,249] },
  { id:'i5-14400',  name:'Core i5-14400',  brand:'Intel', type:'CPU', tier:'budget',    price:189, prev:199, high52:219, low52:179, color:'#0071C5', series:[219,215,209,205,199,198,196,194,192,196,199,189] },
  { id:'i3-14100',  name:'Core i3-14100',  brand:'Intel', type:'CPU', tier:'entry',     price:129, prev:134, high52:149, low52:119, color:'#0071C5', series:[149,145,140,138,135,134,133,131,130,132,134,129] },
  { id:'r9-7950x',  name:'Ryzen 9 7950X',  brand:'AMD',   type:'CPU', tier:'flagship',  price:549, prev:649, high52:799, low52:499, color:'#ED1C24', series:[799,769,730,700,670,650,649,630,610,640,649,549] },
  { id:'r9-7900x',  name:'Ryzen 9 7900X',  brand:'AMD',   type:'CPU', tier:'high-end',  price:349, prev:399, high52:549, low52:299, color:'#ED1C24', series:[549,519,490,460,420,399,390,380,365,385,399,349] },
  { id:'r7-7700x',  name:'Ryzen 7 7700X',  brand:'AMD',   type:'CPU', tier:'mid-range', price:249, prev:299, high52:399, low52:219, color:'#ED1C24', series:[399,369,340,320,305,299,290,279,265,279,299,249] },
  { id:'r5-7600x',  name:'Ryzen 5 7600X',  brand:'AMD',   type:'CPU', tier:'mid-range', price:179, prev:199, high52:299, low52:169, color:'#ED1C24', series:[299,279,259,239,210,199,195,190,182,192,199,179] },
  { id:'r5-7500f',  name:'Ryzen 5 7500F',  brand:'AMD',   type:'CPU', tier:'budget',    price:149, prev:159, high52:199, low52:139, color:'#ED1C24', series:[199,189,175,165,160,159,155,152,148,152,159,149] },
];

// Combined — used by index.html
const ALL_PARTS = [...GPU_DATA, ...CPU_DATA];

// ── Shared utilities (used by all pages) ──────────────────

function calcChange(current, prev) {
  if (!prev) return '0.0';
  return ((current - prev) / prev * 100).toFixed(1);
}

function makeSpark(series) {
  const w = 80, h = 28, pad = 2;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const pts = series.map((v, i) => {
    const x = (pad + (i / (series.length - 1)) * (w - pad * 2)).toFixed(1);
    const y = (h - pad - ((v - min) / range) * (h - pad * 2)).toFixed(1);
    return `${x},${y}`;
  }).join(' ');
  const stroke = series[series.length - 1] >= series[0] ? '#F87171' : '#4ADE80';
  return `<svg class="mini-sparkline" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('nav-menu');
  if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }
}


// ── LIVE API INTEGRATION ──────────────────────────────────
// يجلب الأسعار من Backend في الوقت الفعلي
// إذا فشل الجلب، يستخدم البيانات الثابتة كـ fallback

// ← غيّر هذا الرابط بعد نشر Backend على Railway/Render
// لا يوجد Backend حالياً — يعمل بالبيانات الثابتة مباشرةً
// عند نشر Backend على Railway، أدخل رابطه هنا بدل null
const API_BASE = 'https://your-app.up.railway.app';

let LIVE_DATA      = null; // يُملأ بعد الجلب
let LAST_UPDATED   = null;
let NEXT_UPDATE    = null;

async function fetchLivePrices() {
  // إذا لم يكن هناك Backend، استخدم البيانات الثابتة مباشرةً
  if (!API_BASE) {
    console.log('[GPU Radar] No backend configured — using static data');
    return false;
  }
  try {
    const res  = await fetch(`${API_BASE}/api/prices/live`, {
      signal: AbortSignal.timeout(8000) // 8 sec timeout
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    if (json.data && json.data.length > 0) {
      LIVE_DATA    = json.data;
      LAST_UPDATED = json.updated_at;
      NEXT_UPDATE  = json.next_update;

      // Override static arrays with live data
      json.data.forEach(live => {
        const gpuIdx = GPU_DATA.findIndex(p => p.id === live.id);
        if (gpuIdx !== -1) {
          GPU_DATA[gpuIdx] = { ...GPU_DATA[gpuIdx], ...live };
        }
        const cpuIdx = CPU_DATA.findIndex(p => p.id === live.id);
        if (cpuIdx !== -1) {
          CPU_DATA[cpuIdx] = { ...CPU_DATA[cpuIdx], ...live };
        }
      });

      // Rebuild combined array
      ALL_PARTS.length = 0;
      ALL_PARTS.push(...GPU_DATA, ...CPU_DATA);

      console.log(`[GPU Radar] ✓ Live prices loaded — ${json.count} parts, updated ${formatTimeAgo(LAST_UPDATED)}`);
      return true;
    }
  } catch (err) {
    console.warn('[GPU Radar] Live fetch failed, using static data:', err.message);
  }
  return false;
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'مجهول';
  const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diff < 1)   return 'الآن';
  if (diff < 60)  return `منذ ${diff} دقيقة`;
  if (diff < 1440) return `منذ ${Math.floor(diff/60)} ساعة`;
  return `منذ ${Math.floor(diff/1440)} يوم`;
}

function getUpdateInfo() {
  return {
    lastUpdated: LAST_UPDATED,
    nextUpdate:  NEXT_UPDATE,
    timeAgo:     formatTimeAgo(LAST_UPDATED),
    isLive:      LIVE_DATA !== null,
  };
}

