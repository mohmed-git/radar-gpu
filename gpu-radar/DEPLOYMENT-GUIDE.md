# GPU Radar — دليل النشر الكامل
# ========================================
# Frontend (Netlify) + Backend (Railway/Render)

## ══════════════════════════════════════
## هيكل المشروع الكامل
## ══════════════════════════════════════

```
gpu-radar/
├── index.html              ← الصفحة الرئيسية (SEO كامل)
├── 404.html                ← صفحة الخطأ
├── sitemap.xml             ← خريطة الموقع
├── robots.txt              ← توجيهات الزحف
├── favicon.svg             ← أيقونة رادار
├── _redirects              ← Netlify redirects
├── .env.example            ← نموذج متغيرات البيئة
├── package.json            ← تبعيات Node.js
│
├── css/
│   └── style.css           ← التصميم الكامل (Dark Tech)
│
├── js/
│   ├── data.js             ← بيانات الأسعار (Frontend)
│   └── app.js              ← منطق الواجهة
│
├── api/
│   └── server.js           ← Backend API (Express.js)
│
└── pages/
    ├── gpu.html            ← صفحة بطاقات الرسوميات
    ├── cpu.html            ← صفحة المعالجات
    ├── compare.html        ← صفحة المقارنة
    ├── alerts.html         ← صفحة التنبيهات
    ├── blog.html           ← المدونة (10 مقالات)
    ├── about.html          ← من نحن
    ├── contact.html        ← تواصل معنا
    ├── privacy-policy.html ← سياسة الخصوصية
    └── terms.html          ← الشروط والأحكام
```

## ══════════════════════════════════════
## الخطوة 1: نشر Frontend على Netlify
## ══════════════════════════════════════

### الطريقة السريعة (Drag & Drop):
1. اذهب إلى https://app.netlify.com
2. سجّل دخولاً (مجاني)
3. من Dashboard اسحب مجلد gpu-radar/ كاملاً
4. انتظر 30 ثانية → موقعك حي!
5. ستحصل على رابط: https://random-name-123.netlify.app

### ربط دومين مخصص:
1. Site configuration → Domain management → Add custom domain
2. أدخل: gpu-radar.com
3. في مزود الدومين:
   - أضف CNAME: www → your-site.netlify.app
   - أو انقل Nameservers إلى Netlify

### HTTPS تلقائي:
- Netlify يفعّل HTTPS مجاناً عبر Let's Encrypt تلقائياً ✓

## ══════════════════════════════════════
## الخطوة 2: نشر Backend على Railway
## ══════════════════════════════════════

### تثبيت التبعيات أولاً:
```bash
cd gpu-radar
npm install
```

### نشر على Railway (الأسهل):
1. اذهب إلى https://railway.app
2. Connect GitHub Repository
3. اختر المجلد وسيكتشف Node.js تلقائياً
4. في Environment Variables أضف:
   - PORT=3001
   - NODE_ENV=production
   - FRONTEND_URL=https://gpu-radar.com
5. Deploy → ستحصل على: https://gpu-radar.up.railway.app

### ربط Frontend بـ Backend:
في `js/app.js` عدّل:
```javascript
const API_BASE = 'https://gpu-radar.up.railway.app/api';
// استبدل بيانات js/data.js بـ API calls:
const response = await fetch(`${API_BASE}/parts`);
const { data } = await response.json();
```

### البدائل:
- **Render.com** — مجاني مع Sleep بعد 15 دقيقة
- **Fly.io** — أداء أعلى
- **VPS** (DigitalOcean/Linode) — تحكم كامل

## ══════════════════════════════════════
## الخطوة 3: ربط Sitemap بـ Google Search Console
## ══════════════════════════════════════

1. اذهب إلى: https://search.google.com/search-console
2. Add Property → URL prefix → أدخل: https://gpu-radar.com/
3. تحقق من الملكية باختيار "HTML file":
   - حمّل الملف المُعطى إلى جذر مجلدك
   - أعد نشر الموقع على Netlify
   - انقر Verify
4. بعد التحقق → Sitemaps (في الشريط الجانبي)
5. في "Add a new sitemap" اكتب: sitemap.xml
6. انقر Submit ✓

## ══════════════════════════════════════
## الخطوة 4: طلب الفهرسة الفورية
## ══════════════════════════════════════

### URL Inspection Tool:
لكل صفحة رئيسية:
1. URL Inspection → أدخل الرابط
2. انقر "Request indexing"
3. كرر مع:
   - https://gpu-radar.com/
   - https://gpu-radar.com/pages/gpu.html
   - https://gpu-radar.com/pages/cpu.html
   - https://gpu-radar.com/pages/compare.html
   - https://gpu-radar.com/pages/blog.html

## ══════════════════════════════════════
## الخطوة 5: نصائح لتسريع الأرشفة
## ══════════════════════════════════════

### اليوم الأول:
□ نشر الموقع وتفعيل HTTPS
□ تحقق الملكية في Search Console
□ أرسل Sitemap
□ أضف الموقع إلى Bing Webmaster Tools:
  https://www.bing.com/webmasters

### الأسبوع الأول:
□ أنشئ حساب Google Business Profile
□ أضف الموقع في ملفات LinkedIn الشخصية
□ شارك الموقع في مجتمعات التقنية العربية
□ أضف الموقع إلى Indie Hackers / Product Hunt
□ اكتب تغريدة عن الإطلاق مع رابط الموقع

### الشهر الأول:
□ انشر مقالاً أسبوعياً في blog.html
□ أضف بيانات منظمة (Schema) للمقالات
□ احصل على backlink واحد على الأقل من موقع تقني
□ فعّل Google Analytics (اضبط GOOGLE_ANALYTICS_ID)

## ══════════════════════════════════════
## الخطوة 6: إضافة Google Analytics
## ══════════════════════════════════════

أضف هذا الكود قبل </head> في جميع الصفحات:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX'); // استبدل بـ ID الخاص بك
</script>
```

## ══════════════════════════════════════
## الخطوة 7: فحص SEO قبل النشر
## ══════════════════════════════════════

### أدوات الفحص:
- السرعة: https://pagespeed.web.dev
- Schema: https://search.google.com/test/rich-results
- HTML: https://validator.w3.org
- Sitemap: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Mobile: https://search.google.com/test/mobile-friendly

### نقاط التحقق:
□ title بطول 50-60 حرف
□ meta description بطول 150-160 حرف
□ H1 واحد فقط في كل صفحة
□ جميع الصور لها alt text
□ الروابط الداخلية تعمل
□ HTTPS مفعّل
□ الموقع يعمل على الموبايل

## ══════════════════════════════════════
## طريقة الربح (Revenue Model)
## ══════════════════════════════════════

### 1. Affiliate Marketing (الأساس):
- Amazon Associates: 1-4% عمولة
- Newegg Affiliate: 1-2% عمولة
- B&H Affiliate: 2-3% عمولة
- الدخل المتوقع بـ 10K زيارة/شهر: $200-500/شهر

### 2. إعلانات Google AdSense:
- سجّل في: https://adsense.google.com
- الدخل المتوقع بـ 10K زيارة: $50-150/شهر

### 3. تنبيهات Premium ($4.99/شهر):
- تنبيهات فورية (مجاني: يومي)
- مقارنات غير محدودة
- تصدير البيانات

### 4. API للمطورين ($19-99/شهر):
- بيانات الأسعار عبر API للتطبيقات الأخرى

## ══════════════════════════════════════
## خطة المحتوى — أول 10 مقالات
## ══════════════════════════════════════

1. RTX 4080 Super vs RX 7900 XTX: أيهما أفضل قيمة في 2025؟
2. لماذا انخفضت أسعار GPU 15% في فبراير 2025؟ تحليل السوق
3. دليل شراء CPU 2025: من $150 حتى $600
4. متى تشتري بطاقة رسوميات؟ 5 مؤشرات للتوقيت الأمثل
5. فهم معمار RDNA 4: ما الجديد في AMD؟
6. Intel vs AMD 2025: من يسيطر على المعالجات؟
7. كيف تختار GPU للذكاء الاصطناعي في 2025؟
8. توقعات أسعار GPU في 2025
9. سوق GPU المستعمل: دليل الشراء الآمن
10. RTX 4070 vs RX 7800 XT: معركة الـ $400

## الكلمات المفتاحية المستهدفة:
- أسعار GPU عربي (200-500 بحث/شهر)
- مقارنة بطاقات الرسوميات (300+ بحث)
- RTX 4090 سعر (500+ بحث)
- افضل بطاقة رسوميات 2025 (1000+ بحث)
- معالج للألعاب (800+ بحث)
