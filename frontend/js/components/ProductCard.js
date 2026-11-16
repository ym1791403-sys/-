// Single Product Card Component
// Chic Shop Galena's

function ProductCard({
  product,
  isFavorite,
  onToggleWishlist,
  onQuickView,
  onAddToCart
}) {
  const displayImg = (product.images && product.images[0]) || 
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Image & Wishlist */}
        <div 
          className="relative h-44 sm:h-56 bg-stone-100 overflow-hidden cursor-pointer"
          onClick={() => onQuickView(product)}
        >
          <img
            src={displayImg}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              onToggleWishlist(product.id); 
            }}
            className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center transition ${
              isFavorite ? "text-rose-500" : "text-stone-400 hover:text-rose-500"
            }`}
            title={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart text-xs`}></i>
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <span className="text-[10px] text-stone-500 block mb-0.5">{product.categoryName}</span>
          <h4 
            onClick={() => onQuickView(product)}
            className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 hover:underline cursor-pointer"
          >
            {product.name}
          </h4>

          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {product.colors.map(col => (
                <span key={col} className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                  {col}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price and Add to Cart */}
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
          onClick={() => onAddToCart(product)}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <i className="fa-solid fa-cart-plus text-[11px]"></i>
          <span>إضافة للسلة</span>
        </button>
      </div>

    </div>
  );
}

window.ProductCard = ProductCard;
