

# Landing Page for JobDeck

## Overview
Create a new public landing page at `/landing` and update routing so unauthenticated visitors at `/` see the landing page instead of being redirected to `/auth`. Authenticated users at `/` still go to the Dashboard.

## Routing Changes (`src/App.tsx`)
- Change the `/` route: if user is logged in, show Dashboard; if not, show the new LandingPage.
- Update `ProtectedRoute` or create a new `HomeRoute` component that conditionally renders LandingPage vs Dashboard.
- Keep `/auth` route as-is for the dedicated login/signup page.

## New File: `src/pages/LandingPage.tsx`
A single-page marketing site with these sections, using existing Tailwind theme colors and Inter font:

### Hero
- Large headline: "Run Your Trade Business Without the Paperwork"
- Subheadline text
- Two buttons: "Start Free" (links to `/auth` with signup mode) and "Log In" (links to `/auth`)
- Clean gradient or primary-colored background accent

### Features (3 cards)
- Fast Quotes (Zap icon), Job Tracking (ClipboardList icon), Simple Invoices (FileText icon)
- Each with title and one-line description

### How It Works (3 steps)
- Numbered steps with icons: Create Quote → Customer Accepts → Job Completed
- Horizontal or vertical step layout

### Mobile Friendly
- Text block with Smartphone icon
- Emphasize phone/tablet design for tradespeople on the move

### Pricing (2 cards)
- Free: £0/month, 5 customers, 5 quotes/month
- Pro: £12/month, unlimited everything
- "Start Free" and "Upgrade to Pro" CTAs

### Footer
- Links: Features, Pricing, Login, Sign Up (anchor links and route links)
- © JobDeck

## Design Approach
- Uses existing color variables (primary, accent, muted, card) and Inter font
- Responsive: stacks on mobile, side-by-side on larger screens
- Smooth scroll anchor links for Features, Pricing sections
- No new dependencies needed — all built with existing Tailwind + Lucide icons

## Files to Create/Edit
- **Create**: `src/pages/LandingPage.tsx`
- **Edit**: `src/App.tsx` (add import, change `/` route logic)

