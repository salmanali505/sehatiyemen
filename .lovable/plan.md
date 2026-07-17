## نطاق التنفيذ
استبدال كامل للوحات التحكم الثلاث بدون حذف أي وظيفة. يتم إنشاء "قشرة" (Shell) جديدة موحّدة مستوحاة من الفيديو المرجعي، ثم إعادة تركيب الوحدات الحالية داخلها. الهوية (شعار صحتي، الألوان، الخطوط الطبية، gradient-primary الأزرق) تبقى كما هي.

## نظام التصميم الجديد (Design System v2)
مكوّنات جديدة تحت `src/components/dash2/` (ملفات جديدة كليًا — لا نستبدل القديمة كي لا نكسر شيئًا):
- `DashShell.tsx` — إطار عام: Hero + محتوى + Bottom Nav ثابت مع زر مركزي بارز (Floating Home).
- `DashHeader.tsx` — رأس متدرّج بزاوية منحنية، أيقونة قائمة (تفتح Sheet)، أيقونة الإشعارات مع Badge، شعار صحتي، بطاقة ترحيب (صورة + اسم المستخدم + الوصف).
- `DashQuickTiles.tsx` — شريط "الإجراءات السريعة" (بطاقات ملوّنة ناعمة قابلة للتمرير أفقيًا).
- `DashPeriodTabs.tsx` — تبويبات الفترة (اليوم/الأسبوع/الشهر/السنة) بنفس أسلوب الفيديو.
- `DashStatCard.tsx` — بطاقة إحصائية كبيرة (قيمة ضخمة + وصف + Trend badge + أيقونة ملوّنة).
- `DashChartCard.tsx` — بطاقة رسم بياني (Recharts موجود مسبقًا).
- `DashListCard.tsx` — بطاقة عناصر قائمة (صورة + عنوان + وصف + شارات + إجراءات).
- `DashSearchFilters.tsx` — شريط بحث + Chips فلاتر.
- `DashBottomNav.tsx` — شريط سفلي بخمس أيقونات + زر مركزي دائري (Home).
- `DashSideSheet.tsx` — قائمة جانبية منزلقة تفتح من زر القائمة، بها كل الأقسام والصلاحيات.
- `DashSection.tsx` + `DashEmptyState.tsx` + `DashPageHeader.tsx` (للصفحات الداخلية).

كل الألوان تُقرأ من الـ tokens الموجودة (`--primary`, `--accent`, `--success`, `--warning`, `--gradient-primary`) — لا نضيف ألوانًا خارج النظام.

## اللوحات الثلاث

### 1) لوحة المزوّد `/dashboard`
- **الرئيسية**: Hero (اسم المنشأة + وصف) → Quick Tiles (تحديث المنشأة، إضافة خدمة، إضافة طبيب، إضافة عرض) → Period Tabs → 4 StatCards (الحجوزات، الإيرادات، العملاء، متوسط الحجز) → ChartCard (اتجاه الحجوزات آخر 12 شهر) → قائمة "آخر الحجوزات".
- **الأقسام الداخلية** (تُنقل من التبويبات الحالية إلى صفحات/Sheets بنفس الـ Shell): ملف المنشأة، الخدمات، الأطباء، العروض، الإعلانات، التقييمات، الاستقبال، تيليجرام (تبويب Placeholder جاهز)، QR، الإعدادات.
- Bottom Nav: الرئيسية / الحجوزات / (زر مركزي = إضافة) / الخدمات / الإعدادات.

### 2) لوحة موظف الاستقبال `/dashboard/reception`
- Hero بسيط + Quick Tiles (حجز جديد، مسح QR، حجوزات اليوم، بحث عميل) → StatCards (حجوزات اليوم، بانتظار التأكيد، مكتملة، ملغاة) → قائمة حجوزات اليوم مع أزرار الحالة السريعة.
- Bottom Nav: الرئيسية / الحجوزات / (زر مركزي = مسح QR) / العملاء / الإعدادات.
- إدارة موظفي الاستقبال الحالية تُعاد كصفحة داخلية بنفس نمط `DashListCard`.

### 3) لوحة الإدارة العليا `/admin`
- استبدال الـ `AdminSidebar` + `AdminTopBar` القديمة بـ `DashShell` (على الجوال) و`DashSideSheet` كقائمة كاملة (على الديسكتوب تبقى Sidebar موسّعة بنفس الأسلوب الجديد).
- **الرئيسية**: Hero (مرحبًا أيها المشرف) → Quick Tiles (منشأة جديدة، إعلان، مستخدم، مراجعة توثيق) → Period Tabs → 6 StatCards → ChartCard (نمو المنشآت/المستخدمين) → قوائم "آخر النشاطات" و"طلبات التوثيق".
- كل صفحات الأدمن (~30 صفحة موجودة: providers, doctors, ads, offers, cities, specialties, bookings, users, roles, verification, audit, backup, finance, payments, packages, subscriptions, ai, smart, ui, support, notifications, qr, tokens, reports, analytics, settings, content, facilities, home, permissions, payment-methods, soon) تلبس نفس الـ Shell عبر مكوّن `DashPageHeader` + شبكة بطاقات موحّدة. الوظائف الداخلية (CRUD الحالي) لا تتغيّر.

## استراتيجية عدم كسر الوظائف
- لا نحذف الملفات القديمة في أول دفعة؛ نُنشئ المكوّنات الجديدة ونعيد توجيه الصفحات الرئيسية إليها.
- كل صفحة إدارة (Doctors/Services/Ads/…): الغلاف يتغيّر فقط (Header + Layout + Cards)، أما استعلامات Supabase وأزرار الإجراءات تبقى كما هي.
- بعد التحقّق البصري والوظيفي، نحذف: `dashboard/DashHero.tsx`, `DashCard.tsx`, `DashKpi.tsx`, `DashQuickAction.tsx`, `DashPeriodChips.tsx` القديمة + `admin/AdminSidebar.tsx` + `AdminTopBar.tsx` + `AdminShell.tsx`.

## التقسيم إلى دفعات
1. **Batch 1 — Design System**: كل مكوّنات `dash2/` + توسيع نافذ في `src/styles.css` (utilities للـ soft-tint، shadow-medical، curved-header).
2. **Batch 2 — لوحة المزوّد**: إعادة بناء `src/routes/dashboard.tsx` (الرئيسية + التبويبات الحالية داخل Shell + BottomNav).
3. **Batch 3 — لوحة الاستقبال**: إعادة بناء `src/routes/dashboard.reception.tsx` + `portal.reception.$token.tsx`.
4. **Batch 4 — قشرة الأدمن**: `src/routes/admin.tsx` + `admin.index.tsx` بالكامل على الـ Shell الجديد + SideSheet يجمع كل روابط `adminMenu`.
5. **Batch 5 — صفحات الأدمن الداخلية** (يُنفَّذ على موجات): تلبيس ~30 صفحة بـ `DashPageHeader` + شبكة موحّدة، دفعة 6–8 صفحات في كل جولة.
6. **Batch 6 — تنظيف**: حذف الملفات القديمة، تحديث الاستيرادات، اختبار البناء.

## تفاصيل تقنية
- التنقّل: `@tanstack/react-router` (Link/useNavigate) — نحافظ على مسارات `/admin.*` كما هي.
- الحالة: نبقي على `useAuth`, `useRoles`, `supabase` client كما هي بدون تغيير.
- الاستجابة: القشرة مُصمَّمة للجوال أولًا (411×680)، مع كسور `md:` لعرض الديسكتوب (SideSheet دائم على اليمين + عمودين للبطاقات).
- عدم لمس: `src/integrations/supabase/*`, `src/components/SehatiLogo.tsx`, `src/lib/*` (منطق الأعمال).

## المخرجات المرئية للنتيجة النهائية
- ثلاث لوحات تشعر بأنها تطبيق واحد.
- Hero متدرّج أزرق (هوية صحتي) بزاوية سفلية منحنية، شعار صحتي في اليسار، إشعارات + قائمة.
- بطاقات إجراءات ملوّنة بلمسات باستيل ناعمة على أرضية بيضاء.
- KPI كبيرة بأرقام سميكة + Trend badge أخضر/أحمر.
- Bottom Nav ثابت مع زر مركزي دائري (بديل عن Sidebar على الجوال).
- كل الوظائف الحالية موجودة، فقط بواجهة جديدة.

هل تعتمد الخطة لأبدأ بـ Batch 1 مباشرة؟
