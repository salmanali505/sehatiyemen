# SEHATI — تقرير تحليل النظام (المرحلة الأولى / القسم 1)

_تاريخ التحليل: 2026-07-23_ · _حالة: تحليل توثيقي بدون أي تعديل على البيانات أو الوظائف._

---

## 1. الواجهة الأمامية (Frontend Audit)

### 1.1 هيكل الصفحات (55 route)

**تطبيق المريض (12):**
`index`, `auth`, `verify-email`, `search`, `provider.$id`, `doctor.$id`, `book.$providerId`, `bookings`, `favorites`, `profile`, `profile.edit`, `records`, `family`, `notifications`, `assistant`.

**لوحة المزوّد (2):** `dashboard` (المالك), `dashboard.reception` (الاستقبال).

**بوابات الوصول برمز (3):** `master.$token`, `portal.provider.$token`, `portal.reception.$token`.

**لوحة الأدمن (30):** index + ads, ai, analytics, audit, backup, bookings, cities, content, doctors, facilities, finance, home, notifications, offers, packages, payment-methods, payments, permissions, providers/$id, qr, reports, services, settings, smart, soon, specialties, subscriptions, support, tokens, ui, users, verification.

### 1.2 المكوّنات (89 مكوّن)

| المجلد | العدد | الحالة |
|--------|------|--------|
| `components/` (جذر) | 15 | مكوّنات المريض العامة — مكتملة |
| `components/ui/` | ~40 | shadcn/ui — مكتملة |
| `components/dashboard/` | 12 | نظام قديم (Enterprise v2) — يعمل |
| `components/dash2/` | 10 | نظام جديد (DashShell) — **غير مستخدم بعد** |
| `components/admin/` | 4 | AdminShell/Sidebar/TopBar — مستخدم |

### 1.3 ملاحظات وثغرات

- **ازدواج نظام لوحات التحكم:** `dashboard/` (المفعّل) و `dash2/` (تم إنشاؤه في Batch 1 لكن لم يُربط بعد بأي صفحة). يجب توحيدهما في المرحلة 2 لتجنب انحراف التصميم.
- **صفحات فارغة/توثيقية:** `admin.soon.tsx`, `admin.ui.tsx` — يفضّل توحيدها.
- **إعادة تعريف Layout للأدمن:** `admin.tsx` يستخدم `AdminTopBar` القديم مع `dashboard/DashBottomNav` — يجب أن يهاجر إلى `DashShell`.
- **صفحات مكتملة جيدة:** index, auth, verify-email, book, bookings, provider.$id, family, notifications.
- **صفحات جزئية:** records (131 سطر — نموذج فقط), search (يحتاج فلاتر متقدمة), assistant (واجهة أساسية).

---

## 2. قاعدة البيانات (Database Audit)

### 2.1 الجداول (29 جدول، RLS مفعّل على 100%)

| الفئة | الجداول |
|-------|---------|
| المستخدمون والصلاحيات | `profiles`, `user_roles`, `family_members`, `reception_users`, `access_tokens` |
| المزوّدون | `providers`, `provider_doctors`, `provider_services`, `specialties`, `cities`, `verification_requests` |
| الحجوزات والدفع | `bookings`, `payments`, `payment_methods`, `subscriptions`, `packages` |
| المحتوى والتسويق | `ads`, `offers`, `home_sections`, `content_posts`, `featured_content` |
| التفاعل | `reviews`, `favorites`, `notifications`, `support_tickets` |
| النظام | `system_settings`, `audit_logs`, `ai_conversations`, `health_records` |

### 2.2 الأحجام الحالية

- **نشطة:** bookings (14), providers (7), profiles (5), cities (5), home_sections (5), access_tokens (4), packages (3), payment_methods (3), reviews (3), subscriptions (3).
- **فارغة (14 جدول):** provider_doctors, offers, payments, support_tickets, audit_logs, verification_requests, family_members, provider_services, reception_users, ai_conversations, featured_content, health_records, specialties — طبيعية، مُهيّأة للاستخدام.

### 2.3 الفهارس (Indexes) — نقاط الضعف

الفهارس الموجودة تغطي فقط PK والمفاتيح الفريدة، ما عدا فهرسين مخصّصين (`idx_access_tokens_token`, `idx_notifications_user`). **مفقود:**

- `bookings(user_id)`, `bookings(provider_id)`, `bookings(scheduled_at)`, `bookings(status)` — أكثر الجداول قراءةً.
- `providers(city_id)`, `providers(kind)`, `providers(is_active)`.
- `favorites(user_id)`, `reviews(provider_id)`, `notifications(user_id, read)`.
- `provider_services(provider_id)`, `provider_doctors(provider_id)`.
- `offers/ads(provider_id, status)` — للوحة المراجعة.
- `audit_logs(user_id, created_at)`.

سيتم إضافتها في القسم 2 (Architecture Improvement).

### 2.4 العلاقات (Foreign Keys)

15 جدول له FKs — البنية سليمة. `auth.users` مربوط عبر `profiles.id` فقط (كما يجب في Supabase).

### 2.5 وظائف قاعدة البيانات

`handle_new_user`, `has_role`, `auto_grant_super_admin`, `update_updated_at_column`, `tg_touch_updated_at` — كلها آمنة (`SECURITY DEFINER` مع `search_path`).

---

## 3. تحليل المصادقة (Authentication Audit)

### 3.1 الحالي

- تسجيل بالبريد + كلمة مرور + OTP من 6 أرقام (`verify-email.tsx`).
- تخزين `account_type` في `profiles` (patient / doctor / facility).
- Google OAuth **معطّل** بناءً على طلب سابق.
- الجلسات: Supabase `localStorage` + `onAuthStateChange` في `__root.tsx`.
- الأدوار عبر `user_roles` + `has_role()` (نمط آمن، بلا re-entrancy).

### 3.2 الفجوات

- **لا يوجد Password Reset UI** (`/reset-password` مفقود).
- **لا يوجد Phone OTP** رغم دعم قاعدة البيانات.
- **صلاحيات المزوّد/الاستقبال/الطبيب** موزّعة بين `providers.owner_user_id`, `reception_users`, `access_tokens` بدون طبقة موحّدة (`useDashRole` أُنشئ لكن يحتاج ربط).
- **لا يوجد Session Expiry مخصّص** أو Rate limiting للـ OTP.
- **HIBP (كلمات مرور مسرّبة)** غير مفعّل.

---

## 4. التكاملات (Integrations Audit)

| الخدمة | الحالة |
|--------|--------|
| Supabase (DB/Auth/Storage) | ✅ يعمل — bucket `provider-images` خاص |
| Lovable AI Gateway (`LOVABLE_API_KEY`) | ✅ مفتاح موجود، مُستخدم في `admin.ai` و `assistant` |
| Telegram Notifications | 🟡 جدول `provider_telegram_settings` مذكور في السجل لكن غير موجود في الـ schema — يحتاج تحقّق/ترحيل |
| Payments Gateway (Stripe/Paddle) | ❌ غير مفعّل — الدفع حالياً يدوي (إثبات صورة) |
| Email Templates | 🟡 قوالب Supabase الافتراضية |
| SMS Provider | ❌ غير مربوط |
| Webhooks | ❌ لا توجد endpoints في `api/public/` |

---

## 5. الأمان — الحالة الحالية

✅ **قوي:**
- RLS مفعّل على كل جدول.
- الأدوار في جدول منفصل مع `has_role` security definer.
- كل الأسرار الحسّاسة في Supabase Secrets (لا JWT في الكود).
- `handle_new_user` يحوي `search_path`.

⚠️ **يحتاج تحسين (القسم 4 من المرحلة):**
- لا يوجد **تشفير على مستوى الحقل** للبيانات الطبية في `health_records` (يعتمد على RLS فقط).
- جدول `audit_logs` موجود لكن **لا يُكتب فيه من أي عملية حالياً** (فارغ) — يحتاج triggers.
- لا يوجد Rate limiting على تسجيل الدخول / OTP.
- HIBP معطّل.
- Storage bucket `provider-images` خاص لكن **لا يوجد policy موثّقة للرفع** — يحتاج مراجعة في القسم 4.

---

## 6. الأداء — مؤشرات أولية

- الفهارس ناقصة (البند 2.3) — أولوية عالية لأن `bookings` سينمو بسرعة.
- الاستعلامات في `admin.index.tsx` تجلب 90 يوماً كاملاً بدون تجميع خادمي — يجب تحويلها إلى SQL view / materialized view لاحقاً.
- تحميل الصور بدون `srcset` أو `loading=lazy` في `HeroSlider`, `CategoryGrid`.
- لا يوجد Code Splitting مخصّص للوحات (كل route منفصل تلقائياً عبر TanStack، لكن `admin.*` تشترك في `admin.tsx` الكبير).

---

## 7. الجاهزية للمراحل القادمة

| البند | الحالة |
|-------|--------|
| بنية Modular | 🟡 جزئية — تحتاج إعادة تنظيم إلى `modules/{auth,users,facility,...}` |
| Global Settings | 🟡 جدول `system_settings` موجود (4 أعمدة، سجل واحد) — يحتاج UI + hook `useSettings()` |
| Feature Flags | ❌ غير موجود — يحتاج جدول `feature_flags` + hook |
| Multi-Tenant | 🟡 مُهيّأ ضمنياً (كل شيء مرتبط بـ `provider_id`) — يحتاج توثيق وسياسات موحّدة |
| Audit Log | 🟡 جدول موجود، triggers مفقودة |
| Dynamic Config (specialties/kinds) | ✅ `specialties`, `cities`, `home_sections` قابلة للتوسع من DB |

---

## 8. المخرجات العملية للانتقال إلى القسم 2

الأولويات المقترحة للقسم 2 (Architecture Improvement):

1. **Migration**: إضافة الفهارس الناقصة (البند 2.3) + triggers لـ `audit_logs`.
2. **`src/modules/`**: إعادة تنظيم الكود ضمن modules واضحة (auth, users, facilities, bookings, payments, notifications, settings).
3. **`useSettings()` + `useFeatureFlag()`**: إنشاء hooks + جدول `feature_flags`.
4. **توحيد نظام لوحات التحكم**: ترحيل `admin.tsx` و `dashboard.tsx` إلى `dash2/DashShell` وحذف `dashboard/` القديم بعد التأكد.
5. **Reset Password + HIBP** ضمن القسم 4 (Security).

---

**الحالة العامة:** المشروع في وضع صحّي. البنية سليمة، البيانات محفوظة، RLS كامل. الفجوات الرئيسية هي: **فهارس ناقصة، ازدواج نظام الواجهات، إعدادات مركزية غير مكتملة، audit log صامت.** كلها قابلة للإصلاح بدون كسر أي وظيفة قائمة.
