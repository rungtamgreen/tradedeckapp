import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');

  const [form, setForm] = useState({ customer_id: '', description: '', amount: '', job_id: jobId || '' });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('id, name').eq('user_id', user!.id).order('name');
      if (error) throw error;
      return data;
    },
  });

  // Pre-fill from job if job_id is provided
  useEffect(() => {
    if (jobId && user) {
      supabase.from('jobs').select('*').eq('id', jobId).single().then(({ data }) => {
        if (data) {
          setForm(f => ({
            ...f,
            customer_id: data.customer_id,
            description: data.description || '',
            amount: String(data.price || ''),
            job_id: data.id,
          }));
        }
      });
    }
  }, [jobId, user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('invoices').insert({
        user_id: user!.id,
        customer_id: form.customer_id,
        job_id: form.job_id || null,
        description: form.description,
        amount: parseFloat(form.amount),
        status: 'unpaid',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice created!');
      navigate('/invoices');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AppLayout
      title="New Invoice"
      action={<Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target"><ArrowLeft className="h-5 w-5" /></Button>}
    >
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full h-12 rounded-lg border border-input bg-card px-3 text-base text-foreground" required>
          <option value="">Select customer *</option>
          {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Textarea placeholder="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="text-base min-h-[80px]" required />
        <Input placeholder="Amount (£) *" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="h-12 text-base" required />
        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Invoice'}
        </Button>
      </form>
    </AppLayout>
  );
}
