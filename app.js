const { useState, useEffect, useMemo, useRef } = React;

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlVC_LiwIgiDs5a7VYDSs-tJ5mo9-yfhQ",
  authDomain: "galgol.firebaseapp.com",
  projectId: "galgol",
  storageBucket: "galgol.firebasestorage.app",
  messagingSenderId: "844399737643",
  appId: "1:844399737643:web:a10d8e3df77e001264636e",
  measurementId: "G-5WEMXQWMG2"
};

// Initialize Firebase App & Firestore
let db = null;
let analytics = null;
let isFirebaseAvailable = false;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    isFirebaseAvailable = true;
    try {
      analytics = firebase.analytics();
    } catch (e) {
      // Analytics may not run on file:// or local without window
    }
  }
} catch (err) {
  console.error("Firebase init failed:", err);
}

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

function App() {
  // Firebase Connection Status
  const [firebaseStatus, setFirebaseStatus] = useState(isFirebaseAvailable ? "connecting" : "error");
  const [firebaseErrorMsg, setFirebaseErrorMsg] = useState("");

  // Store Settings (Synced with Firestore 'settings/store')
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem("aura_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.storeName || parsed.storeName.includes("AURA")) {
          parsed.storeName = "𝐂𝐡𝐢𝐜 𝐒𝐡𝐨𝐩 𝐆𝐚𝐥𝐞𝐧𝐚'𝐬";
        }
        return parsed;
      } catch (e) {}
    }
    return {
      whatsappNumber: "",
      storeName: "𝐂𝐡𝐢𝐜 𝐒𝐡𝐨𝐩 𝐆𝐚𝐥𝐞𝐧𝐚'𝐬",
      freeShippingThreshold: 600,
      phoneDisplay: ""
    };
  });

  // Products: Synced with Firestore 'products' collection.
  // NO DUMMY PRODUCTS! Starts empty until added by store owner.
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Orders: Synced with Firestore 'orders' collection
  const [firebaseOrders, setFirebaseOrders] = useState([]);

  // Cart & Wishlist (local to shopper's session)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("aura_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("aura_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  
  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewColor, setQuickViewColor] = useState("");
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);

  // Admin / Store Management Modal
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("settings"); // "settings" | "products" | "add" | "orders"

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "necklaces",
    price: "",
    oldPrice: "",
    imageUrl: "",
    colors: "ذهبي, فضي",
    description: "",
    material: ""
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Settings Temp Form
  const [tempSettings, setTempSettings] = useState({
    whatsappNumber: storeSettings.whatsappNumber,
    phoneDisplay: storeSettings.phoneDisplay,
    storeName: storeSettings.storeName,
    freeShippingThreshold: storeSettings.freeShippingThreshold
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Checkout State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    altPhone: "",
    city: "القاهرة والجيزة",
    address: "",
    notes: ""
  });
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  // Promo code & gift options
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoInput, setPromoInput] = useState("");
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ==============================================================
  // FIREBASE REAL-TIME LISTENERS
  // ==============================================================

  // 1. Listen to 'products' collection in Firestore
  useEffect(() => {
    if (!db) {
      setIsLoadingProducts(false);
      setFirebaseStatus("error");
      setFirebaseErrorMsg("تعذر تحميل مكتبة Firebase");
      return;
    }

    const unsubscribe = db.collection("products").onSnapshot(
      (snapshot) => {
        const fetchedProducts = [];
        snapshot.forEach(doc => {
          fetchedProducts.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setProducts(fetchedProducts);
        setIsLoadingProducts(false);
        setFirebaseStatus("connected");
      },
      (error) => {
        console.error("Firestore products error:", error);
        setIsLoadingProducts(false);
        setFirebaseStatus("permission_denied");
        setFirebaseErrorMsg(error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Listen to 'settings/store' document in Firestore
  useEffect(() => {
    if (!db) return;

    const unsubscribe = db.collection("settings").doc("store").onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          setStoreSettings(prev => ({
            ...prev,
            ...data
          }));
          setTempSettings(prev => ({
            ...prev,
            ...data
          }));
        }
      },
      (error) => {
        console.warn("Firestore settings read error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Listen to 'orders' collection in Firestore
  useEffect(() => {
    if (!db) return;

    const unsubscribe = db.collection("orders")
      .orderBy("createdAt", "desc")
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setFirebaseOrders(list);
        },
        (error) => {
          // If orderBy without index, fallback to simple fetch
          db.collection("orders").limit(50).get().then(snapshot => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setFirebaseOrders(list);
          }).catch(e => console.warn(e));
        }
      );

    return () => unsubscribe();
  }, []);

  // Save Cart & Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("aura_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("aura_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ==============================================================
  // CART & CHECKOUT ACTIONS
  // ==============================================================

  const addToCart = (product, color = null) => {
    const chosenColor = color || (product.colors && product.colors[0]) || "الافتراضي";
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.color === chosenColor);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: (product.images && product.images[0]) || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
          color: chosenColor,
          quantity: 1,
          category: product.categoryName || ""
        }];
      }
    });
    showToast(`تمت إضافة "${product.name.slice(0, 24)}..." للسلة ✨`);
  };

  const updateQuantity = (id, color, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id && item.color === color) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id, color) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.color === color)));
    showToast("تم حذف القطعة من السلة");
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("تمت الإزالة من المفضلة");
        return prev.filter(id => id !== productId);
      } else {
        showToast("تمت الإضافة للمفضلة ❤️");
        return [...prev, productId];
      }
    });
  };

  // ==============================================================
  // FIREBASE PRODUCT CRUD
  // ==============================================================

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) {
      showToast("يرجى إدخال اسم المنتج وسعره", "error");
      return;
    }

    setIsSavingProduct(true);
    const catObj = CATEGORIES.find(c => c.id === newProduct.category) || CATEGORIES[1];
    const parsedColors = newProduct.colors.split(",").map(c => c.trim()).filter(Boolean);

    const productPayload = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      categoryName: catObj.name,
      price: parseFloat(newProduct.price),
      oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
      inStock: true,
      colors: parsedColors.length > 0 ? parsedColors : ["ذهبي"],
      images: [
        newProduct.imageUrl.trim() || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
      ],
      description: newProduct.description.trim() || "قطعة إكسسوار أنيقة بتصميم عصري راقي.",
      material: newProduct.material.trim() || "مقاوم لتغير اللون ومضاد للحساسية.",
      createdAt: firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    try {
      if (db) {
        await db.collection("products").add(productPayload);
        showToast("تم حفظ المنتج بنجاح في قاعدة بيانات Firebase! 🔥");
      } else {
        // Fallback local
        setProducts(prev => [{ id: Date.now().toString(), ...productPayload }, ...prev]);
        showToast("تم حفظ المنتج محلياً");
      }

      setNewProduct({
        name: "",
        category: "necklaces",
        price: "",
        oldPrice: "",
        imageUrl: "",
        colors: "ذهبي, فضي",
        description: "",
        material: ""
      });
      setAdminTab("products");
    } catch (err) {
      console.error("Error adding product to Firebase:", err);
      showToast(`خطأ في الحفظ بـ Firebase: ${err.message}`, "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("هل أنتِ متأكدة من حذف هذا المنتج نهائياً من قاعدة بيانات Firebase؟")) return;

    try {
      if (db && typeof id === 'string' && id.length > 5) {
        await db.collection("products").doc(id).delete();
        showToast("تم حذف المنتج من Firebase بنجاح 🗑️");
      } else {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast("تم حذف المنتج");
      }
      setCart(prev => prev.filter(item => item.id !== id));
      setWishlist(prev => prev.filter(pId => pId !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast(`تعذر الحذف من Firebase: ${err.message}`, "error");
    }
  };

  // Save Settings to Firebase
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      if (db) {
        await db.collection("settings").doc("store").set(tempSettings, { merge: true });
        showToast("تم حفظ إعدادات المتجر في Firebase بنجاح! 🔥");
      }
      setStoreSettings(tempSettings);
      localStorage.setItem("aura_settings", JSON.stringify(tempSettings));
      setIsAdminOpen(false);
    } catch (err) {
      console.error("Error saving settings:", err);
      showToast(`تعذر حفظ الإعدادات بـ Firebase: ${err.message}`, "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewColor((product.colors && product.colors[0]) || "");
    setQuickViewImageIndex(0);
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.round(subtotal * appliedPromo.discount);
  }, [subtotal, appliedPromo]);

  const selectedShipping = useMemo(() => {
    return SHIPPING_RATES.find(s => s.city === customer.city) || SHIPPING_RATES[0];
  }, [customer.city]);

  const shippingCost = useMemo(() => {
    if (subtotal >= storeSettings.freeShippingThreshold || subtotal === 0) return 0;
    return selectedShipping.cost;
  }, [subtotal, selectedShipping, storeSettings.freeShippingThreshold]);

  const giftWrapCost = includeGiftWrap ? 35 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + giftWrapCost);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Send Order & Save to Firebase
  const sendOrderAndWhatsApp = async (e) => {
    if (e) e.preventDefault();

    if (!storeSettings.whatsappNumber.trim()) {
      showToast("يرجى إدخال رقم الواتساب الخاص بالمتجر أولاً من الإعدادات", "error");
      setIsCheckoutModalOpen(false);
      setIsAdminOpen(true);
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      showToast("يرجى ملء الاسم والهاتف والعنوان بالتفصيل", "error");
      return;
    }

    setIsSubmittingOrder(true);
    const orderNumber = "AUR-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('ar-EG', { dateStyle: 'medium' });

    // Save order in Firebase 'orders' collection
    const orderData = {
      orderNumber,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        altPhone: customer.altPhone.trim(),
        city: customer.city,
        address: customer.address.trim(),
        notes: customer.notes.trim()
      },
      items: cart,
      subtotal,
      shippingCost,
      discountAmount,
      grandTotal,
      includeGiftWrap,
      giftNote: giftNote.trim(),
      status: "جديد",
      createdAt: firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    try {
      if (db) {
        await db.collection("orders").add(orderData);
      }
    } catch (err) {
      console.warn("Could not save order to Firebase:", err);
    }

    // Prepare WhatsApp Message
    let message = `✨ *طلب شراء جديد من ${storeSettings.storeName}* ✨\n`;
    message += `رقم الطلب: #${orderNumber}\n`;
    message += `التاريخ: ${dateStr}\n\n`;

    message += `👤 *بيانات العميلة:*\n`;
    message += `• الاسم: ${customer.name.trim()}\n`;
    message += `• رقم الهاتف: ${customer.phone.trim()}\n`;
    if (customer.altPhone) {
      message += `• هاتف بديل: ${customer.altPhone.trim()}\n`;
    }
    message += `• المحافظة: ${customer.city}\n`;
    message += `• العنوان بالتفصيل: ${customer.address.trim()}\n`;
    if (customer.notes.trim()) {
      message += `• ملاحظات: ${customer.notes.trim()}\n`;
    }
    message += `\n🛍️ *المنتجات المطلوبة:*\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   - اللون: ${item.color}\n`;
      message += `   - الكمية: ${item.quantity} × ${item.price} ج.م = ${item.quantity * item.price} ج.م\n`;
    });

    message += `\n----------------------------\n`;
    message += `💵 *المجموع الفرعي:* ${subtotal} ج.م\n`;

    if (includeGiftWrap) {
      message += `🎁 *تغليف هدايا فاخر:* +35 ج.م\n`;
      if (giftNote.trim()) {
        message += `💌 *نص كارت الإهداء:* "${giftNote.trim()}"\n`;
      }
    }

    message += `🚚 *الشحن (${selectedShipping.city}):* ${shippingCost === 0 ? 'مجاناً' : shippingCost + ' ج.م'}\n`;
    message += `💰 *الإجمالي المستحق للدفع:* *${grandTotal} ج.م*\n`;
    message += `💳 *طريقة الدفع:* كاش عند الاستلام (مع إمكانية المعاينة)\n`;
    message += `----------------------------\n`;
    message += `أرجو تأكيد موعد وصول المندوب. شكراً لكم! ✨`;

    if (window.confetti) {
      window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    setCheckoutSuccess({
      orderNumber,
      total: grandTotal,
      name: customer.name,
      phone: customer.phone,
      itemsCount: totalCartItems
    });

    setCart([]);
    setIsCheckoutModalOpen(false);
    setIsSubmittingOrder(false);

    // Open WhatsApp
    const encoded = encodeURIComponent(message);
    const cleanNum = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNum}?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  const hasPhoneSet = Boolean(storeSettings.whatsappNumber.trim());

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-800">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl bg-stone-900 text-white text-sm font-medium border border-brand-gold/40 animate-bounce">
          <i className="fa-solid fa-sparkles text-brand-gold"></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Firebase connection notice / error banner */}
      {firebaseStatus === "permission_denied" && (
        <div className="bg-rose-600 text-white text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>تنبيه: قواعد الأمان (Firestore Rules) في مشروع Firebase تحتاج للسماح بالقراءة والكتابة.</span>
          <button 
            onClick={() => { setAdminTab("settings"); setIsAdminOpen(true); }}
            className="bg-white text-rose-700 px-3 py-0.5 rounded-full text-[11px] underline font-bold"
          >
            عرض التفاصيل والحل
          </button>
        </div>
      )}

      {/* Missing WhatsApp notice for store owner */}
      {!hasPhoneSet && (
        <div className="bg-amber-500 text-stone-950 text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2">
          <i className="fa-solid fa-phone"></i>
          <span>تنبيه لصاحبة المتجر: يرجى إضافة رقم الواتساب الخاص بكِ لربط استلام الطلبات.</span>
          <button 
            onClick={() => { setAdminTab("settings"); setIsAdminOpen(true); }}
            className="bg-stone-950 text-white px-3 py-1 rounded-full text-[11px] hover:bg-stone-800 transition-colors"
          >
            إضافة الرقم
          </button>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-stone-950 text-amber-200 text-xs py-2 px-4 text-center border-b border-amber-900/40 font-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span className="hidden sm:inline-block">متصل بـ Firebase: <strong>galgol</strong></span>
          </div>
          <div className="flex-1 text-center">
            <span>🎉 شحن مجاني لكافة المحافظات عند الطلب بـ {storeSettings.freeShippingThreshold} ج.م أو أكثر</span>
          </div>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="text-[11px] text-amber-300 hover:text-white underline inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full"
            title="لوحة تحكم المتجر وقاعدة البيانات"
          >
            <i className="fa-solid fa-database text-amber-400"></i>
            <span>لوحة التحكم</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-amber-100 shadow-sm transition-all">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-stone-950 font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-gem"></i>
            </div>
            <div>
              <span className="font-playfair text-2xl font-bold tracking-widest text-stone-900 block leading-none">{storeSettings.storeName}</span>
              <span className="text-[10px] tracking-wider text-amber-700 font-semibold uppercase">JEWELRY & ACCESSORIES</span>
            </div>
          </a>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن قطعة في المتجر..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-full focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 shadow-inner"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute left-9 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            
            {hasPhoneSet && (
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن تشكيلة الإكسسوارات ✨')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
              >
                <i className="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
                <span>تواصل واتساب</span>
              </a>
            )}

            {/* Wishlist Trigger */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="المفضلة"
            >
              <i className="fa-regular fa-heart text-xl"></i>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all hover:shadow-lg hover:scale-105"
            >
              <i className="fa-solid fa-bag-shopping text-brand-gold"></i>
              <span className="hidden sm:inline">السلة</span>
              <span className="bg-brand-gold text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {totalCartItems}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن قطعة في المتجر..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-full focus:outline-none focus:border-brand-gold shadow-inner"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950 text-white py-14 lg:py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Hero Text */}
            <div className="text-center lg:text-right space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide">
                <i className="fa-solid fa-sparkles text-amber-400"></i>
                <span>تشكيلة حصرية من أرقى الإكسسوارات والمجوهرات</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                بريقكِ الخاص <br />
                <span className="gold-text-gradient font-playfair italic">يبدأ من هنا</span>
              </h1>
              
              <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                إكسسوارات نسائية فاخرة مطلية ومقاومة لتغير اللون، مصممة بعناية فائقة لتتألقي في كل مناسبة.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#catalog"
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-950 font-bold px-7 py-3 rounded-full shadow-lg shadow-amber-500/20 hover:scale-105 transition-all text-sm flex items-center gap-2"
                >
                  <span>تسوقي التشكيلة</span>
                  <i className="fa-solid fa-arrow-left"></i>
                </a>

                <button
                  onClick={() => { setAdminTab("add"); setIsAdminOpen(true); }}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-full backdrop-blur-sm border border-white/20 transition-all text-sm flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus text-amber-400"></i>
                  <span>إضافة منتج إلى Firebase</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-stone-300">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <i className="fa-solid fa-shield-halved text-amber-400"></i>
                  <span>مقاوم لتغير اللون</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <i className="fa-solid fa-box-open text-amber-400"></i>
                  <span>معاينة قبل الدفع</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <i className="fa-solid fa-truck-fast text-amber-400"></i>
                  <span>توصيل سريع</span>
                </div>
              </div>

            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop"
                  alt="تشكيلة إكسسوارات فاخرة"
                  className="w-full h-[360px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="text-xs text-amber-300 font-bold block mb-1">تسوقي بأمان وراحة</span>
                    <h3 className="text-xl font-bold">جودة مضمونة ودفع عند الاستلام</h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="catalog" className="py-12 flex-1">
        <div className="container mx-auto px-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-stone-900">تشكيلة المتجر</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <i className="fa-solid fa-bolt text-emerald-600"></i> تحديث حي (Firebase)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {isLoadingProducts ? "جارٍ جلب المنتجات من Firebase..." : `القطع المتوفرة حالياً (${products.length})`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAdminTab("add"); setIsAdminOpen(true); }}
                className="bg-brand-gold hover:bg-brand-goldHover text-stone-950 text-xs font-bold px-4 py-2 rounded-full shadow flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <i className="fa-solid fa-plus"></i> إضافة منتج جديد
              </button>
            </div>
          </div>

          {/* Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-stone-900 text-brand-gold shadow-md"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-brand-gold"
                }`}
              >
                <i className={`fa-solid ${cat.icon}`}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoadingProducts ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 p-8">
              <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-bold text-stone-700 text-sm">جارٍ الاتصال بقاعدة بيانات Firebase (galgol)...</p>
            </div>
          ) : products.length === 0 ? (
            /* Clean Empty State: NO DUMMY DATA */
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-4">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">متجركِ متصل بقاعدة بيانات Firebase وجاهز! 🔥</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
                لا توجد منتجات مسجلة في قاعدة البيانات حالياً. يمكنكِ البدء بإضافة أول منتج لمتجركِ الآن ليظهر مباشرة للزبائن.
              </p>
              <button
                onClick={() => { setAdminTab("add"); setIsAdminOpen(true); }}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-6 py-3 rounded-full shadow flex items-center gap-2 mx-auto"
              >
                <i className="fa-solid fa-plus text-brand-gold"></i>
                <span>أضيفي أول منتج لمتجركِ الآن</span>
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
              <p className="font-bold text-stone-700">لا توجد منتجات مطابقة لهذا البحث أو القسم</p>
              <button
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                className="mt-3 text-xs text-brand-gold underline font-bold"
              >
                عرض كافة المنتجات
              </button>
            </div>
          ) : (
            /* Real Products Grid from Firebase */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => {
                const isFavorite = wishlist.includes(product.id);
                const displayImage = (product.images && product.images[0]) || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop";
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-stone-100 luxury-shadow luxury-shadow-hover transition-all duration-300 flex flex-col relative"
                  >
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center transition-transform hover:scale-110 ${
                        isFavorite ? "text-rose-500" : "text-stone-400 hover:text-rose-500"
                      }`}
                      title="المفضلة"
                    >
                      <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart text-sm`}></i>
                    </button>

                    {/* Image Area */}
                    <div 
                      onClick={() => openQuickView(product)}
                      className="relative h-48 sm:h-64 overflow-hidden bg-stone-100 cursor-pointer"
                    >
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover img-zoom"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/95 text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                          <i className="fa-solid fa-eye mr-1"></i> نظرة سريعة
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-stone-500 block mb-1">{product.categoryName}</span>
                        <h3 
                          onClick={() => openQuickView(product)}
                          className="font-bold text-stone-900 text-sm line-clamp-2 hover:text-brand-gold cursor-pointer transition-colors leading-snug"
                        >
                          {product.name}
                        </h3>

                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {product.colors.map(col => (
                              <span key={col} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
                                {col}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price & Action */}
                      <div className="pt-3 mt-3 border-t border-stone-100">
                        <div className="flex items-baseline justify-between mb-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-extrabold text-stone-950 font-cairo">
                              {product.price} <span className="text-xs font-bold text-amber-700">ج.م</span>
                            </span>
                            {product.oldPrice && (
                              <span className="text-xs text-stone-400 line-through">
                                {product.oldPrice} ج.م
                              </span>
                            )}
                          </div>
                          {product.oldPrice && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              وفر {product.oldPrice - product.price} ج.م
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-stone-900 hover:bg-brand-gold hover:text-stone-950 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <i className="fa-solid fa-cart-plus"></i>
                            <span>أضيفي للسلة</span>
                          </button>
                          
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-stone-300 hover:text-rose-600 p-2 text-xs transition-colors"
                            title="حذف من Firebase"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-stone-900">الأسئلة الشائعة</h3>
            <p className="text-xs text-stone-500 mt-1">إجابات استفسارات الطلب والشحن</p>
          </div>

          <div className="space-y-3 text-xs">
            <details className="group bg-stone-50 p-4 rounded-xl border border-stone-200">
              <summary className="font-bold text-sm text-stone-900 cursor-pointer list-none flex items-center justify-between">
                <span>هل يمكنني معاينة المنتجات قبل الدفع للمندوب؟</span>
                <i className="fa-solid fa-chevron-down text-xs text-stone-400 group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-stone-600 mt-2 leading-relaxed">
                نعم، يحق لكِ فتح الشحنة ومعاينتها بحضور مندوب شركة الشحن والتأكد من مطابقتها قبل سداد المبلغ.
              </p>
            </details>

            <details className="group bg-stone-50 p-4 rounded-xl border border-stone-200">
              <summary className="font-bold text-sm text-stone-900 cursor-pointer list-none flex items-center justify-between">
                <span>ما هي مدة توصيل الطلب؟</span>
                <i className="fa-solid fa-chevron-down text-xs text-stone-400 group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-stone-600 mt-2 leading-relaxed">
                يصلكِ الطلب خلال 24 إلى 48 ساعة داخل القاهرة والجيزة، وخلال 2 إلى 3 أيام لباقي المحافظات.
              </p>
            </details>

            <details className="group bg-stone-50 p-4 rounded-xl border border-stone-200">
              <summary className="font-bold text-sm text-stone-900 cursor-pointer list-none flex items-center justify-between">
                <span>كيف تتم عملية الطلب؟</span>
                <i className="fa-solid fa-chevron-down text-xs text-stone-400 group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-stone-600 mt-2 leading-relaxed">
                عند النقر على إتمام الطلب، يتم تسجيل الطلب تلقائياً في قاعدة البيانات مع فتح محادثة واتساب منسقة لتأكيد التوصيل فوراً.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 pt-10 pb-6 border-t border-stone-800 text-xs">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-stone-950 font-bold">
                  <i className="fa-solid fa-gem text-xs"></i>
                </div>
                <span className="font-playfair text-xl font-bold tracking-widest text-white">{storeSettings.storeName}</span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">
                متجر إلكتروني متخصص في أرقى الإكسسوارات النسائية العصرية والمجوهرات المطلية.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">تواصل وإدارة المتجر</h4>
              <ul className="space-y-2">
                {hasPhoneSet ? (
                  <li>
                    <a 
                      href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      className="hover:text-emerald-400 flex items-center gap-2"
                    >
                      <i className="fa-brands fa-whatsapp text-emerald-400"></i>
                      <span>واتساب المتجر: {storeSettings.phoneDisplay || storeSettings.whatsappNumber}</span>
                    </a>
                  </li>
                ) : (
                  <li>
                    <button onClick={() => { setAdminTab("settings"); setIsAdminOpen(true); }} className="text-amber-400 hover:underline">
                      ⚠️ اضغطي هنا لإضافة رقم الواتساب الخاص بالمتجر
                    </button>
                  </li>
                )}
                <li>
                  <button onClick={() => setIsAdminOpen(true)} className="hover:text-brand-gold flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-brand-gold"></i>
                    <span>لوحة التحكم وقاعدة بيانات Firebase</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">طرق الدفع والتوصيل</h4>
              <p className="text-stone-400 text-xs mb-2">الدفع نقداً عند الاستلام مع إمكانية المعاينة قبل الدفع، أو عبر المحافظ الإلكترونية.</p>
              <div className="flex gap-2 text-[10px]">
                <span className="bg-stone-900 px-2 py-1 rounded border border-stone-800">الدفع عند الاستلام</span>
                <span className="bg-stone-900 px-2 py-1 rounded border border-stone-800">فودافون كاش</span>
                <span className="bg-stone-900 px-2 py-1 rounded border border-stone-800">InstaPay</span>
              </div>
            </div>

          </div>

          <div className="border-t border-stone-800 pt-6 text-center text-stone-500 text-[11px]">
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {storeSettings.storeName}. متصل بـ Firebase (galgol) 🔥</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button */}
      {hasPhoneSet && (
        <a
          href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار والطلب ✨')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 pulse-badge"
          title="تواصل معنا عبر واتساب"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      )}

      {/* ============================================================== */}
      {/* CART SLIDE-OVER DRAWER */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"></div>
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-bag-shopping text-brand-gold text-lg"></i>
                  <h3 className="font-bold text-stone-900 text-base">سلة مشترياتكِ</h3>
                  <span className="bg-stone-200 text-stone-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {totalCartItems} قطع
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Free shipping bar */}
              <div className="p-3 bg-amber-50/80 border-b border-amber-100 text-xs">
                {subtotal >= storeSettings.freeShippingThreshold ? (
                  <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i>
                    <span>حصلتِ على شحن مجاني لكافة المحافظات 🎉</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-stone-700 mb-1">
                      <span>أضيفي بـ <strong>{storeSettings.freeShippingThreshold - subtotal} ج.م</strong> للحصول على شحن مجاني</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-brand-gold h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (subtotal / storeSettings.freeShippingThreshold) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="p-4 flex-1 overflow-y-auto divide-y divide-stone-100">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-stone-400">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-300 text-2xl">
                      <i className="fa-solid fa-bag-shopping"></i>
                    </div>
                    <p className="font-bold text-stone-700">سلتكِ فارغة حالياً</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 bg-stone-900 text-white font-bold text-xs px-6 py-2 rounded-full"
                    >
                      تصفح المنتجات
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.id}-${item.color}-${idx}`} className="py-3 flex gap-3 items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-stone-200" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-xs truncate">{item.name}</h4>
                        <div className="text-[11px] text-stone-500 mt-0.5">اللون: <strong className="text-stone-800">{item.color}</strong></div>
                        <div className="text-stone-900 font-extrabold text-xs mt-1">{item.price} ج.م</div>
                      </div>

                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button onClick={() => updateQuantity(item.id, item.color, -1)} className="w-7 h-7 flex items-center justify-center text-xs font-bold text-stone-600">-</button>
                        <span className="w-7 text-center text-xs font-bold text-stone-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.color, 1)} className="w-7 h-7 flex items-center justify-center text-xs font-bold text-stone-600">+</button>
                      </div>

                      <button onClick={() => removeFromCart(item.id, item.color)} className="text-stone-400 hover:text-rose-600 p-1 text-xs">
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Controls */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
                  
                  {/* Gift Wrap */}
                  <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-950">
                      <input
                        type="checkbox"
                        checked={includeGiftWrap}
                        onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      <span>🎁 تغليف كهدية فاخرة مع كارت إهداء (+35 ج.م)</span>
                    </label>
                    {includeGiftWrap && (
                      <input
                        type="text"
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        placeholder="نص كارت الإهداء..."
                        className="w-full mt-2 px-2.5 py-1.5 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>

                  <div className="space-y-1 text-xs pt-1">
                    <div className="flex justify-between text-stone-600">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold">{subtotal} ج.م</span>
                    </div>
                    {includeGiftWrap && (
                      <div className="flex justify-between text-rose-700">
                        <span>تغليف الهدايا:</span>
                        <span>+35 ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>الشحن:</span>
                      <span className="font-bold">{shippingCost === 0 ? 'مجاناً' : `${shippingCost} ج.م`}</span>
                    </div>
                    <div className="flex justify-between text-stone-950 font-extrabold text-base pt-2 border-t border-stone-200">
                      <span>الإجمالي:</span>
                      <span className="text-amber-800">{grandTotal} ج.م</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutModalOpen(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                    <span>إتمام الطلب عبر واتساب</span>
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CHECKOUT MODAL */}
      {/* ============================================================== */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsCheckoutModalOpen(false)} className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 border border-stone-100">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-xl">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <h3 className="text-xl font-bold text-stone-900">بيانات استلام الطلب</h3>
              <p className="text-xs text-stone-500 mt-1">تسجيل الطلب بـ Firebase وإرسال الفاتورة عبر واتساب</p>
            </div>

            <form onSubmit={sendOrderAndWhatsApp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="الاسم"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">رقم الهاتف (الواتساب) *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">هاتف بديل (اختياري)</label>
                  <input
                    type="tel"
                    value={customer.altPhone}
                    onChange={(e) => setCustomer({ ...customer, altPhone: e.target.value })}
                    placeholder="هاتف بديل"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">المحافظة *</label>
                <select
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold bg-white focus:outline-none"
                >
                  {SHIPPING_RATES.map(rate => (
                    <option key={rate.city} value={rate.city}>
                      {rate.city} — {rate.cost} ج.م ({rate.time})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">العنوان بالتفصيل *</label>
                <textarea
                  rows="2"
                  required
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="المنطقة، الشارع، رقم العمارة، رقم الشقة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ملاحظات إضافية (اختياري)</label>
                <input
                  type="text"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="ملاحظات للتوصيل"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>عدد المنتجات:</span>
                  <span className="font-bold">{totalCartItems} قطع</span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1 border-t border-stone-200">
                  <span>المبلغ المستحق عند الاستلام:</span>
                  <span className="text-amber-800 text-base">{grandTotal} ج.م</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                <span>{isSubmittingOrder ? "جارٍ الحفظ والإرسال..." : "تأكيد وإرسال الطلب عبر واتساب"}</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CHECKOUT SUCCESS MODAL */}
      {/* ============================================================== */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setCheckoutSuccess(null)} className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 z-10 text-center border border-stone-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              <i className="fa-solid fa-circle-check"></i>
            </div>

            <h3 className="text-2xl font-bold text-stone-900 mb-1">تم تسجيل طلبكِ بنجاح! ✨</h3>
            <p className="text-xs text-stone-500 mb-4">
              رقم الطلب: <strong className="text-stone-800 font-mono text-sm">{checkoutSuccess.orderNumber}</strong>
            </p>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-stone-700 space-y-2 mb-6 text-right">
              <p>👤 <strong>الاسم:</strong> {checkoutSuccess.name}</p>
              <p>📞 <strong>رقم الهاتف:</strong> {checkoutSuccess.phone}</p>
              <p>💰 <strong>المبلغ عند الاستلام:</strong> <span className="font-bold text-amber-800">{checkoutSuccess.total} ج.م</span></p>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <i className="fa-solid fa-check"></i> تم حفظ بيانات الطلب في قاعدة بيانات Firebase
              </p>
            </div>

            <button
              onClick={() => setCheckoutSuccess(null)}
              className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl text-xs"
            >
              العودة للمتجر
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK VIEW MODAL */}
      {/* ============================================================== */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setQuickViewProduct(null)} className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 z-10 border border-stone-100">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 z-10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 h-72 sm:h-80">
                  <img
                    src={(quickViewProduct.images && quickViewProduct.images[0]) || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded">
                    {quickViewProduct.categoryName}
                  </span>
                  <h3 className="text-xl font-bold text-stone-900 mt-2">
                    {quickViewProduct.name}
                  </h3>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-stone-900 font-cairo">
                    {quickViewProduct.price} <span className="text-sm font-bold text-amber-700">ج.م</span>
                  </span>
                  {quickViewProduct.oldPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      {quickViewProduct.oldPrice} ج.م
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {quickViewProduct.material && (
                  <div className="bg-stone-50 rounded-xl p-3 text-xs border border-stone-200/80">
                    <span className="text-stone-500">الخامة: </span>
                    <span className="font-bold text-stone-800">{quickViewProduct.material}</span>
                  </div>
                )}

                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold text-stone-700 mb-1.5">اللون:</span>
                    <div className="flex gap-2">
                      {quickViewProduct.colors.map(col => (
                        <button
                          key={col}
                          onClick={() => setQuickViewColor(col)}
                          className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                            quickViewColor === col
                              ? "bg-stone-900 text-white border-stone-900 shadow"
                              : "bg-white text-stone-700 border-stone-200 hover:border-brand-gold"
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    addToCart(quickViewProduct, quickViewColor);
                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-brand-gold hover:bg-brand-goldHover text-stone-950 font-black py-3 px-4 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <i className="fa-solid fa-cart-plus"></i>
                  <span>أضيفي للسلة ({quickViewProduct.price} ج.م)</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WISHLIST DRAWER */}
      {/* ============================================================== */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div onClick={() => setIsWishlistOpen(false)} className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"></div>
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-heart text-rose-500 text-lg"></i>
                  <h3 className="font-bold text-stone-900 text-base">قائمة المفضلة</h3>
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {wishlist.length}
                  </span>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto divide-y divide-stone-100">
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 text-stone-400">
                    <i className="fa-regular fa-heart text-4xl mb-3 text-stone-300 block"></i>
                    <p className="font-bold text-stone-700">المفضلة فارغة</p>
                  </div>
                ) : (
                  wishlist.map(favId => {
                    const prod = products.find(p => p.id === favId);
                    if (!prod) return null;
                    return (
                      <div key={prod.id} className="py-3 flex gap-3 items-center">
                        <img src={(prod.images && prod.images[0]) || ""} alt={prod.name} className="w-16 h-16 rounded-xl object-cover border border-stone-200" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-xs truncate">{prod.name}</h4>
                          <span className="text-amber-800 font-extrabold text-xs block mt-0.5">{prod.price} ج.م</span>
                          <button
                            onClick={() => { addToCart(prod); toggleWishlist(prod.id); }}
                            className="mt-1 text-[11px] font-bold text-brand-gold hover:underline flex items-center gap-1"
                          >
                            <i className="fa-solid fa-cart-arrow-down"></i> نقل إلى السلة
                          </button>
                        </div>
                        <button onClick={() => toggleWishlist(prod.id)} className="text-stone-400 hover:text-rose-500 p-1 text-sm">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-stone-200 bg-stone-50">
                <button onClick={() => setIsWishlistOpen(false)} className="w-full bg-stone-900 text-white font-bold py-2.5 rounded-xl text-xs">
                  إغلاق
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STORE SETTINGS & PRODUCT MANAGEMENT MODAL (ADMIN) */}
      {/* ============================================================== */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsAdminOpen(false)} className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 border border-stone-100 text-xs">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-base">
                <i className="fa-solid fa-database text-amber-600"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900">لوحة تحكم Firebase</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${firebaseStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {firebaseStatus === 'connected' ? 'Firebase متصل 🟢' : 'جارٍ الاتصال...'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">مشروع: <strong>galgol</strong> | المزامنة الحية مفعلة</p>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setAdminTab("settings")}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${adminTab === "settings" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
              >
                <i className="fa-solid fa-gear ml-1"></i> إعدادات المتجر
              </button>
              <button
                onClick={() => setAdminTab("products")}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${adminTab === "products" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
              >
                <i className="fa-solid fa-box ml-1"></i> المنتجات ({products.length})
              </button>
              <button
                onClick={() => setAdminTab("add")}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${adminTab === "add" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
              >
                <i className="fa-solid fa-plus ml-1"></i> إضافة منتج
              </button>
              <button
                onClick={() => setAdminTab("orders")}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${adminTab === "orders" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
              >
                <i className="fa-solid fa-receipt ml-1"></i> الطلبات ({firebaseOrders.length})
              </button>
            </div>

            {/* TAB 1: SETTINGS */}
            {adminTab === "settings" && (
              <div className="space-y-4">
                
                {firebaseStatus === "permission_denied" && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-info"></i> تنبيه هام لقواعد فايربيس (Firestore Rules):
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      إذا ظهر خطأ <code>permission-denied</code>، توجهي إلى وحدة تحكم فايربيس الخاصة بمشروع <strong>galgol</strong> ثم <strong>Firestore Database &gt; Rules</strong> وضعي القاعدة التالية للسماح بالقراءة والكتابة:
                    </p>
                    <pre className="bg-stone-900 text-amber-200 p-2 rounded text-[10px] font-mono select-all">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    رقم الواتساب الخاص بالمتجر لاستقبال الطلبات *
                  </label>
                  <input
                    type="text"
                    value={tempSettings.whatsappNumber}
                    onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                    placeholder="مثال لمصر: 201012345678 (مع كود الدولة)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-sm"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    يتم تحويل رسالة الطلب والفاتورة إلى هذا الرقم تلقائياً بنقرة زر من الزبونة
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">اسم المتجر</label>
                  <input
                    type="text"
                    value={tempSettings.storeName}
                    onChange={(e) => setTempSettings({ ...tempSettings, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">رقم الهاتف المعروض للزبائن</label>
                  <input
                    type="text"
                    value={tempSettings.phoneDisplay}
                    onChange={(e) => setTempSettings({ ...tempSettings, phoneDisplay: e.target.value })}
                    placeholder="010 xxxx xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">الحد الأدنى للشحن المجاني (ج.م)</label>
                  <input
                    type="number"
                    value={tempSettings.freeShippingThreshold}
                    onChange={(e) => setTempSettings({ ...tempSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-xl shadow flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-brand-gold"></i>
                    <span>{isSavingSettings ? "جارٍ الحفظ في Firebase..." : "حفظ الإعدادات في Firebase"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS LIST */}
            {adminTab === "products" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span>منتجات مسجلة في Firebase: <strong>{products.length}</strong></span>
                  <button
                    onClick={() => setAdminTab("add")}
                    className="bg-stone-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    + إضافة منتج جديد
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl">
                  {products.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      <p>لا توجد منتجات مسجلة في قاعدة بيانات Firebase حالياً</p>
                      <button
                        onClick={() => setAdminTab("add")}
                        className="mt-2 text-xs text-brand-gold underline font-bold"
                      >
                        أضيفي أول منتج لمتجركِ الآن
                      </button>
                    </div>
                  ) : (
                    products.map(p => (
                      <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50">
                        <img src={(p.images && p.images[0]) || ""} alt={p.name} className="w-10 h-10 rounded-lg object-cover border" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-stone-900 truncate">{p.name}</h5>
                          <span className="text-[10px] text-stone-500">{p.categoryName} — <strong className="text-amber-800">{p.price} ج.م</strong></span>
                        </div>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-stone-400 hover:text-rose-600 p-2"
                          title="حذف من Firebase"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ADD PRODUCT */}
            {adminTab === "add" && (
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="مثال: عقد الفراشة المطلي ذهب"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">القسم *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      {CATEGORIES.filter(c => c.id !== "all").map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">السعر (ج.م) *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="350"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">السعر قبل الخصم (اختياري)</label>
                    <input
                      type="number"
                      value={newProduct.oldPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                      placeholder="450"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">الألوان المتاحة (مفصولة بفاصلة)</label>
                    <input
                      type="text"
                      value={newProduct.colors}
                      onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                      placeholder="ذهبي, فضي, روز جولد"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">رابط صورة المنتج (URL)</label>
                  <input
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="https://... (يمكنكِ لصق رابط صورة)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">إذا تُرك فارغاً، ستوضع صورة إكسسوار أنيقة تلقائياً</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">وصف المنتج</label>
                  <textarea
                    rows="2"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="تفاصيل التصميم..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">الخامة والطلاء</label>
                  <input
                    type="text"
                    value={newProduct.material}
                    onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                    placeholder="ستانلس ستيل 316L مطلي ذهب عيار 18"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="w-full bg-brand-gold hover:bg-brand-goldHover text-stone-950 font-black py-2.5 rounded-xl shadow flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>{isSavingProduct ? "جارٍ الحفظ في Firebase..." : "حفظ المنتج في Firebase"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: ORDERS FROM FIREBASE */}
            {adminTab === "orders" && (
              <div className="space-y-3">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex justify-between items-center">
                  <span>إجمالي الطلبات المسجلة بـ Firebase: <strong>{firebaseOrders.length}</strong></span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {firebaseOrders.length === 0 ? (
                    <div className="text-center py-10 text-stone-400">
                      <p>لا توجد طلبات مسجلة بعد</p>
                      <span className="text-[10px]">تظهر هنا الطلبات فور إتمام الزبائن لعمليات الشراء</span>
                    </div>
                  ) : (
                    firebaseOrders.map(ord => (
                      <div key={ord.id} className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-stone-900">طلب #{ord.orderNumber}</span>
                          <span className="text-amber-800">{ord.grandTotal} ج.م</span>
                        </div>
                        <div className="text-stone-600">
                          <span>العميل: {ord.customer?.name} ({ord.customer?.phone})</span>
                        </div>
                        <div className="text-stone-500 text-[11px]">
                          العنوان: {ord.customer?.city} — {ord.customer?.address}
                        </div>
                        <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-200">
                          المنتجات: {ord.items?.map(it => `${it.name} (${it.quantity})`).join(", ")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
