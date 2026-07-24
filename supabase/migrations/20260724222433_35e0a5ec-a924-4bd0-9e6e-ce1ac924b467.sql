
-- ===== Performance indexes =====
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment ON public.bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);

CREATE INDEX IF NOT EXISTS idx_providers_city ON public.providers(city);
CREATE INDEX IF NOT EXISTS idx_providers_type ON public.providers(type);
CREATE INDEX IF NOT EXISTS idx_providers_status ON public.providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_verified ON public.providers(verified);
CREATE INDEX IF NOT EXISTS idx_providers_featured ON public.providers(featured);
CREATE INDEX IF NOT EXISTS idx_providers_owner ON public.providers(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON public.provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_doctors_provider ON public.provider_doctors(provider_id);

CREATE INDEX IF NOT EXISTS idx_offers_provider_status ON public.offers(provider_id, moderation_status);
CREATE INDEX IF NOT EXISTS idx_ads_provider_status ON public.ads(provider_id, moderation_status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);

-- ===== Feature Flags =====
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  audience TEXT NOT NULL DEFAULT 'all', -- all | admin | providers | patients
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feature_flags TO authenticated, anon;
GRANT ALL ON public.feature_flags TO service_role;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags read all" ON public.feature_flags
  FOR SELECT USING (true);

CREATE POLICY "feature_flags admin write" ON public.feature_flags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_feature_flags_updated
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default flags
INSERT INTO public.feature_flags (key, enabled, description, audience) VALUES
  ('payments_online', false, 'تفعيل الدفع الإلكتروني (Stripe/Paddle)', 'all'),
  ('telegram_notifications', true, 'إشعارات تيليجرام للمزوّدين', 'providers'),
  ('ai_assistant', true, 'المساعد الذكي', 'patients'),
  ('family_module', true, 'إدارة أفراد العائلة', 'patients'),
  ('health_records', true, 'السجلات الصحية', 'patients'),
  ('phone_auth', false, 'التسجيل برقم الهاتف', 'all'),
  ('password_reset', false, 'استعادة كلمة المرور', 'all')
ON CONFLICT (key) DO NOTHING;

-- ===== Audit Logging =====
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _entity TEXT,
  _entity_id TEXT DEFAULT NULL,
  _meta JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _email TEXT;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.audit_logs (actor_id, actor_email, action, entity, entity_id, meta)
  VALUES (auth.uid(), _email, _action, _entity, _entity_id, _meta);
EXCEPTION WHEN OTHERS THEN
  -- never break the parent transaction because of logging
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_audit_row() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _action TEXT;
  _id TEXT;
  _meta JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _action := 'create';
    _id := COALESCE(NEW.id::text, NULL);
    _meta := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    _action := 'update';
    _id := COALESCE(NEW.id::text, NULL);
    _meta := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));
  ELSE
    _action := 'delete';
    _id := COALESCE(OLD.id::text, NULL);
    _meta := to_jsonb(OLD);
  END IF;

  PERFORM public.log_audit_event(_action, TG_TABLE_NAME, _id, _meta);
  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_providers ON public.providers;
CREATE TRIGGER trg_audit_providers AFTER INSERT OR UPDATE OR DELETE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

DROP TRIGGER IF EXISTS trg_audit_offers ON public.offers;
CREATE TRIGGER trg_audit_offers AFTER INSERT OR UPDATE OR DELETE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

DROP TRIGGER IF EXISTS trg_audit_ads ON public.ads;
CREATE TRIGGER trg_audit_ads AFTER INSERT OR UPDATE OR DELETE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

DROP TRIGGER IF EXISTS trg_audit_packages ON public.packages;
CREATE TRIGGER trg_audit_packages AFTER INSERT OR UPDATE OR DELETE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

DROP TRIGGER IF EXISTS trg_audit_subscriptions ON public.subscriptions;
CREATE TRIGGER trg_audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

DROP TRIGGER IF EXISTS trg_audit_system_settings ON public.system_settings;
CREATE TRIGGER trg_audit_system_settings AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

DROP TRIGGER IF EXISTS trg_audit_feature_flags ON public.feature_flags;
CREATE TRIGGER trg_audit_feature_flags AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
