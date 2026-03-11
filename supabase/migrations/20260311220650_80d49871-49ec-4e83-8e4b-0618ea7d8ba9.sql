
-- Store user security preferences (lock method)
CREATE TABLE public.user_security (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lock_method text NOT NULL DEFAULT 'none', -- 'none', 'pin', 'passkey'
  pin_hash text, -- bcrypt hash of 4-digit PIN
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own security settings" ON public.user_security
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security settings" ON public.user_security
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" ON public.user_security
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Store passkey credentials
CREATE TABLE public.user_passkeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id text NOT NULL,
  public_key text NOT NULL,
  name text NOT NULL DEFAULT 'My Device',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(credential_id)
);

ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passkeys" ON public.user_passkeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passkeys" ON public.user_passkeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passkeys" ON public.user_passkeys
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add updated_at trigger to user_security
CREATE TRIGGER update_user_security_updated_at
  BEFORE UPDATE ON public.user_security
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
