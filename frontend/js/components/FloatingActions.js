// Floating Action Buttons & Discreet Control Panel Trigger
// Chic Shop Galena's

function FloatingActions({ storeSettings, onOpenAdmin }) {
  const hasTiktok = Boolean(storeSettings.tiktokUrl && storeSettings.tiktokUrl.trim());

  return (
    <>
      {/* Extremely Discreet Admin Trigger - Blends into background */}
      <button
        onClick={onOpenAdmin}
        className="fixed bottom-3 left-3 z-30 w-6 h-6 rounded-full bg-stone-900/10 hover:bg-stone-900/80 text-stone-500/20 hover:text-stone-200 shadow-none hover:shadow-md flex items-center justify-center transition-all duration-300 opacity-20 hover:opacity-100 border border-transparent hover:border-stone-700"
        aria-label="Panel"
      >
        <i className="fa-solid fa-sliders text-[9px]"></i>
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
