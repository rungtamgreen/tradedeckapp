

# Add Invoice Reminder Email Template

## Summary
Create a branded invoice reminder email template and add a "Send Reminder" button to unpaid invoices, allowing users to nudge customers for payment.

## What gets built

1. **New email template** — `invoice-reminder.tsx` in `_shared/transactional-email-templates/`, matching the existing JobDeck blue brand styling. Shows customer name, invoice description, amount due, and due date (if set).

2. **Registry update** — Add the new template to `registry.ts` so the send system recognises it.

3. **"Send Reminder" button on InvoicesPage** — For each unpaid invoice, add a button that calls `send-transactional-email` with the `invoice-reminder` template. Uses idempotency key `invoice-reminder-{invoiceId}` to prevent accidental duplicate sends within a short window. The button fetches the customer's email before sending and shows a toast on success/failure.

4. **Deploy** — Redeploy `send-transactional-email` and `preview-transactional-email` so the new template is live.

## Files to create/edit

| File | Action |
|------|--------|
| `supabase/functions/_shared/transactional-email-templates/invoice-reminder.tsx` | Create — branded template with amount, description, optional due date |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | Edit — import and register `invoice-reminder` |
| `src/pages/InvoicesPage.tsx` | Edit — add "Send Reminder" button for unpaid invoices with email sending logic |

## Technical details

- Template props: `customerName`, `invoiceDescription`, `invoiceAmount`, `dueDate` (all optional with graceful fallbacks)
- Subject line: `"Payment reminder from JobDeck"`
- Idempotency: `invoice-reminder-{invoiceId}-{Date.now()}` — allows re-sending reminders on different days
- The invoices query already joins `customers(name)` — will expand to `customers(name, email)` to get the recipient address
- No new database tables or migrations needed

