// Navigation Header & Top Announcement Bar
// Chic Shop Galena's

function Header({
  storeSettings,
  searchQuery,
  setSearchQuery,
  wishlistCount,
  totalCartItems,
  setIsWishlistOpen,
  setIsCartOpen,
  onOpenTrack
}) {
  const hasTiktok = Boolean(storeSettings.tiktokUrl && storeSettings.tiktokUrl.trim());

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 text-center font-medium">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-center sm:justify-between">
          <span className="hidden sm:inline">أهلاً بكِ في Chic Shop Galena's للإكسسوارات النسائية</span>
          <span>شحن مجاني لكافة المحافظات للطلبات الأكثر من {storeSettings.freeShippingThreshold} جنيه</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-stone-200 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-3 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-sm shadow">
              <i className="fa-solid fa-gem"></i>
            </div>
            <div>
              <span className="font-playfair text-xl sm:text-2xl font-bold text-stone-900 block leading-tight">
                Chic Shop Galena's
              </span>
              <span className="text-[10px] tracking-wider text-stone-500 font-semibold uppercase">JEWELRY & ACCESSORIES</span>
            </div>
          </a>

          {/* Desktop Search Input */}
          <div className="hidden md:flex flex-1 max-w-sm relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن قطعة في المتجر..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:border-stone-800 transition"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenTrack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-stone-700 hover:bg-stone-100 transition text-xs font-bold"
              title="تتبع طلبك"
            >
              <i className="fa-solid fa-truck-fast text-sm"></i>
              <span className="hidden sm:inline">تتبع طلبك</span>
            </button>

            {hasTiktok && (
              <a
                href={storeSettings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black hover:bg-stone-850 text-white flex items-center justify-center text-sm shadow transition hover:scale-105 border border-stone-800"
                title="تيك توك"
              >
                <i className="fa-brands fa-tiktok"></i>
              </a>
            )}

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-full text-stone-700 hover:bg-stone-100 transition"
              title="المفضلة"
            >
              <i className="fa-regular fa-heart text-lg"></i>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-full text-xs font-medium shadow transition"
            >
              <i className="fa-solid fa-bag-shopping text-amber-300"></i>
              <span className="hidden sm:inline">السلة</span>
              <span className="bg-amber-400 text-stone-900 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {totalCartItems}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن قطعة في المتجر..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-stone-300 rounded-full focus:outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>
        </div>
      </header>
    </>
  );
}

window.Header = Header;
