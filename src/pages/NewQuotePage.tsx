import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewQuotePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ customer_id: '', description: '', price: '' });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('user_id', user!.id)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('quotes').insert({
        user_id: user!.id,
        customer_id: form.customer_id,
        description: form.description,
        price: parseFloat(form.price),
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Quote created!');
      navigate('/quotes');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AppLayout
      title="New Quote"
      action={
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <select
          value={form.customer_id}
          onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
          className="w-full h-12 rounded-lg border border-input bg-card px-3 text-base text-foreground"
          required
        >
          <option value="">Select customer *</option>
          {customers.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Textarea
          placeholder="Job description *"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="text-base min-h-[100px]"
          required
        />
        <Input
          placeholder="Price (£) *"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          className="h-12 text-base"
          required
        />
        <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : '⚡ Send Quote'}
        </Button>
      </form>
    </AppLayout>
  );
}
