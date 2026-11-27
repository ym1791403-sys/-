// Quick View Product Details Modal Component
// Chic Shop Galena's

function QuickViewModal({
  quickViewProduct,
  setQuickViewProduct,
  quickViewColor,
  setQuickViewColor,
  onAddToCart,
  reviews,
  rating,
  onAddReview
}) {
  const [reviewName, setReviewName] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewComment, setReviewComment] = React.useState("");

  React.useEffect(() => {
    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
  }, [quickViewProduct && quickViewProduct.id]);

  if (!quickViewProduct) return null;

  const displayImg = (quickViewProduct.images && quickViewProduct.images[0]) || 
    "images/products/product-1.jpg";

  const renderStars = (value) => {
    const full = Math.round(Number(value) || 0);
    return [1, 2, 3, 4, 5].map(n => (
      <i key={n} className={`fa-${n <= full ? "solid" : "regular"} fa-star`}></i>
    ));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!onAddReview) return;
    const ok = await onAddReview(quickViewProduct.id, { name: reviewName, rating: reviewRating, comment: reviewComment });
    if (ok) {
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
    }
  };

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

        {/* Customer Reviews */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <h4 className="font-bold text-stone-900 text-sm mb-2">تقييمات العملاء</h4>
          {rating && rating.count > 0 ? (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-amber-500">{renderStars(rating.average)}</span>
              <span className="text-stone-600">{rating.average.toFixed(1)} من 5 ({rating.count} تقييم)</span>
            </div>
          ) : (
            <p className="text-stone-500 mb-3">لا توجد تقييمات بعد — كوني أول من يقيّم هذه القطعة</p>
          )}

          {reviews && reviews.length > 0 && (
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">{r.name}</span>
                    <span className="text-amber-500 text-[11px]">{renderStars(r.rating)}</span>
                  </div>
                  <p className="text-stone-600 mt-0.5">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-2 bg-stone-50 border border-stone-200 rounded-xl p-3">
            <p className="font-bold text-stone-800">أضيفي تقييمكِ</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setReviewRating(n)}
                  className={`text-lg ${n <= reviewRating ? "text-amber-500" : "text-stone-300"}`}
                >
                  <i className="fa-solid fa-star"></i>
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="اسمكِ"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
            />
            <textarea
              rows="2"
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="رأيكِ في القطعة..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
            ></textarea>
            <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-lg text-xs">
              نشر التقييم
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

window.QuickViewModal = QuickViewModal;
