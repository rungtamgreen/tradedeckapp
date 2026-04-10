import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Mail, MapPin, FileText, Briefcase, Receipt, Pencil, Trash2, MapPinned } from 'lucide-react';

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
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '', postcode: '', notes: '' });

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
      const { data, error } = await supabase.from('quotes').select('*').eq('customer_id', id!).eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['customer-jobs', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('jobs').select('*').eq('customer_id', id!).eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['customer-invoices', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('invoices').select('*').eq('customer_id', id!).eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('customers').update({
        name: editForm.name,
        phone: editForm.phone || null,
        email: editForm.email || null,
        address: editForm.address || null,
        postcode: editForm.postcode || null,
        notes: editForm.notes || null,
      }).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditing(false);
      toast.success('Customer updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('customers').delete().eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted');
      navigate('/customers');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startEditing = () => {
    if (!customer) return;
    setEditForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      postcode: (customer as any).postcode || '',
      notes: customer.notes || '',
    });
    setEditing(true);
  };

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
          {editing ? (
            <div className="space-y-3">
              <Input placeholder="Name *" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-10 text-sm" required />
              <Input placeholder="Phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="h-10 text-sm" />
              <Input placeholder="Email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="h-10 text-sm" />
              <Textarea placeholder="Address" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} className="text-sm min-h-[60px]" />
              <Input placeholder="Postcode" value={editForm.postcode} onChange={e => setEditForm(f => ({ ...f, postcode: e.target.value }))} className="h-10 text-sm" />
              <Textarea placeholder="Notes" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} className="text-sm min-h-[60px]" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !editForm.name} className="flex-1">
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          ) : (
            <>
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
              {(customer as any).postcode && (
                <p className="flex items-center gap-2 text-sm text-foreground">
                  <MapPinned className="h-4 w-4 text-muted-foreground" /> {(customer as any).postcode}
                </p>
              )}
              {customer.notes && (
                <p className="text-sm text-muted-foreground pt-1">{customer.notes}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={startEditing}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete customer?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {customer.name}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
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
                    <span className="text-sm font-bold text-foreground">£{Number(q.price).toFixed(2)}</span>
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
                <button key={j.id} onClick={() => navigate(`/jobs/${j.id}`)} className="w-full bg-card border border-border rounded-lg p-3 flex items-center justify-between text-left active:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{j.description}</p>
                    {j.scheduled_date && <p className="text-xs text-muted-foreground">{j.scheduled_date}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-bold text-foreground">£{Number(j.price).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[j.status] || ''}`}>{j.status}</span>
                  </div>
                </button>
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
                <button key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)} className="w-full bg-card border border-border rounded-lg p-3 flex items-center justify-between text-left active:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inv.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-bold text-foreground">£{Number(inv.amount).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || ''}`}>{inv.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
