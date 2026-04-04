import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Save, Loader2, Camera, Building2, MapPin,
  CreditCard, FileText, LogOut, Shield, Hash,
} from 'lucide-react';

interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  logo_url: string | null;
  address: string | null;
  vat_number: string | null;
  payment_details: string | null;
  payment_link: string | null;
  default_invoice_terms: string | null;
  default_invoice_notes: string | null;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    business_name: '',
    address: '',
    vat_number: '',
    payment_details: '',
    payment_link: '',
    default_invoice_terms: '',
    default_invoice_notes: '',
  });

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
      return data as BusinessProfile | null;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        business_name: profile.business_name || '',
        address: profile.address || '',
        vat_number: profile.vat_number || '',
        payment_details: profile.payment_details || '',
        payment_link: profile.payment_link || '',
        default_invoice_terms: profile.default_invoice_terms || '',
        default_invoice_notes: profile.default_invoice_notes || '',
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        business_name: form.business_name || null,
        address: form.address || null,
        vat_number: form.vat_number || null,
        payment_details: form.payment_details || null,
        payment_link: form.payment_link || null,
        default_invoice_terms: form.default_invoice_terms || null,
        default_invoice_notes: form.default_invoice_notes || null,
      };

      if (profile) {
        const { error } = await supabase
          .from('business_profiles')
          .update(payload)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_profiles')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `logo.${ext}`;
      const path = `${user!.id}/${fileName}`;

      // Remove old logo if exists
      await supabase.storage.from('business-logos').remove([path]);

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage
        .from('business-logos')
        .getPublicUrl(path).data.publicUrl;

      // Upsert profile with logo URL
      if (profile) {
        const { error } = await supabase
          .from('business_profiles')
          .update({ logo_url: publicUrl })
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_profiles')
          .insert({ user_id: user!.id, logo_url: publicUrl });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success('Logo uploaded');
    },
    onError: () => toast.error('Failed to upload logo'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogoMutation.mutate(file);
    e.target.value = '';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings">
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="space-y-4 pb-4">
        {/* Logo & Business Name */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadLogoMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Business Logo</p>
                <Button
                  size="sm" variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLogoMutation.isPending}
                >
                  {profile?.logo_url ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Building2 className="h-3 w-3" /> Business Name
              </label>
              <Input
                value={form.business_name}
                onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                placeholder="e.g. Smith Plumbing Ltd"
                className="h-12 text-base"
                maxLength={100}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" /> Business Address
              </label>
              <Textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123 High Street&#10;London&#10;SW1A 1AA"
                className="text-base min-h-[80px]"
                maxLength={500}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Hash className="h-3 w-3" /> VAT Number
              </label>
              <Input
                value={form.vat_number}
                onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))}
                placeholder="GB 123 4567 89 (leave blank if not VAT registered)"
                className="h-12 text-base"
                maxLength={20}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment Details
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Bank Details (shown on invoices)
              </label>
              <Textarea
                value={form.payment_details}
                onChange={e => setForm(f => ({ ...f, payment_details: e.target.value }))}
                placeholder="Sort Code: 12-34-56&#10;Account: 12345678&#10;Account Name: Smith Plumbing Ltd"
                className="text-base min-h-[80px]"
                maxLength={500}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Payment Link (optional)
              </label>
              <Input
                value={form.payment_link}
                onChange={e => setForm(f => ({ ...f, payment_link: e.target.value }))}
                placeholder="https://pay.me/your-link"
                className="h-12 text-base"
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Invoice Terms */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Default Invoice Settings
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Default Payment Terms
              </label>
              <Input
                value={form.default_invoice_terms}
                onChange={e => setForm(f => ({ ...f, default_invoice_terms: e.target.value }))}
                placeholder="e.g. Payment due within 14 days"
                className="h-12 text-base"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Default Invoice Notes
              </label>
              <Textarea
                value={form.default_invoice_notes}
                onChange={e => setForm(f => ({ ...f, default_invoice_notes: e.target.value }))}
                placeholder="e.g. Thank you for your business. Please include the invoice number as a payment reference."
                className="text-base min-h-[80px]"
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <Button
          className="w-full h-14 text-base font-semibold"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Saving...</>
          ) : (
            <><Save className="h-5 w-5 mr-2" /> Save Settings</>
          )}
        </Button>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12" onClick={() => navigate('/security')}>
            <Shield className="h-4 w-4 mr-2" /> Security
          </Button>
          <Button variant="outline" className="h-12 text-destructive hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
