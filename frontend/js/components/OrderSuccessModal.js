// Checkout Success Celebration Modal Component
// Chic Shop Galena's

function OrderSuccessModal({ checkoutSuccess, setCheckoutSuccess }) {
  if (!checkoutSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        onClick={() => setCheckoutSuccess(null)} 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 z-10 text-center text-xs animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">
          <i className="fa-solid fa-check"></i>
        </div>

        <h3 className="text-base font-bold text-stone-900 mb-1">تم تسجيل طلبكِ بنجاح</h3>
        <p className="text-stone-500 mb-3">
          رقم الطلب: <strong className="text-stone-900 font-mono">#{checkoutSuccess.orderNumber}</strong>
        </p>

        <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-right space-y-1 mb-3">
          <p>الاسم: <strong className="text-stone-800">{checkoutSuccess.name}</strong></p>
          <p>الهاتف: <strong className="text-stone-800">{checkoutSuccess.phone}</strong></p>
          <p className="font-bold text-stone-900 pt-1 border-t border-stone-200">
            الإجمالي عند الاستلام: <span className="text-emerald-700">{checkoutSuccess.total} ج.م</span>
          </p>
        </div>

        <p className="text-[11px] text-stone-500 mb-4">
          سيتم التواصل معكِ لتأكيد الشحن وموعد التسليم.
        </p>

        <div className="flex gap-2">
          {checkoutSuccess.tiktokUrl && (
            <a
              href={checkoutSuccess.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black text-white font-medium py-2 rounded-lg text-xs hover:bg-stone-850 transition flex items-center justify-center gap-1.5"
            >
              <i className="fa-brands fa-tiktok"></i>
              <span>تيك توك</span>
            </a>
          )}
          <button
            onClick={() => setCheckoutSuccess(null)}
            className="flex-1 bg-stone-900 text-white font-medium py-2 rounded-lg text-xs hover:bg-stone-800 transition"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    </div>
  );
}

window.OrderSuccessModal = OrderSuccessModal;
