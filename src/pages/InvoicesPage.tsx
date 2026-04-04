import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, CheckCircle, Clock, Send, X, AlertTriangle, Mail } from 'lucide-react';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(name, email)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = statusFilter
    ? invoices.filter((inv: any) => inv.status === statusFilter)
    : invoices;

  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      setPendingAction(`paid-${invoiceId}`);
      const { error } = await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', invoiceId);
      if (error) throw error;
    },
    onSettled: () => setPendingAction(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice marked as paid');
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (invoice: any) => {
      setPendingAction(`reminder-${invoice.id}`);
      const email = invoice.customers?.email;
      if (!email) throw new Error('Customer has no email address');
      const { error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'invoice-reminder',
          recipientEmail: email,
          idempotencyKey: `invoice-reminder-${invoice.id}-${Date.now()}`,
          templateData: {
            customerName: invoice.customers?.name,
            invoiceDescription: invoice.description,
            invoiceAmount: `£${Number(invoice.amount).toFixed(2)}`,
            dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined,
          },
        },
      });
      if (error) throw error;
    },
    onSettled: () => setPendingAction(null),
    onSuccess: () => toast.success('Payment reminder sent'),
    onError: (err: any) => toast.error(err.message || 'Failed to send reminder'),
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoice: any) => {
      setPendingAction(`send-${invoice.id}`);
      const email = invoice.customers?.email;
      if (!email) throw new Error('Customer has no email address');
      const { error: fnError } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'invoice-send',
          recipientEmail: email,
          idempotencyKey: `invoice-send-${invoice.id}`,
          templateData: {
            customerName: invoice.customers?.name,
            invoiceNumber: invoice.invoice_number,
            invoiceDescription: invoice.description,
            invoiceAmount: `£${Number(invoice.amount).toFixed(2)}`,
            dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined,
          },
        },
      });
      if (fnError) throw fnError;
      const { error: updateError } = await supabase.from('invoices').update({ sent: true } as any).eq('id', invoice.id);
      if (updateError) throw updateError;
    },
    onSettled: () => setPendingAction(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice sent to customer');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to send invoice'),
  });

  const isOverdue = (inv: any) =>
    inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date();

  const filterLabel: Record<string, string> = {
    unpaid: 'Unpaid Invoices',
    paid: 'Paid Invoices',
  };

  return (
    <AppLayout
      title="Invoices"
      back
      action={
        <Button size="sm" onClick={() => navigate('/invoices/new')} className="touch-target">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      }
    >
      {statusFilter && (
        <div className="mb-4">
          <Badge variant="secondary" className="text-sm px-3 py-1.5 gap-1.5">
            Showing: {filterLabel[statusFilter] || statusFilter}
            <button
              onClick={() => setSearchParams({})}
              className="ml-1 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{statusFilter ? 'No matching invoices' : 'No invoices yet'}</p>
          {!statusFilter && (
            <Button onClick={() => navigate('/invoices/new')}>
              <Plus className="h-4 w-4 mr-1" /> Create First Invoice
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv: any) => (
            <div key={inv.id} className="bg-card border border-border rounded-lg p-4 cursor-pointer active:bg-muted/50" onClick={() => navigate(`/invoices/${inv.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{inv.customers?.name || 'Unknown'}</p>
                    {inv.invoice_number && (
                      <span className="text-xs text-muted-foreground font-mono">{inv.invoice_number}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{inv.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-lg font-bold text-foreground">£{Number(inv.amount).toFixed(2)}</p>
                  {isOverdue(inv) ? (
                    <span className="text-xs font-semibold text-destructive flex items-center justify-end gap-1">
                      <AlertTriangle className="h-3 w-3" /> Overdue
                    </span>
                  ) : (
                    <span className={`text-xs font-medium ${inv.status === 'paid' ? 'text-success' : 'text-destructive'}`}>
                      {inv.status === 'paid' ? '✓ Paid' : '• Unpaid'}
                    </span>
                  )}
                </div>
              </div>
              {inv.status !== 'paid' && (
                <div className="flex gap-2 mt-3">
                  {!inv.sent ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 touch-target"
                      onClick={(e) => { e.stopPropagation(); sendInvoiceMutation.mutate(inv); }}
                      disabled={pendingAction === `send-${inv.id}`}
                    >
                      <Mail className="h-4 w-4 mr-1" /> {pendingAction === `send-${inv.id}` ? 'Sending...' : 'Send Invoice'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 touch-target"
                      onClick={(e) => { e.stopPropagation(); sendReminderMutation.mutate(inv); }}
                      disabled={pendingAction === `reminder-${inv.id}`}
                    >
                      <Send className="h-4 w-4 mr-1" /> {pendingAction === `reminder-${inv.id}` ? 'Sending...' : 'Send Reminder'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1 touch-target bg-success text-success-foreground hover:bg-success/90"
                    onClick={(e) => { e.stopPropagation(); markPaidMutation.mutate(inv.id); }}
                    disabled={pendingAction === `paid-${inv.id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> {pendingAction === `paid-${inv.id}` ? 'Updating...' : 'Mark as Paid'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
