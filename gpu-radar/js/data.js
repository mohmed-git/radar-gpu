// ============================================================
// GPU RADAR — Shared Data Layer  v3.0
// المصدر الوحيد لبيانات الأسعار — يُحمَّل في كل الصفحات
// الأسعار محدّثة من Tom's Hardware / Newegg / BestValueGPU
// آخر تحديث: أبريل 2026
// ============================================================

const MONTHS_AR = ['أبر','مايو','يون','يول','أغس','سبت','أكت','نوف','ديس','يناير','فبر','مارس'];

// ══════════════════════════════════════════════════════════════
// GPU DATA
// ══════════════════════════════════════════════════════════════
const GPU_DATA = [

  // ── NVIDIA RTX 50-Series (Blackwell) — 2025 ──────────────
  { id:'rtx5090',     name:'RTX 5090',           brand:'NVIDIA', type:'GPU', tier:'flagship',  price:3899, prev:2500, high52:5200, low52:1999, color:'#76B900', series:[1999,2200,2500,2800,3100,3500,3700,3850,3800,3900,3850,3899] },
  { id:'rtx5080',     name:'RTX 5080',            brand:'NVIDIA', type:'GPU', tier:'flagship',  price:1299, prev:999,  high52:1599, low52:929,  color:'#76B900', series:[929,999,1050,1100,1150,1200,1250,1280,1290,1299,1295,1299] },
  { id:'rtx5070ti',   name:'RTX 5070 Ti',         brand:'NVIDIA', type:'GPU', tier:'high-end',  price:1009, prev:749,  high52:1199, low52:729,  color:'#76B900', series:[729,749,799,849,899,930,960,980,999,1005,1008,1009] },
  { id:'rtx5070',     name:'RTX 5070',            brand:'NVIDIA', type:'GPU', tier:'high-end',  price:649,  prev:549,  high52:799,  low52:549,  color:'#76B900', series:[549,569,589,599,610,625,635,640,645,648,649,649] },
  { id:'rtx5060ti',   name:'RTX 5060 Ti 16GB',    brand:'NVIDIA', type:'GPU', tier:'mid-range', price:514,  prev:429,  high52:599,  low52:379,  color:'#76B900', series:[379,399,419,429,445,459,470,485,499,505,510,514] },
  { id:'rtx5060ti8',  name:'RTX 5060 Ti 8GB',     brand:'NVIDIA', type:'GPU', tier:'mid-range', price:399,  prev:379,  high52:449,  low52:319,  color:'#76B900', series:[319,339,359,369,375,379,385,389,392,395,397,399] },
  { id:'rtx5060',     name:'RTX 5060',            brand:'NVIDIA', type:'GPU', tier:'budget',    price:349,  prev:299,  high52:399,  low52:279,  color:'#76B900', series:[279,289,299,309,319,329,335,339,343,345,347,349] },
  { id:'rtx5050',     name:'RTX 5050',            brand:'NVIDIA', type:'GPU', tier:'budget',    price:289,  prev:249,  high52:319,  low52:229,  color:'#76B900', series:[229,239,249,255,259,265,270,275,280,284,287,289] },

  // ── NVIDIA RTX 40-Series (Ada) ──────────────────────────
  { id:'rtx4090',     name:'RTX 4090',            brand:'NVIDIA', type:'GPU', tier:'flagship',  price:3199, prev:2199, high52:3599, low52:1599, color:'#76B900', series:[1599,1799,1999,2100,2199,2350,2450,2600,2750,2900,3050,3199] },
  { id:'rtx4080s',    name:'RTX 4080 Super',      brand:'NVIDIA', type:'GPU', tier:'flagship',  price:1498, prev:999,  high52:1550, low52:902,  color:'#76B900', series:[902,950,999,1050,1100,1150,1199,1250,1350,1420,1465,1498] },
  { id:'rtx4080',     name:'RTX 4080',            brand:'NVIDIA', type:'GPU', tier:'flagship',  price:1499, prev:1199, high52:1599, low52:949,  color:'#76B900', series:[949,999,1050,1099,1150,1199,1250,1350,1399,1449,1479,1499] },
  { id:'rtx4070tis',  name:'RTX 4070 Ti Super',   brand:'NVIDIA', type:'GPU', tier:'high-end',  price:1465, prev:799,  high52:1465, low52:739,  color:'#76B900', series:[739,799,820,850,899,950,999,1050,1150,1280,1380,1465] },
  { id:'rtx4070ti',   name:'RTX 4070 Ti',         brand:'NVIDIA', type:'GPU', tier:'high-end',  price:1199, prev:799,  high52:1299, low52:649,  color:'#76B900', series:[649,699,749,799,849,899,950,1000,1050,1100,1149,1199] },
  { id:'rtx4070s',    name:'RTX 4070 Super',      brand:'NVIDIA', type:'GPU', tier:'mid-range', price:898,  prev:599,  high52:898,  low52:560,  color:'#76B900', series:[560,599,620,640,660,689,710,740,780,830,868,898] },
  { id:'rtx4070',     name:'RTX 4070',            brand:'NVIDIA', type:'GPU', tier:'mid-range', price:714,  prev:549,  high52:799,  low52:489,  color:'#76B900', series:[489,519,549,569,589,614,634,654,674,689,704,714] },
  { id:'rtx4060ti16', name:'RTX 4060 Ti 16GB',    brand:'NVIDIA', type:'GPU', tier:'mid-range', price:447,  prev:499,  high52:499,  low52:329,  color:'#76B900', series:[329,349,370,390,419,430,440,447,445,443,446,447] },
  { id:'rtx4060ti',   name:'RTX 4060 Ti',         brand:'NVIDIA', type:'GPU', tier:'mid-range', price:395,  prev:399,  high52:449,  low52:299,  color:'#76B900', series:[299,319,339,359,369,379,385,389,393,395,394,395] },
  { id:'rtx4060',     name:'RTX 4060',            brand:'NVIDIA', type:'GPU', tier:'budget',    price:424,  prev:299,  high52:466,  low52:259,  color:'#76B900', series:[259,275,290,299,310,330,350,370,390,405,415,424] },
  { id:'rtx3090ti',   name:'RTX 3090 Ti',         brand:'NVIDIA', type:'GPU', tier:'flagship',  price:999,  prev:899,  high52:1299, low52:699,  color:'#76B900', series:[699,749,799,849,879,899,919,939,959,969,989,999] },
  { id:'rtx3090',     name:'RTX 3090',            brand:'NVIDIA', type:'GPU', tier:'flagship',  price:849,  prev:749,  high52:999,  low52:549,  color:'#76B900', series:[549,599,649,699,719,739,749,769,789,809,829,849] },
  { id:'rtx3080ti',   name:'RTX 3080 Ti',         brand:'NVIDIA', type:'GPU', tier:'high-end',  price:749,  prev:649,  high52:899,  low52:499,  color:'#76B900', series:[499,529,559,589,619,639,649,669,699,719,739,749] },
  { id:'rtx3080',     name:'RTX 3080 12GB',       brand:'NVIDIA', type:'GPU', tier:'high-end',  price:799,  prev:449,  high52:899,  low52:399,  color:'#76B900', series:[399,420,440,449,460,481,510,560,620,680,740,799] },
  { id:'rtx3070ti',   name:'RTX 3070 Ti',         brand:'NVIDIA', type:'GPU', tier:'mid-range', price:499,  prev:399,  high52:599,  low52:299,  color:'#76B900', series:[299,319,339,359,379,389,399,419,439,459,479,499] },
  { id:'rtx3070',     name:'RTX 3070',            brand:'NVIDIA', type:'GPU', tier:'mid-range', price:449,  prev:349,  high52:529,  low52:269,  color:'#76B900', series:[269,289,309,329,339,349,369,389,409,429,439,449] },
  { id:'rtx3060ti',   name:'RTX 3060 Ti',         brand:'NVIDIA', type:'GPU', tier:'mid-range', price:399,  prev:299,  high52:449,  low52:229,  color:'#76B900', series:[229,249,269,289,299,319,339,349,359,369,389,399] },
  { id:'rtx3060',     name:'RTX 3060 12GB',       brand:'NVIDIA', type:'GPU', tier:'budget',    price:299,  prev:239,  high52:349,  low52:199,  color:'#76B900', series:[199,209,219,229,239,249,259,269,279,284,291,299] },

  // ── AMD Radeon RX 9000-Series (RDNA 4) — 2025 ────────────
  { id:'rx9070xt',    name:'RX 9070 XT',          brand:'AMD',    type:'GPU', tier:'high-end',  price:719,  prev:599,  high52:799,  low52:599,  color:'#ED1C24', series:[599,619,629,649,669,689,699,705,710,715,717,719] },
  { id:'rx9070',      name:'RX 9070',             brand:'AMD',    type:'GPU', tier:'high-end',  price:619,  prev:549,  high52:699,  low52:494,  color:'#ED1C24', series:[494,519,539,549,559,569,579,589,599,605,612,619] },
  { id:'rx9060xt16',  name:'RX 9060 XT 16GB',     brand:'AMD',    type:'GPU', tier:'mid-range', price:429,  prev:349,  high52:479,  low52:349,  color:'#ED1C24', series:[349,359,369,379,389,399,409,415,420,424,427,429] },
  { id:'rx9060xt8',   name:'RX 9060 XT 8GB',      brand:'AMD',    type:'GPU', tier:'mid-range', price:349,  prev:299,  high52:399,  low52:259,  color:'#ED1C24', series:[259,279,289,299,309,319,325,330,335,340,344,349] },

  // ── AMD Radeon RX 7000-Series (RDNA 3) ───────────────────
  { id:'rx7900xtx',   name:'RX 7900 XTX',         brand:'AMD',    type:'GPU', tier:'flagship',  price:1169, prev:879,  high52:1334, low52:749,  color:'#ED1C24', series:[749,799,849,879,910,950,980,1020,1060,1099,1130,1169] },
  { id:'rx7900xt',    name:'RX 7900 XT',          brand:'AMD',    type:'GPU', tier:'high-end',  price:669,  prev:699,  high52:1129, low52:559,  color:'#ED1C24', series:[559,599,629,649,669,680,695,720,749,780,720,669] },
  { id:'rx7900gre',   name:'RX 7900 GRE',         brand:'AMD',    type:'GPU', tier:'high-end',  price:549,  prev:509,  high52:599,  low52:409,  color:'#ED1C24', series:[409,429,449,469,489,499,505,509,515,525,535,549] },
  { id:'rx7800xt',    name:'RX 7800 XT',          brand:'AMD',    type:'GPU', tier:'mid-range', price:499,  prev:449,  high52:499,  low52:429,  color:'#ED1C24', series:[429,440,449,455,460,468,472,478,482,488,493,499] },
  { id:'rx7700xt',    name:'RX 7700 XT',          brand:'AMD',    type:'GPU', tier:'mid-range', price:399,  prev:349,  high52:419,  low52:309,  color:'#ED1C24', series:[309,319,330,340,349,355,360,365,372,380,389,399] },
  { id:'rx7600xt',    name:'RX 7600 XT',          brand:'AMD',    type:'GPU', tier:'budget',    price:299,  prev:288,  high52:329,  low52:239,  color:'#ED1C24', series:[239,249,259,269,279,285,288,291,294,296,298,299] },
  { id:'rx7600',      name:'RX 7600',             brand:'AMD',    type:'GPU', tier:'budget',    price:279,  prev:269,  high52:329,  low52:239,  color:'#ED1C24', series:[239,249,259,265,269,272,274,275,277,278,279,279] },
  { id:'rx7500xt',    name:'RX 7500 XT',          brand:'AMD',    type:'GPU', tier:'entry',     price:199,  prev:189,  high52:229,  low52:169,  color:'#ED1C24', series:[169,174,179,183,185,187,189,191,193,195,197,199] },

  // ── AMD Radeon RX 6000-Series (RDNA 2) ───────────────────
  { id:'rx6950xt',    name:'RX 6950 XT',          brand:'AMD',    type:'GPU', tier:'flagship',  price:499,  prev:449,  high52:599,  low52:349,  color:'#ED1C24', series:[349,369,389,399,419,429,439,449,459,469,484,499] },
  { id:'rx6900xt',    name:'RX 6900 XT',          brand:'AMD',    type:'GPU', tier:'high-end',  price:399,  prev:349,  high52:499,  low52:279,  color:'#ED1C24', series:[279,299,319,329,339,349,359,369,379,384,392,399] },
  { id:'rx6800xt',    name:'RX 6800 XT',          brand:'AMD',    type:'GPU', tier:'high-end',  price:349,  prev:299,  high52:449,  low52:249,  color:'#ED1C24', series:[249,264,279,289,299,309,319,329,334,339,344,349] },
  { id:'rx6700xt',    name:'RX 6700 XT',          brand:'AMD',    type:'GPU', tier:'mid-range', price:249,  prev:229,  high52:299,  low52:179,  color:'#ED1C24', series:[179,189,199,209,219,224,229,234,239,243,246,249] },
  { id:'rx6600xt',    name:'RX 6600 XT',          brand:'AMD',    type:'GPU', tier:'budget',    price:189,  prev:179,  high52:229,  low52:139,  color:'#ED1C24', series:[139,149,159,164,169,174,177,179,182,184,187,189] },
  { id:'rx6600',      name:'RX 6600',             brand:'AMD',    type:'GPU', tier:'budget',    price:169,  prev:159,  high52:199,  low52:119,  color:'#ED1C24', series:[119,129,139,144,149,154,157,159,162,164,167,169] },

  // ── Intel Arc B-Series (Battlemage) — 2024 ───────────────
  { id:'arc-b580',    name:'Arc B580',            brand:'Intel',  type:'GPU', tier:'mid-range', price:289,  prev:250,  high52:299,  low52:229,  color:'#0071C5', series:[229,239,245,250,255,259,263,267,270,274,279,289] },
  { id:'arc-b570',    name:'Arc B570',            brand:'Intel',  type:'GPU', tier:'budget',    price:249,  prev:219,  high52:269,  low52:199,  color:'#0071C5', series:[199,209,215,219,223,227,231,235,239,243,246,249] },

  // ── Intel Arc A-Series (Alchemist) ───────────────────────
  { id:'arc-a770',    name:'Arc A770 16GB',       brand:'Intel',  type:'GPU', tier:'mid-range', price:229,  prev:249,  high52:349,  low52:149,  color:'#0071C5', series:[349,319,289,269,259,249,239,229,224,220,218,229] },
  { id:'arc-a750',    name:'Arc A750',            brand:'Intel',  type:'GPU', tier:'budget',    price:189,  prev:199,  high52:289,  low52:139,  color:'#0071C5', series:[289,259,229,209,199,189,179,169,159,155,169,189] },
  { id:'arc-a580',    name:'Arc A580',            brand:'Intel',  type:'GPU', tier:'budget',    price:159,  prev:179,  high52:179,  low52:119,  color:'#0071C5', series:[179,169,159,149,139,129,119,125,135,145,152,159] },
];

// ══════════════════════════════════════════════════════════════
// CPU DATA
// ══════════════════════════════════════════════════════════════
const CPU_DATA = [

  // ── Intel Arrow Lake (Core Ultra 200-Series) — LGA1851 ──
  { id:'cu9-285k',    name:'Core Ultra 9 285K',   brand:'Intel', type:'CPU', tier:'flagship',  price:557,  prev:589,  high52:589,  low52:499,  color:'#0071C5', series:[589,579,569,559,549,539,530,520,525,535,549,557] },
  { id:'cu7-265k',    name:'Core Ultra 7 265K',   brand:'Intel', type:'CPU', tier:'high-end',  price:309,  prev:389,  high52:399,  low52:284,  color:'#0071C5', series:[399,379,359,339,319,305,295,288,290,300,305,309] },
  { id:'cu7-265kf',   name:'Core Ultra 7 265KF',  brand:'Intel', type:'CPU', tier:'high-end',  price:289,  prev:369,  high52:379,  low52:264,  color:'#0071C5', series:[379,359,339,319,299,285,276,269,272,279,285,289] },
  { id:'cu5-245k',    name:'Core Ultra 5 245K',   brand:'Intel', type:'CPU', tier:'mid-range', price:249,  prev:309,  high52:329,  low52:219,  color:'#0071C5', series:[329,309,289,275,265,255,249,245,247,248,249,249] },
  { id:'cu5-245kf',   name:'Core Ultra 5 245KF',  brand:'Intel', type:'CPU', tier:'mid-range', price:229,  prev:289,  high52:309,  low52:199,  color:'#0071C5', series:[309,289,269,255,245,235,229,225,227,228,229,229] },
  { id:'cu5-235',     name:'Core Ultra 5 235',    brand:'Intel', type:'CPU', tier:'mid-range', price:199,  prev:219,  high52:249,  low52:179,  color:'#0071C5', series:[219,214,209,205,201,199,197,196,196,197,198,199] },

  // ── Intel Raptor Lake Refresh (14th Gen) — LGA1700 ──────
  { id:'i9-14900ks',  name:'Core i9-14900KS',     brand:'Intel', type:'CPU', tier:'flagship',  price:499,  prev:529,  high52:699,  low52:399,  color:'#0071C5', series:[699,649,599,559,539,529,519,509,499,499,499,499] },
  { id:'i9-14900k',   name:'Core i9-14900K',      brand:'Intel', type:'CPU', tier:'flagship',  price:468,  prev:419,  high52:599,  low52:369,  color:'#0071C5', series:[589,565,520,499,480,460,440,420,410,415,429,468] },
  { id:'i9-14900',    name:'Core i9-14900',       brand:'Intel', type:'CPU', tier:'high-end',  price:389,  prev:359,  high52:449,  low52:299,  color:'#0071C5', series:[449,429,409,389,369,359,349,339,349,359,374,389] },
  { id:'i7-14700k',   name:'Core i7-14700K',      brand:'Intel', type:'CPU', tier:'high-end',  price:349,  prev:329,  high52:419,  low52:279,  color:'#0071C5', series:[419,395,370,345,319,305,299,289,295,310,329,349] },
  { id:'i7-14700kf',  name:'Core i7-14700KF',     brand:'Intel', type:'CPU', tier:'high-end',  price:329,  prev:309,  high52:399,  low52:259,  color:'#0071C5', series:[399,374,349,325,299,285,279,269,275,290,309,329] },
  { id:'i7-14700',    name:'Core i7-14700',       brand:'Intel', type:'CPU', tier:'high-end',  price:299,  prev:279,  high52:349,  low52:239,  color:'#0071C5', series:[349,329,309,289,273,265,259,255,259,269,284,299] },
  { id:'i5-14600k',   name:'Core i5-14600K',      brand:'Intel', type:'CPU', tier:'mid-range', price:279,  prev:249,  high52:329,  low52:189,  color:'#0071C5', series:[319,299,275,259,249,239,235,234,240,259,265,279] },
  { id:'i5-14600kf',  name:'Core i5-14600KF',     brand:'Intel', type:'CPU', tier:'mid-range', price:259,  prev:229,  high52:309,  low52:169,  color:'#0071C5', series:[299,279,259,244,234,229,224,219,224,234,244,259] },
  { id:'i5-14600',    name:'Core i5-14600',       brand:'Intel', type:'CPU', tier:'mid-range', price:229,  prev:219,  high52:259,  low52:179,  color:'#0071C5', series:[259,249,239,230,224,219,215,212,215,220,224,229] },
  { id:'i5-14500',    name:'Core i5-14500',       brand:'Intel', type:'CPU', tier:'mid-range', price:209,  prev:199,  high52:239,  low52:169,  color:'#0071C5', series:[239,229,219,210,204,199,195,192,195,200,205,209] },
  { id:'i5-14400',    name:'Core i5-14400',       brand:'Intel', type:'CPU', tier:'budget',    price:189,  prev:189,  high52:219,  low52:155,  color:'#0071C5', series:[219,210,199,188,175,165,158,155,162,172,183,189] },
  { id:'i5-14400f',   name:'Core i5-14400F',      brand:'Intel', type:'CPU', tier:'budget',    price:149,  prev:159,  high52:189,  low52:119,  color:'#0071C5', series:[189,179,169,163,159,155,150,145,142,145,149,149] },
  { id:'i3-14100',    name:'Core i3-14100',       brand:'Intel', type:'CPU', tier:'entry',     price:105,  prev:134,  high52:162,  low52:95,   color:'#0071C5', series:[162,149,139,132,126,118,112,107,102,99,102,105] },
  { id:'i3-14100f',   name:'Core i3-14100F',      brand:'Intel', type:'CPU', tier:'entry',     price:79,   prev:109,  high52:129,  low52:75,   color:'#0071C5', series:[129,119,108,101,97,93,89,84,79,77,78,79] },

  // ── Intel Raptor Lake (13th Gen) — LGA1700 ──────────────
  { id:'i9-13900k',   name:'Core i9-13900K',      brand:'Intel', type:'CPU', tier:'flagship',  price:349,  prev:399,  high52:589,  low52:279,  color:'#0071C5', series:[589,549,499,459,429,409,389,369,349,339,344,349] },
  { id:'i9-13900ks',  name:'Core i9-13900KS',     brand:'Intel', type:'CPU', tier:'flagship',  price:429,  prev:479,  high52:699,  low52:349,  color:'#0071C5', series:[699,639,589,549,519,499,469,449,429,419,424,429] },
  { id:'i7-13700k',   name:'Core i7-13700K',      brand:'Intel', type:'CPU', tier:'high-end',  price:279,  prev:319,  high52:419,  low52:219,  color:'#0071C5', series:[419,389,359,339,319,299,279,259,245,254,265,279] },
  { id:'i5-13600k',   name:'Core i5-13600K',      brand:'Intel', type:'CPU', tier:'mid-range', price:219,  prev:239,  high52:319,  low52:169,  color:'#0071C5', series:[319,289,264,249,239,229,219,209,199,205,212,219] },
  { id:'i5-13400',    name:'Core i5-13400',       brand:'Intel', type:'CPU', tier:'budget',    price:169,  prev:179,  high52:219,  low52:139,  color:'#0071C5', series:[219,199,184,175,169,164,159,155,152,155,162,169] },
  { id:'i3-13100',    name:'Core i3-13100',       brand:'Intel', type:'CPU', tier:'entry',     price:99,   prev:109,  high52:149,  low52:79,   color:'#0071C5', series:[149,134,119,109,103,99,95,91,88,91,95,99] },

  // ── AMD Ryzen 9000-Series (Zen 5) — AM5 ─────────────────
  { id:'r9-9950x3d',  name:'Ryzen 9 9950X3D',    brand:'AMD',   type:'CPU', tier:'flagship',  price:675,  prev:699,  high52:749,  low52:649,  color:'#ED1C24', series:[699,699,695,689,685,680,679,677,676,676,675,675] },
  { id:'r9-9950x',    name:'Ryzen 9 9950X',      brand:'AMD',   type:'CPU', tier:'flagship',  price:519,  prev:549,  high52:699,  low52:479,  color:'#ED1C24', series:[699,649,619,599,579,559,549,539,529,519,519,519] },
  { id:'r9-9900x3d',  name:'Ryzen 9 9900X3D',    brand:'AMD',   type:'CPU', tier:'high-end',  price:549,  prev:599,  high52:649,  low52:529,  color:'#ED1C24', series:[599,599,589,579,569,561,555,551,549,549,549,549] },
  { id:'r9-9900x',    name:'Ryzen 9 9900X',      brand:'AMD',   type:'CPU', tier:'high-end',  price:379,  prev:449,  high52:499,  low52:339,  color:'#ED1C24', series:[499,479,459,449,439,419,409,399,389,381,379,379] },
  { id:'r7-9850x3d',  name:'Ryzen 7 9850X3D',    brand:'AMD',   type:'CPU', tier:'high-end',  price:499,  prev:499,  high52:519,  low52:479,  color:'#ED1C24', series:[499,499,499,499,499,499,499,499,499,499,499,499] },
  { id:'r7-9800x3d',  name:'Ryzen 7 9800X3D',    brand:'AMD',   type:'CPU', tier:'high-end',  price:419,  prev:479,  high52:479,  low52:419,  color:'#ED1C24', series:[479,469,459,449,439,434,430,427,424,421,419,419] },
  { id:'r7-9700x',    name:'Ryzen 7 9700X',      brand:'AMD',   type:'CPU', tier:'mid-range', price:299,  prev:359,  high52:399,  low52:279,  color:'#ED1C24', series:[399,379,359,345,329,319,311,305,301,299,299,299] },
  { id:'r5-9600x',    name:'Ryzen 5 9600X',      brand:'AMD',   type:'CPU', tier:'mid-range', price:189,  prev:199,  high52:279,  low52:169,  color:'#ED1C24', series:[279,249,229,214,205,199,194,190,185,182,185,189] },
  { id:'r5-9600',     name:'Ryzen 5 9600',       brand:'AMD',   type:'CPU', tier:'budget',    price:169,  prev:179,  high52:199,  low52:149,  color:'#ED1C24', series:[199,189,184,179,176,173,170,167,165,165,167,169] },

  // ── AMD Ryzen 7000-Series (Zen 4) — AM5 ─────────────────
  { id:'r9-7950x3d',  name:'Ryzen 9 7950X3D',    brand:'AMD',   type:'CPU', tier:'flagship',  price:549,  prev:599,  high52:699,  low52:449,  color:'#ED1C24', series:[699,659,619,589,569,549,529,509,495,505,525,549] },
  { id:'r9-7950x',    name:'Ryzen 9 7950X',      brand:'AMD',   type:'CPU', tier:'flagship',  price:450,  prev:549,  high52:799,  low52:400,  color:'#ED1C24', series:[799,749,699,649,599,549,480,445,410,420,435,450] },
  { id:'r9-7900x3d',  name:'Ryzen 9 7900X3D',    brand:'AMD',   type:'CPU', tier:'high-end',  price:329,  prev:369,  high52:499,  low52:279,  color:'#ED1C24', series:[499,459,419,399,379,359,344,334,324,319,324,329] },
  { id:'r9-7900x',    name:'Ryzen 9 7900X',      brand:'AMD',   type:'CPU', tier:'high-end',  price:299,  prev:349,  high52:549,  low52:251,  color:'#ED1C24', series:[549,489,430,389,360,340,320,300,280,275,285,299] },
  { id:'r9-7900',     name:'Ryzen 9 7900',       brand:'AMD',   type:'CPU', tier:'high-end',  price:279,  prev:299,  high52:429,  low52:229,  color:'#ED1C24', series:[429,389,359,339,319,304,294,284,274,270,274,279] },
  { id:'r7-7800x3d',  name:'Ryzen 7 7800X3D',    brand:'AMD',   type:'CPU', tier:'high-end',  price:299,  prev:349,  high52:449,  low52:249,  color:'#ED1C24', series:[449,419,389,369,349,329,314,309,304,299,299,299] },
  { id:'r7-7700x',    name:'Ryzen 7 7700X',      brand:'AMD',   type:'CPU', tier:'mid-range', price:225,  prev:249,  high52:399,  low52:189,  color:'#ED1C24', series:[399,349,310,279,255,240,225,210,198,205,219,225] },
  { id:'r7-7700',     name:'Ryzen 7 7700',       brand:'AMD',   type:'CPU', tier:'mid-range', price:199,  prev:219,  high52:329,  low52:169,  color:'#ED1C24', series:[329,299,269,249,235,225,215,205,195,190,195,199] },
  { id:'r5-7600x',    name:'Ryzen 5 7600X',      brand:'AMD',   type:'CPU', tier:'mid-range', price:189,  prev:179,  high52:299,  low52:169,  color:'#ED1C24', series:[299,259,220,199,185,179,175,172,169,175,183,189] },
  { id:'r5-7600',     name:'Ryzen 5 7600',       brand:'AMD',   type:'CPU', tier:'budget',    price:169,  prev:159,  high52:229,  low52:139,  color:'#ED1C24', series:[229,209,189,174,164,159,154,149,144,150,159,169] },
  { id:'r5-7500f',    name:'Ryzen 5 7500F',      brand:'AMD',   type:'CPU', tier:'budget',    price:149,  prev:149,  high52:199,  low52:129,  color:'#ED1C24', series:[199,180,165,155,149,143,138,135,132,138,143,149] },

  // ── AMD Ryzen 5000-Series (Zen 3) — AM4 ─────────────────
  { id:'r9-5950x',    name:'Ryzen 9 5950X',      brand:'AMD',   type:'CPU', tier:'flagship',  price:249,  prev:279,  high52:349,  low52:199,  color:'#ED1C24', series:[349,319,299,279,264,254,249,244,239,234,241,249] },
  { id:'r9-5900x',    name:'Ryzen 9 5900X',      brand:'AMD',   type:'CPU', tier:'high-end',  price:199,  prev:219,  high52:299,  low52:159,  color:'#ED1C24', series:[299,269,249,234,224,219,214,209,199,189,194,199] },
  { id:'r7-5800x3d',  name:'Ryzen 7 5800X3D',    brand:'AMD',   type:'CPU', tier:'high-end',  price:219,  prev:239,  high52:299,  low52:179,  color:'#ED1C24', series:[299,279,259,249,239,234,229,224,219,214,216,219] },
  { id:'r7-5800x',    name:'Ryzen 7 5800X',      brand:'AMD',   type:'CPU', tier:'mid-range', price:169,  prev:189,  high52:249,  low52:139,  color:'#ED1C24', series:[249,229,209,194,184,179,174,169,164,159,164,169] },
  { id:'r5-5600x',    name:'Ryzen 5 5600X',      brand:'AMD',   type:'CPU', tier:'mid-range', price:119,  prev:129,  high52:179,  low52:99,   color:'#ED1C24', series:[179,159,144,134,129,124,119,114,109,104,111,119] },
  { id:'r5-5600',     name:'Ryzen 5 5600',       brand:'AMD',   type:'CPU', tier:'budget',    price:99,   prev:109,  high52:149,  low52:79,   color:'#ED1C24', series:[149,134,119,109,103,99,94,89,84,81,89,99] },
  { id:'r5-5500',     name:'Ryzen 5 5500',       brand:'AMD',   type:'CPU', tier:'entry',     price:79,   prev:89,   high52:119,  low52:59,   color:'#ED1C24', series:[119,104,94,89,84,79,74,69,64,62,70,79] },
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
