// Product Catalog Grid & Customer FAQ Section
// Chic Shop Galena's

function ProductGrid({
  products,
  filteredProducts,
  isLoadingProducts,
  categories,
  selectedCategory,
  onSelectCategory,
  onResetFilters,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart
}) {
  return (
    <>
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

          {/* Category Filter Pills */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />

          {/* Loading or Empty States */}
          {isLoadingProducts ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
              <div className="w-10 h-10 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-stone-600 font-medium">جارٍ تحميل منتجات المتجر...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xl mx-auto mb-3">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">لا توجد منتجات معروضة حالياً</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                سيتم إضافة المنتجات قريباً، يمكنكِ متابعة المتجر أو التواصل معنا عبر تيك توك وواتساب.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <p className="text-xs text-stone-600 font-bold">لا توجد قطع مطابقة لهذا البحث أو القسم</p>
              <button
                onClick={onResetFilters}
                className="mt-2 text-xs text-stone-900 underline font-medium hover:text-amber-600 transition"
              >
                عرض كافة المنتجات
              </button>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Customer Information / FAQ Section */}
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
    </>
  );
}

window.ProductGrid = ProductGrid;
