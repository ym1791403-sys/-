// Footer Component with Developer Credit 'Developed by Joe'
// Chic Shop Galena's

function Footer({ storeSettings, onOpenAdmin }) {
  const hasPhoneSet = Boolean(storeSettings.whatsappNumber && storeSettings.whatsappNumber.trim());
  const hasTiktok = Boolean(storeSettings.tiktokUrl && storeSettings.tiktokUrl.trim());

  return (
    <footer className="bg-stone-900 text-stone-400 pt-8 pb-6 text-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-800 text-center sm:text-right">
          <div>
            <span className="font-playfair text-lg font-bold text-white block">Chic Shop Galena's</span>
            <p className="text-stone-400 text-xs mt-0.5">متجر إلكتروني متخصص في الإكسسوارات النسائية المطلية.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {hasTiktok && (
              <a 
                href={storeSettings.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <i className="fa-brands fa-tiktok text-white text-sm"></i>
                <span>حساب تيك توك</span>
              </a>
            )}
            {hasPhoneSet && (
              <a 
                href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                className="text-stone-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <i className="fa-brands fa-whatsapp text-emerald-400"></i>
                <span>واتساب: {storeSettings.phoneDisplay || storeSettings.whatsappNumber}</span>
              </a>
            )}
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-stone-400 text-[11px] gap-2">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} Chic Shop Galena's</span>
          <span className="text-stone-400 font-sans tracking-wide">
            Developed by <strong className="text-amber-400 font-medium">Joe</strong>
          </span>
          <button 
            onClick={onOpenAdmin}
            className="hover:text-stone-200 underline transition"
          >
            إدارة المتجر
          </button>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
