// ============================================================
// GPU RADAR — app.js (index.html only)
// Depends on: js/data.js loaded BEFORE this file
// ============================================================

let mainChartInstance = null;
let chartPeriod = 12;
let selectedParts = ['rtx4090', 'i9-14900k'];
let currentFilter = 'all';
let currentSort   = 'name';
let displayedCount = 8;

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();

  // Show loading state
  showLoadingState();

  // Fetch live prices from backend, fallback to static data
  const isLive = await fetchLivePrices();

  // Hide loading, render everything
  hideLoadingState();
  buildTicker();
  buildMiniCharts();
  buildDeals();
  renderTable();
  buildMainChart();
  buildChartSelector();
  updateLastTime(isLive);

  // Auto-refresh every 30 minutes
  setInterval(async () => {
    await fetchLivePrices();
    buildTicker();
    buildDeals();
    renderTable();
    buildMainChart();
    updateLastTime(true);
  }, 30 * 60 * 1000);
});

function showLoadingState() {
  const tbody = document.getElementById('price-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr><td colspan="8" style="text-align:center;padding:3rem;color:var(--text3)">
        <div style="display:flex;align-items:center;justify-content:center;gap:.75rem;font-size:.95rem">
          <span style="display:inline-block;width:16px;height:16px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></span>
          جارٍ تحميل أحدث الأسعار...
        </div>
      </td></tr>`;
  }
  // Add spin animation if not already present
  if (!document.getElementById('spin-style')) {
    const s = document.createElement('style');
    s.id = 'spin-style';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}

function hideLoadingState() {
  // Loading row will be replaced by renderTable()
}

// ── TICKER ────────────────────────────────────────────────
function buildTicker() {
  const el = document.getElementById('ticker');
  if (!el) return;
  const items = [...ALL_PARTS].sort(() => Math.random() - 0.5).slice(0, 10);
  const html = [...items, ...items].map(p => {
    const ch = parseFloat(calcChange(p.price, p.prev));
    const cls = ch > 0 ? 't-up' : 't-down';
    const sign = ch > 0 ? '▲' : '▼';
    return `<span class="ticker-item">
      <span class="ticker-name">${p.name}</span>
      <span class="ticker-price">$${p.price.toLocaleString()}</span>
      <span class="ticker-change ${cls}">${sign}${Math.abs(ch)}%</span>
    </span>`;
  }).join('');
  el.innerHTML = html;
}

// ── MINI CHARTS ───────────────────────────────────────────
function buildMiniCharts() {
  renderMiniBar('gpu-mini-chart', GPU_DATA, '#38BDF8');
  renderMiniBar('cpu-mini-chart', CPU_DATA, '#FBBF24');
}

function renderMiniBar(id, data, color) {
  const el = document.getElementById(id);
  if (!el) return;
  const avgs = MONTHS_AR.map((_, i) => {
    const vals = data.map(d => d.series[i]);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  });
  const max = Math.max(...avgs), min = Math.min(...avgs);
  el.innerHTML = avgs.map((v, i) => {
    const pct = Math.round(((v - min) / (max - min || 1)) * 100) || 10;
    return `<div class="mini-bar" style="height:${pct}%;background:${color}33;border-top:2px solid ${color}" title="${MONTHS_AR[i]}: $${v.toLocaleString()}"></div>`;
  }).join('');
}

// ── DEALS ─────────────────────────────────────────────────
function buildDeals() {
  const el = document.getElementById('deals-list');
  if (!el) return;
  const drops = [...ALL_PARTS]
    .map(p => ({ ...p, drop: parseFloat(calcChange(p.price, p.prev)) }))
    .filter(p => p.drop < 0)
    .sort((a, b) => a.drop - b.drop)
    .slice(0, 5);
  el.innerHTML = drops.map(p =>
    `<li class="deal-item">
      <span class="deal-name">${p.name}</span>
      <span class="deal-drop">▼ ${Math.abs(p.drop)}%</span>
    </li>`
  ).join('');
}

// ── PRICE TABLE ───────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('price-tbody');
  if (!tbody) return;

  let data = [...ALL_PARTS];

  // Apply search query first
  if (searchQuery) {
    data = data.filter(p =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery) ||
      p.type.toLowerCase().includes(searchQuery) ||
      (p.tier && p.tier.toLowerCase().includes(searchQuery))
    );
  } else if (currentFilter !== 'all') {
    data = data.filter(p => {
      if (currentFilter === 'gpu')    return p.type === 'GPU';
      if (currentFilter === 'cpu')    return p.type === 'CPU';
      if (currentFilter === 'nvidia') return p.brand === 'NVIDIA';
      if (currentFilter === 'amd')    return p.brand === 'AMD';
      if (currentFilter === 'intel')  return p.brand === 'Intel';
      return true;
    });
  }

  data.sort((a, b) => {
    if (currentSort === 'price-asc')  return a.price - b.price;
    if (currentSort === 'price-desc') return b.price - a.price;
    if (currentSort === 'drop')       return parseFloat(calcChange(a.price, a.prev)) - parseFloat(calcChange(b.price, b.prev));
    if (currentSort === 'rise')       return parseFloat(calcChange(b.price, b.prev)) - parseFloat(calcChange(a.price, a.prev));
    return a.name.localeCompare(b.name);
  });

  const sliced = data.slice(0, displayedCount);

  tbody.innerHTML = sliced.map(p => {
    const ch = parseFloat(calcChange(p.price, p.prev));
    const chCls  = ch > 0 ? 'change-up' : ch < 0 ? 'change-down' : 'change-flat';
    const chSign = ch > 0 ? '▲' : ch < 0 ? '▼' : '—';
    const typeCls  = p.type === 'GPU' ? 'type-gpu' : 'type-cpu';
    const brandCls = `brand-${p.brand.toLowerCase()}`;
    return `<tr>
      <td class="td-name">${p.name}<small>${p.brand} ${p.type}</small></td>
      <td><span class="type-badge ${typeCls}">${p.type}</span></td>
      <td><span class="brand-badge ${brandCls}">${p.brand}</span></td>
      <td class="td-price">$${p.price.toLocaleString()}</td>
      <td class="td-prev">$${p.prev.toLocaleString()}</td>
      <td><span class="change-badge ${chCls}">${chSign}${Math.abs(ch)}%</span></td>
      <td class="price-range"><span class="high">▲$${p.high52.toLocaleString()}</span> / <span class="low">▼$${p.low52.toLocaleString()}</span></td>
      <td>${makeSpark(p.series.slice(-6))}</td>
    </tr>`;
  }).join('');

  const btn = document.getElementById('load-more-btn');
  if (btn) btn.style.display = displayedCount >= data.length ? 'none' : 'inline-flex';
}

function filterParts(filter, btn) {
  currentFilter = filter;
  displayedCount = 8;
  document.querySelectorAll('.ftab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  renderTable();
}

function sortParts(val) {
  currentSort = val;
  renderTable();
}

function loadMoreParts() {
  displayedCount += 8;
  renderTable();
}

// ── MAIN CHART ────────────────────────────────────────────
function buildMainChart() {
  const ctx = document.getElementById('main-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (mainChartInstance) mainChartInstance.destroy();

  const labels   = MONTHS_AR.slice(12 - chartPeriod);
  const datasets = selectedParts.map(id => {
    const p = ALL_PARTS.find(x => x.id === id);
    if (!p) return null;
    return {
      label: p.name,
      data: p.series.slice(12 - chartPeriod),
      borderColor: p.color,
      backgroundColor: p.color + '10',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
    };
  }).filter(Boolean);

  mainChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A2332',
          borderColor: 'rgba(99,179,237,.2)',
          borderWidth: 1,
          titleColor: '#94A3B8',
          bodyColor: '#E2E8F0',
          callbacks: { label: c => ` ${c.dataset.label}: $${c.parsed.y.toLocaleString()}` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#64748B', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#64748B', font: { size: 11 }, callback: v => '$' + v.toLocaleString() } }
      }
    }
  });

  buildChartLegend(datasets);
}

function buildChartLegend(datasets) {
  const el = document.getElementById('chart-legend');
  if (!el) return;
  el.innerHTML = datasets.map((d, i) =>
    `<span class="legend-item" onclick="toggleChartLine(${i}, this)">
      <span class="legend-dot" style="background:${d.borderColor}"></span>
      ${d.label}
    </span>`
  ).join('');
}

function toggleChartLine(index, el) {
  if (!mainChartInstance) return;
  const meta = mainChartInstance.getDatasetMeta(index);
  meta.hidden = !meta.hidden;
  mainChartInstance.update();
  el.style.opacity = meta.hidden ? '0.35' : '1';
}

function setChartPeriod(months, btn) {
  chartPeriod = months;
  document.querySelectorAll('.pbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildMainChart();
}

function buildChartSelector() {
  const el = document.getElementById('chart-selector');
  if (!el) return;
  el.innerHTML = ALL_PARTS.slice(0, 10).map(p =>
    `<button class="cpart-btn${selectedParts.includes(p.id) ? ' active' : ''}"
      onclick="toggleChartPart('${p.id}', this)">${p.name}</button>`
  ).join('');
}

function toggleChartPart(id, btn) {
  if (selectedParts.includes(id)) {
    if (selectedParts.length <= 1) return;
    selectedParts = selectedParts.filter(x => x !== id);
    btn.classList.remove('active');
  } else {
    if (selectedParts.length >= 5) {
      const removed = selectedParts.shift();
      document.querySelector(`.cpart-btn[onclick*="'${removed}'"]`)?.classList.remove('active');
    }
    selectedParts.push(id);
    btn.classList.add('active');
  }
  buildMainChart();
}

// ── SEARCH ────────────────────────────────────────────────
// ── SEARCH ────────────────────────────────────────────────
let searchQuery = '';

function handleSearch() {
  const input = document.getElementById('hero-search');
  const q = (input?.value || '').trim().toLowerCase();
  if (!q) return;

  searchQuery = q;

  // Reset filter tabs to 'all' so search covers everything
  currentFilter = 'all';
  currentSort   = 'name';
  displayedCount = 20;
  document.querySelectorAll('.ftab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  const allTab = document.querySelector('.ftab');
  if (allTab) { allTab.classList.add('active'); allTab.setAttribute('aria-pressed', 'true'); }

  renderTable();

  // Scroll to results
  setTimeout(() => {
    document.getElementById('tracker-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);

  // Show search result label
  const labelWrap = document.getElementById('search-result-label');
  const labelText = document.getElementById('search-result-text');
  const clearBtn  = document.getElementById('search-clear-btn');
  if (labelWrap && labelText) {
    const count = ALL_PARTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    ).length;
    labelText.textContent = count > 0
      ? `نتائج البحث عن "${input.value}" — ${count} قطعة`
      : `لا توجد نتائج لـ "${input.value}"`;
    labelWrap.style.display = 'flex';
  }
  if (clearBtn) clearBtn.style.display = 'inline-flex';
}

function clearSearch() {
  searchQuery = '';
  const input = document.getElementById('hero-search');
  if (input) input.value = '';
  const labelWrap = document.getElementById('search-result-label');
  if (labelWrap) labelWrap.style.display = 'none';
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
  displayedCount = 8;
  renderTable();
}

function quickSearch(term) {
  const input = document.getElementById('hero-search');
  if (input) input.value = term;
  handleSearch();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'hero-search') handleSearch();
  if (e.key === 'Escape' && searchQuery) clearSearch();
});

// ── ALERT FORM ────────────────────────────────────────────
function subscribeAlert(e) {
  e.preventDefault();
  const ok = document.getElementById('alert-success');
  if (ok) { ok.style.display = 'block'; e.target.reset(); setTimeout(() => ok.style.display = 'none', 5000); }
}

// ── UTILS ─────────────────────────────────────────────────
function updateLastTime(isLive = false) {
  const el = document.getElementById('last-update');
  if (!el) return;

  const info = getUpdateInfo(); // from data.js

  if (info.isLive && info.lastUpdated) {
    el.innerHTML = info.timeAgo;
    el.title = `آخر تحديث: ${new Date(info.lastUpdated).toLocaleString('ar-SA')}`;
  } else {
    el.textContent = 'بيانات محلية';
    el.title = 'تعذّر الاتصال بالخادم، يتم عرض البيانات المحفوظة';
  }

  // Update next update countdown if available
  const nextEl = document.getElementById('next-update');
  if (nextEl && info.nextUpdate) {
    const mins = Math.round((new Date(info.nextUpdate) - Date.now()) / 60000);
    nextEl.textContent = mins > 0 ? `التحديث القادم: خلال ${mins < 60 ? mins + ' دقيقة' : Math.round(mins/60) + ' ساعة'}` : 'التحديث قريباً';
  }
}
