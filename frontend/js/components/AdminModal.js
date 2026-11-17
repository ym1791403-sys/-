// Store Admin Control Panel Modal Component
// Chic Shop Galena's

function AdminModal({
  isAdminOpen,
  setIsAdminOpen,
  adminTab,
  setAdminTab,
  products,
  orders,
  pendingOrdersCount,
  totalSalesRevenue,
  deleteProduct,
  updateOrderStatus,
  newProduct,
  setNewProduct,
  handleAddProduct,
  isSavingProduct,
  isDragging,
  setIsDragging,
  fileInputRef,
  handleImageFile,
  categories,
  dbStatus,
  tempSettings,
  setTempSettings,
  handleSaveSettings,
  isSavingSettings,
  updateProductPrice,
  updateProduct,
  reorderProducts,
  resetDefaultProducts
}) {
  if (!isAdminOpen) return null;

  const [editingProduct, setEditingProduct] = React.useState(null);
  const [quickPrices, setQuickPrices] = React.useState({});
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  const handleMove = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= products.length) return;
    const reordered = [...products];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    if (reorderProducts) reorderProducts(reordered);
  };

  const startFullEdit = (p) => {
    setEditingProduct({
      id: p.id,
      name: p.name || "",
      category: p.category || "necklaces",
      price: p.price || "",
      oldPrice: p.oldPrice || "",
      colors: Array.isArray(p.colors) ? p.colors.join(", ") : (p.colors || ""),
      description: p.description || "",
      material: p.material || "",
      images: p.images || [],
      inStock: p.inStock !== false
    });
  };

  const handleSaveFullEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) {
      alert("يرجى إدخال اسم المنتج والسعر");
      return;
    }
    setIsSavingEdit(true);
    const parsedColors = editingProduct.colors
      ? (typeof editingProduct.colors === "string"
          ? editingProduct.colors.split(",").map(c => c.trim()).filter(Boolean)
          : editingProduct.colors)
      : ["ذهبي"];

    const payload = {
      name: editingProduct.name.trim(),
      category: editingProduct.category,
      price: parseFloat(editingProduct.price),
      oldPrice: editingProduct.oldPrice ? parseFloat(editingProduct.oldPrice) : null,
      colors: parsedColors,
      description: editingProduct.description ? editingProduct.description.trim() : "",
      material: editingProduct.material ? editingProduct.material.trim() : "",
      images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [],
      inStock: editingProduct.inStock
    };

    if (updateProduct) {
      await updateProduct(editingProduct.id, payload);
    }
    setIsSavingEdit(false);
    setEditingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      <div 
        onClick={() => setIsAdminOpen(false)} 
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-7 z-10 text-xs max-h-[92vh] flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-sm shadow">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">لوحة إدارة المتجر</h3>
              <span className="text-[11px] text-stone-500">Chic Shop Galena's</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAdminOpen(false)} 
            className="text-stone-400 hover:text-stone-800 p-1 text-base transition"
          >
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
        <div className="flex gap-1.5 mb-4 border-b border-stone-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setAdminTab("products")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
              adminTab === "products" ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            المنتجات ({products.length})
          </button>
          <button
            onClick={() => setAdminTab("orders")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
              adminTab === "orders" ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            الطلبات الواردة ({orders.length})
          </button>
          <button
            onClick={() => setAdminTab("add")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
              adminTab === "add" ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            + إضافة منتج
          </button>
          <button
            onClick={() => setAdminTab("settings")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
              adminTab === "settings" ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            إعدادات المتجر
          </button>
        </div>

        {/* TAB CONTENT (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* 1. PRODUCTS TAB */}
          {adminTab === "products" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-stone-700 font-bold">قائمة المنتجات ({products.length})</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                    يمكنكِ تعديل أي سعر وترتيب مباشرة
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {resetDefaultProducts && (
                    <button
                      type="button"
                      onClick={resetDefaultProducts}
                      className="text-[10px] text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                      title="استعادة الأسعار والتشكيلة الافتراضية"
                    >
                      <i className="fa-solid fa-rotate-left"></i>
                      <span>استعادة الأصلية</span>
                    </button>
                  )}
                  <button
                    onClick={() => setAdminTab("add")}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    + إضافة منتج جديد
                  </button>
                </div>
              </div>

              {/* Full Edit Form Modal Box */}
              {editingProduct && (
                <div className="bg-amber-50/90 p-4 rounded-xl border-2 border-amber-400 space-y-3 mb-3 shadow-md animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-pen-to-square text-amber-800 text-sm"></i>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm">تعديل بيانات وسعر المنتج</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-stone-400 hover:text-stone-800 p-1 text-sm"
                      title="إغلاق"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <form onSubmit={handleSaveFullEdit} className="space-y-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">اسم المنتج *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-amber-600 bg-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">القسم *</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-amber-600"
                        >
                          {categories.filter(c => c.id !== "all").map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-amber-900 mb-1">السعر المطلوب (ج.م) *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-amber-500 focus:outline-none focus:border-amber-700 bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">السعر قبل الخصم (مشطوب)</label>
                        <input
                          type="number"
                          value={editingProduct.oldPrice || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value })}
                          placeholder="مثال: 320"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-amber-600 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">الألوان المتاحة</label>
                        <input
                          type="text"
                          value={editingProduct.colors || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, colors: e.target.value })}
                          placeholder="ذهبي, فضي"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-amber-600 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">وصف المنتج</label>
                      <textarea
                        rows="2"
                        value={editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-amber-600 bg-white"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="inStockEdit"
                        checked={editingProduct.inStock !== false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <label htmlFor="inStockEdit" className="font-bold text-stone-800 text-xs cursor-pointer">
                        المنتج متوفر بالمخزون حالياً
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingEdit}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition shadow"
                      >
                        <i className="fa-solid fa-check"></i>
                        <span>{isSavingEdit ? "جارٍ الحفظ..." : "حفظ التعديلات"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

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
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {products.map((p, idx) => {
                    const currentPriceVal = quickPrices[p.id] !== undefined ? quickPrices[p.id] : p.price;
                    const isPriceChanged = Number(currentPriceVal) !== Number(p.price);

                    return (
                      <div key={p.id} className="p-3 flex items-center justify-between gap-2.5 sm:gap-3 hover:bg-stone-50 transition flex-wrap sm:flex-nowrap">
                        
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5 self-center flex-shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, -1)}
                            className={`w-6 h-5 flex items-center justify-center rounded text-[10px] transition ${
                              idx === 0 ? "text-stone-300 cursor-not-allowed" : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                            }`}
                            title="تحريك لأعلى (تقديم الترتيب)"
                          >
                            <i className="fa-solid fa-chevron-up"></i>
                          </button>
                          <button
                            type="button"
                            disabled={idx === products.length - 1}
                            onClick={() => handleMove(idx, 1)}
                            className={`w-6 h-5 flex items-center justify-center rounded text-[10px] transition ${
                              idx === products.length - 1 ? "text-stone-300 cursor-not-allowed" : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                            }`}
                            title="تحريك لأسفل (تأخير الترتيب)"
                          >
                            <i className="fa-solid fa-chevron-down"></i>
                          </button>
                        </div>

                        {/* Product Image */}
                        <img 
                          src={(p.images && p.images[0]) || ""} 
                          alt={p.name} 
                          className="w-12 h-12 rounded-lg object-cover border shadow-sm flex-shrink-0" 
                        />

                        {/* Product Info */}
                        <div className="flex-1 min-w-[130px]">
                          <h5 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">{p.name}</h5>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                            <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded text-[10px]">{p.categoryName || p.category}</span>
                            {p.oldPrice && (
                              <span className="line-through text-stone-400 text-[10px]">{p.oldPrice} ج.م</span>
                            )}
                          </div>
                        </div>

                        {/* Quick Price Editor */}
                        <div className="flex items-center gap-1 bg-stone-100/80 border border-stone-200 p-1 rounded-lg flex-shrink-0">
                          <label className="text-[10px] text-stone-500 font-bold px-0.5">السعر:</label>
                          <input
                            type="number"
                            value={currentPriceVal}
                            onChange={(e) => setQuickPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (updateProductPrice) updateProductPrice(p.id, currentPriceVal);
                              }
                            }}
                            className={`w-16 px-1.5 py-1 text-center font-bold text-xs rounded border transition focus:outline-none ${
                              isPriceChanged ? "border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-400" : "border-stone-300 bg-white text-stone-900"
                            }`}
                            title="اكتبي السعر واضغطي حفظ"
                          />
                          <span className="text-[10px] text-stone-600 font-bold px-0.5">ج.م</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (updateProductPrice) updateProductPrice(p.id, currentPriceVal);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition shadow-sm ${
                              isPriceChanged ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse" : "bg-stone-900 hover:bg-stone-800 text-white"
                            }`}
                            title="حفظ السعر الجديد"
                          >
                            <i className="fa-solid fa-check text-[9px]"></i>
                            <span>حفظ</span>
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startFullEdit(p)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="تعديل كافة تفاصيل المنتج"
                          >
                            <i className="fa-solid fa-pen-to-square text-xs"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProduct(p.id)}
                            className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف المنتج"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>

                      </div>
                    );
                  })}
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'تم التوصيل' ? 'bg-emerald-100 text-emerald-800' : 
                            ord.status === 'تم الشحن' ? 'bg-blue-100 text-blue-800' : 
                            'bg-amber-100 text-amber-800'
                          }`}>
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
                          <button 
                            onClick={() => updateOrderStatus(ord.id, "تم الشحن")} 
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold border border-blue-200 transition"
                          >
                            شحن
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(ord.id, "تم التوصيل")} 
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200 transition"
                          >
                            تم التوصيل
                          </button>
                        </div>

                        {ord.customer?.phone && (
                          <a
                            href={`https://wa.me/${ord.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ/ة ${ord.customer?.name}، بخصوص طلبكِ رقم ${ord.orderNumber} من Chic Shop Galena's:`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition shadow"
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
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-800"
                  >
                    {categories.filter(c => c.id !== "all").map(c => (
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
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
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
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">الألوان المتاحة</label>
                  <input
                    type="text"
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                    placeholder="ذهبي, فضي"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
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
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">الخامة والطلاء (اختياري)</label>
                <input
                  type="text"
                  value={newProduct.material}
                  onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                  placeholder="مثال: ستانلس ستيل مطلي ذهب عيار 18"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-lg shadow transition"
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
                  رابط حساب تيك توك للتواصل (TikTok URL) *
                </label>
                <input
                  type="url"
                  value={tempSettings.tiktokUrl || ""}
                  onChange={(e) => setTempSettings({ ...tempSettings, tiktokUrl: e.target.value })}
                  placeholder="https://www.tiktok.com/@..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:border-stone-800"
                />
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  رابط حساب تيك توك الرسمي لمتجر Chic Shop Galena's
                </span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">رقم الهاتف المعروض في الفوتر</label>
                <input
                  type="text"
                  value={tempSettings.phoneDisplay}
                  onChange={(e) => setTempSettings({ ...tempSettings, phoneDisplay: e.target.value })}
                  placeholder="010 xxxx xxxx"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">الحد الأدنى للشحن المجاني (ج.م)</label>
                <input
                  type="number"
                  value={tempSettings.freeShippingThreshold}
                  onChange={(e) => setTempSettings({ ...tempSettings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-lg shadow transition"
                >
                  {isSavingSettings ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

window.AdminModal = AdminModal;
