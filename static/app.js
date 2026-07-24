// ============================================================
//  تحويل الزوّار البشر إلى الدومين الجديد — مع إبقاء Googlebot
//  يرى المحتوى طبيعيًا (SEO-safe: لا يُحوَّل الزواحف).
//
//  ⚠️ عدّل سطرًا واحدًا فقط: REDIRECT_ENABLED و NEW_DOMAIN.
//     لا تلمس أي سطر آخر.
//
//  1) ضع دومينك الجديد داخل علامتَي الاقتباس (بدون / في النهاية).
//  2) اجعل REDIRECT_ENABLED = true لتشغيل التحويل.
// ============================================================
var NEW_DOMAIN = 'https://mynewdoman.com';   // ← دومينك الجديد هنا
var REDIRECT_ENABLED = true;                  // ← true لتشغيل التحويل، false لإيقافه
// ============================================================
(function () {
  // 1) لا تحوّل إذا كان التحويل مُعطّلًا أو الرابط فارغًا
  if (!REDIRECT_ENABLED || !NEW_DOMAIN) return

  // 2) اكتشاف محرّكات البحث (bots) — نتركها ترى المحتوى كما هو
  var ua = navigator.userAgent || ''
  var isBot = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkShare|W3C_Validator|whatsapp|telegram|Googlebot|AdsBot|Mediapartners|Google-InspectionTool|Storebot|APIs-Google/i.test(ua)
  if (isBot) return

  // 3) احترام أدوات المعاينة/التحقق: إذا وُجد ?noredirect أو ?seo نتوقّف
  if (/[?&](noredirect|seo|preview)=1/.test(location.search)) return

  // 4) حوّل البشر إلى نفس المسار على الدومين الجديد
  var target = NEW_DOMAIN.replace(/\/+$/, '') + location.pathname + location.search + location.hash
  location.replace(target)
})();

// تفعيل قائمة التنقّل على الشاشات الصغيرة
(function () {
  const toggle = document.getElementById('nav-toggle')
  const nav = document.getElementById('site-nav')
  if (!toggle || !nav) return

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open')
    toggle.setAttribute('aria-expanded', String(isOpen))
    const icon = toggle.querySelector('i')
    if (icon) {
      icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'
    }
  })

  // إغلاق القائمة عند الضغط على رابط
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open')
      toggle.setAttribute('aria-expanded', 'false')
      const icon = toggle.querySelector('i')
      if (icon) icon.className = 'fa-solid fa-bars'
    })
  })
})();

// ====== بحث من جهة العميل (يعمل على الموقع الثابت) ======
(function () {
  // نعمل فقط على صفحة البحث (سواء بامتداد .html أو برابط نظيف /search)
  if (!/\/search(\.html)?$/.test(location.pathname)) return

  var params = new URLSearchParams(location.search)
  var q = (params.get('q') || '').trim()

  // ضبط قيمة حقل البحث لو موجودة في الرابط
  var input = document.querySelector('.page-search input[name="q"]')
  if (input && q) input.value = q

  if (!q) return // بدون كلمة بحث: يبقى الفهرس الكامل ظاهرًا

  var catNames = {
    movies: 'أفلام ومسلسلات',
    celebrities: 'مشاهير',
    health: 'صحة',
    general: 'معلومات عامة',
  }
  var catIcons = {
    movies: 'fa-film',
    celebrities: 'fa-star',
    health: 'fa-heart-pulse',
    general: 'fa-lightbulb',
  }
  var catColors = {
    movies: 'indigo', celebrities: 'amber', health: 'emerald', general: 'sky',
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  fetch('/static/search-index.json')
    .then(function (r) { return r.json() })
    .then(function (data) {
      var ql = q.toLowerCase()
      var results = data.filter(function (a) {
        var hay = [a.title, a.keyword, a.summary].concat(a.tags || []).join(' ').toLowerCase()
        return hay.indexOf(ql) !== -1
      })

      var cards = results.map(function (a) {
        return '<article class="card" data-category="' + a.category + '">' +
          '<a class="card-link" href="/article/' + a.slug + '.html">' +
          '<div class="card-badge badge-' + (catColors[a.category] || 'indigo') + '">' +
          '<i class="fa-solid ' + (catIcons[a.category] || 'fa-file') + '"></i> ' +
          esc(catNames[a.category] || '') + '</div>' +
          '<h3 class="card-title">' + esc(a.title) + '</h3>' +
          '<p class="card-summary">' + esc(a.summary) + '</p>' +
          '</a></article>'
      }).join('')

      var info = results.length
        ? 'نتائج البحث عن «<strong>' + esc(q) + '</strong>»: ' + results.length + ' مقالة'
        : 'لا توجد نتائج مطابقة لـ «<strong>' + esc(q) + '</strong>». جرّب كلمات أخرى.'

      var html = '<p class="search-info">' + info + '</p>' +
        (results.length ? '<div class="card-grid">' + cards + '</div>' : '')

      // نستبدل كتلة الفهرس بالنتائج
      var container = document.querySelector('.container')
      if (!container) return
      // نزيل الأقسام الحالية (الفهرس) بعد نموذج البحث
      var form = container.querySelector('.page-search')
      var el = form ? form.nextElementSibling : null
      while (el) { var next = el.nextElementSibling; el.remove(); el = next }
      form.insertAdjacentHTML('afterend', html)
    })
    .catch(function () {})
})()
