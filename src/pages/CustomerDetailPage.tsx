import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, Mail, MapPin, Plus, Clock, CheckCircle, XCircle, FileText, Briefcase, Receipt } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-accent/10 text-accent',
  accepted: 'bg-green-500/10 text-green-600',
  declined: 'bg-destructive/10 text-destructive',
  scheduled: 'bg-accent/10 text-accent',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-600',
  unpaid: 'bg-accent/10 text-accent',
  paid: 'bg-green-500/10 text-green-600',
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['customer-quotes', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('customer_id', id!)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['customer-jobs', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('customer_id', id!)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['customer-invoices', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', id!)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loadingCustomer) {
    return (
      <AppLayout title="Customer" action={<Button variant="ghost" size="icon" onClick={() => navigate('/customers')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </AppLayout>
    );
  }

  if (!customer) {
    return (
      <AppLayout title="Customer" action={<Button variant="ghost" size="icon" onClick={() => navigate('/customers')}><ArrowLeft className="h-5 w-5" /></Button>}>
        <p className="text-center text-muted-foreground py-12">Customer not found</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={customer.name}
      action={<Button variant="ghost" size="icon" onClick={() => navigate('/customers')}><ArrowLeft className="h-5 w-5" /></Button>}
    >
      {/* Contact Info */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-2">
          {customer.phone && (
            <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" /> {customer.phone}
            </a>
          )}
          {customer.email && (
            <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" /> {customer.email}
            </a>
          )}
          {customer.address && (
            <p className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground" /> {customer.address}
            </p>
          )}
          {customer.notes && (
            <p className="text-sm text-muted-foreground pt-1">{customer.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/quotes/new?customer=${id}`)}>
          <FileText className="h-4 w-4 mr-1" /> Quote
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/new?customer=${id}`)}>
          <Briefcase className="h-4 w-4 mr-1" /> Job
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/new?customer=${id}`)}>
          <Receipt className="h-4 w-4 mr-1" /> Invoice
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quotes">
        <TabsList className="w-full">
          <TabsTrigger value="quotes" className="flex-1">Quotes ({quotes.length})</TabsTrigger>
          <TabsTrigger value="jobs" className="flex-1">Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="invoices" className="flex-1">Invoices ({invoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes">
          {quotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No quotes yet</p>
          ) : (
            <div className="space-y-2">
              {quotes.map((q: any) => (
                <button key={q.id} onClick={() => navigate(`/quotes/${q.id}`)} className="w-full bg-card border border-border rounded-lg p-3 flex items-center justify-between text-left active:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{q.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-bold text-foreground">£{Number(q.price).toFixed(0)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[q.status] || ''}`}>{q.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs">
          {jobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No jobs yet</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((j: any) => (
                <div key={j.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{j.description}</p>
                    {j.scheduled_date && <p className="text-xs text-muted-foreground">{j.scheduled_date}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-bold text-foreground">£{Number(j.price).toFixed(0)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[j.status] || ''}`}>{j.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inv.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-bold text-foreground">£{Number(inv.amount).toFixed(0)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || ''}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
