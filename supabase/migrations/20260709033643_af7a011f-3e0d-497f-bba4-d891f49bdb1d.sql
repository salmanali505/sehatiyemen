
-- Payment methods (admin-managed)
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  type text NOT NULL CHECK (type IN ('cash','bank_transfer','wallet','card','other')),
  instructions text,
  account_details jsonb DEFAULT '{}'::jsonb,
  logo_url text,
  requires_proof boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_methods TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pm_public_read_enabled" ON public.payment_methods
  FOR SELECT USING (enabled = true);
CREATE POLICY "pm_admin_all_select" ON public.payment_methods
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "pm_admin_write" ON public.payment_methods
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER pm_touch BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Booking payment fields
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS amount numeric,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'YER',
  ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_method_code text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_proof_url text,
  ADD COLUMN IF NOT EXISTS confirmed_by uuid,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='bookings_touch') THEN
    CREATE TRIGGER bookings_touch BEFORE UPDATE ON public.bookings
      FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
  END IF;
END $$;

-- Allow provider/admin to read & update bookings tied to their provider
CREATE POLICY "bookings_admin_all" ON public.bookings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default payment methods
INSERT INTO public.payment_methods (code, name_ar, name_en, type, instructions, requires_proof, sort_order) VALUES
  ('cash', 'الدفع نقداً في العيادة', 'Cash on arrival', 'cash', 'ادفع مباشرةً في مقر مزوّد الخدمة عند الوصول.', false, 1),
  ('bank_transfer', 'تحويل بنكي', 'Bank transfer', 'bank_transfer', 'حوّل المبلغ إلى الحساب البنكي أدناه ثم ارفق صورة إشعار التحويل.', true, 2),
  ('wallet', 'محفظة إلكترونية', 'E-wallet', 'wallet', 'حوّل المبلغ عبر المحفظة الإلكترونية ثم ارفق لقطة شاشة للعملية.', true, 3)
ON CONFLICT (code) DO NOTHING;
