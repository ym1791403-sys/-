const { useState, useEffect, useMemo, useRef } = React;

// Firebase Configuration (Direct & Live)
const firebaseConfig = {
  apiKey: "AIzaSyDlVC_LiwIgiDs5a7VYDSs-tJ5mo9-yfhQ",
  authDomain: "galgol.firebaseapp.com",
  projectId: "galgol",
  storageBucket: "galgol.firebasestorage.app",
  messagingSenderId: "844399737643",
  appId: "1:844399737643:web:a10d8e3df77e001264636e",
  measurementId: "G-5WEMXQWMG2"
};

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
    } catch (e) {}
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
  // Store Settings (Synced with database)
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem("store_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          whatsappNumber: parsed.whatsappNumber || "201026040845",
          storeName: "Chic Shop Galena's",
          freeShippingThreshold: parsed.freeShippingThreshold || 600,
          phoneDisplay: parsed.phoneDisplay || "010 2604 0845"
        };
      } catch (e) {}
    }
    return {
      whatsappNumber: "201026040845",
      storeName: "Chic Shop Galena's",
      freeShippingThreshold: 600,
      phoneDisplay: "010 2604 0845"
    };
  });

  // Database Connection Status (Only visible inside admin)
  const [dbStatus, setDbStatus] = useState(isFirebaseAvailable ? "connected" : "error");
  const [dbErrorMsg, setDbErrorMsg] = useState("");

  // Products from Database
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Orders from Database
  const [orders, setOrders] = useState([]);

  // Customer Shopping State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("store_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("store_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewColor, setQuickViewColor] = useState("");

  // Admin Dashboard State (Discreet trigger)
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("products"); // "products" | "orders" | "add" | "settings"

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "necklaces",
    price: "",
    oldPrice: "",
    imageData: "",
    colors: "ذهبي, فضي",
    description: "",
    material: ""
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Function to process & compress image from device
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast("يرجى اختيار ملف صورة صالح (JPG أو PNG)", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setNewProduct(prev => ({ ...prev, imageData: compressed }));
        showToast("تم اختيار الصورة بنجاح");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Settings Temp Form
  const [tempSettings, setTempSettings] = useState({
    whatsappNumber: storeSettings.whatsappNumber,
    phoneDisplay: storeSettings.phoneDisplay,
    storeName: "Chic Shop Galena's",
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
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  // Toast Alerts
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ==============================================================
  // REAL-TIME DATABASE LISTENERS
  // ==============================================================

  // 1. Products Listener
  useEffect(() => {
    if (!db) {
      setIsLoadingProducts(false);
      setDbStatus("error");
      return;
    }

    const unsubscribe = db.collection("products").onSnapshot(
      (snapshot) => {
        const fetched = [];
        snapshot.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
        setProducts(fetched);
        setIsLoadingProducts(false);
        setDbStatus("connected");
      },
      (error) => {
        console.warn("Products sync notice:", error);
        setIsLoadingProducts(false);
        if (error.code === "permission-denied") {
          setDbStatus("permission_denied");
          setDbErrorMsg(error.message);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Settings Listener
  useEffect(() => {
    if (!db) return;

    const unsubscribe = db.collection("settings").doc("store").onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          const cleanName = "Chic Shop Galena's";
          setStoreSettings(prev => ({ ...prev, ...data, storeName: cleanName }));
          setTempSettings(prev => ({ ...prev, ...data, storeName: cleanName }));
        }
      },
      () => {}
    );

    return () => unsubscribe();
  }, []);

  // 3. Orders Listener
  useEffect(() => {
    if (!db) return;

    const unsubscribe = db.collection("orders")
      .orderBy("createdAt", "desc")
      .limit(60)
      .onSnapshot(
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setOrders(list);
        },
        () => {
          // Fallback if index not yet built
          db.collection("orders").limit(60).get().then(snap => {
            const list = [];
            snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setOrders(list);
          }).catch(() => {});
        }
      );

    return () => unsubscribe();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("store_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("store_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ==============================================================
  // CART ACTIONS
  // ==============================================================

  const addToCart = (product, color = null) => {
    const chosenColor = color || (product.colors && product.colors[0]) || "الافتراضي";
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === product.id && item.color === chosenColor);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
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
    showToast(`تمت إضافة "${product.name.slice(0, 24)}..." إلى السلة`);
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
    showToast("تم حذف المنتج من السلة");
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("تمت الإزالة من المفضلة");
        return prev.filter(id => id !== productId);
      } else {
        showToast("تمت الإضافة إلى المفضلة");
        return [...prev, productId];
      }
    });
  };

  // ==============================================================
  // ADMIN DASHBOARD ACTIONS
  // ==============================================================

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) {
      showToast("يرجى كتابة اسم المنتج وسعره", "error");
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
        newProduct.imageData || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
      ],
      description: newProduct.description.trim() || "قطعة إكسسوار أنيقة بتصميم عصري راقي.",
      material: newProduct.material.trim() || "مقاوم لتغير اللون ومضاد للحساسية.",
      createdAt: new Date().toISOString()
    };

    try {
      if (db) {
        await db.collection("products").add(productPayload);
        showToast("تمت إضافة المنتج بنجاح");
      } else {
        setProducts(prev => [{ id: Date.now().toString(), ...productPayload }, ...prev]);
        showToast("تمت إضافة المنتج محلياً");
      }

      setNewProduct({
        name: "",
        category: "necklaces",
        price: "",
        oldPrice: "",
        imageData: "",
        colors: "ذهبي, فضي",
        description: "",
        material: ""
      });
      setAdminTab("products");
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء حفظ المنتج، يرجى مراجعة الصلاحيات", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("هل أنتِ متأكدة من حذف هذا المنتج؟")) return;

    try {
      if (db && typeof id === 'string' && id.length > 5) {
        await db.collection("products").doc(id).delete();
        showToast("تم حذف المنتج بنجاح");
      } else {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast("تم حذف المنتج");
      }
      setCart(prev => prev.filter(item => item.id !== id));
      setWishlist(prev => prev.filter(pId => pId !== id));
    } catch (err) {
      console.error(err);
      showToast("تعذر حذف المنتج", "error");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (db && orderId) {
        await db.collection("orders").doc(orderId).update({ status: newStatus });
        showToast(`تم تحديث حالة الطلب إلى "${newStatus}"`);
      }
    } catch (e) {
      showToast("تعذر تحديث الحالة", "error");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const updated = { ...tempSettings, storeName: "Chic Shop Galena's" };
    try {
      if (db) {
        await db.collection("settings").doc("store").set(updated, { merge: true });
        showToast("تم حفظ الإعدادات بنجاح");
      }
      setStoreSettings(updated);
      localStorage.setItem("store_settings", JSON.stringify(updated));
      setIsAdminOpen(false);
    } catch (err) {
      console.error(err);
      showToast("تعذر حفظ الإعدادات", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ==============================================================
  // SHOPPER FILTER & CALCULATIONS
  // ==============================================================

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

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const selectedShipping = useMemo(() => {
    return SHIPPING_RATES.find(s => s.city === customer.city) || SHIPPING_RATES[0];
  }, [customer.city]);

  const shippingCost = useMemo(() => {
    if (subtotal >= storeSettings.freeShippingThreshold || subtotal === 0) return 0;
    return selectedShipping.cost;
  }, [subtotal, selectedShipping, storeSettings.freeShippingThreshold]);

  const giftWrapCost = includeGiftWrap ? 35 : 0;
  const grandTotal = Math.max(0, subtotal + shippingCost + giftWrapCost);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Stats for Admin
  const totalSalesRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === "جديد" || !o.status).length;
  }, [orders]);

  // Submit Order
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!storeSettings.whatsappNumber.trim()) {
      showToast("يرجى إدخال رقم الواتساب الخاص بالمتجر أولاً من لوحة الإدارة", "error");
      setIsCheckoutModalOpen(false);
      setIsAdminOpen(true);
      setAdminTab("settings");
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      showToast("يرجى ملء الاسم والهاتف والعنوان بالتفصيل", "error");
      return;
    }

    setIsSubmittingOrder(true);
    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('ar-EG', { dateStyle: 'medium' });

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
      grandTotal,
      includeGiftWrap,
      giftNote: giftNote.trim(),
      status: "جديد",
      createdAt: new Date().toISOString()
    };

    try {
      if (db) {
        await db.collection("orders").add(orderData);
      }
    } catch (err) {
      console.warn(err);
    }

    // Build WhatsApp message
    let message = `طلب جديد من المتجر (${storeSettings.storeName})\n`;
    message += `رقم الطلب: #${orderNumber}\n`;
    message += `التاريخ: ${dateStr}\n\n`;
    message += `بيانات العميل:\n`;
    message += `• الاسم: ${customer.name.trim()}\n`;
    message += `• الهاتف: ${customer.phone.trim()}\n`;
    if (customer.altPhone) message += `• هاتف إضافي: ${customer.altPhone.trim()}\n`;
    message += `• المحافظة: ${customer.city}\n`;
    message += `• العنوان بالتفصيل: ${customer.address.trim()}\n`;
    if (customer.notes.trim()) message += `• ملاحظات: ${customer.notes.trim()}\n`;
    
    message += `\nالمنتجات:\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.color}) - عدد: ${item.quantity} = ${item.quantity * item.price} ج.م\n`;
    });

    if (includeGiftWrap) {
      message += `• تغليف هدية: نعم (+35 ج.م)\n`;
      if (giftNote.trim()) message += `• رسالة الهدية: "${giftNote.trim()}"\n`;
    }

    message += `\nالشحن (${selectedShipping.city}): ${shippingCost === 0 ? 'مجاني' : shippingCost + ' ج.م'}\n`;
    message += `المبلغ المطلوب عند الاستلام: ${grandTotal} ج.م\n`;

    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
    const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  const hasPhoneSet = Boolean(storeSettings.whatsappNumber.trim());

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-800">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl bg-stone-900 text-white text-xs font-medium border border-stone-700 animate-fade-in">
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 text-center font-medium">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-center sm:justify-between">
          <span className="hidden sm:inline">أهلاً بكِ في Chic Shop Galena's للإكسسوارات النسائية</span>
          <span>شحن مجاني لكافة المحافظات للطلبات الأكثر من {storeSettings.freeShippingThreshold} جنيه</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-stone-200 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-3 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-sm shadow">
              <i className="fa-solid fa-gem"></i>
            </div>
            <div>
              <span className="font-playfair text-xl sm:text-2xl font-bold text-stone-900 block leading-tight">
                Chic Shop Galena's
              </span>
              <span className="text-[10px] tracking-wider text-stone-500 font-semibold uppercase">JEWELRY & ACCESSORIES</span>
            </div>
          </a>

          {/* Search Input */}
          <div className="hidden md:flex flex-1 max-w-sm relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن قطعة في المتجر..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:border-stone-800"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            {hasPhoneSet && (
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن إكسسوارات المتجر')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-emerald-100"
              >
                <i className="fa-brands fa-whatsapp text-emerald-600"></i>
                <span>واتساب</span>
              </a>
            )}

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-full text-stone-700 hover:bg-stone-100"
              title="المفضلة"
            >
              <i className="fa-regular fa-heart text-lg"></i>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-full text-xs font-medium shadow"
            >
              <i className="fa-solid fa-bag-shopping text-amber-300"></i>
              <span className="hidden sm:inline">السلة</span>
              <span className="bg-amber-400 text-stone-900 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {totalCartItems}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن قطعة في المتجر..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-stone-300 rounded-full focus:outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section - Fully Responsive for Mobile, Tablet, Laptop & Desktop */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 text-white py-8 sm:py-12 md:py-16 lg:py-20">
        
        {/* Ambient background glows for luxury vibe */}
        <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Text & Value Proposition (7 cols on Desktop, full on Mobile/Tablet) */}
            <div className="lg:col-span-7 text-center lg:text-right space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-stone-200">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>تشكيلة حصرية من أرقى الإكسسوارات والمجوهرات النسائية</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-snug">
                أناقتكِ تكتمل بتفاصيل <br className="hidden sm:inline" />
                <span className="text-amber-300 font-playfair">Chic Shop Galena's</span>
              </h1>
              
              <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                مجموعة مختارة من أحدث السلاسل، الخواتم، الأساور، والأقراط المطلية بعناية فائقة والمقاومة لتغير اللون، مصممة لتبرز جمالكِ في كل مناسبة.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#catalog"
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold px-7 py-3 rounded-full text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 hover:scale-105"
                >
                  <span>تصفحي المنتجات الآن</span>
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                </a>

                {hasPhoneSet && (
                  <a
                    href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار والطلب من Chic Shop Galena\'s')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-full text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                    <span>طلب مباشر عبر واتساب</span>
                  </a>
                )}
              </div>

              {/* Trust Badges - Responsive Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-white/10 text-[11px] sm:text-xs text-stone-300">
                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start text-center sm:text-right">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <strong className="block text-white text-[11px] sm:text-xs">ضمان الخامات</strong>
                    <span className="text-[10px] sm:text-[11px] text-stone-400">مقاوم لتغير اللون</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start text-center sm:text-right">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                    <i className="fa-solid fa-box-open"></i>
                  </div>
                  <div>
                    <strong className="block text-white text-[11px] sm:text-xs">معاينة قبل الدفع</strong>
                    <span className="text-[10px] sm:text-[11px] text-stone-400">التأكد قبل الاستلام</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start text-center sm:text-right">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                    <i className="fa-solid fa-truck-fast"></i>
                  </div>
                  <div>
                    <strong className="block text-white text-[11px] sm:text-xs">توصيل سريع</strong>
                    <span className="text-[10px] sm:text-[11px] text-stone-400">لكافة المحافظات</span>
                  </div>
                </div>
              </div>

            </div>

            {/* BIG HERO IMAGE SHOWCASE (5 cols on Desktop, full & large on Phone/Tablet) */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
                
                {/* Main Large Visual Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop"
                    alt="Chic Shop Galena's Luxury Jewelry"
                    className="w-full h-[360px] sm:h-[440px] md:h-[480px] lg:h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Subtle Gradient & Bottom Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white">
                    <span className="bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2 self-start shadow">
                      القطعة الأكثر طلباً
                    </span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-snug">
                      تشكيلة المجوهرات والإكسسوارات الحصرية
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 mt-1">
                      تصاميم عصرية تناسب يومكِ والمناسبات الخاصة
                    </p>
                  </div>
                </div>

                {/* Floating Decorative Quality Badge */}
                <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-white text-stone-900 p-3 sm:p-4 rounded-2xl shadow-2xl border border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg sm:text-xl">
                    <i className="fa-solid fa-gem"></i>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">طلاء عالي الثبات</div>
                    <div className="text-[10px] sm:text-xs text-stone-500">جودة أصلية مضمونة</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="py-10 sm:py-14 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900">تشكيلة المتجر</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {isLoadingProducts ? "جارٍ تحميل المنتجات..." : `القطع المعروضة (${products.length})`}
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400"
                }`}
              >
                <i className={`fa-solid ${cat.icon} text-[11px]`}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Loading or Empty */}
          {isLoadingProducts ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 p-8">
              <div className="w-10 h-10 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-stone-600">جارٍ تحميل منتجات المتجر...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xl mx-auto mb-3">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">لا توجد منتجات معروضة حالياً</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                سيتم إضافة المنتجات قريباً، يمكنكِ متابعة المتجر أو التواصل معنا عبر واتساب.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
              <p className="text-xs text-stone-600 font-bold">لا توجد قطع مطابقة لهذا البحث أو القسم</p>
              <button
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                className="mt-2 text-xs text-stone-900 underline"
              >
                عرض كافة المنتجات
              </button>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map(product => {
                const isFavorite = wishlist.includes(product.id);
                const displayImg = (product.images && product.images[0]) || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop";
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image & Wishlist */}
                      <div className="relative h-44 sm:h-56 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => { setQuickViewProduct(product); setQuickViewColor((product.colors && product.colors[0]) || ""); }}>
                        <img
                          src={displayImg}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                          className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center ${isFavorite ? "text-rose-500" : "text-stone-400 hover:text-rose-500"}`}
                        >
                          <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart text-xs`}></i>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <span className="text-[10px] text-stone-500 block mb-0.5">{product.categoryName}</span>
                        <h4 
                          onClick={() => { setQuickViewProduct(product); setQuickViewColor((product.colors && product.colors[0]) || ""); }}
                          className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 hover:underline cursor-pointer"
                        >
                          {product.name}
                        </h4>

                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {product.colors.map(col => (
                              <span key={col} className="text-[9px] px-1 py-0.5 bg-stone-100 text-stone-600 rounded">
                                {col}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Cart */}
                    <div className="p-3 pt-0 border-t border-stone-100 mt-2">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm sm:text-base font-bold text-stone-900">
                          {product.price} <span className="text-[10px] font-normal text-stone-600">ج.م</span>
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            {product.oldPrice} ج.م
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <i className="fa-solid fa-cart-plus text-[11px]"></i>
                        <span>إضافة للسلة</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Customer Information / FAQ */}
      <section className="py-10 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-base font-bold text-stone-900 mb-4 text-center">معلومات الشحن والاستلام</h3>
          <div className="space-y-2.5 text-xs text-stone-700">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <strong className="block text-stone-900 mb-1">معاينة الطلب قبل الدفع</strong>
              <span>يحق لكِ فتح الشحنة ومعاينتها والتأكد من سلامتها بحضور مندوب شركة الشحن قبل الدفع.</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <strong className="block text-stone-900 mb-1">مدة التوصيل</strong>
              <span>خلال 24-48 ساعة داخل القاهرة والجيزة، ومن يومين إلى 3 أيام لباقي محافظات الجمهورية.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 pt-8 pb-6 text-xs">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-800 text-center sm:text-right">
            <div>
              <span className="font-playfair text-lg font-bold text-white block">Chic Shop Galena's</span>
              <p className="text-stone-400 text-xs mt-0.5">متجر إلكتروني متخصص في الإكسسوارات النسائية المطلية.</p>
            </div>
            {hasPhoneSet && (
              <div>
                <a 
                  href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  className="text-stone-300 hover:text-white flex items-center gap-1.5"
                >
                  <i className="fa-brands fa-whatsapp text-emerald-400"></i>
                  <span>واتساب: {storeSettings.phoneDisplay || storeSettings.whatsappNumber}</span>
                </a>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-stone-400 text-[11px] gap-2">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} Chic Shop Galena's</span>
            <span className="text-stone-400 font-sans tracking-wide">
              Developed by <strong className="text-amber-400 font-medium">Joe</strong>
            </span>
            <button 
              onClick={() => { setAdminTab("products"); setIsAdminOpen(true); }}
              className="hover:text-stone-200 underline"
            >
              إدارة المتجر
            </button>
          </div>
        </div>
      </footer>

      {/* Discreet Admin Trigger (علامة صغيرة زي موقع كيان سيتي) */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-4 left-4 z-40 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-stone-300 hover:text-white shadow flex items-center justify-center transition-all backdrop-blur-sm border border-stone-700/50"
        title="إدارة المتجر"
      >
        <i className="fa-solid fa-gear text-xs"></i>
      </button>

      {/* Floating WhatsApp Action Button */}
      {hasPhoneSet && (
        <a
          href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار والطلب')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-40 bg-emerald-600 hover:bg-emerald-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-transform hover:scale-105"
          title="تواصل واتساب"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      )}

      {/* ============================================================== */}
      {/* CART DRAWER */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between">
              
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-bag-shopping text-stone-900"></i>
                  <h3 className="font-bold text-stone-900 text-sm">سلة المشتريات</h3>
                  <span className="bg-stone-200 text-stone-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {totalCartItems}
                  </span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-stone-500 hover:text-stone-900 p-1">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Items List */}
              <div className="p-4 flex-1 overflow-y-auto divide-y divide-stone-100">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-stone-400">
                    <p className="font-bold text-stone-700 text-xs">سلتكِ فارغة حالياً</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-3 bg-stone-900 text-white text-xs px-4 py-1.5 rounded-full">
                      تصفح المنتجات
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.id}-${item.color}-${idx}`} className="py-2.5 flex gap-2.5 items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-xs truncate">{item.name}</h4>
                        <span className="text-[10px] text-stone-500 block">اللون: {item.color}</span>
                        <span className="text-xs font-bold text-stone-900 block">{item.price} ج.م</span>
                      </div>

                      <div className="flex items-center border border-stone-200 rounded bg-stone-50 text-xs">
                        <button onClick={() => updateQuantity(item.id, item.color, -1)} className="px-2 py-0.5 text-stone-600">-</button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.color, 1)} className="px-2 py-0.5 text-stone-600">+</button>
                      </div>

                      <button onClick={() => removeFromCart(item.id, item.color)} className="text-stone-400 hover:text-rose-600 p-1">
                        <i className="fa-regular fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2.5 text-xs">
                  <div className="bg-rose-50 p-2 rounded border border-rose-100">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-950 text-[11px]">
                      <input
                        type="checkbox"
                        checked={includeGiftWrap}
                        onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                      />
                      <span>تغليف كهدية مع كارت إهداء (+35 ج.م)</span>
                    </label>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-stone-600">
                      <span>المجموع:</span>
                      <span className="font-bold">{subtotal} ج.م</span>
                    </div>
                    {includeGiftWrap && (
                      <div className="flex justify-between text-rose-700">
                        <span>تغليف الهدية:</span>
                        <span>+35 ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-900 font-bold text-sm pt-1 border-t border-stone-200">
                      <span>الإجمالي:</span>
                      <span>{grandTotal} ج.م</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow flex items-center justify-center gap-2"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
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
          <div onClick={() => setIsCheckoutModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10 text-xs">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-4 left-4 text-stone-400 hover:text-stone-800">
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            <h3 className="text-base font-bold text-stone-900 mb-1 text-center">بيانات استلام الطلب</h3>
            <p className="text-stone-500 text-[11px] text-center mb-4">يرجى كتابة العنوان بدقة لتسليم الشحنة في الموعد</p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">هاتف بديل (اختياري)</label>
                  <input
                    type="tel"
                    value={customer.altPhone}
                    onChange={(e) => setCustomer({ ...customer, altPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">المحافظة *</label>
                <select
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
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
                  placeholder="الشارع، رقم العمارة، رقم الشقة أو علامة مميزة"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                ></textarea>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <div className="flex justify-between text-stone-600 mb-1">
                  <span>الشحن ({selectedShipping.city}):</span>
                  <span>{shippingCost === 0 ? 'مجاناً' : `${shippingCost} ج.م`}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold text-sm">
                  <span>المبلغ للدفع عند الاستلام:</span>
                  <span>{grandTotal} ج.م</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>{isSubmittingOrder ? "جارٍ الإرسال..." : "تأكيد الطلب عبر واتساب"}</span>
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
          <div onClick={() => setCheckoutSuccess(null)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 z-10 text-center text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              <i className="fa-solid fa-check"></i>
            </div>

            <h3 className="text-base font-bold text-stone-900 mb-1">تم تسجيل طلبكِ بنجاح</h3>
            <p className="text-stone-500 mb-4">
              رقم الطلب: <strong className="text-stone-900 font-mono">{checkoutSuccess.orderNumber}</strong>
            </p>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-right space-y-1 mb-4">
              <p>الاسم: {checkoutSuccess.name}</p>
              <p>الهاتف: {checkoutSuccess.phone}</p>
              <p className="font-bold">الإجمالي عند الاستلام: {checkoutSuccess.total} ج.م</p>
            </div>

            <button
              onClick={() => setCheckoutSuccess(null)}
              className="w-full bg-stone-900 text-white font-medium py-2 rounded-lg text-xs"
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
          <div onClick={() => setQuickViewProduct(null)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-5 sm:p-6 z-10 text-xs">
            <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 left-4 text-stone-400 hover:text-stone-800">
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="h-64 rounded-xl overflow-hidden bg-stone-100">
                <img
                  src={(quickViewProduct.images && quickViewProduct.images[0]) || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-stone-500 block">{quickViewProduct.categoryName}</span>
                  <h3 className="text-base font-bold text-stone-900 mt-0.5">{quickViewProduct.name}</h3>
                </div>

                <div className="text-lg font-bold text-stone-900">
                  {quickViewProduct.price} ج.م
                  {quickViewProduct.oldPrice && (
                    <span className="text-xs text-stone-400 line-through mr-2">{quickViewProduct.oldPrice} ج.م</span>
                  )}
                </div>

                <p className="text-stone-600 leading-relaxed">{quickViewProduct.description}</p>

                {quickViewProduct.material && (
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-500">الخامة: </span>
                    <span className="font-bold text-stone-800">{quickViewProduct.material}</span>
                  </div>
                )}

                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                  <div>
                    <span className="block font-bold text-stone-700 mb-1">اللون:</span>
                    <div className="flex gap-1.5">
                      {quickViewProduct.colors.map(col => (
                        <button
                          key={col}
                          onClick={() => setQuickViewColor(col)}
                          className={`px-2.5 py-1 text-xs rounded border transition-all ${quickViewColor === col ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-700 border-stone-300"}`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { addToCart(quickViewProduct, quickViewColor); setQuickViewProduct(null); }}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-lg text-xs"
                >
                  إضافة للسلة ({quickViewProduct.price} ج.م)
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
          <div onClick={() => setIsWishlistOpen(false)} className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between">
              
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-heart text-rose-500"></i>
                  <h3 className="font-bold text-stone-900 text-sm">قائمة المفضلة</h3>
                  <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {wishlist.length}
                  </span>
                </div>
                <button onClick={() => setIsWishlistOpen(false)} className="text-stone-500 hover:text-stone-900 p-1">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto divide-y divide-stone-100">
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 text-stone-400 text-xs">
                    <p className="font-bold text-stone-700">المفضلة فارغة</p>
                  </div>
                ) : (
                  wishlist.map(favId => {
                    const prod = products.find(p => p.id === favId);
                    if (!prod) return null;
                    return (
                      <div key={prod.id} className="py-2.5 flex gap-2.5 items-center">
                        <img src={(prod.images && prod.images[0]) || ""} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-xs truncate">{prod.name}</h4>
                          <span className="text-xs font-bold text-stone-900 block">{prod.price} ج.م</span>
                          <button
                            onClick={() => { addToCart(prod); toggleWishlist(prod.id); }}
                            className="mt-1 text-[11px] text-stone-900 font-bold underline"
                          >
                            نقل إلى السلة
                          </button>
                        </div>
                        <button onClick={() => toggleWishlist(prod.id)} className="text-stone-400 hover:text-rose-600 p-1">
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-stone-200 bg-stone-50">
                <button onClick={() => setIsWishlistOpen(false)} className="w-full bg-stone-900 text-white py-2 rounded-lg text-xs">
                  إغلاق
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STORE ADMIN DASHBOARD (لوحة الإدارة - مرتبة ومريحة) */}
      {/* ============================================================== */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
          <div onClick={() => setIsAdminOpen(false)} className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-7 z-10 text-xs max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-sm">
                  <i className="fa-solid fa-sliders"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">لوحة إدارة المتجر</h3>
                  <span className="text-[11px] text-stone-500">Chic Shop Galena's</span>
                </div>
              </div>
              <button onClick={() => setIsAdminOpen(false)} className="text-stone-400 hover:text-stone-800 p-1 text-base">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">إجمالي المنتجات</span>
                <span className="text-lg font-bold text-stone-900">{products.length}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">إجمالي الطلبات</span>
                <span className="text-lg font-bold text-stone-900">{orders.length}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">طلبات جديدة</span>
                <span className="text-lg font-bold text-amber-600">{pendingOrdersCount}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] text-stone-500 block">إجمالي المبيعات</span>
                <span className="text-lg font-bold text-emerald-700">{totalSalesRevenue} ج.م</span>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex gap-1.5 mb-4 border-b border-stone-200 pb-2">
              <button
                onClick={() => setAdminTab("products")}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${adminTab === "products" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
              >
                المنتجات ({products.length})
              </button>
              <button
                onClick={() => setAdminTab("orders")}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${adminTab === "orders" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
              >
                الطلبات الواردة ({orders.length})
              </button>
              <button
                onClick={() => setAdminTab("add")}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${adminTab === "add" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
              >
                + إضافة منتج
              </button>
              <button
                onClick={() => setAdminTab("settings")}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${adminTab === "settings" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
              >
                إعدادات المتجر
              </button>
            </div>

            {/* TAB CONTENT (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1">
              
              {/* 1. PRODUCTS TAB */}
              {adminTab === "products" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-stone-700 font-bold">قائمة المنتجات الحالية ({products.length})</span>
                    <button
                      onClick={() => setAdminTab("add")}
                      className="bg-stone-900 text-white px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      + إضافة منتج جديد
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <p className="mb-2">لا توجد منتجات مسجلة في المتجر حتى الآن</p>
                      <button
                        onClick={() => setAdminTab("add")}
                        className="text-stone-900 underline font-bold"
                      >
                        أضيفي أول منتج لمتجركِ الآن
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                      {products.map(p => (
                        <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50">
                          <img src={(p.images && p.images[0]) || ""} alt={p.name} className="w-10 h-10 rounded-lg object-cover border" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-stone-900 truncate">{p.name}</h5>
                            <span className="text-[11px] text-stone-500">{p.categoryName} — <strong className="text-stone-900">{p.price} ج.م</strong></span>
                          </div>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="text-stone-400 hover:text-rose-600 p-2"
                            title="حذف"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. ORDERS TAB */}
              {adminTab === "orders" && (
                <div className="space-y-3">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex justify-between items-center">
                    <span className="font-bold text-stone-800">سجل طلبات العملاء ({orders.length})</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-stone-400">
                      <p>لا توجد طلبات مسجلة بعد</p>
                      <span className="text-[10px]">تظهر هنا الطلبات فور قيام العملاء بالطلب</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {orders.map(ord => (
                        <div key={ord.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-xs">طلب #{ord.orderNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ord.status === 'تم التوصيل' ? 'bg-emerald-100 text-emerald-800' : ord.status === 'تم الشحن' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                                {ord.status || 'جديد'}
                              </span>
                            </div>
                            <span className="font-bold text-stone-900">{ord.grandTotal} ج.م</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200">
                            <div>
                              <p><strong>العميل:</strong> {ord.customer?.name}</p>
                              <p><strong>الهاتف:</strong> {ord.customer?.phone}</p>
                              {ord.customer?.altPhone && <p><strong>هاتف إضافي:</strong> {ord.customer?.altPhone}</p>}
                            </div>
                            <div>
                              <p><strong>المحافظة:</strong> {ord.customer?.city}</p>
                              <p><strong>العنوان:</strong> {ord.customer?.address}</p>
                              {ord.customer?.notes && <p><strong>ملاحظات:</strong> {ord.customer?.notes}</p>}
                            </div>
                          </div>

                          <div className="text-[11px] text-stone-500">
                            <strong>المنتجات: </strong>
                            {ord.items?.map(it => `${it.name} (${it.quantity})`).join(" + ")}
                          </div>

                          {/* Order Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-stone-500">تغيير الحالة:</span>
                              <button onClick={() => updateOrderStatus(ord.id, "تم الشحن")} className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold border border-blue-200">شحن</button>
                              <button onClick={() => updateOrderStatus(ord.id, "تم التوصيل")} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200">تم التوصيل</button>
                            </div>

                            {ord.customer?.phone && (
                              <a
                                href={`https://wa.me/${ord.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ/ة ${ord.customer?.name}، بخصوص طلبكِ رقم ${ord.orderNumber} من Chic Shop Galena's:`)}`}
                                target="_blank"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <i className="fa-brands fa-whatsapp"></i>
                                <span>مراسلة واتساب</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. ADD PRODUCT TAB */}
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
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">القسم *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
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
                        className="w-full px-3 py-2 rounded-lg border border-stone-300"
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
                        className="w-full px-3 py-2 rounded-lg border border-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">الألوان المتاحة</label>
                      <input
                        type="text"
                        value={newProduct.colors}
                        onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                        placeholder="ذهبي, فضي"
                        className="w-full px-3 py-2 rounded-lg border border-stone-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">صورة المنتج</label>
                    {newProduct.imageData ? (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-stone-300 shadow-sm mx-auto group">
                        <img src={newProduct.imageData} alt="معاينة" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, imageData: "" }))}
                          className="absolute inset-0 bg-stone-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 font-bold text-xs"
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                          <span>تغيير الصورة</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleImageFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                          isDragging ? "border-stone-900 bg-stone-100" : "border-stone-300 bg-stone-50 hover:bg-stone-100"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageFile(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto mb-2 text-sm">
                          <i className="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        <p className="font-bold text-stone-800 text-xs">اسحبي صورة المنتج هنا أو اضغطي للاختيار</p>
                        <span className="text-[10px] text-stone-500 block mt-0.5">اختاري أي صورة من جهازكِ أو هاتفكِ مباشرة</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">وصف المنتج (اختياري)</label>
                    <textarea
                      rows="2"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="تفاصيل التصميم..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">الخامة والطلاء (اختياري)</label>
                    <input
                      type="text"
                      value={newProduct.material}
                      onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                      placeholder="مثال: ستانلس ستيل مطلي ذهب عيار 18"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProduct}
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-lg shadow"
                    >
                      {isSavingProduct ? "جارٍ الحفظ..." : "حفظ المنتج وعرضه في المتجر"}
                    </button>
                  </div>
                </form>
              )}

              {/* 4. SETTINGS TAB */}
              {adminTab === "settings" && (
                <div className="space-y-3.5">
                  
                  {dbStatus === "permission_denied" && (
                    <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg text-amber-900 text-[11px] space-y-1">
                      <p className="font-bold">تنبيه صلاحيات قاعدة البيانات:</p>
                      <p>يرجى التأكد من ضبط قواعد Firestore للسماح بالقراءة والكتابة.</p>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      رقم الواتساب لاستقبال الطلبات *
                    </label>
                    <input
                      type="text"
                      value={tempSettings.whatsappNumber}
                      onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                      placeholder="مثال: 201012345678"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono"
                    />
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      هذا الرقم هو الذي يتم تحويل رسائل وفواتير الطلبات إليه مباشرة
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">رقم الهاتف المعروض في الفوتر</label>
                    <input
                      type="text"
                      value={tempSettings.phoneDisplay}
                      onChange={(e) => setTempSettings({ ...tempSettings, phoneDisplay: e.target.value })}
                      placeholder="010 xxxx xxxx"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">الحد الأدنى للشحن المجاني (ج.م)</label>
                    <input
                      type="number"
                      value={tempSettings.freeShippingThreshold}
                      onChange={(e) => setTempSettings({ ...tempSettings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-lg shadow"
                    >
                      {isSavingSettings ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Mount App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
