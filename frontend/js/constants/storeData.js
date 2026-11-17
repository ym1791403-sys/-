// Store Constants and Configuration
// Chic Shop Galena's

const SHIPPING_RATES = [
  { city: "القاهرة والجيزة", cost: 45, time: "خلال 24-48 ساعة" },
  { city: "الإسكندرية والبحيرة", cost: 55, time: "خلال 2-3 أيام" },
  { city: "محافظات الدلتا والقناة", cost: 60, time: "خلال 2-3 أيام" },
  { city: "محافظات الصعيد", cost: 70, time: "خلال 3-4 أيام" },
  { city: "شرم الشيخ والغردقة ومطروح", cost: 85, time: "خلال 3-5 أيام" }
];

const CATEGORIES = [
  { id: "all", name: "كل التشكيلة", icon: "fa-gem" },
  { id: "necklaces", name: "سلاسل وأعقاد", icon: "fa-certificate" },
  { id: "bracelets", name: "أساور وخلاخل", icon: "fa-ring" },
  { id: "rings", name: "خواتم", icon: "fa-circle-notch" },
  { id: "earrings", name: "أقراط وحلقان", icon: "fa-star" },
  { id: "packages", name: "بكجات وهدايا", icon: "fa-gift" },
  { id: "accessories", name: "إكسسوارات وحقائب", icon: "fa-wand-magic-sparkles" }
];

const DEFAULT_STORE_SETTINGS = {
  storeName: "Chic Shop Galena's",
  tiktokUrl: "https://www.tiktok.com/@jaljola2?_r=1&_t=ZS-9BReZO7XDVs",
  freeShippingThreshold: 600,
  phoneDisplay: "010 2604 0845",
  whatsappNumber: ""
};

// First 6 Official Accessories for Chic Shop Galena's
const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "طقم زهرة الياقوت الأزرق الملكي (عقد + إسوارة)",
    category: "packages",
    categoryName: "بكجات وهدايا",
    price: 130,
    oldPrice: 180,
    inStock: true,
    colors: ["ذهبي - أزرق ملكي"],
    images: ["images/products/product-1.jpg"],
    description: "طقم فاخر مطلي بالذهب يجمع بين عقد رقيق وإسوارة بتصميم زهور الياقوت الأزرق الساحر وفيونكة مرصعة بالزركون اللامع.",
    material: "معدن مطلي عالي الجودة ومقاوم لتغير اللون مع أحجار زركون كريستالية",
    createdAt: "2026-11-17T07:00:00.000Z"
  },
  {
    id: "prod-2",
    name: "طقم روز جالينا الفاخر في علبة المتجر (عقد وإسوارة)",
    category: "packages",
    categoryName: "بكجات وهدايا",
    price: 250,
    oldPrice: 320,
    inStock: true,
    colors: ["ذهبي - روز بينك"],
    images: ["images/products/product-2.jpg"],
    description: "طقم استثنائي في علبة Chic Shop Galena's المخملية الفاخرة، يضم إسوارة غصن الزيتون المرصعة بأحجار الزركون الوردي الناعم مع سلسلة أنيقة.",
    material: "مطلي ذهب عيار 18 عالي الثبات مرصع بأحجار الكوارتز الوردي",
    createdAt: "2026-11-17T07:01:00.000Z"
  },
  {
    id: "prod-3",
    name: "تريو أساور المعصم الملكية (3 أساور مكدسة)",
    category: "bracelets",
    categoryName: "أساور وخلاخل",
    price: 150,
    oldPrice: 210,
    inStock: true,
    colors: ["ذهبي - أحمر ياقوتي"],
    images: ["images/products/product-3.jpg"],
    description: "مجموعة من 3 أساور عصرية ساحرة على المعصم: إسوارة المسمار الأيقونية، إسوارة غصن مرصعة بحبات الياقوت الأحمر، وسلسلة الحبل المجدول.",
    material: "ستانلس ستيل مطلي ذهب عيار 18 ومقاوم للماء مع زركون أحمر",
    createdAt: "2026-11-17T07:02:00.000Z"
  },
  {
    id: "prod-4",
    name: "طقم أساور السلاسل الذهبية العصرية (3 قطع مكدسة)",
    category: "bracelets",
    categoryName: "أساور وخلاخل",
    price: 180,
    oldPrice: 240,
    inStock: true,
    colors: ["ذهبي لامع"],
    images: ["images/products/product-4.jpg"],
    description: "مجموعة متناسقة من 3 أساور ذهبية تريند: إسوارة سنيك هيرنجبون مسطحة ولامعة مع سلسلتين كرب كوبي كلاسيكية لإطلالة راقية وجريئة.",
    material: "ستانلس ستيل 316L أصلي مطلي ذهب، مضاد للحساسية ومقاوم للصدأ",
    createdAt: "2026-11-17T07:03:00.000Z"
  },
  {
    id: "prod-5",
    name: "عقد دبل لاير زهور الأقحوان وسلسلة سنيك مسطحة",
    category: "necklaces",
    categoryName: "سلاسل وأعقاد",
    price: 250,
    oldPrice: 320,
    inStock: true,
    colors: ["ذهبي - أسود وأصفر"],
    images: ["images/products/product-5.jpg"],
    description: "عقد مزدوج الطبقات بتصميم جذاب وعصري يدمج بين نعومة سلسلة السنيك المسطحة وسلسلة كرات ذهبية متدلية منها ورود الأقحوان الأنيقة.",
    material: "مطلي ذهب مع مينا ملون عالي الثبات ومقاوم للاحتكاك",
    createdAt: "2026-11-17T07:04:00.000Z"
  },
  {
    id: "prod-6",
    name: "عقد السهرة الماسي الفاخر (أغصان الكريستال وفيونكة الزركون)",
    category: "necklaces",
    categoryName: "سلاسل وأعقاد",
    price: 350,
    oldPrice: 450,
    inStock: true,
    colors: ["ذهبي - كريستال ناصع"],
    images: ["images/products/product-6.jpg"],
    description: "قطعة ماستر بيس للأعراس والمناسبات السعيدة، بتصميم أغصان وأوراق شجر مرصعة بالكامل بأحجار الزركون اللامعة مع دلاية فيونكة مذهلة تعكس الضوء.",
    material: "نحاس نقي مطلي ذهب عيار 18 مرصع بأحجار زركون AAA براقة",
    createdAt: "2026-11-17T07:05:00.000Z"
  }
];

window.SHIPPING_RATES = SHIPPING_RATES;
window.CATEGORIES = CATEGORIES;
window.DEFAULT_STORE_SETTINGS = DEFAULT_STORE_SETTINGS;
window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
