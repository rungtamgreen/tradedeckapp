import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { QuickAction } from '@/components/QuickAction';
import { QuickQuoteSheet } from '@/components/QuickQuoteSheet';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Wrench, FileText, Receipt, Clock, Plus, LogOut, Shield, BarChart3, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(user: any): string {
  const meta = user?.user_metadata;
  if (meta?.first_name) return meta.first_name;
  if (meta?.full_name) return meta.full_name.split(' ')[0];
  if (meta?.name) return meta.name.split(' ')[0];
  const email = user?.email || '';
  return email.split('@')[0];
}

function getTodayDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { refreshSubscription } = useSubscription();
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

  const activeJobs = stats?.activeJobs ?? 0;
  const pendingQuotes = stats?.pendingQuotes ?? 0;

  const summaryParts: string[] = [];
  if (activeJobs > 0) summaryParts.push(`${activeJobs} active job${activeJobs !== 1 ? 's' : ''}`);
  if (pendingQuotes > 0) summaryParts.push(`${pendingQuotes} pending quote${pendingQuotes !== 1 ? 's' : ''}`);
  const summaryLine = summaryParts.length > 0
    ? `You have ${summaryParts.join(' and ')}`
    : 'No active jobs or pending quotes today';

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
        {/* Greeting */}
        <p className="text-lg font-medium text-foreground">
          {getGreeting()}, {getFirstName(user)} 👋
        </p>

        {/* Today's Overview */}
        <Card className="bg-muted/40 border-border">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{getTodayDate()}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{summaryLine}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Unpaid Invoices" value={stats?.unpaidInvoices ?? 0} icon={<Receipt className="h-5 w-5" />} color="destructive" to="/invoices?status=unpaid" />
          <StatCard label="Outstanding" value={`£${stats?.outstanding?.toFixed(2) ?? '0.00'}`} icon={<FileText className="h-5 w-5" />} color="primary" to="/invoices?status=unpaid" />
          <StatCard label="Pending Quotes" value={stats?.pendingQuotes ?? 0} icon={<Clock className="h-5 w-5" />} color="accent" to="/quotes?status=pending" />
          <StatCard label="Active Jobs" value={stats?.activeJobs ?? 0} icon={<Wrench className="h-5 w-5" />} color="success" to="/jobs?status=active" />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-5 gap-2">
            <QuickAction label="Quote" icon={<FileText className="h-5 w-5" />} onClick={() => setQuoteOpen(true)} variant="accent" />
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