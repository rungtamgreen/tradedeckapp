
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    SELECT COALESCE(MAX(
      CASE 
        WHEN invoice_number ~ '^INV-[0-9]+$' 
        THEN CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)
        ELSE 0 
      END
    ), 0) + 1
    INTO next_num
    FROM public.invoices
    WHERE user_id = NEW.user_id;

    NEW.invoice_number := 'INV-' || LPAD(next_num::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_number();
