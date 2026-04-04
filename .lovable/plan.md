

# Rebrand Everything to "JobDeck"

## Summary
Replace all 86 instances of "TradeFlow" with "JobDeck" across 8 files. The landing page already uses "JobDeck" — no changes needed there.

## Files to Edit

| File | Changes |
|------|---------|
| `index.html` | `apple-mobile-web-app-title`, `og:title`, `og:description` → "JobDeck" |
| `vite.config.ts` | PWA manifest `name` → "JobDeck - Job Management", `short_name` → "JobDeck" |
| `src/pages/AuthPage.tsx` | "TradeFlow" → "JobDeck" |
| `src/components/LockScreen.tsx` | "TradeFlow" → "JobDeck" |
| `src/pages/AcceptQuotePage.tsx` | "Powered by TradeFlow" → "Powered by JobDeck" |
| `src/pages/InstallPage.tsx` | 4 instances of "TradeFlow" → "JobDeck" |
| `src/hooks/useAppLock.tsx` | Passkey `rp.name` → "JobDeck", session keys `tradeflow_unlocked` → `jobdeck_unlocked` |
| `supabase/functions/send-quote-email/index.ts` | Fallback origin, email header, and "Sent via" footer → "JobDeck" |

No structural or logic changes — pure text replacement across all files.

