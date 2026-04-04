import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, CheckCircle, Clock, Receipt, Send } from 'lucide-react';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', invoiceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice marked as paid');
    },
  });

  return (
    <AppLayout
      title="Invoices"
      action={
        <Button size="sm" onClick={() => navigate('/invoices/new')} className="touch-target">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No invoices yet</p>
          <Button onClick={() => navigate('/invoices/new')}>
            <Plus className="h-4 w-4 mr-1" /> Create First Invoice
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{inv.customers?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{inv.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-lg font-bold text-foreground">£{Number(inv.amount).toFixed(0)}</p>
                  <span className={`text-xs font-medium ${inv.status === 'paid' ? 'text-success' : 'text-destructive'}`}>
                    {inv.status === 'paid' ? '✓ Paid' : '• Unpaid'}
                  </span>
                </div>
              </div>
              {inv.status !== 'paid' && (
                <Button
                  size="sm"
                  className="w-full mt-3 touch-target bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => markPaidMutation.mutate(inv.id)}
                  disabled={markPaidMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark as Paid
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
