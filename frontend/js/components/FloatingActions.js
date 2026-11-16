// Floating Action Buttons & Discreet Control Panel Trigger
// Chic Shop Galena's

function FloatingActions({ storeSettings, onOpenAdmin }) {
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

      {/* Floating TikTok Action Button */}
      {hasTiktok && (
        <div className="fixed bottom-4 right-4 z-40">
          <a
            href={storeSettings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black hover:bg-stone-850 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-xl transition-all hover:scale-110 border border-stone-700"
            title="تيك توك"
          >
            <i className="fa-brands fa-tiktok"></i>
          </a>
        </div>
      )}
    </>
  );
}

window.FloatingActions = FloatingActions;
