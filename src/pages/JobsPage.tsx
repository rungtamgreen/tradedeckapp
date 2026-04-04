import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, ChevronRight, CheckCircle, Clock } from 'lucide-react';

export default function JobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, customers(name, email)')
        .eq('user_id', user!.id)
        .order('scheduled_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (job: any) => {
      const { error } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', job.id);
      if (error) throw error;

      // Send job-completed notification if customer has email
      if (job.customers?.email) {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'job-completed',
            recipientEmail: job.customers.email,
            idempotencyKey: `job-completed-${job.id}`,
            templateData: {
              customerName: job.customers.name,
              jobDescription: job.description,
              jobPrice: `£${Number(job.price).toFixed(2)}`,
              completedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            },
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Job marked complete — customer notified');
    },
  });

  return (
    <AppLayout
      title="Jobs"
      action={
        <Button size="sm" onClick={() => navigate('/jobs/new')} className="touch-target">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No jobs yet</p>
          <Button onClick={() => navigate('/jobs/new')}>
            <Plus className="h-4 w-4 mr-1" /> Add First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((j: any) => (
            <div key={j.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{j.customers?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground truncate">{j.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {j.scheduled_date ? new Date(j.scheduled_date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-bold text-foreground">£{Number(j.price).toFixed(0)}</span>
                  {j.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-accent" />
                  )}
                </div>
              </div>
              {j.status !== 'completed' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 touch-target"
                    onClick={() => completeMutation.mutate(j)}
                    disabled={completeMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Complete
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 touch-target"
                    onClick={() => navigate(`/invoices/new?job_id=${j.id}`)}
                  >
                    Generate Invoice
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
