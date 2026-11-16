// Checkout Form & Delivery Address Modal Component
// Chic Shop Galena's

function CheckoutModal({
  isCheckoutModalOpen,
  setIsCheckoutModalOpen,
  customer,
  setCustomer,
  shippingRates,
  selectedShipping,
  shippingCost,
  grandTotal,
  isSubmittingOrder,
  handleCheckoutSubmit
}) {
  if (!isCheckoutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        onClick={() => setIsCheckoutModalOpen(false)} 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10 text-xs animate-fade-in">
        <button 
          onClick={() => setIsCheckoutModalOpen(false)} 
          className="absolute top-4 left-4 text-stone-400 hover:text-stone-800 p-1"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        <h3 className="text-base font-bold text-stone-900 mb-1 text-center">بيانات استلام الطلب</h3>
        <p className="text-stone-500 text-[11px] text-center mb-4">يرجى كتابة العنوان بدقة لتسليم الشحنة في الموعد</p>

        <form onSubmit={handleCheckoutSubmit} className="space-y-3">
          <div>
            <label className="block font-bold text-stone-700 mb-1">الاسم بالكامل *</label>
            <input
              type="text"
              required
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
              placeholder="اكتبي اسمكِ ثلاثي"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                required
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">هاتف بديل (اختياري)</label>
              <input
                type="tel"
                value={customer.altPhone}
                onChange={(e) => setCustomer({ ...customer, altPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
                placeholder="رقم آخر للتأكيد"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">المحافظة *</label>
            <select
              value={customer.city}
              onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-800"
            >
              {shippingRates.map(rate => (
                <option key={rate.city} value={rate.city}>
                  {rate.city} — {rate.cost} ج.م ({rate.time})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">العنوان بالتفصيل *</label>
            <textarea
              rows="2"
              required
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="الشارع، رقم العمارة، رقم الشقة أو علامة مميزة"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-800"
            ></textarea>
          </div>

          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <div className="flex justify-between text-stone-600 mb-1">
              <span>الشحن ({selectedShipping.city}):</span>
              <span>{shippingCost === 0 ? 'مجاناً' : `${shippingCost} ج.م`}</span>
            </div>
            <div className="flex justify-between text-stone-900 font-bold text-sm">
              <span>المبلغ للدفع عند الاستلام:</span>
              <span>{grandTotal} ج.م</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingOrder}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow flex items-center justify-center gap-2 transition"
          >
            <i className="fa-brands fa-whatsapp text-sm"></i>
            <span>{isSubmittingOrder ? "جارٍ الإرسال..." : "تأكيد الطلب عبر واتساب"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

window.CheckoutModal = CheckoutModal;
