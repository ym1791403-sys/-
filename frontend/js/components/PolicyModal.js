// Policy & Terms Modal Component (سياسة الخصوصية والاستبدال والشروط)
// Chic Shop Galena's

function PolicyModal({ activeTab, onClose, onSelectTab }) {
  if (!activeTab) return null;

  const tabs = [
    { id: 'privacy', title: 'سياسة الخصوصية', icon: 'fa-shield-halved' },
    { id: 'returns', title: 'الاستبدال والاسترجاع', icon: 'fa-arrow-rotate-left' },
    { id: 'terms', title: 'الشروط والأحكام', icon: 'fa-file-lines' },
    { id: 'shipping', title: 'الشحن والتوصيل', icon: 'fa-truck-fast' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-7 z-10 text-xs max-h-[90vh] flex flex-col animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center text-sm shadow">
              <i className="fa-solid fa-scale-balanced"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">سياسات وقوانين المتجر</h3>
              <span className="text-[11px] text-stone-500">Chic Shop Galena's</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-800 p-1 text-base transition"
            title="إغلاق"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 my-3.5 border-b border-stone-200 pb-2 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id 
                  ? "bg-stone-900 text-white shadow-sm" 
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-[11px] ${activeTab === tab.id ? 'text-amber-300' : ''}`}></i>
              <span>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-stone-700 leading-relaxed text-xs sm:text-[13px]">
          
          {/* 1. PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl text-amber-950">
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-amber-900 flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-cat"></i>
                  <span>التزامنا بحماية خصوصيتكِ وأمان بياناتكِ</span>
                </h4>
                <p className="text-[11px] sm:text-xs">
                  في <strong>Chic Shop Galena's</strong>، نضع خصوصية وأمان معلومات زبائننا الكرام على رأس أولوياتنا. هذه السياسة توضح كيفية تعاملنا مع البيانات.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">1. ما هي البيانات التي نجمعها؟</h5>
                  <p className="text-stone-600">
                    نجمع فقط البيانات الأساسية الضرورية لتوصيل طلبكِ بنجاح، وتشمل:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600 text-xs">
                    <li>الاسم بالكامل لتسليم الشحنة للشخص المعني.</li>
                    <li>رقم الهاتف الأساسي (والبديل اختياري) لتواصل مندوب الشحن وتأكيد الموعد.</li>
                    <li>المحافظة والعنوان التفصيلي لتوجيه الشحنة بدقة.</li>
                    <li>المنتجات المطلوبة وملاحظات التغليف والإهداء.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">2. حماية وسرية البيانات</h5>
                  <p className="text-stone-600">
                    نلتزم التزاماً صارماً وأخلاقياً بعدم بيع أو تأجير أو مشاركة أي بيانات شخصية مع أي أطراف ثالثة أو شركات إعلانية أو جهات تسويقية خارجية. بياناتكِ تستخدم حصرياً لغرض تجهيز وشحن طلبكِ.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">3. أمان التخزين السحابي</h5>
                  <p className="text-stone-600">
                    يتم حفظ ومزامنة بيانات الطلبات عبر خوادم سحابية مؤمنة ومشفرة بالكامل بتقنيات التشفير الحديثة (SSL/HTTPS)، ولا يمكن الوصول إليها إلا للمشرفين المعتمدين لمتابعة حالة الشحنات.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">4. حقوق العميل في البيانات</h5>
                  <p className="text-stone-600">
                    يحق لكِ في أي وقت مراجعة بياناتكِ أو طلب تعديلها أو حذف سجل طلباتكِ نهائياً من قاعدة البيانات عبر التواصل المباشر مع إدارة المتجر.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. RETURN & EXCHANGE POLICY */}
          {activeTab === 'returns' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950">
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-emerald-900 flex items-center gap-1.5">
                  <i className="fa-solid fa-box-open"></i>
                  <span>معاينة مجانية كاملة قبل الدفع واستبدال سهل</span>
                </h4>
                <p className="text-[11px] sm:text-xs">
                  حرصاً على ثقتكِ ورضاكِ التام، نتيح لكِ فحص وتأكيد سلامة كل قطعة بنفسكِ قبل استلامها وسداد قيمتها.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">1. حق الفحص والمعاينة عند الاستلام</h5>
                  <p className="text-stone-600">
                    يحق لكِ فتح الشحنة بحضور مندوب شركة الشحن ومعاينة القطع والتأكد من مطابقتها للمواصفات المعروضة على المتجر وخلوها من أي عيوب قبل الدفع. إذا لم تنل القطعة إعجابكِ، يمكنكِ رفض استلام الشحنة فوراً.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">2. مدة الاستبدال والاسترجاع</h5>
                  <p className="text-stone-600">
                    وفقاً لقانون حماية المستهلك المصري، يُتاح استبدال أو استرجاع المنتج خلال <strong>14 يوماً</strong> من تاريخ الاستلام في حال ظهور أي عيب مصنعي في الطلاء أو الخامة.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">3. شروط قبول الاسترجاع</h5>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600 text-xs">
                    <li>أن تكون القطعة في حالتها الأصلية وبكامل ملحقاتها وعلبتها المرفقة.</li>
                    <li>ألا تكون القطعة قد تعرضت لسوء استخدام أو احتكاك بمواد كيميائية حارقة أو عطور مركزة مباشرة.</li>
                    <li>وجود رقم الطلب أو الفاتورة لتأكيد الشراء من متجرنا.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">4. استرداد الأموال</h5>
                  <p className="text-stone-600">
                    عند قبول الاسترجاع، يتم استرداد المبلغ المدفوع بالكامل نقداً أو عبر المحافظ الإلكترونية المعتمدة (فودافون كاش، إنستاباي) خلال 48 ساعة من استلام المنتج المرتجع وفحصه.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-stone-900 flex items-center gap-1.5">
                  <i className="fa-solid fa-gavel"></i>
                  <span>شروط وأحكام الشراء والاستخدام</span>
                </h4>
                <p className="text-[11px] sm:text-xs text-stone-600">
                  باستخدامكِ لمتجر <strong>Chic Shop Galena's</strong> وإتمام طلبات الشراء، فإنكِ توافقين على الشروط والأحكام الآتية المنظمة لعملية البيع والتوصيل.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">1. الأسعار والعروض</h5>
                  <p className="text-stone-600">
                    جميع الأسعار المعروضة على المتجر بالجنيه المصري (ج.م) وشاملة كافة تفاصيل القطعة. نحتفظ بالحق في تعديل الأسعار أو إطلاق عروض وتخفيضات موسمية دون إشعار مسبق، مع التزامنا التام بالسعر المعلن وقت تأكيدكِ للطلب.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">2. جودة الإكسسوارات والعناية بها</h5>
                  <p className="text-stone-600">
                    إكسسواراتنا مطلية بتقنيات طلاء عالية الجودة ومقاومة لتغير اللون مع الاستخدام المعتاد. للحفاظ على بريقها ولمعانها لأطول فترة ممكنة، يُنصح بحفظها في علبتها وتجنب تعرضها المباشر لمياه البحر، الكلور، والكحوليات.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">3. إلغاء وتعديل الطلبات</h5>
                  <p className="text-stone-600">
                    يمكنكِ تعديل تفاصيل الطلب أو إلغائه مجاناً قبل خروج الشحنة مع شركة التوزيع، وذلك بالتواصل مع خدمة العملاء عبر حساب تيك توك الرسمي أو رقم المتجر.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. SHIPPING & DELIVERY */}
          {activeTab === 'shipping' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-amber-950">
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-amber-900 flex items-center gap-1.5">
                  <i className="fa-solid fa-truck-ramp-box"></i>
                  <span>شحن سريع وموثوق لكافة أنحاء جمهورية مصر العربية</span>
                </h4>
                <p className="text-[11px] sm:text-xs">
                  نتعاون مع أفضل شركات الشحن السريع في مصر لضمان وصول طلبكِ بأمان وبأعلى درجات العناية بالتغليف.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">1. مواعيد التوصيل التقديرية</h5>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-stone-600 text-xs">
                    <li><strong>القاهرة والجيزة:</strong> خلال 24 - 48 ساعة كحد أقصى.</li>
                    <li><strong>الإسكندرية ومحافظات الدلتا والقناة:</strong> خلال 2 - 3 أيام عمل.</li>
                    <li><strong>محافظات الصعيد والوجه القبلي:</strong> خلال 3 - 4 أيام عمل.</li>
                    <li><strong>المناطق الحدودية (شرم الشيخ، الغردقة، مطروح):</strong> خلال 3 - 5 أيام عمل.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">2. الشحن المجاني</h5>
                  <p className="text-stone-600">
                    يتمتع عملاؤنا بشحن مجاني بالكامل لأي طلب يتجاوز الحد الأدنى للشحن المجاني المعلن في المتجر (600 ج.م).
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">3. التغليف الفاخر والهدايا</h5>
                  <p className="text-stone-600">
                    جميع المنتجات تُشحن في علب أنيقة ومبطنة لحمايتها أثناء النقل، كما نوفر خيار التغليف الفاخر كهدية مع كارت إهداء مخصص لكتابة رسالتكِ الخاصة (+35 ج.م).
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3.5 border-t border-stone-200 mt-2 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            آخر تحديث للسياسات: {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

window.PolicyModal = PolicyModal;
