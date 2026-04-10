import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Save, Loader2, Camera, Building2, MapPin, Phone, Mail,
  CreditCard, FileText, Bell, Shield, Trash2, KeyRound,
  Crown, Hash, User, X, MapPinned, Landmark,
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { plan } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    business_name: '',
    trading_name: '',
    phone: '',
    email: '',
    address: '',
    postcode: '',
    vat_number: '',
    default_invoice_notes: '',
    default_quote_notes: '',
    bank_name: '',
    account_name: '',
    account_number: '',
    sort_code: '',
    paypal_email: '',
    notify_quote_accepted: true,
    notify_invoice_overdue: true,
    notify_send_receipt: false,
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
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setForm({
        business_name: p.business_name || '',
        trading_name: p.trading_name || '',
        phone: p.phone || '',
        email: p.email || '',
        address: p.address || '',
        postcode: p.postcode || '',
        vat_number: p.vat_number || '',
        default_invoice_notes: p.default_invoice_notes || '',
        default_quote_notes: p.default_quote_notes || '',
        bank_name: p.bank_name || '',
        account_name: p.account_name || '',
        account_number: p.account_number || '',
        sort_code: p.sort_code || '',
        paypal_email: p.paypal_email || '',
        notify_quote_accepted: p.notify_quote_accepted ?? true,
        notify_invoice_overdue: p.notify_invoice_overdue ?? true,
        notify_send_receipt: p.notify_send_receipt ?? false,
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        user_id: user!.id,
        business_name: form.business_name || null,
        trading_name: form.trading_name || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        postcode: form.postcode || null,
        vat_number: form.vat_number || null,
        default_invoice_notes: form.default_invoice_notes || null,
        default_quote_notes: form.default_quote_notes || null,
        bank_name: form.bank_name || null,
        account_name: form.account_name || null,
        account_number: form.account_number || null,
        sort_code: form.sort_code || null,
        paypal_email: form.paypal_email || null,
        notify_quote_accepted: form.notify_quote_accepted,
        notify_invoice_overdue: form.notify_invoice_overdue,
        notify_send_receipt: form.notify_send_receipt,
      };

      if (profile) {
        const { error } = await supabase.from('business_profiles').update(payload).eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('business_profiles').insert(payload);
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
      const path = `${user!.id}/logo.${ext}`;
      await supabase.storage.from('business-logos').remove([path]);
      const { error: uploadError } = await supabase.storage.from('business-logos').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const publicUrl = supabase.storage.from('business-logos').getPublicUrl(path).data.publicUrl;
      if (profile) {
        const { error } = await supabase.from('business_profiles').update({ logo_url: publicUrl }).eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('business_profiles').insert({ user_id: user!.id, logo_url: publicUrl });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success('Logo uploaded');
    },
    onError: () => toast.error('Failed to upload logo'),
  });

  const removeLogoMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.logo_url) return;
      const urlParts = profile.logo_url.split('/business-logos/');
      if (urlParts[1]) {
        await supabase.storage.from('business-logos').remove([urlParts[1]]);
      }
      const { error } = await supabase.from('business_profiles').update({ logo_url: null }).eq('id', profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success('Logo removed');
    },
    onError: () => toast.error('Failed to remove logo'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogoMutation.mutate(file);
    e.target.value = '';
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      toast.error('Failed to send reset email');
    } else {
      toast.success('Password reset email sent — check your inbox');
    }
  };

  const handleDeleteAccount = async () => {
    // Sign the user out — actual account deletion requires admin/edge function
    await signOut();
    toast.success('You have been signed out. Contact support to complete account deletion.');
    navigate('/');
  };

  const formatSortCode = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="space-y-5 pb-6">
        {/* Current Plan */}
        <button
          onClick={() => navigate('/pricing')}
          className="w-full flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 touch-target"
        >
          <span className="text-sm text-muted-foreground">Current Plan</span>
          <Badge className={plan === 'pro' ? 'bg-accent text-accent-foreground' : ''}>
            {plan === 'pro' && <Crown className="h-3 w-3 mr-1" />}
            {plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
        </button>

        {/* 1. Business Profile */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Business Profile
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Building2 className="h-3 w-3" /> Business Name
              </label>
              <Input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="e.g. Smith Plumbing Ltd" className="h-12 text-base" maxLength={100} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <User className="h-3 w-3" /> Your Name / Trading Name
              </label>
              <Input value={form.trading_name} onChange={e => setForm(f => ({ ...f, trading_name: e.target.value }))} placeholder="e.g. John Smith" className="h-12 text-base" maxLength={100} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Phone className="h-3 w-3" /> Business Phone
              </label>
              <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07700 900000" className="h-12 text-base" maxLength={20} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Mail className="h-3 w-3" /> Business Email
              </label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="hello@smithplumbing.co.uk" className="h-12 text-base" maxLength={255} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" /> Business Address
              </label>
              <Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder={"123 High Street\nLondon\nSW1A 1AA"} className="text-base min-h-[80px]" maxLength={500} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <MapPinned className="h-3 w-3" /> Postcode
              </label>
              <Input value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} placeholder="SW1A 1AA" className="h-12 text-base" maxLength={10} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Hash className="h-3 w-3" /> VAT Number
              </label>
              <Input value={form.vat_number} onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))} placeholder="GB 123 4567 89" className="h-12 text-base" maxLength={20} />
              <p className="text-xs text-muted-foreground mt-1">Leave blank if not VAT registered</p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Business Branding */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4" /> Business Branding
            </p>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors shrink-0"
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
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Business Logo</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadLogoMutation.isPending}>
                    {profile?.logo_url ? 'Change' : 'Upload'}
                  </Button>
                  {profile?.logo_url && (
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => removeLogoMutation.mutate()} disabled={removeLogoMutation.isPending}>
                      <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Default Invoice Notes</label>
              <Textarea value={form.default_invoice_notes} onChange={e => setForm(f => ({ ...f, default_invoice_notes: e.target.value }))} placeholder={"Please pay within 14 days.\nBank transfer to Account: 12345678 Sort code: 00-00-00"} className="text-base min-h-[80px]" maxLength={500} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Default Quote Notes</label>
              <Textarea value={form.default_quote_notes} onChange={e => setForm(f => ({ ...f, default_quote_notes: e.target.value }))} placeholder={"This quote is valid for 30 days.\nAll prices include labour and parts unless stated."} className="text-base min-h-[80px]" maxLength={500} />
            </div>
          </CardContent>
        </Card>

        {/* 3. Payment Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment Details
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Bank Name</label>
              <Input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="e.g. Barclays" className="h-12 text-base" maxLength={100} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Account Name</label>
              <Input value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} placeholder="e.g. Smith Plumbing Ltd" className="h-12 text-base" maxLength={100} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Account Number</label>
              <Input value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} placeholder="12345678" className="h-12 text-base" maxLength={8} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort Code</label>
              <Input
                value={form.sort_code}
                onChange={e => setForm(f => ({ ...f, sort_code: formatSortCode(e.target.value) }))}
                placeholder="00-00-00"
                className="h-12 text-base"
                maxLength={8}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">PayPal Email or Payment Link (optional)</label>
              <Input value={form.paypal_email} onChange={e => setForm(f => ({ ...f, paypal_email: e.target.value }))} placeholder="https://paypal.me/yourname" className="h-12 text-base" maxLength={500} />
            </div>
          </CardContent>
        </Card>

        {/* 4. Notifications */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </p>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground">Email me when a customer accepts a quote</span>
              <Switch checked={form.notify_quote_accepted} onCheckedChange={v => setForm(f => ({ ...f, notify_quote_accepted: v }))} />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground">Email me when an invoice is overdue</span>
              <Switch checked={form.notify_invoice_overdue} onCheckedChange={v => setForm(f => ({ ...f, notify_invoice_overdue: v }))} />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground">Send customer a receipt when invoice is marked as paid</span>
              <Switch checked={form.notify_send_receipt} onCheckedChange={v => setForm(f => ({ ...f, notify_send_receipt: v }))} />
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

        {/* 5. Account */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" /> Account
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
              <Input value={user?.email || ''} readOnly className="h-12 text-base bg-muted/50" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-12" onClick={handlePasswordReset}>
                <KeyRound className="h-4 w-4 mr-2" /> Change Password
              </Button>
              <Button variant="outline" className="h-12" onClick={() => navigate('/security')}>
                <Shield className="h-4 w-4 mr-2" /> Security
              </Button>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Danger Zone</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive h-12">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your data including customers, quotes, jobs and invoices. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
