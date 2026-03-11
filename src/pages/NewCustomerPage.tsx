import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('customers').insert({
        user_id: user!.id,
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer added');
      navigate('/customers');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AppLayout
      title="New Customer"
      action={
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <form
        onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        className="space-y-4"
      >
        <Input placeholder="Customer name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-12 text-base" required />
        <Input placeholder="Phone number" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-12 text-base" />
        <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-12 text-base" />
        <Textarea placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="text-base min-h-[80px]" />
        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Customer'}
        </Button>
      </form>
    </AppLayout>
  );
}
