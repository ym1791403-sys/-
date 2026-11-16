// Cart Drawer Slide-over Component
// Chic Shop Galena's

function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  totalCartItems,
  cart,
  updateQuantity,
  removeFromCart,
  includeGiftWrap,
  setIncludeGiftWrap,
  subtotal,
  grandTotal,
  onProceedCheckout
}) {
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={() => setIsCartOpen(false)} 
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
      ></div>
      
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-bag-shopping text-stone-900"></i>
              <h3 className="font-bold text-stone-900 text-sm">سلة المشتريات</h3>
              <span className="bg-stone-200 text-stone-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {totalCartItems}
              </span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)} 
              className="text-stone-500 hover:text-stone-900 p-1 transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Items List */}
          <div className="p-4 flex-1 overflow-y-auto divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <i className="fa-solid fa-bag-shopping text-3xl mb-2 text-stone-300"></i>
                <p className="font-bold text-stone-700 text-xs">سلتكِ فارغة حالياً</p>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="mt-3 bg-stone-900 text-white text-xs px-4 py-1.5 rounded-full transition hover:bg-stone-800"
                >
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
                    <button 
                      onClick={() => updateQuantity(item.id, item.color, -1)} 
                      className="px-2 py-0.5 text-stone-600 hover:text-stone-900"
                    >-</button>
                    <span className="px-2 font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.color, 1)} 
                      className="px-2 py-0.5 text-stone-600 hover:text-stone-900"
                    >+</button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id, item.color)} 
                    className="text-stone-400 hover:text-rose-600 p-1 transition"
                  >
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
                  <span>الإجمالي (بدون مصاريف الشحن):</span>
                  <span>{grandTotal} ج.م</span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow flex items-center justify-center gap-2 transition"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>متابعة إتمام الطلب</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

window.CartDrawer = CartDrawer;
