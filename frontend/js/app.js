// Main App Coordinator Component
// Chic Shop Galena's - Women's Accessories Store

const { useState, useEffect, useMemo, useRef } = React;

// SHA-256 hash of a normalized phone number, used as the lookup key for
// public order tracking — the phone itself is never stored in the
// tracking document.
async function hashPhoneNumber(phone) {
  const digits = (phone || "").replace(/[^0-9]/g, "").replace(/^002/, "").replace(/^2(?=01)/, "");
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(digits));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) {}
  // Fallback for very old browsers without crypto.subtle (lookup key only).
  let h = 5381;
  for (let i = 0; i < digits.length; i++) h = ((h << 5) + h + digits.charCodeAt(i)) >>> 0;
  return "djb2-" + h.toString(16);
}
window.hashPhoneNumber = hashPhoneNumber;

// Realtime Database snapshots arrive as objects keyed by child key;
// normalize them to the same [{ id, ...data }] arrays the app uses.
function snapshotToList(snapshot) {
  const val = snapshot.val() || {};
  return Object.keys(val).map(key => ({ id: key, ...val[key] }));
}

function App() {
  const storeDefaults = window.DEFAULT_STORE_SETTINGS || {
    storeName: "Chic Shop Galena's",
    tiktokUrl: "https://www.tiktok.com/@jaljola2?_r=1&_t=ZS-9BReZO7XDVs",
    freeShippingThreshold: 600,
    phoneDisplay: "010 2604 0845"
  };

  // Store Settings (Synced with database)
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem("store_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          storeName: "Chic Shop Galena's",
          tiktokUrl: (parsed.tiktokUrl && parsed.tiktokUrl.trim()) ? parsed.tiktokUrl : storeDefaults.tiktokUrl,
          freeShippingThreshold: parsed.freeShippingThreshold || storeDefaults.freeShippingThreshold,
          phoneDisplay: parsed.phoneDisplay || storeDefaults.phoneDisplay
        };
      } catch (e) {}
    }
    return storeDefaults;
  });

  // Database Connection Status (Only visible inside admin)
  const [dbStatus, setDbStatus] = useState(window.isFirebaseAvailable ? "connected" : "error");
  const [dbErrorMsg, setDbErrorMsg] = useState("");

  // Products from Database / LocalStorage (Defaults to INITIAL_PRODUCTS)
  const [products, setProducts] = useState(() => {
    const initial = window.INITIAL_PRODUCTS || [];
    const saved = localStorage.getItem("store_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(p => p.id));
          const missing = initial.filter(p => !existingIds.has(p.id));
          if (missing.length > 0) {
            const combined = [...parsed, ...missing];
            try { localStorage.setItem("store_products", JSON.stringify(combined)); } catch (e) {}
            return combined;
          }
          return parsed;
        }
      } catch (e) {}
    }
    if (initial.length > 0) {
      try { localStorage.setItem("store_products", JSON.stringify(initial)); } catch (e) {}
    }
    return initial;
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

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

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewColor, setQuickViewColor] = useState("");
  const [policyModal, setPolicyModal] = useState(null); // 'privacy' | 'returns' | 'terms' | 'shipping'

  // Admin Dashboard State (Footer brand trigger & Firebase Auth)
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("products"); // "products" | "orders" | "add" | "settings" | "coupons"
  // Security: admin login runs on Firebase Authentication (email +
  // password account created in the Firebase console). No admin password
  // lives in the code or in the database anymore.
  const [adminUser, setAdminUser] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Firebase Auth session listener (local persistence: stays signed in
  // across reloads).
  useEffect(() => {
    if (!window.auth) return;
    const unsubscribe = window.auth.onAuthStateChanged((user) => {
      setAdminUser(user || null);
      setIsAdminAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "necklaces",
    price: "",
    oldPrice: "",
    stock: 10,
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
    phoneDisplay: storeSettings.phoneDisplay,
    storeName: "Chic Shop Galena's",
    tiktokUrl: storeSettings.tiktokUrl || storeDefaults.tiktokUrl,
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

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoError, setPromoError] = useState("");

  // Gift wrap options
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  // Order tracking modal
  const [isTrackOpen, setIsTrackOpen] = useState(false);

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
    if (!window.db) {
      setIsLoadingProducts(false);
      setDbStatus("error");
      return;
    }

    const productsRef = window.db.ref("products");
    const handleSnapshot = (snapshot) => {
        const fetched = snapshotToList(snapshot);
        if (fetched.length > 0) {
          setProducts(fetched);
          localStorage.setItem("store_products", JSON.stringify(fetched));
        } else {
          const initial = window.INITIAL_PRODUCTS || [];
          const saved = localStorage.getItem("store_products");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const existingIds = new Set(parsed.map(p => p.id));
                const missing = initial.filter(p => !existingIds.has(p.id));
                const finalProds = missing.length > 0 ? [...parsed, ...missing] : parsed;
                setProducts(finalProds);
                try { localStorage.setItem("store_products", JSON.stringify(finalProds)); } catch (e) {}
                setIsLoadingProducts(false);
                setDbStatus("connected");
                return;
              }
            } catch (e) {}
          }
          if (initial.length > 0) {
            setProducts(initial);
          }
        }
        setIsLoadingProducts(false);
        setDbStatus("connected");
    };
    const handleError = (error) => {
        console.warn("Products sync notice:", error);
        const initial = window.INITIAL_PRODUCTS || [];
        const saved = localStorage.getItem("store_products");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const existingIds = new Set(parsed.map(p => p.id));
              const missing = initial.filter(p => !existingIds.has(p.id));
              const finalProds = missing.length > 0 ? [...parsed, ...missing] : parsed;
              setProducts(finalProds);
              try { localStorage.setItem("store_products", JSON.stringify(finalProds)); } catch (e) {}
              setIsLoadingProducts(false);
              return;
            }
          } catch (e) {}
        }
        if (initial.length > 0) {
          setProducts(initial);
        }
        setIsLoadingProducts(false);
        if (error.code === "permission-denied" || error.code === "PERMISSION_DENIED") {
          setDbStatus("permission_denied");
          setDbErrorMsg(error.message);
        }
    };
    productsRef.on("value", handleSnapshot, handleError);

    return () => productsRef.off("value", handleSnapshot);
  }, []);

  // 2. Settings Listener
  useEffect(() => {
    if (!window.db) return;

    const settingsRef = window.db.ref("settings/store");
    const handleSettings = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cleanName = "Chic Shop Galena's";
        const tiktok = (data.tiktokUrl && data.tiktokUrl.trim()) ? data.tiktokUrl : storeDefaults.tiktokUrl;
        setStoreSettings(prev => ({ ...prev, ...data, storeName: cleanName, tiktokUrl: tiktok }));
        setTempSettings(prev => ({ ...prev, ...data, storeName: cleanName, tiktokUrl: tiktok }));
      }
    };
    settingsRef.on("value", handleSettings, () => {});

    return () => settingsRef.off("value", handleSettings);
  }, []);

  // 3. Orders Listener (admin only — full orders contain customer data,
  // so Realtime Database rules allow reading them only for a signed-in admin)
  useEffect(() => {
    if (!window.db || !isAdminAuthenticated) {
      setOrders([]);
      return;
    }

    const ordersRef = window.db.ref("orders").orderByChild("createdAt").limitToLast(60);
    const handleOrders = (snapshot) => {
      setOrders(snapshotToList(snapshot).reverse());
    };
    ordersRef.on("value", handleOrders, () => {});

    return () => ordersRef.off("value", handleOrders);
  }, [isAdminAuthenticated]);

  // 3b. Public Order-Tracking Listener (order_tracking nodes carry no
  // customer data — only status, totals and items — so anyone may read them)
  const [trackingOrders, setTrackingOrders] = useState([]);
  useEffect(() => {
    if (!window.db) return;
    const trackingRef = window.db.ref("order_tracking").orderByChild("createdAt").limitToLast(60);
    const handleTracking = (snapshot) => {
      setTrackingOrders(snapshotToList(snapshot).reverse());
    };
    trackingRef.on("value", handleTracking, () => {});
    return () => trackingRef.off("value", handleTracking);
  }, []);

  // 5. Coupons Listener (falls back to DEFAULT_COUPONS when empty)
  const [coupons, setCoupons] = useState(window.DEFAULT_COUPONS || []);
  useEffect(() => {
    if (!window.db) return;
    const couponsRef = window.db.ref("coupons");
    const handleCoupons = (snapshot) => {
      const list = snapshotToList(snapshot);
      if (list.length > 0) setCoupons(list);
    };
    couponsRef.on("value", handleCoupons, () => {});
    return () => couponsRef.off("value", handleCoupons);
  }, []);

  // 6. Reviews Listener
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (!window.db) return;
    const reviewsRef = window.db.ref("reviews").orderByChild("createdAt").limitToLast(200);
    const handleReviews = (snapshot) => {
      setReviews(snapshotToList(snapshot).reverse());
    };
    reviewsRef.on("value", handleReviews, () => {});
    return () => reviewsRef.off("value", handleReviews);
  }, []);

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem("store_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("store_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ==============================================================
  // CART & WISHLIST ACTIONS
  // ==============================================================

  const addToCart = (product, color = null) => {
    const chosenColor = color || (product.colors && product.colors[0]) || "الافتراضي";
    // Do not sell more than the available stock (when stock is tracked)
    if (typeof product.stock === "number") {
      const inCart = cart.filter(item => item.id === product.id).reduce((acc, item) => acc + item.quantity, 0);
      if (product.stock <= 0) {
        showToast("هذه القطعة نفدت من المخزون حالياً", "error");
        return;
      }
      if (inCart >= product.stock) {
        showToast(`الكمية المتاحة من هذه القطعة ${product.stock} فقط`, "error");
        return;
      }
    }
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
          image: (product.images && product.images[0]) || "images/products/product-1.jpg",
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
    const catList = window.CATEGORIES || [];
    const catObj = catList.find(c => c.id === newProduct.category) || catList[1];
    const parsedColors = newProduct.colors.split(",").map(c => c.trim()).filter(Boolean);

    const productPayload = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      categoryName: catObj ? catObj.name : "إكسسوارات",
      price: parseFloat(newProduct.price),
      oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
      inStock: true,
      stock: (newProduct.stock === "" || newProduct.stock === undefined || newProduct.stock === null)
        ? 10
        : Math.max(0, parseInt(newProduct.stock, 10) || 0),
      colors: parsedColors.length > 0 ? parsedColors : ["ذهبي"],
      images: [
        newProduct.imageData || "images/products/product-1.jpg"
      ],
      description: newProduct.description.trim() || "قطعة إكسسوار أنيقة بتصميم عصري راقي.",
      material: newProduct.material.trim() || "مقاوم لتغير اللون ومضاد للحساسية.",
      createdAt: new Date().toISOString()
    };

    try {
      let createdId = Date.now().toString();
      if (window.db) {
        try {
          const newRef = window.db.ref("products").push();
          await newRef.set(productPayload);
          createdId = newRef.key;
        } catch (e) {
          console.warn("Database add failed, adding locally:", e);
        }
      }

      const updatedList = [{ id: createdId, ...productPayload }, ...products];
      setProducts(updatedList);
      localStorage.setItem("store_products", JSON.stringify(updatedList));
      showToast("تمت إضافة المنتج بنجاح");

      setNewProduct({
        name: "",
        category: "necklaces",
        price: "",
        oldPrice: "",
        stock: 10,
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
      if (window.db) {
        try {
          await window.db.ref("products/" + id).remove();
        } catch (e) {
          console.warn("Database delete notice:", e);
        }
      }
      const updatedList = products.filter(p => p.id !== id);
      setProducts(updatedList);
      localStorage.setItem("store_products", JSON.stringify(updatedList));
      setCart(prev => prev.filter(item => item.id !== id));
      setWishlist(prev => prev.filter(pId => pId !== id));
      showToast("تم حذف المنتج بنجاح");
    } catch (err) {
      console.error(err);
      showToast("تعذر حذف المنتج", "error");
    }
  };

  // Quick In-Place Price Update
  const updateProductPrice = async (id, newPrice, newOldPrice = null) => {
    const numPrice = Number(newPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      showToast("يرجى إدخال سعر صحيح أكبر من الصفر", "error");
      return false;
    }

    const updated = products.map(p => {
      if (p.id === id) {
        const item = { ...p, price: numPrice };
        if (newOldPrice !== null && newOldPrice !== undefined && newOldPrice !== "") {
          item.oldPrice = Number(newOldPrice);
        }
        return item;
      }
      return p;
    });

    setProducts(updated);
    localStorage.setItem("store_products", JSON.stringify(updated));

    // Update in cart if active
    setCart(prev => prev.map(item => item.id === id ? { ...item, price: numPrice } : item));

    if (window.db) {
      try {
        const payload = { price: numPrice };
        if (newOldPrice !== null && newOldPrice !== undefined && newOldPrice !== "") {
          payload.oldPrice = Number(newOldPrice);
        }
        await window.db.ref("products/" + id).update(payload);
      } catch (e) {
        console.warn("Database price update notice:", e);
      }
    }

    showToast("تم حفظ السعر الجديد بنجاح!");
    return true;
  };

  // Full Product Update
  const updateProduct = async (id, updatedFields) => {
    if (!updatedFields.name || !updatedFields.price) {
      showToast("يرجى إدخال اسم المنتج والسعر", "error");
      return false;
    }

    const numPrice = Number(updatedFields.price);
    const numOldPrice = updatedFields.oldPrice ? Number(updatedFields.oldPrice) : null;
    const catObj = (window.CATEGORIES || []).find(c => c.id === updatedFields.category);

    const updated = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updatedFields,
          price: numPrice,
          oldPrice: numOldPrice,
          categoryName: catObj ? catObj.name : p.categoryName
        };
      }
      return p;
    });

    setProducts(updated);
    localStorage.setItem("store_products", JSON.stringify(updated));

    // Update cart
    setCart(prev => prev.map(item => item.id === id ? { ...item, name: updatedFields.name, price: numPrice } : item));

    if (window.db) {
      try {
        const payload = {
          ...updatedFields,
          price: numPrice,
          oldPrice: numOldPrice
        };
        if (catObj) payload.categoryName = catObj.name;
        await window.db.ref("products/" + id).update(payload);
      } catch (e) {
        console.warn("Database product update:", e);
      }
    }

    showToast("تم تحديث بيانات المنتج بنجاح!");
    return true;
  };

  // Reorder Products (Move Up / Down)
  const reorderProducts = (reordered) => {
    setProducts(reordered);
    localStorage.setItem("store_products", JSON.stringify(reordered));
    showToast("تم تحديث ترتيب المنتجات بنجاح");
  };

  // Reset to Initial Products
  const resetDefaultProducts = () => {
    if (!confirm("هل ترغبين في استعادة التشكيلة والأسعار الأصلية؟")) return;
    if (window.INITIAL_PRODUCTS && window.INITIAL_PRODUCTS.length > 0) {
      setProducts(window.INITIAL_PRODUCTS);
      localStorage.setItem("store_products", JSON.stringify(window.INITIAL_PRODUCTS));
      showToast("تم استعادة التشكيلة والأسعار الأصلية");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (window.db && orderId) {
        await window.db.ref("orders/" + orderId).update({ status: newStatus });
        // Keep the public tracking copy in sync so customers see the new status.
        const order = orders.find(o => o.id === orderId);
        if (order && order.orderNumber) {
          window.db.ref("order_tracking/" + order.orderNumber).update({ status: newStatus }).catch(() => {});
        }
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
      if (window.db) {
        // Realtime Database update() rejects undefined values, so strip them.
        const clean = {};
        Object.keys(updated).forEach(k => { if (updated[k] !== undefined) clean[k] = updated[k]; });
        await window.db.ref("settings/store").update(clean);
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

  // Admin Password Authentication & Firebase Sync
  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated) {
      setAdminTab("products");
      setIsAdminOpen(true);
    } else {
      setPasswordError("");
      setIsPasswordModalOpen(true);
    }
  };

  // Admin login through Firebase Authentication. The form asks for the
  // password only; the email is a fixed admin address (not a secret).
  const handleAdminLogin = async (password) => {
    const pwd = (password || "").trim();
    if (!pwd) {
      setPasswordError("اكتب كلمة المرور");
      return;
    }
    if (!window.auth) {
      setPasswordError("خدمة الدخول غير متاحة حالياً، حاول بعد قليل");
      return;
    }
    try {
      await window.auth.signInWithEmailAndPassword(window.ADMIN_EMAIL, pwd);
      setIsPasswordModalOpen(false);
      setAdminTab("products");
      setIsAdminOpen(true);
      setPasswordError("");
      showToast("مرحباً بك في لوحة الإدارة");
    } catch (err) {
      if (err && err.code === "auth/too-many-requests") {
        setPasswordError("محاولات كثيرة — انتظر دقيقة وحاول تاني");
      } else {
        setPasswordError("كلمة المرور غير صحيحة، أو حساب الأدمن لسه متعملش — تأكد من Firebase Console");
      }
    }
  };

  const handleAdminLogout = async () => {
    try { if (window.auth) await window.auth.signOut(); } catch (e) {}
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    setOrders([]);
    setIsAdminOpen(false);
    showToast("تم قفل لوحة الإدارة وتسجيل الخروج");
  };

  // Change the Firebase Auth admin password (the account itself).
  const handleUpdateAdminPassword = async (newPassword) => {
    const trimmed = (newPassword || "").trim();
    if (!trimmed || trimmed.length < 6) {
      showToast("كلمة المرور يجب ألا تقل عن 6 خانات", "error");
      return false;
    }
    const user = (window.auth && window.auth.currentUser) || adminUser;
    if (!user) {
      showToast("سجّل الدخول أولاً", "error");
      return false;
    }
    try {
      await user.updatePassword(trimmed);
      showToast("تم تغيير كلمة مرور الأدمن بنجاح");
      return true;
    } catch (err) {
      if (err && err.code === "auth/requires-recent-login") {
        showToast("لأمانك سجّل الدخول من جديد ثم غيّر كلمة المرور", "error");
      } else {
        console.warn("Update password error:", err);
        showToast("تعذر تغيير كلمة المرور", "error");
      }
      return false;
    }
  };

  // ==============================================================
  // PROMO CODES
  // ==============================================================

  const applyPromoCode = () => {
    const code = (promoInput || "").trim().toUpperCase();
    if (!code) {
      setPromoError("اكتبي كود الخصم أولاً");
      return;
    }
    const found = (coupons || []).find(c => c.active !== false && (c.code || "").toUpperCase() === code);
    if (!found) {
      setPromoError("الكود غير صحيح أو غير مفعّل");
      setAppliedCoupon(null);
      return;
    }
    if (found.minSubtotal && subtotal < Number(found.minSubtotal)) {
      setPromoError(`هذا الكود يحتاج طلباً بقيمة ${found.minSubtotal} ج.م على الأقل`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    setPromoError("");
    showToast(`تم تطبيق كود الخصم ${found.code}`);
  };

  const removePromoCode = () => {
    setAppliedCoupon(null);
    setPromoInput("");
    setPromoError("");
  };

  const addCoupon = async (coupon) => {
    const code = (coupon.code || "").trim().toUpperCase();
    const value = Number(coupon.value);
    if (!code || !value || value <= 0) {
      showToast("اكتبي كوداً وقيمة صحيحة للخصم", "error");
      return false;
    }
    if (coupon.type === "percent" && value > 90) {
      showToast("نسبة الخصم لا تزيد عن 90%", "error");
      return false;
    }
    const payload = {
      code,
      type: coupon.type === "fixed" ? "fixed" : "percent",
      value,
      minSubtotal: Number(coupon.minSubtotal) || 0,
      active: true,
      createdAt: new Date().toISOString()
    };
    try {
      if (window.db) {
        const newRef = window.db.ref("coupons").push();
        await newRef.set(payload);
        setCoupons(prev => [...prev, { id: newRef.key, ...payload }]);
      } else {
        setCoupons(prev => [...prev, { id: Date.now().toString(), ...payload }]);
      }
      showToast("تمت إضافة الكوبون بنجاح");
      return true;
    } catch (err) {
      showToast("تعذر حفظ الكوبون", "error");
      return false;
    }
  };

  const deleteCoupon = async (id) => {
    const isLocalOnly = String(id).startsWith("default-");
    try {
      if (window.db && !isLocalOnly) await window.db.ref("coupons/" + id).remove();
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast("تم حذف الكوبون");
    } catch (err) {
      showToast("تعذر حذف الكوبون", "error");
    }
  };

  const toggleCoupon = async (id, active) => {
    const isLocalOnly = String(id).startsWith("default-");
    try {
      if (window.db && !isLocalOnly) await window.db.ref("coupons/" + id).update({ active });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, active } : c));
    } catch (err) {
      showToast("تعذر تحديث الكوبون", "error");
    }
  };

  // ==============================================================
  // PRODUCT REVIEWS
  // ==============================================================

  const addReview = async (productId, review) => {
    const name = (review.name || "").trim();
    const comment = (review.comment || "").trim();
    const rating = Number(review.rating) || 0;
    if (!name || !comment || rating < 1 || rating > 5) {
      showToast("اكتبي اسمكِ وتقييمكِ وتعليقكِ", "error");
      return false;
    }
    const payload = { productId, name, comment, rating, createdAt: new Date().toISOString() };
    try {
      if (window.db) {
        const newRef = window.db.ref("reviews").push();
        await newRef.set(payload);
        setReviews(prev => [{ id: newRef.key, ...payload }, ...prev]);
      } else {
        setReviews(prev => [{ id: Date.now().toString(), ...payload }, ...prev]);
      }
      showToast("شكراً! تم نشر تقييمكِ");
      return true;
    } catch (err) {
      showToast("تعذر حفظ التقييم، حاولي مرة أخرى", "error");
      return false;
    }
  };

  // ==============================================================
  // CALCULATIONS & CHECKOUT
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

  const shippingRates = window.SHIPPING_RATES || [];
  const selectedShipping = useMemo(() => {
    return shippingRates.find(s => s.city === customer.city) || shippingRates[0] || { city: "القاهرة والجيزة", cost: 45 };
  }, [customer.city, shippingRates]);

  const shippingCost = useMemo(() => {
    if (subtotal >= storeSettings.freeShippingThreshold || subtotal === 0) return 0;
    return selectedShipping.cost;
  }, [subtotal, selectedShipping, storeSettings.freeShippingThreshold]);

  const giftWrapCost = includeGiftWrap ? 35 : 0;
  const promoDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const val = Number(appliedCoupon.value) || 0;
    if (appliedCoupon.type === "fixed") return Math.min(val, subtotal);
    return Math.round(subtotal * (val / 100));
  }, [appliedCoupon, subtotal]);
  const grandTotal = Math.max(0, subtotal + shippingCost + giftWrapCost - promoDiscount);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalSalesRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === "جديد" || !o.status).length;
  }, [orders]);

  // Products running low on stock (tracked stock of 3 or fewer)
  const lowStockProducts = useMemo(() => {
    return products.filter(p => typeof p.stock === "number" && p.stock >= 0 && p.stock <= 3);
  }, [products]);

  // Best sellers: top products by sold quantity across all orders
  // (computed from the public order_tracking nodes, not the admin orders)
  const bestSellers = useMemo(() => {
    const sold = {};
    trackingOrders.forEach(o => {
      (o.items || []).forEach(item => {
        sold[item.id] = (sold[item.id] || 0) + (item.quantity || 1);
      });
    });
    return Object.entries(sold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => products.find(p => p.id === id))
      .filter(Boolean);
  }, [trackingOrders, products]);

  // Average rating per product
  const ratingsByProduct = useMemo(() => {
    const map = {};
    reviews.forEach(r => {
      if (!r.productId) return;
      if (!map[r.productId]) map[r.productId] = { total: 0, count: 0 };
      map[r.productId].total += Number(r.rating) || 0;
      map[r.productId].count += 1;
    });
    Object.keys(map).forEach(id => {
      map[id].average = map[id].count ? map[id].total / map[id].count : 0;
    });
    return map;
  }, [reviews]);

  // Submit Order
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("السلة فارغة، أضيفي منتجاً أولاً", "error");
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      showToast("يرجى ملء الاسم والهاتف والعنوان بالتفصيل", "error");
      return;
    }

    const phoneDigits = customer.phone.replace(/[^0-9]/g, "");
    if (!/^01[0-9]{9}$/.test(phoneDigits)) {
      showToast("يرجى كتابة رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 01)", "error");
      return;
    }

    setIsSubmittingOrder(true);
    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);

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
      promoCode: appliedCoupon ? appliedCoupon.code : null,
      discount: promoDiscount,
      grandTotal,
      includeGiftWrap,
      giftNote: giftNote.trim(),
      status: "جديد",
      createdAt: new Date().toISOString()
    };

    try {
      if (window.db) {
        await window.db.ref("orders").push(orderData);
        // Public tracking copy: status + totals + items only, NO customer
        // data. The phone is stored only as a SHA-256 hash so customers
        // can still look up their order by phone.
        const phoneHash = await hashPhoneNumber(phoneDigits);
        window.db.ref("order_tracking/" + orderNumber).set({
          orderNumber,
          phoneHash,
          status: "جديد",
          items: cart.map(item => ({ id: item.id || "", name: item.name || "", quantity: item.quantity || 1, price: item.price || 0 })),
          subtotal,
          shippingCost,
          promoCode: appliedCoupon ? appliedCoupon.code : null,
          discount: promoDiscount,
          grandTotal,
          createdAt: new Date().toISOString()
        }).catch(() => {});
        // Decrease stock for ordered items (only products with a numeric stock)
        const ServerValue = (typeof firebase !== "undefined" && firebase.database) ? firebase.database.ServerValue : null;
        if (ServerValue) {
          cart.forEach(item => {
            const prod = products.find(p => p.id === item.id);
            if (prod && typeof prod.stock === "number") {
              window.db.ref("products/" + item.id + "/stock").set(ServerValue.increment(-item.quantity)).catch(() => {});
            }
          });
          setProducts(prev => prev.map(p => {
            const item = cart.find(i => i.id === p.id);
            if (item && typeof p.stock === "number") {
              return { ...p, stock: Math.max(0, p.stock - item.quantity) };
            }
            return p;
          }));
        }
      }
    } catch (err) {
      console.warn("Order save notice:", err);
    }

    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    setCheckoutSuccess({
      orderNumber,
      total: grandTotal,
      name: customer.name,
      phone: customer.phone,
      itemsCount: totalCartItems,
      tiktokUrl: storeSettings.tiktokUrl
    });

    setCart([]);
    setAppliedCoupon(null);
    setPromoInput("");
    setPromoError("");
    setIsCheckoutModalOpen(false);
    setIsSubmittingOrder(false);
    showToast("تم تأكيد طلبكِ بنجاح!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-800">
      
      {/* Toast Alert */}
      <Toast toast={toast} />

      {/* Main Header & Announcement Bar */}
      <Header
        storeSettings={storeSettings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        wishlistCount={wishlist.length}
        totalCartItems={totalCartItems}
        setIsWishlistOpen={setIsWishlistOpen}
        setIsCartOpen={setIsCartOpen}
        onOpenTrack={() => setIsTrackOpen(true)}
      />

      {/* Hero Showcase Section */}
      <Hero storeSettings={storeSettings} />

      {/* Best Sellers (computed from real orders) */}
      {bestSellers.length > 0 && (
        <section className="py-10 bg-white border-b border-stone-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center gap-2 mb-5">
              <i className="fa-solid fa-fire text-amber-500"></i>
              <h2 className="text-xl font-bold text-stone-900">الأكثر مبيعاً</h2>
              <span className="text-xs text-stone-500">اختيارات عملائنا المفضلة</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {bestSellers.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rating={ratingsByProduct[product.id]}
                  isFavorite={wishlist.includes(product.id)}
                  onToggleWishlist={toggleWishlist}
                  onQuickView={(prod) => {
                    setQuickViewProduct(prod);
                    setQuickViewColor((prod.colors && prod.colors[0]) || "");
                  }}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Catalog & FAQs */}
      <ProductGrid
        products={products}
        filteredProducts={filteredProducts}
        isLoadingProducts={isLoadingProducts}
        categories={window.CATEGORIES || []}
        ratingsByProduct={ratingsByProduct}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onResetFilters={() => { setSelectedCategory("all"); setSearchQuery(""); }}
        wishlist={wishlist}
        onToggleWishlist={toggleWishlist}
        onQuickView={(prod) => {
          setQuickViewProduct(prod);
          setQuickViewColor((prod.colors && prod.colors[0]) || "");
        }}
        onAddToCart={addToCart}
      />

      {/* Footer */}
      <Footer
        storeSettings={storeSettings}
        onOpenAdmin={handleOpenAdminTrigger}
        onOpenPolicy={(tab) => setPolicyModal(tab)}
      />

      {/* Legal & Privacy Policy Modal */}
      <PolicyModal
        activeTab={policyModal}
        onClose={() => setPolicyModal(null)}
        onSelectTab={(tab) => setPolicyModal(tab)}
      />

      {/* Floating Action Buttons */}
      <FloatingActions
        storeSettings={storeSettings}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        totalCartItems={totalCartItems}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        includeGiftWrap={includeGiftWrap}
        setIncludeGiftWrap={setIncludeGiftWrap}
        subtotal={subtotal}
        grandTotal={grandTotal}
        promoDiscount={promoDiscount}
        onProceedCheckout={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isWishlistOpen={isWishlistOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        wishlist={wishlist}
        products={products}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        quickViewProduct={quickViewProduct}
        setQuickViewProduct={setQuickViewProduct}
        quickViewColor={quickViewColor}
        setQuickViewColor={setQuickViewColor}
        onAddToCart={addToCart}
        reviews={quickViewProduct ? reviews.filter(r => r.productId === quickViewProduct.id) : []}
        rating={quickViewProduct ? ratingsByProduct[quickViewProduct.id] : undefined}
        onAddReview={addReview}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isCheckoutModalOpen={isCheckoutModalOpen}
        setIsCheckoutModalOpen={setIsCheckoutModalOpen}
        customer={customer}
        setCustomer={setCustomer}
        shippingRates={window.SHIPPING_RATES || []}
        selectedShipping={selectedShipping}
        shippingCost={shippingCost}
        grandTotal={grandTotal}
        promoInput={promoInput}
        setPromoInput={setPromoInput}
        appliedCoupon={appliedCoupon}
        promoError={promoError}
        promoDiscount={promoDiscount}
        onApplyPromo={applyPromoCode}
        onRemovePromo={removePromoCode}
        isSubmittingOrder={isSubmittingOrder}
        handleCheckoutSubmit={handleCheckoutSubmit}
      />

      {/* Checkout Success Modal */}
      <OrderSuccessModal
        checkoutSuccess={checkoutSuccess}
        setCheckoutSuccess={setCheckoutSuccess}
      />

      {/* Order Tracking Modal */}
      <TrackOrderModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        orders={trackingOrders}
      />

      {/* Admin Password Authentication Modal */}
      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => { setIsPasswordModalOpen(false); setPasswordError(""); }}
        onSubmit={handleAdminLogin}
        error={passwordError}
        setError={setPasswordError}
      />

      {/* Store Admin Dashboard Modal */}
      <AdminModal
        isAdminOpen={isAdminOpen}
        setIsAdminOpen={setIsAdminOpen}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        products={products}
        orders={orders}
        pendingOrdersCount={pendingOrdersCount}
        totalSalesRevenue={totalSalesRevenue}
        deleteProduct={deleteProduct}
        updateOrderStatus={updateOrderStatus}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        isSavingProduct={isSavingProduct}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        fileInputRef={fileInputRef}
        handleImageFile={handleImageFile}
        categories={window.CATEGORIES || []}
        dbStatus={dbStatus}
        tempSettings={tempSettings}
        setTempSettings={setTempSettings}
        handleSaveSettings={handleSaveSettings}
        isSavingSettings={isSavingSettings}
        updateProductPrice={updateProductPrice}
        updateProduct={updateProduct}
        reorderProducts={reorderProducts}
        resetDefaultProducts={resetDefaultProducts}
        onUpdateAdminPassword={handleUpdateAdminPassword}
        onLogout={handleAdminLogout}
        coupons={coupons}
        lowStockProducts={lowStockProducts}
        onAddCoupon={addCoupon}
        onDeleteCoupon={deleteCoupon}
        onToggleCoupon={toggleCoupon}
      />

    </div>
  );
}

// Mount App to DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
