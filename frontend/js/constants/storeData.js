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
  whatsappNumber: "201026040845",
  storeName: "Chic Shop Galena's",
  tiktokUrl: "https://www.tiktok.com/@jaljola2?_r=1&_t=ZS-9BReZO7XDVs",
  freeShippingThreshold: 600,
  phoneDisplay: "010 2604 0845"
};

window.SHIPPING_RATES = SHIPPING_RATES;
window.CATEGORIES = CATEGORIES;
window.DEFAULT_STORE_SETTINGS = DEFAULT_STORE_SETTINGS;
