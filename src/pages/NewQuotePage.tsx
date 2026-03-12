import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/plans';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Mic, MicOff, Loader2, Crown } from 'lucide-react';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';

export default function NewQuotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoVoice = searchParams.get('voice') === '1';
  const { user } = useAuth();
  const { plan } = useSubscription();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ customer_id: '', description: '', price: '' });
  const [isParsing, setIsParsing] = useState(false);
  const quotesLimit = PLANS[plan].quotesPerMonth;

  const { data: quotesThisMonth = 0 } = useQuery({
    queryKey: ['quotes-month-count', user?.id],
    enabled: !!user && quotesLimit !== Infinity,
    queryFn: async () => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const { count, error } = await supabase.from('quotes').select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', start.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });

  const atQuoteLimit = quotesLimit !== Infinity && quotesThisMonth >= quotesLimit;

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', user?.id],
    enabled: !!user,
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

  const handleVoiceResult = useCallback(async (transcript: string) => {
    setIsParsing(true);
    toast.info(`Heard: "${transcript}"`, { duration: 3000 });

    try {
      const customerNames = customers.map((c: any) => c.name);
      const { data, error } = await supabase.functions.invoke('parse-voice-quote', {
        body: { transcript, customerNames },
      });

      if (error) throw error;

      // Match customer name to ID
      if (data.customer_name) {
        const match = customers.find((c: any) =>
          c.name.toLowerCase().includes(data.customer_name.toLowerCase()) ||
          data.customer_name.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match) {
          setForm(f => ({ ...f, customer_id: match.id }));
        } else {
          toast.warning(`Customer "${data.customer_name}" not found. Please select manually.`);
        }
      }

      if (data.price) setForm(f => ({ ...f, price: String(data.price) }));
      if (data.description) setForm(f => ({ ...f, description: data.description }));

      toast.success('Voice command parsed!');
    } catch (err: any) {
      console.error('Voice parse error:', err);
      toast.error('Could not parse voice command. Try again or fill manually.');
    } finally {
      setIsParsing(false);
    }
  }, [customers]);

  const { isListening, transcript, startListening, stopListening, error: voiceError, supported } = useVoiceCommand(handleVoiceResult);

  // Auto-start voice when arriving from dashboard Voice Quote button
  const [autoStarted, setAutoStarted] = useState(false);
  useEffect(() => {
    if (autoVoice && supported && !autoStarted && customers.length >= 0) {
      setAutoStarted(true);
      // Small delay to let the page render
      const t = setTimeout(() => startListening(), 500);
      return () => clearTimeout(t);
    }
  }, [autoVoice, supported, autoStarted, startListening]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('quotes').insert({
        user_id: user!.id,
        customer_id: form.customer_id,
        description: form.description,
        price: parseFloat(form.price),
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Quote created!');
      navigate('/quotes');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AppLayout
      title="New Quote"
      action={
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Voice Input */}
        {supported && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isParsing}
            className={`w-full flex items-center justify-center gap-3 h-16 rounded-xl text-lg font-bold transition-all ${
              isListening
                ? 'bg-destructive text-destructive-foreground animate-pulse'
                : isParsing
                ? 'bg-muted text-muted-foreground'
                : 'bg-accent text-accent-foreground hover:bg-accent/90'
            }`}
          >
            {isParsing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Parsing...
              </>
            ) : isListening ? (
              <>
                <MicOff className="h-6 w-6" />
                Tap to Stop
              </>
            ) : (
              <>
                <Mic className="h-6 w-6" />
                🎤 Voice Quote
              </>
            )}
          </button>
        )}

        {(isListening || transcript) && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground italic">
            {isListening && !transcript && '🎧 Listening...'}
            {transcript && `"${transcript}"`}
          </div>
        )}

        {voiceError && (
          <p className="text-sm text-destructive">{voiceError}</p>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or fill manually</span>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <select
            value={form.customer_id}
            onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
            className="w-full h-12 rounded-lg border border-input bg-card px-3 text-base text-foreground"
            required
          >
            <option value="">Select customer *</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Textarea
            placeholder="Job description *"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="text-base min-h-[100px]"
            required
          />
          <Input
            placeholder="Price (£) *"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="h-12 text-base"
            required
          />
          <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : '⚡ Send Quote'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
