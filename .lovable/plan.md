

## Plan: Fetch GHL Tags and Use for Revenue Classification + Filtering

### Context
Currently, the GHL sync does not capture tags from opportunities. The GHL API v2 returns a `tags` array on each opportunity/contact. We need to:
1. Store tags per lead in the database
2. Use tags to classify revenue as "New Revenue", "Recurring Revenue", or "One-Time"
3. Add a tag filter dropdown to the dashboard

### Step 1: Add `tags` column to `leads` table
- Migration: `ALTER TABLE leads ADD COLUMN tags text[] DEFAULT '{}'::text[]`
- Text array to store all tags from each GHL opportunity

### Step 2: Update `ghl-sync` edge function to capture tags
- Add `tags` to the `GHLOpportunity` interface (GHL returns `tags: string[]` on opportunities)
- Log a sample opportunity's full JSON to confirm tag field name
- Include tags in `buildLeadRow()` output and upsert
- Collect all unique tags across opportunities and return them in the sync summary

### Step 3: Update `useOverviewData` hook for tag-based revenue classification
- Instead of filtering by hardcoded service names (`WL`, `CA`, etc.), use tags to determine:
  - **New Revenue (Total)**: all won deals revenue
  - **Recurring Revenue**: won deals with a tag indicating recurring (you will need to tell me which tag names indicate "recurring" vs "one-time")
  - **One-Time Revenue**: the remainder (new revenue minus recurring)
- Accept a `selectedTags` filter parameter to filter leads by tags before computing metrics

### Step 4: Add tag filter dropdown to dashboard UI
- Create a hook or query to fetch all distinct tags from the `leads` table
- Add a multi-select dropdown in the `OverviewSection` and `LeadQualitySection` headers (next to the date filter)
- When tags are selected, pass them to `useOverviewData` and `LeadQualitySection` to filter leads accordingly
- Show "All Tags" when none selected

### Step 5: Re-sync GHL data
- Trigger a manual sync to populate the new `tags` column for all existing leads

### Questions needed
Before implementing, I need to understand how your tags map to revenue types. I will first sync and log the actual tags from your pipeline so we can define the classification rules together.

### Technical summary
- 1 migration (add `tags` column)
- 1 edge function update (`ghl-sync`)
- 2 hook updates (`useOverviewData`, lead quality data)
- 2 component updates (`OverviewSection`, `LeadQualitySection`) for tag dropdown

