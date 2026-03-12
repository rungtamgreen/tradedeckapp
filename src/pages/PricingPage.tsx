import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/plans';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Check, Crown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate();
  const { plan, subscribed, loading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS.pro.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Failed to open portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const features = {
    free: ['Up to 5 customers', 'Up to 5 quotes/month', 'Unlimited jobs', 'Unlimited invoices'],
    pro: ['Unlimited customers', 'Unlimited quotes', 'Unlimited jobs', 'Unlimited invoices', 'Priority support'],
  };

  return (
    <AppLayout
      title="Plans"
      action={
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Free Plan */}
        <div className={`rounded-2xl border-2 p-5 space-y-4 ${plan === 'free' ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Free</h3>
            {plan === 'free' && <Badge>Current Plan</Badge>}
          </div>
          <p className="text-2xl font-bold">£0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <ul className="space-y-2">
            {features.free.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className={`rounded-2xl border-2 p-5 space-y-4 ${plan === 'pro' ? 'border-primary bg-primary/5' : 'border-accent'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent-foreground" />
              Pro
            </h3>
            {plan === 'pro' && <Badge>Current Plan</Badge>}
          </div>
          <p className="text-2xl font-bold">£12<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <ul className="space-y-2">
            {features.pro.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          {!loading && (
            plan === 'pro' ? (
              <Button onClick={handleManage} disabled={portalLoading} className="w-full h-12" variant="outline">
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Manage Subscription'}
              </Button>
            ) : (
              <Button onClick={handleUpgrade} disabled={checkoutLoading} className="w-full h-12 font-bold bg-accent text-accent-foreground hover:bg-accent/90">
                {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '⚡ Upgrade to Pro'}
              </Button>
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}
