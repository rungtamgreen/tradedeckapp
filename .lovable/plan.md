

## Plan: Customer Detail Page + Quote-to-Job Auto-conversion

### 1. Customer Detail Page (`/customers/:id`)

**New file: `src/pages/CustomerDetailPage.tsx`**
- Fetch customer by ID from the `customers` table
- Display customer info (name, phone, email, address, notes) in a card
- Fetch and display three tabbed lists using the Tabs component:
  - **Quotes** tab: all quotes for this customer (status, price, description)
  - **Jobs** tab: all jobs for this customer (status, price, scheduled date)
  - **Invoices** tab: all invoices for this customer (status, amount)
- Each list item is tappable, navigating to the relevant detail/list page
- Include quick action buttons: "New Quote", "New Job", "New Invoice" pre-linked to this customer
- Back button in the header to return to `/customers`

**Update `src/App.tsx`:**
- Add route: `/customers/:id` pointing to `CustomerDetailPage`
- Import the new page component

### 2. Quote-to-Job Auto-conversion

**Update `src/pages/QuotesPage.tsx`:**
- Currently quotes list navigates to `/quotes/:id` (which doesn't exist). Instead, add inline "Accept" and "Decline" buttons on pending quotes.
- "Accept" mutation: updates quote status to `accepted`, then inserts a new job row with the quote's `customer_id`, `description`, `price`, `quote_id`, and `user_id`. Invalidates both `quotes` and `jobs` queries.
- "Decline" mutation: updates quote status to `declined`.
- Show toast confirmation on each action.

**New file: `src/pages/QuoteDetailPage.tsx`:**
- Display full quote details with Accept/Decline actions for pending quotes
- Show linked job if quote is already accepted

**Update `src/App.tsx`:**
- Add route: `/quotes/:id` pointing to `QuoteDetailPage`

### 3. Summary of file changes

| File | Action |
|------|--------|
| `src/pages/CustomerDetailPage.tsx` | Create |
| `src/pages/QuoteDetailPage.tsx` | Create |
| `src/pages/QuotesPage.tsx` | Add accept/decline mutations |
| `src/App.tsx` | Add 2 new routes |

No database changes needed -- all tables and columns already exist.

