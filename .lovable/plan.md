

# Stripe Subscription Billing Plan

## What We're Building

Subscription billing with two plans — Free (5 customers, 5 quotes/month) and Pro (£12/month, unlimited) — enforced server-side and shown in the UI.

**Stripe Product Created:** Pro Plan — `prod_U8OeOqczZNSp8X` / `price_1TA7rBBjid6EToKsbO4rph8P` (£12/month)

---

## Implementation Steps

### 1. Edge Functions (3 new functions)

- **`check-subscription`** — Authenticates user, looks up Stripe customer by email, checks for active subscription. Returns `{ subscribed, product_id, subscription_end }`.
- **`create-checkout`** — Creates a Stripe Checkout Session for the Pro plan. Returns the checkout URL.
- **`customer-portal`** — Creates a Stripe Customer Portal session so users can manage/cancel their subscription.

All three use `verify_jwt = false` in config.toml with manual auth via token.

### 2. Subscription Context (`useSubscription` hook)

- New React context that calls `check-subscription` on login, page load, and every 60 seconds.
- Exposes: `{ subscribed, plan, loading, refreshSubscription }`.
- Maps `product_id` to plan name (`pro` vs `free`).
- Wraps the app alongside `AuthProvider`.

### 3. Usage Limit Enforcement

- **Customers limit (Free: 5):** Before creating a new customer, check current customer count. Show upgrade prompt if at limit.
- **Quotes limit (Free: 5/month):** Before creating a new quote, count quotes created this calendar month. Show upgrade prompt if at limit.
- Both checks happen client-side using existing queries, with clear "Upgrade to Pro" messaging.

### 4. Subscription/Pricing Page

- New `/pricing` route showing Free vs Pro comparison.
- "Upgrade to Pro" button calls `create-checkout` and redirects to Stripe.
- For Pro users: "Manage Subscription" button calls `customer-portal`.
- Current plan highlighted with a badge.

### 5. UI Integration

- Add a plan badge/indicator on the Dashboard.
- Add "Upgrade" link in the bottom nav or settings area for Free users.
- Show limit warnings on the Customers and Quotes pages (e.g., "3 of 5 customers used").
- After successful checkout (redirect back), auto-refresh subscription status.

### 6. Config Updates

- Add all 3 new functions to `supabase/config.toml` with `verify_jwt = false`.
- Store plan tier constants in a shared config file mapping product/price IDs to plan names.

---

## Technical Details

### Tier Constants
```typescript
const PLANS = {
  free: { name: 'Free', customers: 5, quotesPerMonth: 5 },
  pro: {
    name: 'Pro',
    price_id: 'price_1TA7rBBjid6EToKsbO4rph8P',
    product_id: 'prod_U8OeOqczZNSp8X',
    customers: Infinity,
    quotesPerMonth: Infinity,
  },
};
```

### Limit Check Flow
```text
User clicks "New Customer" or "New Quote"
  → Query current count
  → If count >= plan limit → show upgrade dialog
  → Else → proceed normally
```

### Files to Create/Edit
- **Create:** `supabase/functions/check-subscription/index.ts`, `supabase/functions/create-checkout/index.ts`, `supabase/functions/customer-portal/index.ts`
- **Create:** `src/hooks/useSubscription.tsx`, `src/lib/plans.ts`, `src/pages/PricingPage.tsx`
- **Edit:** `src/App.tsx` (add context + route), `src/pages/Dashboard.tsx` (plan badge), `src/pages/NewCustomerPage.tsx` (limit check), `src/pages/NewQuotePage.tsx` (limit check), `src/components/BottomNav.tsx` (pricing link), `supabase/config.toml`

