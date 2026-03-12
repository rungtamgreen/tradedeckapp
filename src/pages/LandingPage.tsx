import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Zap,
  ClipboardList,
  FileText,
  Smartphone,
  Send,
  ThumbsUp,
  CheckCircle2,
  Wrench,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Fast Quotes',
    description: 'Create and send professional quotes in under 30 seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Job Tracking',
    description: 'Keep track of all your jobs in one place.',
  },
  {
    icon: FileText,
    title: 'Simple Invoices',
    description: 'Turn completed jobs into invoices instantly.',
  },
];

const steps = [
  {
    icon: Send,
    step: '1',
    title: 'Create Quote',
    description: 'Enter the job details and send a quote to your customer.',
  },
  {
    icon: ThumbsUp,
    step: '2',
    title: 'Customer Accepts',
    description: 'Customer accepts the quote from their phone.',
  },
  {
    icon: CheckCircle2,
    step: '3',
    title: 'Job Completed',
    description: 'Finish the job and send the invoice instantly.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">JobDeck</span>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
            <Link to="/auth" className="transition hover:text-foreground">Log In</Link>
          </div>
          <Link to="/auth">
            <Button size="sm" className="sm:hidden">Log In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Run Your Trade Business{' '}
            <span className="text-primary">Without the Paperwork</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Create quotes, track jobs, and send invoices in seconds from your phone.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full text-base font-semibold sm:w-auto">
                Start Free
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full text-base font-semibold sm:w-auto">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Everything you need, nothing you don't
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-none bg-card shadow-md">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How It Works</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <s.icon className="h-7 w-7" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Friendly */}
      <section className="border-t border-border bg-muted/40 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">Built for Tradespeople on the Move</h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            JobDeck is designed mobile-first so you can manage your business from a van, a rooftop, or a customer's kitchen. Works perfectly on phones and tablets — no laptop required.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Simple Pricing</h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Start for free. Upgrade when you're ready.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <Card className="flex flex-col border-border">
              <CardContent className="flex flex-1 flex-col p-8">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="mt-1 text-3xl font-extrabold">
                  £0<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Up to 5 customers</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />5 quotes per month</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Job tracking</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Invoicing</li>
                </ul>
                <Link to="/auth" className="mt-8">
                  <Button variant="outline" className="w-full font-semibold">Start Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="relative flex flex-col border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                POPULAR
              </div>
              <CardContent className="flex flex-1 flex-col p-8">
                <h3 className="text-lg font-semibold">Pro</h3>
                <p className="mt-1 text-3xl font-extrabold">
                  £12<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Unlimited customers</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Unlimited quotes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Unlimited jobs</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Unlimited invoices</li>
                </ul>
                <Link to="/auth" className="mt-8">
                  <Button className="w-full font-semibold">Upgrade to Pro</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
            <Link to="/auth" className="transition hover:text-foreground">Login</Link>
            <Link to="/auth" className="transition hover:text-foreground">Sign Up</Link>
          </div>
          <p className="text-xs text-muted-foreground">© JobDeck</p>
        </div>
      </footer>
    </div>
  );
}
