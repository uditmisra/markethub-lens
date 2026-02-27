

## Add Gartner Peer Insights Import (Free -- CSV/Paste Upload)

### Approach

Instead of paying for a scraping service, we'll add a **manual import** flow for Gartner reviews. Gartner Peer Insights lets authenticated users browse and copy their product's reviews. The admin can either:

1. **Paste reviews** directly into a text area (copy from the Gartner page)
2. **Upload a CSV** file with columns like reviewer name, company, rating, review text, date

A backend function parses the pasted/uploaded data and imports it into the evidence table, following the exact same pattern as G2/Capterra imports.

### Changes

#### 1. Database Migration
- Add `'gartner'` to the `integration_type` enum so Gartner can be stored alongside G2 and Capterra integrations.

#### 2. New Backend Function: `supabase/functions/import-gartner-reviews/index.ts`
- Accepts a JSON body with an array of reviews (parsed on the frontend from CSV or structured paste)
- Each review has: `reviewer_name`, `company`, `job_title`, `rating`, `title`, `content`, `date`
- Inserts into the `evidence` table with `integration_source: 'gartner'`, deduplicating by a hash-based `external_id`
- Updates the integration's sync status/metrics just like the G2 function does

#### 3. Frontend: Update `src/pages/Integrations.tsx`
- Add `Gartner Peer Insights` to the integration type dropdown
- When `gartner` is selected, hide the API Key and Product ID fields
- Instead, show a dedicated "Import Reviews" section with:
  - A **text area** where the admin can paste Gartner reviews (we'll parse the structured text)
  - A **CSV upload** button as an alternative
  - A help note: "Copy reviews from your Gartner Peer Insights product page and paste them here, or upload a CSV"

#### 4. New Utility: `src/utils/parseGartnerReviews.ts`
- `parseGartnerPaste(text: string)`: Parses pasted Gartner review text into structured review objects. Gartner reviews follow a repeating pattern (reviewer name, rating, date, review text sections) that can be regex-matched.
- `parseGartnerCSV(csvText: string)`: Parses a CSV with headers like `Name, Company, Rating, Title, Review, Date` into the same structure.
- Both return an array of `{ reviewer_name, company, job_title, rating, title, content, date }`.

#### 5. Update `src/hooks/useIntegrations.tsx`
- Add `"gartner"` to the `IntegrationType` union
- In `triggerSync`, add a `gartner` case that calls `import-gartner-reviews`
- Add a new `importGartnerReviews` mutation that accepts parsed review data and calls the edge function

#### 6. Update `src/utils/parseReviewContent.ts`
- Add Gartner-specific content cleaning: strip headers like "What do you like most?" and "What needs improvement?" so the Wall of Love shows clean content

#### 7. Update `supabase/config.toml`
- Register `[functions.import-gartner-reviews]` with `verify_jwt = false`

### How It Works for the Admin

1. Go to Integrations, click "Add Integration", select "Gartner Peer Insights"
2. The dialog shows a text area and CSV upload option (no API key needed)
3. Admin copies reviews from their Gartner product page and pastes them, or uploads a CSV export
4. Click "Import" -- the frontend parses the data and sends it to the backend function
5. Reviews appear in the evidence table, ready for review/publishing
6. The integration card shows import stats (imported, skipped duplicates, etc.)

### Why This Is Free

- No Firecrawl subscription needed
- No external API keys required
- The admin manually provides the data from Gartner (which they already have access to)
- The parsing/import logic runs entirely on your existing backend

