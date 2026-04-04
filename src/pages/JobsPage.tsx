import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, CheckCircle, Clock, X } from 'lucide-react';

export default function JobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

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

  const filtered = statusFilter
    ? jobs.filter((j: any) => {
        if (statusFilter === 'active') return j.status !== 'completed';
        return j.status === statusFilter;
      })
    : jobs;

  const completeMutation = useMutation({
    mutationFn: async (job: any) => {
      const { error } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', job.id);
      if (error) throw error;

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

  const filterLabel: Record<string, string> = {
    active: 'Active Jobs',
    completed: 'Completed Jobs',
    scheduled: 'Scheduled Jobs',
  };

  return (
    <AppLayout
      title="Jobs"
      back
      action={
        <Button size="sm" onClick={() => navigate('/jobs/new')} className="touch-target">
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
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{statusFilter ? 'No matching jobs' : 'No jobs yet'}</p>
          {!statusFilter && (
            <Button onClick={() => navigate('/jobs/new')}>
              <Plus className="h-4 w-4 mr-1" /> Add First Job
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((j: any) => (
            <div key={j.id} className="bg-card border border-border rounded-lg p-4 space-y-3 cursor-pointer active:bg-muted/50" onClick={() => navigate(`/jobs/${j.id}`)}>
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
                    onClick={(e) => { e.stopPropagation(); completeMutation.mutate(j); }}
                    disabled={completeMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Complete
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 touch-target"
                    onClick={(e) => { e.stopPropagation(); navigate(`/invoices/new?job_id=${j.id}`); }}
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
