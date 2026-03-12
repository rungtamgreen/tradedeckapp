import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, Clock, Briefcase } from 'lucide-react';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const StatusIcon = quote.status === 'accepted' ? CheckCircle : quote.status === 'declined' ? XCircle : Clock;

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
              quote.status === 'accepted' ? 'bg-green-500/10 text-green-600' :
              quote.status === 'declined' ? 'bg-destructive/10 text-destructive' :
              'bg-accent/10 text-accent'
            }`}>
              <StatusIcon className="h-3 w-3" />
              {quote.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{quote.description}</p>
          <p className="text-2xl font-bold text-foreground">£{Number(quote.price).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Created {new Date(quote.created_at).toLocaleDateString()}</p>
        </CardContent>
      </Card>

      {quote.status === 'pending' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
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
