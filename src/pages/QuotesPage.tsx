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
import { ArrowLeft, Plus, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-accent/10 text-accent',
  accepted: 'bg-success/10 text-success',
  declined: 'bg-destructive/10 text-destructive',
};

export default function QuotesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, customers(name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'accepted') return <CheckCircle className="h-4 w-4" />;
    if (status === 'declined') return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <AppLayout
      title="Quotes"
      action={
        <Button size="sm" onClick={() => navigate('/quotes/new')} className="touch-target">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No quotes yet</p>
          <Button onClick={() => navigate('/quotes/new')}>
            <Plus className="h-4 w-4 mr-1" /> Create First Quote
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map((q: any) => (
            <button
              key={q.id}
              onClick={() => navigate(`/quotes/${q.id}`)}
              className="w-full bg-card border border-border rounded-lg p-4 flex items-center justify-between touch-target text-left active:bg-muted transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{q.customers?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground truncate">{q.description}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-sm font-bold text-foreground">£{Number(q.price).toFixed(0)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusColors[q.status] || ''}`}>
                  <StatusIcon status={q.status} />
                  {q.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
