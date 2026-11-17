// Main App Coordinator Component
// Chic Shop Galena's - Women's Accessories Store

const { useState, useEffect, useMemo, useRef } = React;

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
    if (!window.db) {
      setIsLoadingProducts(false);
      setDbStatus("error");
      return;
    }

    const unsubscribe = window.db.collection("products").onSnapshot(
      (snapshot) => {
        const fetched = [];
        snapshot.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
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
      },
      (error) => {
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
    if (!window.db) return;

    const unsubscribe = window.db.collection("settings").doc("store").onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          const cleanName = "Chic Shop Galena's";
          const tiktok = (data.tiktokUrl && data.tiktokUrl.trim()) ? data.tiktokUrl : storeDefaults.tiktokUrl;
          setStoreSettings(prev => ({ ...prev, ...data, storeName: cleanName, tiktokUrl: tiktok }));
          setTempSettings(prev => ({ ...prev, ...data, storeName: cleanName, tiktokUrl: tiktok }));
        }
      },
      () => {}
    );

    return () => unsubscribe();
  }, []);

  // 3. Orders Listener
  useEffect(() => {
    if (!window.db) return;

    const unsubscribe = window.db.collection("orders")
      .orderBy("createdAt", "desc")
      .limit(60)
      .onSnapshot(
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setOrders(list);
        },
        () => {
          window.db.collection("orders").limit(60).get().then(snap => {
            const list = [];
            snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setOrders(list);
          }).catch(() => {});
        }
      );

    return () => unsubscribe();
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
      colors: parsedColors.length > 0 ? parsedColors : ["ذهبي"],
      images: [
        newProduct.imageData || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
      ],
      description: newProduct.description.trim() || "قطعة إكسسوار أنيقة بتصميم عصري راقي.",
      material: newProduct.material.trim() || "مقاوم لتغير اللون ومضاد للحساسية.",
      createdAt: new Date().toISOString()
    };

    try {
      let createdId = Date.now().toString();
      if (window.db) {
        try {
          const docRef = await window.db.collection("products").add(productPayload);
          createdId = docRef.id;
        } catch (e) {
          console.warn("Firestore add failed, adding locally:", e);
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
          await window.db.collection("products").doc(id).delete();
        } catch (e) {
          console.warn("Firestore delete notice:", e);
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
        await window.db.collection("products").doc(id).set(payload, { merge: true });
      } catch (e) {
        console.warn("Firestore price update notice:", e);
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
        await window.db.collection("products").doc(id).set({
          ...updatedFields,
          price: numPrice,
          oldPrice: numOldPrice,
          categoryName: catObj ? catObj.name : undefined
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore product update:", e);
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
    if (!confirm("هل ترغبين في استعادة التشكيلة والأسعار الأصلية الـ 6؟")) return;
    if (window.INITIAL_PRODUCTS && window.INITIAL_PRODUCTS.length > 0) {
      setProducts(window.INITIAL_PRODUCTS);
      localStorage.setItem("store_products", JSON.stringify(window.INITIAL_PRODUCTS));
      showToast("تم استعادة التشكيلة والأسعار الأصلية");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (window.db && orderId) {
        await window.db.collection("orders").doc(orderId).update({ status: newStatus });
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
        await window.db.collection("settings").doc("store").set(updated, { merge: true });
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
  const grandTotal = Math.max(0, subtotal + shippingCost + giftWrapCost);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalSalesRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === "جديد" || !o.status).length;
  }, [orders]);

  // Submit Order
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      showToast("يرجى ملء الاسم والهاتف والعنوان بالتفصيل", "error");
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
      grandTotal,
      includeGiftWrap,
      giftNote: giftNote.trim(),
      status: "جديد",
      createdAt: new Date().toISOString()
    };

    try {
      if (window.db) {
        await window.db.collection("orders").add(orderData);
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
      />

      {/* Hero Showcase Section */}
      <Hero storeSettings={storeSettings} />

      {/* Product Catalog & FAQs */}
      <ProductGrid
        products={products}
        filteredProducts={filteredProducts}
        isLoadingProducts={isLoadingProducts}
        categories={window.CATEGORIES || []}
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
        onOpenAdmin={() => { setAdminTab("products"); setIsAdminOpen(true); }}
        onOpenPolicy={(tab) => setPolicyModal(tab)}
      />

      {/* Legal & Privacy Policy Modal */}
      <PolicyModal
        activeTab={policyModal}
        onClose={() => setPolicyModal(null)}
        onSelectTab={(tab) => setPolicyModal(tab)}
      />

      {/* Floating Action Buttons & Discreet Control Trigger */}
      <FloatingActions
        storeSettings={storeSettings}
        onOpenAdmin={() => setIsAdminOpen(true)}
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
        isSubmittingOrder={isSubmittingOrder}
        handleCheckoutSubmit={handleCheckoutSubmit}
      />

      {/* Checkout Success Modal */}
      <OrderSuccessModal
        checkoutSuccess={checkoutSuccess}
        setCheckoutSuccess={setCheckoutSuccess}
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
      />

    </div>
  );
}

// Mount App to DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
