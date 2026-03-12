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
  ArrowRight,
  Star,
  ChevronRight,
} from 'lucide-react';
import mockupDashboard from '@/assets/mockup-dashboard.png';
import mockupQuote from '@/assets/mockup-quote.png';
import mockupJobs from '@/assets/mockup-jobs.png';

const features = [
  {
    icon: Zap,
    title: 'Fast Quotes',
    description: 'Create and send professional quotes in under 30 seconds. Quick-pick pricing gets you back on the tools faster.',
  },
  {
    icon: ClipboardList,
    title: 'Job Tracking',
    description: 'See every job at a glance — scheduled, in progress, or completed. Never lose track of work again.',
  },
  {
    icon: FileText,
    title: 'Simple Invoices',
    description: 'Turn completed jobs into invoices with one tap. Get paid faster with professional billing.',
  },
];

const steps = [
  {
    icon: Send,
    step: '01',
    title: 'Create a Quote',
    description: 'Enter the job details and send a quote to your customer in seconds.',
    image: mockupQuote,
  },
  {
    icon: ThumbsUp,
    step: '02',
    title: 'Customer Accepts',
    description: 'Your customer reviews and accepts the quote straight from their phone.',
    image: mockupDashboard,
  },
  {
    icon: CheckCircle2,
    step: '03',
    title: 'Job Done, Get Paid',
    description: 'Mark the job complete and send a professional invoice instantly.',
    image: mockupJobs,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">JobDeck</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition hover:text-foreground">How It Works</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
            <Link to="/auth" className="transition hover:text-foreground">Log In</Link>
            <Link to="/auth">
              <Button size="sm" className="rounded-full px-5 font-semibold shadow-md">
                Start Free <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Link to="/auth" className="md:hidden">
            <Button size="sm" className="rounded-full px-5 font-semibold">Start Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <Star className="h-3.5 w-3.5 text-accent" />
                Trusted by 1,000+ tradespeople
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
                Run Your Trade Business{' '}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Without the Paperwork
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0 lg:text-xl">
                Create quotes, track jobs, and send invoices in seconds — all from your phone. Built for plumbers, electricians, builders, and every trade in between.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold shadow-lg shadow-primary/25">
                    Start Free — No Card Needed <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost" size="lg" className="h-14 rounded-full px-8 text-base font-semibold text-muted-foreground">
                    Log In <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
              <div className="relative z-10 overflow-hidden rounded-[2rem] border-[6px] border-foreground/10 bg-card shadow-2xl shadow-primary/10">
                <img
                  src={mockupDashboard}
                  alt="JobDeck dashboard showing active jobs, revenue, and pending quotes"
                  className="h-auto w-full"
                  loading="eager"
                />
              </div>
              {/* Floating accent card */}
              <div className="absolute -left-6 bottom-20 z-20 rounded-xl border border-border bg-card p-3 shadow-xl sm:-left-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Quote Accepted!</p>
                    <p className="text-[11px] text-muted-foreground">Kitchen fitting — £2,400</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Features</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple tools built for how tradespeople actually work — fast, on-site, and from a phone.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex flex-col p-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">How It Works</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Three steps. That's it.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From quote to payment in minutes, not hours.
            </p>
          </div>

          <div className="mt-16 space-y-20 lg:space-y-28">
            {steps.map((s, i) => (
              <div
                key={s.step}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? 'lg:direction-rtl' : ''
                }`}
              >
                <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {s.step}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="text-2xl font-bold sm:text-3xl">{s.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
                <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="mx-auto max-w-[280px] overflow-hidden rounded-[2rem] border-[5px] border-foreground/10 bg-card shadow-xl transition-transform duration-500 hover:scale-[1.02]">
                    <img
                      src={s.image}
                      alt={`JobDeck ${s.title} screen`}
                      className="h-auto w-full"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Friendly */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-28">
        <div className="absolute inset-0 -z-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-foreground/15 backdrop-blur-sm">
            <Smartphone className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Built for Tradespeople on the Move
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
            JobDeck is designed mobile-first so you can manage your business from a van, a rooftop, or a customer's kitchen.
            Works perfectly on phones and tablets — no laptop required. Big buttons, fast loading, zero fuss.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="h-14 rounded-full px-8 text-base font-bold shadow-lg">
                Try It Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Pricing</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Simple, honest pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start for free. Upgrade when your business grows.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2">
            {/* Free */}
            <Card className="flex flex-col overflow-hidden border-border/50 transition-all hover:shadow-lg">
              <CardContent className="flex flex-1 flex-col p-8 sm:p-10">
                <h3 className="text-lg font-bold">Free</h3>
                <p className="mt-2">
                  <span className="text-4xl font-extrabold">£0</span>
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <p className="mt-3 text-sm text-muted-foreground">Perfect for getting started</p>
                <ul className="mt-8 flex-1 space-y-4 text-sm">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>Up to 5 customers</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>5 quotes per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>Job tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span>Invoicing</span>
                  </li>
                </ul>
                <Link to="/auth" className="mt-8 block">
                  <Button variant="outline" className="h-12 w-full rounded-full text-base font-semibold">
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="relative flex flex-col overflow-hidden border-2 border-primary shadow-xl shadow-primary/10 transition-all hover:shadow-2xl">
              <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
                MOST POPULAR
              </div>
              <CardContent className="flex flex-1 flex-col p-8 sm:p-10">
                <h3 className="text-lg font-bold">Pro</h3>
                <p className="mt-2">
                  <span className="text-4xl font-extrabold">£12</span>
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <p className="mt-3 text-sm text-muted-foreground">For busy tradespeople</p>
                <ul className="mt-8 flex-1 space-y-4 text-sm">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Unlimited customers</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Unlimited quotes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Unlimited jobs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium">Unlimited invoices</span>
                  </li>
                </ul>
                <Link to="/auth" className="mt-8 block">
                  <Button className="h-12 w-full rounded-full text-base font-bold shadow-lg shadow-primary/25">
                    Upgrade to Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to ditch the paperwork?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of tradespeople running their business with JobDeck.
          </p>
          <div className="mt-8">
            <Link to="/auth">
              <Button size="lg" className="h-14 rounded-full px-10 text-base font-bold shadow-lg shadow-primary/25">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="font-bold">JobDeck</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
            <Link to="/auth" className="transition hover:text-foreground">Login</Link>
            <Link to="/auth" className="transition hover:text-foreground">Sign Up</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} JobDeck</p>
        </div>
      </footer>
    </div>
  );
}
