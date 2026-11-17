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
  },
  {
    id: "prod-7",
    name: "طقم البجعة الملكية والياقوت والزمرد (عقد + إسوارة)",
    category: "packages",
    categoryName: "بكجات وهدايا",
    price: 150,
    oldPrice: 200,
    inStock: true,
    colors: ["ذهبي - زمرد وياقوت"],
    images: ["images/products/product-7.jpg"],
    description: "طقم ساحر في علبة المتجر يضم عقد دلاية البجعة المرصعة بالزركون الأخضر الزمردي وسلسلة ذهبية مع إسوارة أغصان الشجر بحبات الياقوت الأحمر.",
    material: "مطلي ذهب عالي الثبات مرصع بأحجار زركون ملونة",
    createdAt: "2026-11-17T07:40:00.000Z"
  },
  {
    id: "prod-8",
    name: "تريو أساور ستانلس ستيل زهور الفان كليف وسنيك هيرنجبون",
    category: "bracelets",
    categoryName: "أساور وخلاخل",
    price: 250,
    oldPrice: 320,
    inStock: true,
    colors: ["ذهبي لامع"],
    images: ["images/products/product-8.jpg"],
    description: "مجموعة من 3 قطع إكسسوار ستانلس ستيل راقية: إسوارة زهور الفان كليف المحفورة، سلسلة سنيك هيرنجبون مسطحة، وإسوارة بنجل مجدولة فاخرة.",
    material: "ستانلس ستيل أصلي 316L مقاوم للماء والصدأ ولا يغير لون",
    createdAt: "2026-11-17T07:41:00.000Z"
  },
  {
    id: "prod-9",
    name: "طقم أغصان الروز كوارتز الفاخر (عقد متدرج + إسوارة)",
    category: "packages",
    categoryName: "بكجات وهدايا",
    price: 375,
    oldPrice: 480,
    inStock: true,
    colors: ["ذهبي - روز كوارتز"],
    images: ["images/products/product-9.jpg"],
    description: "طقم هدايا ملكي متكامل في علبة Chic Shop Galena's المخملية، مرصع بأحجار الماركيز الوردية اللامعة بتصميم أغصان متناسقة للعقد والإسوارة.",
    material: "معدن مطلي ذهب عيار 18 مع أحجار زركون ماركيز وردية نقية",
    createdAt: "2026-11-17T07:42:00.000Z"
  },
  {
    id: "prod-10",
    name: "طقم أساور ستانلس ستيل ديور والزهور الملكية وحبل الذهب",
    category: "bracelets",
    categoryName: "أساور وخلاخل",
    price: 300,
    oldPrice: 380,
    inStock: true,
    colors: ["ذهبي لامع"],
    images: ["images/products/product-10.jpg"],
    description: "مجموعة ثلاثية فاخرة ومقاومة للماء تضم إسوارة شعار ديور CD العريضة، إسوارة زهور البرسيم المنقوشة، وسلسلة الحبل المجدولة.",
    material: "ستانلس ستيل عالي الجودة مطلي بتقنية PVD المقاومة للماء والعطور",
    createdAt: "2026-11-17T07:43:00.000Z"
  },
  {
    id: "prod-11",
    name: "طقم البجعة الماسية النقية (عقد + إسوارة الكريستال الأبيض)",
    category: "packages",
    categoryName: "بكجات وهدايا",
    price: 300,
    oldPrice: 390,
    inStock: true,
    colors: ["ذهبي - كريستال ناصع"],
    images: ["images/products/product-11.jpg"],
    description: "طقم المناسبات والعرائس في علبة المتجر المخملية، عقد دلاية البجعة المرصعة بالكامل بزركون ناصع البياض وإسوارة أغصان الكريستال الماسي.",
    material: "مطلي ذهب عيار 18 مع أحجار زركون سويسري AAA براق",
    createdAt: "2026-11-17T07:44:00.000Z"
  },
  {
    id: "prod-12",
    name: "طقم رينبو جالينا الملكي (عقد البجعة وإسوارة الأحجار الملونة)",
    category: "packages",
    categoryName: "بكجات وهدايا",
    price: 280,
    oldPrice: 350,
    inStock: true,
    colors: ["ذهبي - أحجار رينبو متعددة الألوان"],
    images: ["images/products/product-12.jpg"],
    description: "طقم ملون يخطف الأنظار يجمع بين عقد البجعة الكريستالية وإسوارة مرصعة بأحجار ملونة من الياقوت والزمرد والتوباز والجمشت.",
    material: "معدن مطلي عالي الجودة مع أحجار زركون ملونة",
    createdAt: "2026-11-17T07:45:00.000Z"
  },
  {
    id: "prod-13",
    name: "طقم الفراشة الملكية الصدفية (عقد وسلسلة يد فراشات بيضاء)",
    category: "packages",
    categoryName: "بكجات وهدايا",
    price: 260,
    oldPrice: 340,
    inStock: true,
    colors: ["ذهبي - صدف أبيض"],
    images: ["images/products/product-13.jpg"],
    description: "طقم فان كليف ستايل المميز بفراشات صدفية بيضاء بإطار ذهبي مخرز، يضم عقداً رقيقاً وإسوارة فراشات مبهجة تناسب الإطلالات اليومية والراقية.",
    material: "مطلي ذهب مع صدف طبيعي ومضاد للحساسية",
    createdAt: "2026-11-17T07:46:00.000Z"
  },
  {
    id: "prod-14",
    name: "أساور التنس الباكيت الكريستالية اللامعة القابلة للتعديل",
    category: "bracelets",
    categoryName: "أساور وخلاخل",
    price: 160,
    oldPrice: 220,
    inStock: true,
    colors: ["ذهبي لامع"],
    images: ["images/products/product-14.jpg"],
    description: "إسوارة تنس باجيت مرصعة بصف من الزركون البراق مع سنتر بيس مربع هالو متوهج، بقفل سحاب منزلق يناسب جميع مقاسات المعصم.",
    material: "نحاس مطلي ذهب عيار 18 ومرصع بأحجار زركون باجيت مكعبة",
    createdAt: "2026-11-17T07:47:00.000Z"
  },
  {
    id: "prod-15",
    name: "ديو أساور المعصم العصرية (إسوارة شبك المش + إسوارة ديور CD)",
    category: "bracelets",
    categoryName: "أساور وخلاخل",
    price: 190,
    oldPrice: 250,
    inStock: true,
    colors: ["ذهبي"],
    images: ["images/products/product-15.jpg"],
    description: "طقم من إسوارين متناسقين للمعصم: إسوارة السير الشبك العريضة بتصميم ساعات اليد الراقية وإسوارة جنزير كلاسيكية تتوسطها علامة CD.",
    material: "ستانلس ستيل مطلي ذهب مع قفل مغناطيسي وسلسلة قابلة للتعديل",
    createdAt: "2026-11-17T07:48:00.000Z"
  },
  {
    id: "prod-16",
    name: "عقد الأميرة الساحر مرصع بالزركون وأحجار الأميثست البنفسجية",
    category: "necklaces",
    categoryName: "سلاسل وأعقاد",
    price: 290,
    oldPrice: 380,
    inStock: true,
    colors: ["ذهبي - أميثست بنفسجي وزركون"],
    images: ["images/products/product-16.jpg"],
    description: "عقد كوليه ملوكي بتصميم V ياقة مطرزة بأحجار الزركون والأميثست البنفسجية المتلألئة، تتدلى منه دلاية مستطيلة سوليتير براقة.",
    material: "معدن مطلي ذهب ومقاوم لتغير اللون مع زركون AAA مقطوع بدقة",
    createdAt: "2026-11-17T07:49:00.000Z"
  }
];

window.SHIPPING_RATES = SHIPPING_RATES;
window.CATEGORIES = CATEGORIES;
window.DEFAULT_STORE_SETTINGS = DEFAULT_STORE_SETTINGS;
window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
