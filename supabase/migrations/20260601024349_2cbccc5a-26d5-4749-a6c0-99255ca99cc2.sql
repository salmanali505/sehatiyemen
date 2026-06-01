
CREATE TYPE public.record_type AS ENUM ('prescription','lab_result','radiology','diagnosis','vaccination','other');

CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_member_id UUID,
  title TEXT NOT NULL,
  record_type public.record_type NOT NULL DEFAULT 'other',
  description TEXT,
  provider_name TEXT,
  doctor_name TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_records TO authenticated;
GRANT ALL ON public.health_records TO service_role;

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "records_select_own" ON public.health_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "records_insert_own" ON public.health_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "records_update_own" ON public.health_records FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "records_delete_own" ON public.health_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_records_updated BEFORE UPDATE ON public.health_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow users to delete their own bookings (cancel)
CREATE POLICY "bookings_delete_own" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
