// Admin Login Modal Component (Firebase Authentication)
// Chic Shop Galena's - Protected Control Panel

function AdminPasswordModal({
  isOpen,
  onClose,
  onSubmit,
  error,
  setError
}) {
  if (!isOpen) return null;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      if (setError) setError("");
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      if (setError) setError("اكتبي إيميل حساب الأدمن");
      return;
    }
    if (!password) {
      if (setError) setError("يرجى إدخال كلمة المرور");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 z-10 text-xs animate-fade-in border border-stone-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-stone-400 hover:text-stone-700 p-1 transition"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Lock Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-lg mx-auto mb-3 shadow-inner">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h3 className="text-base font-bold text-stone-900">دخول لوحة الإدارة</h3>
          <p className="text-[11px] text-stone-500 mt-1">
            سجّلي الدخول بحساب الأدمن (الإيميل وكلمة المرور من Firebase Authentication)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
              إيميل الأدمن
            </label>
            <input
              ref={inputRef}
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error && setError) setError("");
              }}
              placeholder="admin@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-xs bg-stone-50 font-medium text-right"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error && setError) setError("");
                }}
                placeholder="أدخلي كلمة المرور هنا..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-xs bg-stone-50 font-medium pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 text-xs"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {error && (
              <p className="text-rose-600 text-[11px] font-bold mt-1.5 flex items-center gap-1 animate-shake">
                <i className="fa-solid fa-circle-exclamation text-xs"></i>
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-xs"></i>
              <span>{isSubmitting ? "جارٍ التحقق..." : "دخول"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs transition"
            >
              إلغاء
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-100 text-center">
          <span className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <i className="fa-solid fa-shield-halved text-emerald-600"></i>
            <span>دخول آمن عبر Firebase Authentication</span>
          </span>
          <p className="text-[10px] text-stone-400 mt-1">
            لو لسه معملتيش حساب الأدمن، أنشئيه من Firebase Console ← Authentication ← Add user
          </p>
        </div>

      </div>
    </div>
  );
}

window.AdminPasswordModal = AdminPasswordModal;
