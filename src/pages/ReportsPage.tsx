import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PoundSterling, Clock, CheckCircle, TrendingUp,
  FileText, Wrench, Users, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const { data: invoices = [], isLoading: invLoading } = useQuery({
    queryKey: ['report-invoices', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount, status, paid_at, created_at')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['report-jobs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('price, status, completed_at, created_at')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['report-quotes', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('price, status, created_at')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['report-customers', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, created_at')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    // Revenue
    const paidThisMonth = invoices.filter(
      i => i.status === 'paid' && i.paid_at && i.paid_at >= startOfMonth
    );
    const revenueThisMonth = paidThisMonth.reduce((s, i) => s + Number(i.amount), 0);

    const paidLastMonth = invoices.filter(
      i => i.status === 'paid' && i.paid_at && i.paid_at >= startOfLastMonth && i.paid_at <= endOfLastMonth
    );
    const revenueLastMonth = paidLastMonth.reduce((s, i) => s + Number(i.amount), 0);

    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((s, i) => s + Number(i.amount), 0);

    // Outstanding
    const unpaidInvoices = invoices.filter(i => i.status !== 'paid');
    const outstandingTotal = unpaidInvoices.reduce((s, i) => s + Number(i.amount), 0);

    // Jobs
    const jobsCompletedThisMonth = jobs.filter(
      j => j.status === 'completed' && j.completed_at && j.completed_at >= startOfMonth
    ).length;
    const totalJobsCompleted = jobs.filter(j => j.status === 'completed').length;
    const activeJobs = jobs.filter(j => j.status !== 'completed').length;

    // Quotes
    const quotesThisMonth = quotes.filter(q => q.created_at >= startOfMonth).length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
    const conversionRate = quotes.length > 0
      ? Math.round((acceptedQuotes / quotes.length) * 100)
      : 0;

    // Customers
    const newCustomersThisMonth = customers.filter(c => c.created_at >= startOfMonth).length;

    return {
      revenueThisMonth,
      revenueLastMonth,
      totalRevenue,
      outstandingTotal,
      unpaidCount: unpaidInvoices.length,
      jobsCompletedThisMonth,
      totalJobsCompleted,
      activeJobs,
      quotesThisMonth,
      pendingQuotes,
      conversionRate,
      totalCustomers: customers.length,
      newCustomersThisMonth,
    };
  }, [invoices, jobs, quotes, customers, startOfMonth, startOfLastMonth, endOfLastMonth]);

  const isLoading = invLoading || jobsLoading || quotesLoading;

  const monthName = now.toLocaleDateString('en-GB', { month: 'long' });

  return (
    <AppLayout title="Reports">
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {/* Revenue headline */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PoundSterling className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue — {monthName}</p>
                  <p className="text-2xl font-bold text-foreground">£{stats.revenueThisMonth.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-background/60 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Last month</p>
                  <p className="font-semibold text-foreground">£{stats.revenueLastMonth.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">All time</p>
                  <p className="font-semibold text-foreground">£{stats.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding invoices */}
          <Card className={stats.unpaidCount > 0 ? 'border-destructive/20 bg-destructive/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.unpaidCount > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
                    <Clock className={`h-5 w-5 ${stats.unpaidCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding Invoices</p>
                    <p className="text-xl font-bold text-foreground">£{stats.outstandingTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted-foreground">{stats.unpaidCount} unpaid invoice{stats.unpaidCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/invoices')}>
                  View <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Jobs stats */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Jobs</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-muted/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-foreground">{stats.jobsCompletedThisMonth}</p>
                  <p className="text-[10px] text-muted-foreground">Completed this month</p>
                </div>
                <div className="text-center bg-muted/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-foreground">{stats.activeJobs}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div className="text-center bg-muted/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-foreground">{stats.totalJobsCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">Total completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotes stats */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Quotes</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-muted/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-foreground">{stats.quotesThisMonth}</p>
                  <p className="text-[10px] text-muted-foreground">Sent this month</p>
                </div>
                <div className="text-center bg-muted/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-foreground">{stats.pendingQuotes}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
                <div className="text-center bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <p className="text-xl font-bold text-foreground">{stats.conversionRate}%</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Conversion rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Customers</p>
                    <p className="text-xl font-bold text-foreground">{stats.totalCustomers}</p>
                    {stats.newCustomersThisMonth > 0 && (
                      <p className="text-xs text-primary">+{stats.newCustomersThisMonth} this month</p>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/customers')}>
                  View <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
