import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { QuickAction } from '@/components/QuickAction';
import { QuickQuoteSheet } from '@/components/QuickQuoteSheet';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, FileText, Receipt, Clock, Plus, LogOut, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { plan, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      refreshSubscription();
      toast.success('Welcome to Pro! 🎉');
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams]);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [jobsRes, quotesRes, invoicesRes, activeJobsRes] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('scheduled_date', today),
        supabase.from('quotes').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('status', 'pending'),
        supabase.from('invoices').select('amount', { count: 'exact' }).eq('user_id', user!.id).eq('status', 'unpaid'),
        supabase.from('jobs').select('id', { count: 'exact' }).eq('user_id', user!.id).neq('status', 'completed'),
      ]);

      const outstanding = invoicesRes.data?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0;

      return {
        jobsToday: jobsRes.count ?? 0,
        pendingQuotes: quotesRes.count ?? 0,
        unpaidInvoices: invoicesRes.count ?? 0,
        outstanding,
        activeJobs: activeJobsRes.count ?? 0,
      };
    },
  });

  return (
    <AppLayout
      title="Dashboard"
      action={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/security')} className="touch-target">
            <Shield className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} className="touch-target">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Plan Badge */}
        <button
          onClick={() => navigate('/pricing')}
          className="w-full flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 touch-target"
        >
          <span className="text-sm text-muted-foreground">Current Plan</span>
          <Badge className={plan === 'pro' ? 'bg-accent text-accent-foreground' : ''}>
            {plan === 'pro' && <Crown className="h-3 w-3 mr-1" />}
            {plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
        </button>

        {/* Hero CTA — Create Quote */}
        <button
          onClick={() => setQuoteOpen(true)}
          className="w-full h-20 rounded-2xl bg-accent text-accent-foreground font-bold text-xl flex items-center justify-center gap-3 active:scale-[0.97] transition-transform shadow-lg touch-target"
        >
          <FileText className="h-7 w-7" />
          Create Quote
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Unpaid Invoices" value={stats?.unpaidInvoices ?? 0} icon={<Receipt className="h-5 w-5" />} color="destructive" to="/invoices?status=unpaid" />
          <StatCard label="Outstanding" value={`£${stats?.outstanding?.toFixed(0) ?? 0}`} icon={<FileText className="h-5 w-5" />} color="primary" to="/invoices?status=unpaid" />
          <StatCard label="Pending Quotes" value={stats?.pendingQuotes ?? 0} icon={<Clock className="h-5 w-5" />} color="accent" to="/quotes?status=pending" />
          <StatCard label="Active Jobs" value={stats?.activeJobs ?? 0} icon={<Wrench className="h-5 w-5" />} color="success" to="/jobs?status=active" />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            <QuickAction label="New Job" icon={<Wrench className="h-5 w-5" />} onClick={() => navigate('/jobs/new')} />
            <QuickAction label="Invoice" icon={<Receipt className="h-5 w-5" />} onClick={() => navigate('/invoices/new')} />
            <QuickAction label="Customer" icon={<Plus className="h-5 w-5" />} onClick={() => navigate('/customers/new')} />
            <QuickAction label="Reports" icon={<BarChart3 className="h-5 w-5" />} onClick={() => navigate('/reports')} />
          </div>
        </div>
      </div>

      <QuickQuoteSheet open={quoteOpen} onOpenChange={setQuoteOpen} />
    </AppLayout>
  );
}
