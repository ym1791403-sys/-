// Hero Section Component - Fully Responsive across Phone, Tablet, Laptop & Desktop
// Chic Shop Galena's

function Hero({ storeSettings }) {
  const hasPhoneSet = Boolean(storeSettings.whatsappNumber && storeSettings.whatsappNumber.trim());
  const hasTiktok = Boolean(storeSettings.tiktokUrl && storeSettings.tiktokUrl.trim());

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 text-white py-8 sm:py-12 md:py-16 lg:py-20">
      
      {/* Ambient background glows for luxury vibe */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Text & Value Proposition (7 cols on Desktop, full on Mobile/Tablet) */}
          <div className="lg:col-span-7 text-center lg:text-right space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-stone-200">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>تشكيلة حصرية من أرقى الإكسسوارات والمجوهرات النسائية</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-snug">
              أناقتكِ تكتمل بتفاصيل <br className="hidden sm:inline" />
              <span className="text-amber-300 font-playfair">Chic Shop Galena's</span>
            </h1>
            
            <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              مجموعة مختارة من أحدث السلاسل، الخواتم، الأساور، والأقراط المطلية بعناية فائقة والمقاومة لتغير اللون، مصممة لتبرز جمالكِ في كل مناسبة.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#catalog"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold px-7 py-3 rounded-full text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <span>تصفحي المنتجات الآن</span>
                <i className="fa-solid fa-arrow-left text-xs"></i>
              </a>

              {hasTiktok && (
                <a
                  href={storeSettings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-black hover:bg-stone-850 text-white font-medium px-6 py-3 rounded-full text-xs sm:text-sm border border-stone-700 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-tiktok text-sm"></i>
                  <span>تواصل عبر تيك توك</span>
                </a>
              )}

              {hasPhoneSet && (
                <a
                  href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار والطلب من Chic Shop Galena\'s')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-full text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                  <span>طلب مباشر عبر واتساب</span>
                </a>
              )}
            </div>

            {/* Trust Badges - Responsive Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-white/10 text-[11px] sm:text-xs text-stone-300">
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start text-center sm:text-right">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <strong className="block text-white text-[11px] sm:text-xs">ضمان الخامات</strong>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">مقاوم لتغير اللون</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start text-center sm:text-right">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                  <i className="fa-solid fa-box-open"></i>
                </div>
                <div>
                  <strong className="block text-white text-[11px] sm:text-xs">معاينة قبل الدفع</strong>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">التأكد قبل الاستلام</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start text-center sm:text-right">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                  <i className="fa-solid fa-truck-fast"></i>
                </div>
                <div>
                  <strong className="block text-white text-[11px] sm:text-xs">توصيل سريع</strong>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">لكافة المحافظات</span>
                </div>
              </div>
            </div>

          </div>

          {/* Large Hero Image Showcase (5 cols on Desktop, full on Mobile/Tablet) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
              
              {/* Main Large Visual Card */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10 relative group">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop"
                  alt="Chic Shop Galena's Luxury Jewelry"
                  className="w-full h-[360px] sm:h-[440px] md:h-[480px] lg:h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Subtle Gradient & Bottom Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white">
                  <span className="bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2 self-start shadow">
                    القطعة الأكثر طلباً
                  </span>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-snug">
                    تشكيلة المجوهرات والإكسسوارات الحصرية
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    تصاميم عصرية تناسب يومكِ والمناسبات الخاصة
                  </p>
                </div>
              </div>

              {/* Floating Decorative Quality Badge */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-white text-stone-900 p-3 sm:p-4 rounded-2xl shadow-2xl border border-stone-100 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg sm:text-xl">
                  <i className="fa-solid fa-gem"></i>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs sm:text-sm text-stone-900">طلاء عالي الثبات</div>
                  <div className="text-[10px] sm:text-xs text-stone-500">جودة أصلية مضمونة</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
