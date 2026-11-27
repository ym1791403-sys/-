// Footer Component with Developer WhatsApp Direct Link & Legal Policy Links
// Chic Shop Galena's

function Footer({ storeSettings, onOpenAdmin, onOpenPolicy }) {
  const hasTiktok = Boolean(storeSettings.tiktokUrl && storeSettings.tiktokUrl.trim());

  return (
    <footer className="bg-stone-900 text-stone-400 pt-8 pb-6 text-xs border-t border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Top Row: Store Info & Social */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-800 text-center sm:text-right">
          <div>
            <button
              onClick={() => onOpenAdmin && onOpenAdmin()}
              className="font-playfair text-lg font-bold text-white block cursor-pointer hover:text-amber-300 transition"
              title="لوحة التحكم"
            >
              Chic Shop Galena's
            </button>
            <p className="text-stone-400 text-xs mt-0.5">متجر إلكتروني متخصص في الإكسسوارات النسائية المطلية والمجوهرات العصرية.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {hasTiktok && (
              <a 
                href={storeSettings.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-white flex items-center gap-1.5 transition text-xs bg-stone-800 hover:bg-stone-750 px-3.5 py-1.5 rounded-full border border-stone-700"
                title="حساب تيك توك"
              >
                <i className="fa-brands fa-tiktok text-white text-sm"></i>
                <span>تيك توك</span>
              </a>
            )}
          </div>
        </div>

        {/* Middle Row: Legal & Policy Links */}
        <div className="py-4 border-b border-stone-800 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-400">
          <button 
            onClick={() => onOpenPolicy && onOpenPolicy('privacy')} 
            className="hover:text-amber-400 transition hover:underline"
          >
            سياسة الخصوصية
          </button>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <button 
            onClick={() => onOpenPolicy && onOpenPolicy('returns')} 
            className="hover:text-amber-400 transition hover:underline"
          >
            سياسة الاستبدال والاسترجاع
          </button>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <button 
            onClick={() => onOpenPolicy && onOpenPolicy('terms')} 
            className="hover:text-amber-400 transition hover:underline"
          >
            الشروط والأحكام
          </button>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <button 
            onClick={() => onOpenPolicy && onOpenPolicy('shipping')} 
            className="hover:text-amber-400 transition hover:underline"
          >
            الشحن والتوصيل والمعاينة
          </button>
        </div>

        {/* Bottom Row: Copyright & Developer Credit */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-stone-400 text-[11px] gap-3 text-center sm:text-right">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} Chic Shop Galena's</span>

          {/* Developer Credit - Exactly like Kayan City */}
          <p className="dev-credit font-sans text-xs sm:text-sm tracking-wide text-stone-400" dir="ltr">
            Developed by{" "}
            <a
              href="https://wa.me/201095046646"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-white font-bold transition hover:underline"
              title="تواصل مع المطور عبر واتساب"
            >
              JOO
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
