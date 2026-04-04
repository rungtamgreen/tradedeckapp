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
import { ArrowLeft, CheckCircle, XCircle, Clock, Briefcase, Send, Loader2, Pencil, Save, X, AlertTriangle } from 'lucide-react';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', price: '', expires_at: '' });

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quote', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, customers(name)')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedJob } = useQuery({
    queryKey: ['quote-job', id],
    enabled: !!user && !!id && quote?.status === 'accepted',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('quote_id', id!)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', id!);
      if (updateError) throw updateError;

      const { error: jobError } = await supabase.from('jobs').insert({
        user_id: user!.id,
        customer_id: quote!.customer_id,
        quote_id: quote!.id,
        description: quote!.description,
        price: quote!.price,
        status: 'scheduled',
      });
      if (jobError) throw jobError;
    },
    onSuccess: () => {
      toast.success('Quote accepted — job created!');
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quote-job', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: () => toast.error('Failed to accept quote'),
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'declined' })
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Quote declined');
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: () => toast.error('Failed to decline quote'),
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-quote-email', {
        body: { quoteId: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => toast.success('Quote emailed to customer!'),
    onError: (err: any) => toast.error(err.message || 'Failed to send email'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updates: any = {
        description: editForm.description,
        price: parseFloat(editForm.price),
      };
      updates.expires_at = editForm.expires_at || null;
      const { error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote updated');
    },
    onError: () => toast.error('Failed to update quote'),
  });

  const startEditing = () => {
    if (!quote) return;
    setEditForm({
      description: quote.description,
      price: String(quote.price),
      expires_at: (quote as any).expires_at || '',
    });
    setEditing(true);
  };

  if (isLoading) {
    return (
      <AppLayout title="Quote" action={<Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </AppLayout>
    );
  }

  if (!quote) {
    return (
      <AppLayout title="Quote" action={<Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <p className="text-center text-muted-foreground py-12">Quote not found</p>
      </AppLayout>
    );
  }

  const isExpired = quote.status === 'pending' && (quote as any).expires_at && new Date((quote as any).expires_at) < new Date();
  const displayStatus = isExpired ? 'expired' : quote.status;
  const StatusIcon = displayStatus === 'accepted' ? CheckCircle : displayStatus === 'declined' ? XCircle : displayStatus === 'expired' ? AlertTriangle : Clock;

  return (
    <AppLayout
      title="Quote Details"
      action={<Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}><ArrowLeft className="h-5 w-5" /></Button>}
    >
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-foreground">{(quote as any).customers?.name || 'Unknown'}</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
              displayStatus === 'accepted' ? 'bg-green-500/10 text-green-600' :
              displayStatus === 'declined' ? 'bg-destructive/10 text-destructive' :
              displayStatus === 'expired' ? 'bg-destructive/10 text-destructive' :
              'bg-accent/10 text-accent'
            }`}>
              <StatusIcon className="h-3 w-3" />
              {displayStatus}
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground">£</span>
                <Input
                  type="number" step="0.01" min="0"
                  value={editForm.price}
                  onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                  className="h-12 text-base pl-8" placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Valid until</label>
                <Input
                  type="date"
                  value={editForm.expires_at}
                  onChange={e => setEditForm(f => ({ ...f, expires_at: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{quote.description}</p>
              <p className="text-2xl font-bold text-foreground">£{Number(quote.price).toFixed(2)}</p>
              {(quote as any).expires_at && (
                <p className={`text-xs ${isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  Valid until: {new Date((quote as any).expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Created {new Date(quote.created_at).toLocaleDateString()}</p>
            </>
          )}
        </CardContent>
      </Card>

      {quote.status === 'pending' && !editing && (
        <div className="space-y-3 mb-4">
          <Button
            size="lg"
            className="w-full h-14 text-base bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => sendEmailMutation.mutate()}
            disabled={sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...</>
            ) : (
              <><Send className="h-5 w-5 mr-2" /> Send Quote to Customer</>
            )}
          </Button>
          <div className="grid grid-cols-3 gap-3">
            <Button
              size="lg"
              className="h-14 text-base"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Accept
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 text-base"
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
            >
              <XCircle className="h-5 w-5 mr-2" />
              Decline
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 text-base"
              onClick={startEditing}
            >
              <Pencil className="h-5 w-5 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}

      {linkedJob && (
        <Card
          className="cursor-pointer active:bg-muted/50 transition-colors"
          onClick={() => navigate(`/jobs/${linkedJob.id}`)}
        >
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