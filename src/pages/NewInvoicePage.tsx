import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');

  const [form, setForm] = useState({ customer_id: '', description: '', amount: '', job_id: jobId || '' });
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 14));

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('id, name').eq('user_id', user!.id).order('name');
      if (error) throw error;
      return data;
    },
  });

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
        due_date: format(dueDate, 'yyyy-MM-dd'),
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

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full h-12 justify-start text-left font-normal text-base")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dueDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(d) => d && setDueDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Invoice'}
        </Button>
      </form>
    </AppLayout>
  );
}
