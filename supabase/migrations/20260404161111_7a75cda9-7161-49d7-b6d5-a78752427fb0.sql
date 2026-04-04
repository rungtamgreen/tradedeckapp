
CREATE TABLE public.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  business_name text,
  logo_url text,
  address text,
  vat_number text,
  payment_details text,
  payment_link text,
  default_invoice_terms text,
  default_invoice_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.business_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.business_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.business_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own logo"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own logo"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view business logos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'business-logos');
