
Goal: stop the app from intermittently showing an older UI. The current source code still contains your latest dashboard/settings changes, so this does not look like a real revert — it looks like stale frontend assets being served.

What I found:
- `src/pages/Dashboard.tsx` still has the clickable stat cards, “Today’s Overview”, and the 5 quick action buttons.
- `src/components/StatCard.tsx` still wraps cards in a clickable button with `navigate(...)`.
- `src/pages/SettingsPage.tsx` still has the moved “Current Plan” section.
- `vite.config.ts` has `VitePWA(...)` enabled globally.
- `src/main.tsx` has no explicit service worker update/reload handling.
- `src/pages/InstallPage.tsx` confirms the app is intended to be installable, which increases the chance of stale cached bundles if updates are not handled cleanly.

Most likely cause:
- A cached service worker / PWA bundle is sometimes serving an older app shell, especially after updates.
- That would explain why logging back in or forcing a reload makes the latest layout appear again.

Implementation plan:
1. Add explicit app update handling
   - Register the PWA update flow in `src/main.tsx`.
   - Detect when a new version is available and force/apply the update cleanly instead of leaving the app on an older bundle.

2. Prevent stale preview sessions
   - Adjust the PWA setup in `vite.config.ts` so the preview/development experience does not keep serving old cached UI during active iteration.
   - Keep installability for the live app, but make preview safer and less sticky.

3. Clear already-bad caches
   - Ship a one-time cache-clearing strategy if needed so users who already have the stale worker installed get moved onto the latest version.
   - This is the safest way to stop the “old layout came back” issue from recurring.

4. Add a visible refresh path
   - Show a small toast/banner when a new version is ready, with a “Reload” action.
   - That gives users a clear way to update without needing to log out and back in.

5. Re-verify the affected UI after the cache fix
   - Confirm the dashboard always shows the latest tappable cards and quick actions.
   - Confirm Settings still shows the moved “Current Plan” section.
   - Confirm both browser and installed-app flows stay on the latest layout consistently.

Technical details:
- Likely files: `vite.config.ts`, `src/main.tsx`, and possibly a tiny update toast/helper component.
- No database changes are needed for this fix.
- I would not revert any UI work; I would fix the asset caching/update behavior so your latest changes always load.
