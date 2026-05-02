# 🏢 Real Estate Investment Pro — عقار برو

منصة الجدوى الاستثمارية العقارية الاحترافية  
**React + Tailwind CSS + PWA — جاهز للرفع على Vercel**

---

## 🚀 تشغيل المشروع محلياً

```bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل خادم التطوير
npm run dev
# → http://localhost:5173

# 3. بناء للإنتاج
npm run build

# 4. معاينة البناء
npm run preview
```

---

## ☁️ الرفع على Vercel

### الطريقة 1: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### الطريقة 2: GitHub + Vercel Dashboard
1. ارفع المشروع على GitHub
2. افتح [vercel.com](https://vercel.com) وأنشئ مشروعاً جديداً
3. اختر الـ repo
4. الإعدادات تلقائية (Vite auto-detected)
5. اضغط Deploy ✅

---

## 📁 هيكل المشروع

```
real-estate-pro/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/index.jsx          ← مكونات UI قابلة لإعادة الاستخدام
│   │   ├── charts/Charts.jsx     ← الرسوم البيانية (Recharts)
│   │   ├── steps/
│   │   │   ├── Step1PropertyInfo.jsx
│   │   │   ├── Step2DevCosts.jsx
│   │   │   ├── Steps3_4_5.jsx
│   │   │   └── Step6Results.jsx  ← النتائج الكاملة
│   │   ├── PortfolioDashboard.jsx
│   │   └── ProjectWizard.jsx
│   ├── context/
│   │   └── store.js              ← Zustand store + Local Storage
│   ├── utils/
│   │   ├── calculator.js         ← محرك الحسابات المالية
│   │   └── pdfExport.js          ← مولّد تقرير PDF
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

---

## ✅ المميزات

| الميزة | الحالة |
|--------|--------|
| 7 أنواع عقارات | ✅ |
| معلومات العقار الكاملة | ✅ |
| 10+ تكلفة تطوير مع حساب تلقائي | ✅ |
| نموذج الإيرادات + الإشغال | ✅ |
| 10 مصاريف تشغيلية | ✅ |
| التمويل البنكي (اختياري) | ✅ |
| NOI / ROI / ROE / Cap Rate | ✅ |
| IRR (Newton-Raphson) | ✅ |
| NPV بمعدل خصم 10% | ✅ |
| DSCR + تحليل القرض | ✅ |
| 3 سيناريوهات (متحفظ/أساسي/متفائل) | ✅ |
| كاشف مخاطر ذكي (7 معايير) | ✅ |
| 4 رسوم بيانية تفاعلية | ✅ |
| تقرير PDF احترافي (3 صفحات) | ✅ |
| حفظ مشاريع متعددة (LocalStorage) | ✅ |
| لوحة تحكم المحفظة | ✅ |
| تصميم عربي RTL كامل | ✅ |
| Dark Mode فقط | ✅ |
| PWA (يعمل بدون إنترنت) | ✅ |
| جاهز للرفع على Vercel | ✅ |

---

## 🧮 المعادلات المالية

```
NOI = EGI - OpEx
ROI = NOI / Total Cost × 100
ROE = Cash Flow After Financing / Equity × 100
Cap Rate = NOI / Total Cost × 100
DSCR = NOI / Annual Debt Service
Payback = Equity / Annual Cash Flow
Break-even Occ. = (OpEx + Debt Service) / Gross Rent × 100
Property Value = NOI / 8% (Market Cap Rate)
IRR = Newton-Raphson on discounted cash flows
NPV = Σ(CF_t / (1.1)^t) - Initial Investment
```

---

## 📦 الحزم المستخدمة

- **React 18** + **Vite** — السرعة والحداثة
- **Tailwind CSS 3** — التصميم
- **Zustand** — إدارة الحالة + Local Storage
- **Recharts** — الرسوم البيانية
- **jsPDF + autoTable** — توليد PDF
- **vite-plugin-pwa** — PWA support
