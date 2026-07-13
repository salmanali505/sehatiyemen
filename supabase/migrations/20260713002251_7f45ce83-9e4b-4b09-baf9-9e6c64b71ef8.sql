
-- Moderation workflow + provider self-service tables

-- 1) Offers: moderation workflow
ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID;

-- Backfill: existing approved offers -> approved status
UPDATE public.offers SET moderation_status='approved' WHERE approved=true AND moderation_status='draft';

-- Provider can manage own offers (linked via providers.owner_user_id)
DROP POLICY IF EXISTS offers_owner_all ON public.offers;
CREATE POLICY offers_owner_all ON public.offers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = offers.provider_id AND p.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = offers.provider_id AND p.owner_user_id = auth.uid()));

-- Public read: only approved+active
DROP POLICY IF EXISTS offers_public_read ON public.offers;
CREATE POLICY offers_public_read ON public.offers
  FOR SELECT
  USING (
    ((active AND moderation_status='approved') 
     OR has_role(auth.uid(),'admin'::app_role)
     OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id=offers.provider_id AND p.owner_user_id=auth.uid()))
  );

-- 2) Ads: moderation workflow
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID;

UPDATE public.ads SET moderation_status='approved' WHERE active=true AND moderation_status='draft';

DROP POLICY IF EXISTS ads_owner_all ON public.ads;
CREATE POLICY ads_owner_all ON public.ads
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = ads.provider_id AND p.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = ads.provider_id AND p.owner_user_id = auth.uid()));

DROP POLICY IF EXISTS ads_public_read ON public.ads;
CREATE POLICY ads_public_read ON public.ads
  FOR SELECT
  USING (
    ((active AND moderation_status='approved' AND ((starts_at IS NULL) OR (starts_at <= now())) AND ((ends_at IS NULL) OR (ends_at > now())))
     OR has_role(auth.uid(),'admin'::app_role)
     OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id=ads.provider_id AND p.owner_user_id=auth.uid()))
  );

-- 3) Providers: add working hours + whatsapp
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS working_hours JSONB,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- 4) Reviews: allow provider replies
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reply TEXT,
  ADD COLUMN IF NOT EXISTS reply_at TIMESTAMPTZ;

DROP POLICY IF EXISTS reviews_owner_reply ON public.reviews;
CREATE POLICY reviews_owner_reply ON public.reviews
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id::text = reviews.provider_id AND p.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id::text = reviews.provider_id AND p.owner_user_id = auth.uid()));

-- 5) Provider services table
CREATE TABLE IF NOT EXISTS public.provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'YER',
  duration_minutes INTEGER,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_services TO authenticated;
GRANT SELECT ON public.provider_services TO anon;
GRANT ALL ON public.provider_services TO service_role;

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY provider_services_public_read ON public.provider_services FOR SELECT USING (active);
CREATE POLICY provider_services_owner_all ON public.provider_services FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_services.provider_id AND p.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_services.provider_id AND p.owner_user_id = auth.uid()));
CREATE POLICY provider_services_admin_all ON public.provider_services FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_provider_services_updated_at BEFORE UPDATE ON public.provider_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Provider doctors table
CREATE TABLE IF NOT EXISTS public.provider_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  bio TEXT,
  photo_url TEXT,
  years_experience INTEGER,
  schedule JSONB,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_doctors TO authenticated;
GRANT SELECT ON public.provider_doctors TO anon;
GRANT ALL ON public.provider_doctors TO service_role;

ALTER TABLE public.provider_doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY provider_doctors_public_read ON public.provider_doctors FOR SELECT USING (active);
CREATE POLICY provider_doctors_owner_all ON public.provider_doctors FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_doctors.provider_id AND p.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_doctors.provider_id AND p.owner_user_id = auth.uid()));
CREATE POLICY provider_doctors_admin_all ON public.provider_doctors FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_provider_doctors_updated_at BEFORE UPDATE ON public.provider_doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
