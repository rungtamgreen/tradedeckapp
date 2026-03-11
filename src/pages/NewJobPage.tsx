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

export default function NewJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ customer_id: '', description: '', price: '', scheduled_date: '' });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('id, name').eq('user_id', user!.id).order('name');
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('jobs').insert({
        user_id: user!.id,
        customer_id: form.customer_id,
        description: form.description,
        price: parseFloat(form.price),
        scheduled_date: form.scheduled_date || null,
        status: 'scheduled',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Job created!');
      navigate('/jobs');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AppLayout
      title="New Job"
      action={<Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target"><ArrowLeft className="h-5 w-5" /></Button>}
    >
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full h-12 rounded-lg border border-input bg-card px-3 text-base text-foreground" required>
          <option value="">Select customer *</option>
          {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Textarea placeholder="Job description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="text-base min-h-[100px]" required />
        <Input placeholder="Price (£) *" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="h-12 text-base" required />
        <Input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} className="h-12 text-base" />
        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Job'}
        </Button>
      </form>
    </AppLayout>
  );
}
