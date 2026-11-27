// Order Tracking Modal Component
// Chic Shop Galena's — look up an order by order number or phone

function TrackOrderModal({ isOpen, onClose, orders }) {
  const [query, setQuery] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [searched, setSearched] = React.useState(false);

  if (!isOpen) return null;

  const normalizePhone = (v) =>
    (v || "").replace(/[^0-9]/g, "").replace(/^002/, "").replace(/^2(?=01)/, "");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;
    const qPhone = normalizePhone(q);
    const found = (orders || []).find(o =>
      (o.orderNumber && o.orderNumber.toUpperCase() === q.toUpperCase()) ||
      (o.customer && o.customer.phone && qPhone.length >= 9 && normalizePhone(o.customer.phone) === qPhone)
    );
    setResult(found || null);
    setSearched(true);
  };

  const close = () => {
    setQuery("");
    setResult(null);
    setSearched(false);
    onClose();
  };

  const statusStyle = (status) => {
    if (status === "تم التوصيل") return "bg-emerald-100 text-emerald-800";
    if (status === "ملغي") return "bg-rose-100 text-rose-700";
    if (status === "قيد التجهيز" || status === "تم الشحن") return "bg-sky-100 text-sky-800";
    return "bg-amber-100 text-amber-800";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={close}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10 text-xs animate-fade-in">
        <button
          onClick={close}
          className="absolute top-4 left-4 text-stone-400 hover:text-stone-800 p-1"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        <h3 className="text-base font-bold text-stone-900 mb-1 text-center">تتبع طلبك</h3>
        <p className="text-stone-500 text-[11px] text-center mb-4">
          اكتبي رقم الطلب (مثال: ORD-123456) أو رقم الهاتف المسجل به الطلب
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="رقم الطلب أو رقم الهاتف"
            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
          />
          <button
            type="submit"
            className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-bold"
          >
            بحث
          </button>
        </form>

        {searched && !result && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center text-rose-700 font-bold">
            لم نعثر على طلب بهذا الرقم أو الهاتف، تأكدي من البيانات وحاولي مرة أخرى
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div>
                <span className="text-stone-500 block">رقم الطلب</span>
                <span className="font-mono font-bold text-stone-900">{result.orderNumber}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${statusStyle(result.status)}`}>
                {result.status || "جديد"}
              </span>
            </div>

            {result.createdAt && (
              <p className="text-stone-500">
                تاريخ الطلب: {new Date(result.createdAt).toLocaleDateString("ar-EG")}
              </p>
            )}

            <div className="border border-stone-200 rounded-xl divide-y divide-stone-100">
              {(result.items || []).map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="p-2.5 flex justify-between gap-2">
                  <span className="font-bold text-stone-800">{item.name} × {item.quantity}</span>
                  <span className="text-stone-600">{item.price * item.quantity} ج.م</span>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>المجموع:</span>
                <span>{result.subtotal} ج.م</span>
              </div>
              {result.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>خصم الكود ({result.promoCode}):</span>
                  <span>-{result.discount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>الشحن:</span>
                <span>{result.shippingCost === 0 ? "مجاناً" : `${result.shippingCost} ج.م`}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-sm pt-1 border-t border-stone-200">
                <span>الإجمالي:</span>
                <span>{result.grandTotal} ج.م</span>
              </div>
            </div>

            <p className="text-stone-500 text-center">
              للاستفسار عن طلبكِ تواصلي معنا عبر تيك توك
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

window.TrackOrderModal = TrackOrderModal;
