import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Phone, Mail, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function CustomersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppLayout
      title="Customers"
      action={
        <Button size="sm" onClick={() => navigate('/customers/new')} className="touch-target">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No customers yet</p>
          <Button onClick={() => navigate('/customers/new')}>
            <Plus className="h-4 w-4 mr-1" /> Add First Customer
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c: any) => (
            <button
              key={c.id}
              onClick={() => navigate(`/customers/${c.id}`)}
              className="w-full bg-card border border-border rounded-lg p-4 flex items-center justify-between touch-target text-left active:bg-muted transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground">{c.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  {c.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {c.email}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
