import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Clock, Send, Pencil, X, Save, Loader2, Briefcase } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', amount: '' });

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(name, email)')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedJob } = useQuery({
    queryKey: ['invoice-job', invoice?.job_id],
    enabled: !!user && !!invoice?.job_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', invoice!.job_id!)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice marked as paid');
    },
    onError: () => toast.error('Failed to update invoice'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('invoices')
        .update({
          description: editForm.description,
          amount: parseFloat(editForm.amount),
        })
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated');
    },
    onError: () => toast.error('Failed to update invoice'),
  });

  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      const email = (invoice as any)?.customers?.email;
      if (!email) throw new Error('Customer has no email address');
      const { error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'invoice-reminder',
          recipientEmail: email,
          idempotencyKey: `invoice-reminder-${id}-${Date.now()}`,
          templateData: {
            customerName: (invoice as any)?.customers?.name,
            invoiceDescription: invoice?.description,
            invoiceAmount: `£${Number(invoice?.amount).toFixed(2)}`,
            dueDate: invoice?.due_date
              ? new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
              : undefined,
          },
        },
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success('Payment reminder sent'),
    onError: (err: any) => toast.error(err.message || 'Failed to send reminder'),
  });

  const startEditing = () => {
    if (!invoice) return;
    setEditForm({ description: invoice.description, amount: String(invoice.amount) });
    setEditing(true);
  };

  if (isLoading) {
    return (
      <AppLayout title="Invoice" action={<Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout title="Invoice" action={<Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <p className="text-center text-muted-foreground py-12">Invoice not found</p>
      </AppLayout>
    );
  }

  const isPaid = invoice.status === 'paid';

  return (
    <AppLayout
      title="Invoice Details"
      action={<Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}><ArrowLeft className="h-5 w-5" /></Button>}
    >
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-foreground">{(invoice as any).customers?.name || 'Unknown'}</p>
              {invoice.invoice_number && (
                <p className="text-xs text-muted-foreground font-mono">{invoice.invoice_number}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
              isPaid ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}>
              {isPaid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {isPaid ? 'Paid' : 'Unpaid'}
            </span>
          </div>

          {editing ? (
            <div className="space-y-3">
              <Textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                className="text-base min-h-[80px]"
                placeholder="Description"
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editForm.amount}
                onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                className="h-12 text-base"
                placeholder="Amount (£)"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{invoice.description}</p>
              <p className="text-2xl font-bold text-foreground">£{Number(invoice.amount).toFixed(2)}</p>
              {(invoice as any).vat_included && (() => {
                const gross = Number(invoice.amount);
                const net = gross / 1.2;
                const vat = gross - net;
                return (
                  <div className="rounded-lg bg-muted/50 px-3 py-2 space-y-0.5 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>Net</span><span>£{net.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>VAT (20%)</span><span>£{vat.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold text-foreground"><span>Total</span><span>£{gross.toFixed(2)}</span></div>
                  </div>
                );
              })()}
              {invoice.due_date && (() => {
                const isOverdue = !isPaid && new Date(invoice.due_date) < new Date();
                return (
                  <p className={`text-xs ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                    {isOverdue ? '⚠ Overdue — ' : 'Due: '}
                    {new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                );
              })()}
              {invoice.paid_at && (
                <p className="text-xs text-muted-foreground">
                  Paid: {new Date(invoice.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Created {new Date(invoice.created_at).toLocaleDateString()}
              </p>
              {invoice.invoice_number && (
                <p className="text-xs text-muted-foreground">Ref: {invoice.invoice_number}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!editing && !isPaid && (
        <div className="space-y-3 mb-4">
          <Button
            size="lg"
            className="w-full h-14 text-base bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => sendReminderMutation.mutate()}
            disabled={sendReminderMutation.isPending}
          >
            {sendReminderMutation.isPending ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...</>
            ) : (
              <><Send className="h-5 w-5 mr-2" /> Send Payment Reminder</>
            )}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" className="h-14 text-base" onClick={startEditing}>
              <Pencil className="h-5 w-5 mr-2" /> Edit
            </Button>
            <Button
              size="lg"
              className="h-14 text-base bg-success text-success-foreground hover:bg-success/90"
              onClick={() => markPaidMutation.mutate()}
              disabled={markPaidMutation.isPending}
            >
              <CheckCircle className="h-5 w-5 mr-2" /> Mark Paid
            </Button>
          </div>
        </div>
      )}

      {!editing && isPaid && (
        <div className="mb-4">
          <Button size="lg" variant="outline" className="w-full h-14 text-base" onClick={startEditing}>
            <Pencil className="h-5 w-5 mr-2" /> Edit Invoice
          </Button>
        </div>
      )}

      {linkedJob && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Linked Job</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{linkedJob.description}</p>
                <p className="text-xs text-muted-foreground">Status: {linkedJob.status}</p>
              </div>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
