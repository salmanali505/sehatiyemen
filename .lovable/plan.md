# المرحلة الأولى — إعادة بناء البنية الأساسية للوحات التحكم

## المبدأ الحاكم
- **يُحذف**: كل واجهات وتصميمات لوحات التحكم القديمة (Shell، Sidebar، TopBar، البطاقات، القوائم القديمة).
- **يبقى بلا مساس**: تطبيق المستخدم، قاعدة البيانات، جداول Supabase، Auth، QR، الإشعارات، الحجوزات، الاشتراكات، جميع منطق الأعمال (queries/mutations).
- **الاستراتيجية**: نبني القشرة الجديدة أولًا، نُلبِس بها كل صفحات لوحات التحكم (الوظائف الداخلية لكل صفحة تبقى كما هي — فقط الغلاف يتغيّر)، ثم نحذف الملفات القديمة في الدفعة الأخيرة. هذه الطريقة تضمن ألا تنكسر أي وظيفة أثناء التحويل.

## الهيكل الجديد (`src/components/dash2/`)
نظام واجهات موحّد لجميع اللوحات الثلاث:

- `DashShell.tsx` — الإطار العام (Sidebar جانبي على الديسكتوب + Bottom Nav عائم على الجوال + Top Bar + منطقة المحتوى).
- `DashSidebar.tsx` — شريط جانبي احترافي قابل للطي، يقرأ روابطه ديناميكيًا حسب دور المستخدم (admin / provider / reception).
- `DashTopBar.tsx` — شريط علوي: بحث شامل + مركز إشعارات + قائمة مستخدم + Breadcrumbs + مبدّل Light/Dark.
- `DashBottomNav.tsx` — شريط سفلي عائم (جوال) بزر مركزي بارز.
- `DashPageHeader.tsx` — رأس صفحة موحّد (عنوان + وصف + أزرار إجراءات + Breadcrumbs).
- `DashStatCard.tsx` / `DashKpiGrid.tsx` — بطاقات KPI موحّدة.
- `DashDataTable.tsx` — جدول احترافي (بحث، فرز، ترقيم، تحديد جماعي، تصدير CSV).
- `DashModal.tsx` / `DashSheet.tsx` — نوافذ منبثقة + Sheet جانبي موحّدة.
- `DashForm.tsx` + حقول موحّدة (Input, Select, Toggle, Upload).
- `DashEmptyState.tsx` / `DashLoader.tsx` / `DashBadge.tsx` / `DashSectionHeader.tsx`.
- `DashSearchBar.tsx` — بحث شامل عبر الجداول (providers/users/bookings…).
- `DashNotifCenter.tsx` — Popover لعرض آخر الإشعارات مع عدّاد مباشر.

كل مكوّن يقرأ التوكينز من `src/styles.css` (الهوية الأزرق/الذهبي الحالية) — لا ألوان مكتوبة يدويًا. يدعم كامل RTL، Light/Dark، Responsive من 360px حتى الديسكتوب.

## نظام الصلاحيات
`src/lib/dash/permissions.ts`:
- `useDashRole()` → يُرجع `admin | provider | reception | none` من `useRoles`/`access_tokens`.
- `useDashMenu(role)` → يُرجع قائمة الروابط المسموحة (يستبدل `adminMenu.ts` القديم بنسخة موحّدة لكل الأدوار).
- Route guards: كل صفحة تحت `/admin/*` تتحقّق من `admin`، `/dashboard` من `provider`، `/dashboard/reception` من `reception`.

## Real-Time
`src/lib/dash/realtime.ts`:
- Hook `useRealtimeTable(table, filter?)` يشترك في `postgres_changes` عبر `supabase.channel` مع تنظيف في `useEffect`.
- تفعيل Realtime عبر migration واحدة على الجداول الأساسية (`bookings`, `providers`, `offers`, `ads`, `notifications`) — بلا تغيير على الأعمدة.
- الصفحات تستخدم الـ hook فتتحدّث الأرقام والقوائم فورًا دون إعادة تحميل.

## الدفعات (Batches)

### Batch 1 — الأساسات (هذه الدفعة)
- إنشاء كل مكوّنات `dash2/` بالكامل + `permissions.ts` + `realtime.ts`.
- تحديث `src/styles.css` بأدوات مساعدة موحّدة (glass, curved-header, soft-tint, shadow-medical) دون كسر التوكينز.
- Migration واحدة لتفعيل `supabase_realtime` على الجداول الأساسية.

### Batch 2 — قشرة الأدمن الجديدة
- إعادة كتابة `src/routes/admin.tsx` و`admin.index.tsx` على `DashShell` الجديد بالكامل.
- بناء لوحة رئيسية للأدمن: Hero + KPI Grid + Charts + آخر النشاطات + طلبات التوثيق.

### Batch 3 — قشرة المزوّد + الاستقبال
- إعادة كتابة `dashboard.tsx` و`dashboard.reception.tsx` و`portal.reception.$token.tsx` على `DashShell`.

### Batch 4 — تلبيس صفحات الأدمن الداخلية (~30 صفحة)
- استبدال `AdminShell` بـ `DashPageHeader` + مكوّنات `dash2` في كل صفحة (facilities, providers, doctors, ads, offers, bookings, users, cities, specialties, verification, audit, finance, packages, subscriptions, ai, ui, support, notifications, qr, tokens, reports, analytics, settings, content, home, permissions, payment-methods, backup, smart, soon).
- الوظائف الداخلية (Supabase queries/CRUD) تبقى **كما هي** — فقط الغلاف والبطاقات والجداول تتحول لمكوّنات `dash2`.

### Batch 5 — التنظيف النهائي
- حذف: `src/components/admin/AdminShell.tsx`, `AdminSidebar.tsx`, `AdminTopBar.tsx`, `src/components/dashboard/DashHero.tsx`, `DashCard.tsx`, `DashKpi.tsx`, `DashQuickAction.tsx`, `DashPeriodChips.tsx`, `DashBottomNav.tsx` القديمة.
- إزالة أي استيرادات متبقية، اختبار البناء الكامل.

## تفاصيل تقنية
- الفريمورك: TanStack Start + Router (كما هو، لا تغيير في `router.tsx`).
- الحالة: `useAuth`, `useRoles`, `supabase` client دون تغيير.
- التنقّل: `Link` + `useNavigate` من `@tanstack/react-router`.
- الوضع الداكن: `@custom-variant dark` موجود في `styles.css` — نضيف Toggle في `DashTopBar` يخزّن التفضيل في `localStorage` مع قراءة آمنة في `useEffect`.
- عدم لمس: `src/integrations/supabase/*`, `src/routes/*` غير المتعلّق بلوحات التحكم (index, provider.$id, book.$providerId, bookings, profile…) — تطبيق المستخدم محمي بالكامل.

## المخرجات
- ثلاث لوحات تحكم موحّدة الأسلوب، Enterprise-grade، RTL، Light/Dark، Responsive.
- قاعدة بيانات ووظائف التطبيق تعمل كما هي.
- بنية جاهزة لاستقبال الوحدات المتقدمة في المرحلة الثانية.

هل أبدأ فورًا بـ **Batch 1 (الأساسات)** ثم أتابع الدفعات تباعًا؟
