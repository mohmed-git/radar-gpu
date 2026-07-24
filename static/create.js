/* منطق صفحة إنشاء مقال — يعمل بالكامل في المتصفّح (static، بدون خادم) */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  if (!$('article-form')) return; // ليست صفحة الإنشاء

  var pageTypeLabels = {
    question: 'سؤال مباشر',
    comparison: 'مقارنة',
    listicle: 'قائمة',
    howto: 'شرح خطوة بخطوة',
    guide: 'دليل'
  };
  var categoryNames = {
    movies: 'أفلام ومسلسلات',
    celebrities: 'مشاهير',
    health: 'صحة',
    general: 'معلومات عامة'
  };

  var sectionsWrap = $('sections-wrap');
  var faqWrap = $('faq-wrap');

  // ---- توليد slug تلقائيًا من العنوان العربي (تحويل تقريبي) ----
  var translitMap = {
    'ا':'a','أ':'a','إ':'a','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh',
    'د':'d','ذ':'th','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'th',
    'ع':'3','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w',
    'ي':'y','ى':'a','ة':'a','ء':'','ئ':'2','ؤ':'2'
  };
  function slugify(text) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (translitMap[ch] !== undefined) out += translitMap[ch];
      else if (/[a-zA-Z0-9]/.test(ch)) out += ch.toLowerCase();
      else if (ch === ' ' || ch === '-' || ch === '_') out += '-';
    }
    return out.replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  var slugEdited = false;
  $('f-slug').addEventListener('input', function () { slugEdited = true; });
  $('f-title').addEventListener('input', function () {
    if (!slugEdited) $('f-slug').value = slugify($('f-title').value);
    render();
  });

  $('f-meta').addEventListener('input', function () {
    $('meta-count').textContent = $('f-meta').value.length;
  });

  // ---- إضافة قسم ----
  var sectionCount = 0;
  function addSection(heading, body, ordered) {
    sectionCount++;
    var idx = sectionCount;
    var div = document.createElement('div');
    div.className = 'dyn-block';
    div.innerHTML =
      '<div class="dyn-head"><strong>قسم #' + idx + '</strong>' +
      '<button type="button" class="btn-remove" title="حذف">&times;</button></div>' +
      '<label class="field"><span class="field-label">عنوان القسم (اختياري)</span>' +
      '<input type="text" class="sec-heading" placeholder="عنوان فرعي..." /></label>' +
      '<label class="field"><span class="field-label">الفقرات (كل فقرة في سطر)</span>' +
      '<textarea class="sec-paras" rows="3" placeholder="اكتب فقرة في كل سطر..."></textarea></label>' +
      '<label class="field"><span class="field-label">عناصر القائمة (كل عنصر في سطر — اختياري)</span>' +
      '<textarea class="sec-list" rows="2" placeholder="عنصر في كل سطر..."></textarea></label>' +
      '<label class="field-check"><input type="checkbox" class="sec-ordered" /> قائمة مرقّمة (خطوات)</label>';
    if (heading) div.querySelector('.sec-heading').value = heading;
    if (body) div.querySelector('.sec-paras').value = body;
    if (ordered) div.querySelector('.sec-ordered').checked = true;
    div.querySelector('.btn-remove').addEventListener('click', function () {
      div.remove(); render();
    });
    div.addEventListener('input', render);
    sectionsWrap.appendChild(div);
    render();
  }
  $('add-section').addEventListener('click', function () { addSection(); });

  // ---- إضافة سؤال FAQ ----
  function addFaq() {
    var div = document.createElement('div');
    div.className = 'dyn-block';
    div.innerHTML =
      '<div class="dyn-head"><strong>سؤال</strong>' +
      '<button type="button" class="btn-remove" title="حذف">&times;</button></div>' +
      '<label class="field"><span class="field-label">السؤال</span>' +
      '<input type="text" class="faq-q" placeholder="اكتب السؤال..." /></label>' +
      '<label class="field"><span class="field-label">الإجابة</span>' +
      '<textarea class="faq-a" rows="2" placeholder="اكتب الإجابة..."></textarea></label>';
    div.querySelector('.btn-remove').addEventListener('click', function () {
      div.remove(); render();
    });
    div.addEventListener('input', render);
    faqWrap.appendChild(div);
    render();
  }
  $('add-faq').addEventListener('click', addFaq);

  // بدء بقسم واحد افتراضي
  addSection();

  // ---- جمع بيانات النموذج ----
  function lines(v) {
    return v.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function collect() {
    var data = {
      slug: $('f-slug').value.trim(),
      category: $('f-category').value,
      type: $('f-type').value,
      keyword: $('f-keyword').value.trim(),
      title: $('f-title').value.trim(),
      metaDescription: $('f-meta').value.trim(),
      searchIntent: $('f-intent').value.trim(),
      summary: $('f-summary').value.trim(),
      sections: [],
      faq: [],
      tags: lines($('f-tags').value.replace(/,/g, '\n'))
    };
    var secs = sectionsWrap.querySelectorAll('.dyn-block');
    secs.forEach(function (s) {
      var heading = s.querySelector('.sec-heading').value.trim();
      var paras = lines(s.querySelector('.sec-paras').value);
      var list = lines(s.querySelector('.sec-list').value);
      var ordered = s.querySelector('.sec-ordered').checked;
      if (!heading && !paras.length && !list.length) return;
      var sec = {};
      if (heading) sec.heading = heading;
      if (paras.length) sec.paragraphs = paras;
      if (list.length) { sec.list = list; if (ordered) sec.ordered = true; }
      data.sections.push(sec);
    });
    faqWrap.querySelectorAll('.dyn-block').forEach(function (f) {
      var q = f.querySelector('.faq-q').value.trim();
      var a = f.querySelector('.faq-a').value.trim();
      if (q && a) data.faq.push({ question: q, answer: a });
    });
    return data;
  }

  // ---- المعاينة الحيّة ----
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function render() {
    var d = collect();
    var html = '';
    html += '<span class="preview-badge">' + escapeHtml(categoryNames[d.category] || '') +
            ' · ' + escapeHtml(pageTypeLabels[d.type] || '') + '</span>';
    html += '<h3>' + (escapeHtml(d.title) || '<span class="muted">العنوان...</span>') + '</h3>';
    if (d.summary) html += '<p class="preview-summary">' + escapeHtml(d.summary) + '</p>';
    d.sections.forEach(function (sec) {
      if (sec.heading) html += '<h4>' + escapeHtml(sec.heading) + '</h4>';
      (sec.paragraphs || []).forEach(function (p) { html += '<p>' + escapeHtml(p) + '</p>'; });
      if (sec.list) {
        var tag = sec.ordered ? 'ol' : 'ul';
        html += '<' + tag + '>';
        sec.list.forEach(function (li) { html += '<li>' + escapeHtml(li) + '</li>'; });
        html += '</' + tag + '>';
      }
    });
    if (d.faq.length) {
      html += '<h4>الأسئلة الشائعة</h4>';
      d.faq.forEach(function (f) {
        html += '<p><strong>' + escapeHtml(f.question) + '</strong><br>' + escapeHtml(f.answer) + '</p>';
      });
    }
    if (d.tags.length) {
      html += '<div class="preview-tags">';
      d.tags.forEach(function (t) { html += '<span>#' + escapeHtml(t) + '</span> '; });
      html += '</div>';
    }
    $('preview').innerHTML = html;
  }
  $('article-form').addEventListener('input', render);

  // ---- توليد كود TypeScript ----
  function q(s) {
    // نصّ آمن داخل علامات اقتباس مفردة في TS
    return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ') + "'";
  }
  function arr(items, indent) {
    if (!items.length) return '[]';
    return '[\n' + items.map(function (i) { return indent + '  ' + q(i) + ',';
    }).join('\n') + '\n' + indent + ']';
  }
  function genCode(d) {
    var L = [];
    L.push('  {');
    L.push('    slug: ' + q(d.slug) + ',');
    L.push('    category: ' + q(d.category) + ',');
    L.push('    type: ' + q(d.type) + ',');
    L.push('    keyword: ' + q(d.keyword) + ',');
    L.push('    title: ' + q(d.title) + ',');
    L.push('    metaDescription: ' + q(d.metaDescription) + ',');
    L.push('    searchIntent: ' + q(d.searchIntent) + ',');
    L.push('    summary: ' + q(d.summary) + ',');
    L.push('    sections: [');
    d.sections.forEach(function (sec) {
      L.push('      {');
      if (sec.heading) L.push('        heading: ' + q(sec.heading) + ',');
      if (sec.paragraphs) L.push('        paragraphs: ' + arr(sec.paragraphs, '        ') + ',');
      if (sec.list) {
        L.push('        list: ' + arr(sec.list, '        ') + ',');
        if (sec.ordered) L.push('        ordered: true,');
      }
      L.push('      },');
    });
    L.push('    ],');
    if (d.faq.length) {
      L.push('    faq: [');
      d.faq.forEach(function (f) {
        L.push('      { question: ' + q(f.question) + ', answer: ' + q(f.answer) + ' },');
      });
      L.push('    ],');
    }
    L.push("    updated: '" + new Date().toISOString().slice(0, 10) + "',");
    if (d.tags.length) L.push('    tags: ' + arr(d.tags, '    ') + ',');
    L.push('  },');
    return L.join('\n');
  }

  function validate(d) {
    var errs = [];
    if (!d.slug) errs.push('المُعرّف (slug) مطلوب.');
    if (!d.title) errs.push('العنوان مطلوب.');
    if (!d.keyword) errs.push('الكلمة المفتاحية مطلوبة.');
    if (!d.sections.length) errs.push('أضِف قسمًا واحدًا على الأقل بمحتوى.');
    return errs;
  }

  var lastCode = '';
  $('generate-btn').addEventListener('click', function () {
    var d = collect();
    var errs = validate(d);
    if (errs.length) { alert('يرجى استكمال:\n\n• ' + errs.join('\n• ')); return; }
    lastCode = genCode(d);
    $('output-code').textContent = lastCode;
    $('output-section').hidden = false;
    $('output-section').scrollIntoView({ behavior: 'smooth' });
  });

  $('copy-btn').addEventListener('click', function () {
    if (!lastCode) return;
    navigator.clipboard.writeText(lastCode).then(function () {
      var msg = $('copy-msg'); msg.hidden = false;
      setTimeout(function () { msg.hidden = true; }, 2000);
    });
  });

  $('download-btn').addEventListener('click', function () {
    if (!lastCode) return;
    var d = collect();
    var blob = new Blob([lastCode + '\n'], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (d.slug || 'article') + '.snippet.ts';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  render();
})();
