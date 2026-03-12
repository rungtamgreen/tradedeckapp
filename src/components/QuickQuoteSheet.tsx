import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface QuickQuoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMON_PRICES = [50, 100, 150, 250, 500];

export function QuickQuoteSheet({ open, onOpenChange }: QuickQuoteSheetProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', user?.id],
    enabled: !!user && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('user_id', user!.id)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('quotes').insert({
        user_id: user!.id,
        customer_id: customerId,
        description,
        price: parseFloat(price),
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Quote sent!');
      resetAndClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetAndClose = () => {
    setCustomerId('');
    setDescription('');
    setPrice('');
    onOpenChange(false);
  };

  const canSubmit = customerId && description.trim() && price && parseFloat(price) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-xl font-bold">Quick Quote</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={e => { e.preventDefault(); if (canSubmit) mutation.mutate(); }}
          className="space-y-4 pt-2"
        >
          {/* Customer select */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Customer</label>
            <div className="flex gap-2">
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="flex-1 h-14 rounded-xl border border-input bg-card px-3 text-base text-foreground touch-target"
                required
              >
                <option value="">Select customer</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-14 w-14 shrink-0 rounded-xl touch-target"
                onClick={() => { resetAndClose(); navigate('/customers/new'); }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">What's the job?</label>
            <Textarea
              placeholder="e.g. Fix leaking tap in kitchen"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="text-base min-h-[80px] rounded-xl"
              required
            />
          </div>

          {/* Quick price buttons */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Price</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {COMMON_PRICES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrice(String(p))}
                  className={`h-12 px-5 rounded-xl font-bold text-base transition-all active:scale-95 touch-target ${
                    price === String(p)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  £{p}
                </button>
              ))}
            </div>
            <Input
              placeholder="Custom amount (£)"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="h-14 text-lg font-bold rounded-xl"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit || mutation.isPending}
            className="w-full h-16 text-lg font-bold rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform"
          >
            {mutation.isPending ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...</>
            ) : (
              '⚡ Send Quote'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
