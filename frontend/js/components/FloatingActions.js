// Floating Action Buttons
// Chic Shop Galena's

function FloatingActions({ storeSettings }) {
  const hasTiktok = Boolean(storeSettings.tiktokUrl && storeSettings.tiktokUrl.trim());

  return (
    <>
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
