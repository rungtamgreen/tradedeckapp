
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS postcode text,
  ADD COLUMN IF NOT EXISTS trading_name text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS account_name text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS sort_code text,
  ADD COLUMN IF NOT EXISTS paypal_email text,
  ADD COLUMN IF NOT EXISTS default_quote_notes text,
  ADD COLUMN IF NOT EXISTS notify_quote_accepted boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_invoice_overdue boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_send_receipt boolean NOT NULL DEFAULT false;
