// Quick View Product Details Modal Component
// Chic Shop Galena's

function QuickViewModal({
  quickViewProduct,
  setQuickViewProduct,
  quickViewColor,
  setQuickViewColor,
  onAddToCart
}) {
  if (!quickViewProduct) return null;

  const displayImg = (quickViewProduct.images && quickViewProduct.images[0]) || 
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        onClick={() => setQuickViewProduct(null)} 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-5 sm:p-6 z-10 text-xs animate-fade-in">
        <button 
          onClick={() => setQuickViewProduct(null)} 
          className="absolute top-4 left-4 text-stone-400 hover:text-stone-800 p-1"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="h-64 rounded-xl overflow-hidden bg-stone-100 border">
            <img
              src={displayImg}
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
                <span className="text-xs text-stone-400 line-through mr-2 font-normal">
                  {quickViewProduct.oldPrice} ج.م
                </span>
              )}
            </div>

            <p className="text-stone-600 leading-relaxed text-xs">{quickViewProduct.description}</p>

            {quickViewProduct.material && (
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span className="text-stone-500">الخامة: </span>
                <span className="font-bold text-stone-800">{quickViewProduct.material}</span>
              </div>
            )}

            {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
              <div>
                <span className="block font-bold text-stone-700 mb-1">اللون:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {quickViewProduct.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setQuickViewColor(col)}
                      className={`px-2.5 py-1 text-xs rounded border transition-all ${
                        quickViewColor === col 
                          ? "bg-stone-900 text-white border-stone-900 font-bold" 
                          : "bg-white text-stone-700 border-stone-300"
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
                onAddToCart(quickViewProduct, quickViewColor);
                setQuickViewProduct(null);
              }}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <i className="fa-solid fa-cart-plus text-xs"></i>
              <span>إضافة للسلة ({quickViewProduct.price} ج.م)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.QuickViewModal = QuickViewModal;
