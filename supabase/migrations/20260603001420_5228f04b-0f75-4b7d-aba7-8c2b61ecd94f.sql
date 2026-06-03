
-- ============== CITIES ==============
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cities TO anon, authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY cities_public_read ON public.cities FOR SELECT TO anon, authenticated USING (active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY cities_admin_all ON public.cities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============== ACCESS TOKENS (private hidden URLs) ==============
CREATE TYPE public.token_kind AS ENUM ('admin', 'provider', 'reception');

CREATE TABLE public.access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  kind public.token_kind NOT NULL,
  label text,
  provider_id uuid REFERENCES public.providers(id) ON DELETE CASCADE,
  reception_user_id uuid,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  last_used_at timestamptz,
  uses_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_access_tokens_token ON public.access_tokens(token);
GRANT SELECT ON public.access_tokens TO anon, authenticated;
GRANT ALL ON public.access_tokens TO service_role;
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
-- Public read by token only happens through the validate function; but allow lookup by exact token via RPC
CREATE POLICY access_tokens_admin_all ON public.access_tokens FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY access_tokens_anon_lookup ON public.access_tokens FOR SELECT TO anon, authenticated USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- ============== RECEPTION USERS ==============
CREATE TABLE public.reception_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  employee_name text,
  phone text,
  photo_url text,
  permissions jsonb NOT NULL DEFAULT '{"appointments":true,"qr_scan":true,"checkin":true}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reception_users TO authenticated;
GRANT ALL ON public.reception_users TO service_role;
ALTER TABLE public.reception_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY reception_owner_all ON public.reception_users FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.owner_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.owner_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY reception_anon_lookup ON public.reception_users FOR SELECT TO anon USING (active = true);

ALTER TABLE public.access_tokens
  ADD CONSTRAINT access_tokens_reception_fk FOREIGN KEY (reception_user_id) REFERENCES public.reception_users(id) ON DELETE CASCADE;

-- ============== HOME SECTIONS ==============
CREATE TABLE public.home_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text,
  section_type text NOT NULL DEFAULT 'providers', -- providers | doctors | banner | categories | offers
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_sections TO anon, authenticated;
GRANT ALL ON public.home_sections TO service_role;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY home_sections_public_read ON public.home_sections FOR SELECT TO anon, authenticated
  USING (visible = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY home_sections_admin_all ON public.home_sections FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============== NOTIFICATIONS ==============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'system', -- system | booking | promo | alert
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own_all ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============== TRIGGERS ==============
CREATE TRIGGER trg_cities_updated BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_reception_updated BEFORE UPDATE ON public.reception_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_home_sections_updated BEFORE UPDATE ON public.home_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== SEED CITIES ==============
INSERT INTO public.cities (name_ar, name_en, sort_order) VALUES
  ('عدن','Aden',1),('صنعاء','Sanaa',2),('تعز','Taiz',3),
  ('المكلا','Mukalla',4),('إب','Ibb',5),('الحديدة','Hodeidah',6),
  ('سيئون','Seiyun',7),('ذمار','Dhamar',8);

-- ============== SEED HOME SECTIONS ==============
INSERT INTO public.home_sections (key, title_ar, section_type, sort_order) VALUES
  ('hero','العروض المميزة','banner',1),
  ('categories','التخصصات','categories',2),
  ('featured_providers','مراكز موصى بها','providers',3),
  ('top_doctors','أفضل الأطباء','doctors',4),
  ('offers','عروض حصرية','offers',5);
