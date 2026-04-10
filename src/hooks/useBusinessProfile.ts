import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBusinessProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['business-profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const buildPaymentDetailsString = () => {
    if (!profile) return '';
    const parts: string[] = [];
    if (profile.bank_name) parts.push(`Bank: ${profile.bank_name}`);
    if (profile.account_name) parts.push(`Account: ${profile.account_name}`);
    if (profile.account_number) parts.push(`Acc No: ${profile.account_number}`);
    if (profile.sort_code) parts.push(`Sort: ${profile.sort_code}`);
    if (profile.paypal_email) parts.push(`PayPal: ${profile.paypal_email}`);
    if (profile.payment_link) parts.push(`Payment link: ${profile.payment_link}`);
    return parts.join(' | ');
  };

  const getLogoUrl = () => {
    if (!profile?.logo_url) return '';
    return profile.logo_url;
  };

  const getInvoiceTemplateData = () => {
    const pd = buildPaymentDetailsString();
    const data: Record<string, any> = {
      businessName: profile?.business_name || '',
      businessAddress: profile?.address || '',
      businessPhone: profile?.phone || '',
      businessLogo: getLogoUrl(),
      defaultInvoiceNotes: profile?.default_invoice_notes || '',
    };
    if (pd) data.paymentDetails = pd;
    if (profile?.vat_number) data.vatNumber = profile.vat_number;
    return data;
  };

  return {
    profile,
    isLoading,
    buildPaymentDetailsString,
    getLogoUrl,
    getInvoiceTemplateData,
  };
}
