import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { QuickAction } from '@/components/QuickAction';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, FileText, Receipt, Clock, Plus, LogOut, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [jobsRes, quotesRes, invoicesRes] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('scheduled_date', today),
        supabase.from('quotes').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('status', 'pending'),
        supabase.from('invoices').select('amount', { count: 'exact' }).eq('user_id', user!.id).eq('status', 'unpaid'),
      ]);

      const outstanding = invoicesRes.data?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0;

      return {
        jobsToday: jobsRes.count ?? 0,
        pendingQuotes: quotesRes.count ?? 0,
        unpaidInvoices: invoicesRes.count ?? 0,
        outstanding,
      };
    },
  });

  return (
    <AppLayout
      title="Dashboard"
      action={
        <Button variant="ghost" size="icon" onClick={signOut} className="touch-target">
          <LogOut className="h-5 w-5" />
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Jobs Today" value={stats?.jobsToday ?? 0} icon={<Wrench className="h-5 w-5" />} color="primary" />
          <StatCard label="Pending Quotes" value={stats?.pendingQuotes ?? 0} icon={<Clock className="h-5 w-5" />} color="accent" />
          <StatCard label="Unpaid Invoices" value={stats?.unpaidInvoices ?? 0} icon={<Receipt className="h-5 w-5" />} color="destructive" />
          <StatCard label="Outstanding" value={`£${stats?.outstanding?.toFixed(0) ?? 0}`} icon={<FileText className="h-5 w-5" />} color="success" />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction label="Voice Quote" icon={<Mic className="h-5 w-5" />} onClick={() => navigate('/quotes/new?voice=1')} variant="accent" />
            <QuickAction label="New Quote" icon={<Plus className="h-5 w-5" />} onClick={() => navigate('/quotes/new')} />
            <QuickAction label="New Customer" icon={<Plus className="h-5 w-5" />} onClick={() => navigate('/customers/new')} />
            <QuickAction label="New Job" icon={<Plus className="h-5 w-5" />} onClick={() => navigate('/jobs/new')} />
            <QuickAction label="New Invoice" icon={<Plus className="h-5 w-5" />} onClick={() => navigate('/invoices/new')} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
