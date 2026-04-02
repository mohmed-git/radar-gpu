// ============================================================
// GPU RADAR — Shared Data Layer
// المصدر الوحيد لبيانات الأسعار — يُحمَّل في كل الصفحات
// ============================================================

const MONTHS_AR = ['أبر','مايو','يون','يول','أغس','سبت','أكت','نوف','ديس','يناير','فبر','مارس'];

const GPU_DATA = [
  // الأسعار محدّثة من Tom's Hardware & BestValueGPU — أبريل 2026
  // السوق يعاني من ارتفاع حاد بسبب أزمة ذاكرة AI وانتهاء إنتاج RTX 40
  { id:'rtx4090',   name:'RTX 4090',         brand:'NVIDIA', type:'GPU', tier:'flagship',  price:3199, prev:2199, high52:3599, low52:1599, color:'#76B900', series:[1599,1799,1999,2100,2199,2350,2450,2600,2750,2900,3050,3199] },
  { id:'rtx4080s',  name:'RTX 4080 Super',    brand:'NVIDIA', type:'GPU', tier:'high-end',  price:1498, prev:999,  high52:1529, low52:902,  color:'#76B900', series:[902,950,999,1050,1100,1150,1199,1250,1350,1420,1465,1498] },
  { id:'rtx4070ti', name:'RTX 4070 Ti Super', brand:'NVIDIA', type:'GPU', tier:'high-end',  price:1465, prev:779,  high52:1465, low52:739,  color:'#76B900', series:[739,799,820,850,899,950,999,1050,1150,1280,1380,1465] },
  { id:'rtx4070s',  name:'RTX 4070 Super',    brand:'NVIDIA', type:'GPU', tier:'mid-range', price:898,  prev:599,  high52:898,  low52:560,  color:'#76B900', series:[560,599,620,640,660,689,710,740,780,830,868,898] },
  { id:'rtx4060ti', name:'RTX 4060 Ti',       brand:'NVIDIA', type:'GPU', tier:'mid-range', price:447,  prev:399,  high52:499,  low52:329,  color:'#76B900', series:[329,349,370,390,399,415,420,425,430,438,443,447] },
  { id:'rtx4060',   name:'RTX 4060',          brand:'NVIDIA', type:'GPU', tier:'budget',    price:424,  prev:299,  high52:466,  low52:259,  color:'#76B900', series:[259,275,290,299,310,330,350,370,390,405,415,424] },
  { id:'rtx3080',   name:'RTX 3080 12GB',     brand:'NVIDIA', type:'GPU', tier:'high-end',  price:799,  prev:449,  high52:899,  low52:399,  color:'#76B900', series:[399,420,440,449,460,481,510,560,620,680,740,799] },
  { id:'rx7900xtx', name:'RX 7900 XTX',       brand:'AMD',    type:'GPU', tier:'flagship',  price:1169, prev:879,  high52:1334, low52:749,  color:'#ED1C24', series:[749,799,849,879,910,950,980,1020,1060,1099,1130,1169] },
  { id:'rx7900xt',  name:'RX 7900 XT',        brand:'AMD',    type:'GPU', tier:'high-end',  price:669,  prev:699,  high52:1129, low52:559,  color:'#ED1C24', series:[559,599,629,649,669,680,695,720,749,780,720,669] },
  { id:'rx7800xt',  name:'RX 7800 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', price:499,  prev:449,  high52:499,  low52:429,  color:'#ED1C24', series:[429,440,449,455,460,468,472,478,482,488,493,499] },
  { id:'rx7700xt',  name:'RX 7700 XT',        brand:'AMD',    type:'GPU', tier:'mid-range', price:399,  prev:349,  high52:419,  low52:309,  color:'#ED1C24', series:[309,319,330,340,349,355,360,365,372,380,389,399] },
  { id:'rx7600',    name:'RX 7600',           brand:'AMD',    type:'GPU', tier:'budget',    price:279,  prev:269,  high52:329,  low52:239,  color:'#ED1C24', series:[239,249,259,265,269,272,274,275,277,278,279,279] },
];

const CPU_DATA = [
  // الأسعار محدّثة من Newegg & PCPartPicker & Tom's Hardware — أبريل 2026
  { id:'i9-14900k', name:'Core i9-14900K', brand:'Intel', type:'CPU', tier:'flagship',  price:468, prev:419, high52:599, low52:369, color:'#0071C5', series:[589,565,520,499,480,460,440,420,410,415,429,468] },
  { id:'i7-14700k', name:'Core i7-14700K', brand:'Intel', type:'CPU', tier:'high-end',  price:465, prev:329, high52:499, low52:299, color:'#0071C5', series:[419,395,370,345,319,305,299,310,320,339,349,465] },
  { id:'i5-14600k', name:'Core i5-14600K', brand:'Intel', type:'CPU', tier:'mid-range', price:279, prev:249, high52:329, low52:189, color:'#0071C5', series:[319,299,275,259,249,239,235,234,240,259,265,279] },
  { id:'i5-14400',  name:'Core i5-14400',  brand:'Intel', type:'CPU', tier:'budget',    price:189, prev:189, high52:219, low52:155, color:'#0071C5', series:[219,210,199,188,175,165,158,155,162,172,183,189] },
  { id:'i3-14100',  name:'Core i3-14100',  brand:'Intel', type:'CPU', tier:'entry',     price:129, prev:129, high52:149, low52:99,  color:'#0071C5', series:[149,139,130,119,109,102,99, 105,110,118,124,129] },
  { id:'r9-7950x',  name:'Ryzen 9 7950X',  brand:'AMD',   type:'CPU', tier:'flagship',  price:450, prev:549, high52:799, low52:400, color:'#ED1C24', series:[799,749,699,649,599,549,480,445,410,420,435,450] },
  { id:'r9-7900x',  name:'Ryzen 9 7900X',  brand:'AMD',   type:'CPU', tier:'high-end',  price:299, prev:349, high52:549, low52:251, color:'#ED1C24', series:[549,489,430,389,360,340,320,300,280,275,285,299] },
  { id:'r7-7700x',  name:'Ryzen 7 7700X',  brand:'AMD',   type:'CPU', tier:'mid-range', price:225, prev:249, high52:399, low52:189, color:'#ED1C24', series:[399,349,310,279,255,240,225,210,198,205,219,225] },
  { id:'r5-7600x',  name:'Ryzen 5 7600X',  brand:'AMD',   type:'CPU', tier:'mid-range', price:189, prev:179, high52:299, low52:169, color:'#ED1C24', series:[299,259,220,199,185,179,175,172,169,175,183,189] },
  { id:'r5-7500f',  name:'Ryzen 5 7500F',  brand:'AMD',   type:'CPU', tier:'budget',    price:149, prev:149, high52:199, low52:129, color:'#ED1C24', series:[199,180,165,155,149,143,138,135,132,138,143,149] },
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
const API_BASE = 'https://radar-gpu-production.up.railway.app';

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

