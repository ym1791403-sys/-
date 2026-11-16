// Floating Action Buttons & Discreet Control Panel Trigger
// Chic Shop Galena's

function FloatingActions({ storeSettings, onOpenAdmin }) {
  const hasPhoneSet = Boolean(storeSettings.whatsappNumber && storeSettings.whatsappNumber.trim());
  const hasTiktok = Boolean(storeSettings.tiktokUrl && storeSettings.tiktokUrl.trim());

  return (
    <>
      {/* Discreet Admin Trigger (Small gear icon like Kayan City) */}
      <button
        onClick={onOpenAdmin}
        className="fixed bottom-4 left-4 z-40 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-stone-300 hover:text-white shadow flex items-center justify-center transition-all backdrop-blur-sm border border-stone-700/50"
        title="إدارة المتجر"
      >
        <i className="fa-solid fa-gear text-xs"></i>
      </button>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2.5 items-end">
        {hasTiktok && (
          <a
            href={storeSettings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black hover:bg-stone-850 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-xl transition-transform hover:scale-110 border border-stone-700"
            title="تواصل عبر تيك توك"
          >
            <i className="fa-brands fa-tiktok"></i>
          </a>
        )}

        {hasPhoneSet && (
          <a
            href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار والطلب')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-transform hover:scale-105"
            title="تواصل واتساب"
          >
            <i className="fa-brands fa-whatsapp"></i>
          </a>
        )}
      </div>
    </>
  );
}

window.FloatingActions = FloatingActions;
