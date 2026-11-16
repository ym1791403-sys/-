// Wishlist Drawer Slide-over Component
// Chic Shop Galena's

function WishlistDrawer({
  isWishlistOpen,
  setIsWishlistOpen,
  wishlist,
  products,
  onAddToCart,
  onToggleWishlist
}) {
  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={() => setIsWishlistOpen(false)} 
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
      ></div>
      
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-heart text-rose-500"></i>
              <h3 className="font-bold text-stone-900 text-sm">قائمة المفضلة</h3>
              <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {wishlist.length}
              </span>
            </div>
            <button 
              onClick={() => setIsWishlistOpen(false)} 
              className="text-stone-500 hover:text-stone-900 p-1 transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Items List */}
          <div className="p-4 flex-1 overflow-y-auto divide-y divide-stone-100">
            {wishlist.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-xs">
                <i className="fa-regular fa-heart text-3xl mb-2 text-stone-300"></i>
                <p className="font-bold text-stone-700">المفضلة فارغة حالياً</p>
                <p className="text-stone-400 text-[11px] mt-1">اضغطي على علامة القلب في أي منتج لإضافته هنا</p>
              </div>
            ) : (
              wishlist.map(favId => {
                const prod = products.find(p => p.id === favId);
                if (!prod) return null;
                return (
                  <div key={prod.id} className="py-2.5 flex gap-2.5 items-center">
                    <img 
                      src={(prod.images && prod.images[0]) || ""} 
                      alt={prod.name} 
                      className="w-12 h-12 rounded-lg object-cover border" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-xs truncate">{prod.name}</h4>
                      <span className="text-xs font-bold text-stone-900 block">{prod.price} ج.م</span>
                      <button
                        onClick={() => { 
                          onAddToCart(prod); 
                          onToggleWishlist(prod.id); 
                        }}
                        className="mt-1 text-[11px] text-stone-900 font-bold underline hover:text-amber-600 transition"
                      >
                        نقل إلى السلة
                      </button>
                    </div>
                    <button 
                      onClick={() => onToggleWishlist(prod.id)} 
                      className="text-stone-400 hover:text-rose-600 p-1 transition"
                      title="حذف من المفضلة"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-stone-200 bg-stone-50">
            <button 
              onClick={() => setIsWishlistOpen(false)} 
              className="w-full bg-stone-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-stone-800 transition"
            >
              إغلاق
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

window.WishlistDrawer = WishlistDrawer;
