

## Plan: Map GHL Contact Owner to Closer + Derive Qualification from Tags

### Problem
1. **Closer is always "Unassigned"** — the GHL `assignedTo` field (Contact Owner user ID) is fetched but never written to `closer_id` in the leads table.
2. **Qualification is always "mql"** — never set during sync; falls back to the DB column default.

### Current GHL Fields Used
| Lead Column | GHL Source | Status |
|---|---|---|
| `name` | `contact.name` or `opp.name` | ✅ Working |
| `company` | `contact.companyName` | ✅ Working |
| `pipeline_stage` | Derived from stage name | ✅ Working |
| `deal_size` | `monetaryValue` | ✅ Working |
| `source` | `opp.source` | ✅ Working |
| `tags` | `opp.tags` or `contact.tags` | ✅ Working |
| `closer_id` | `opp.assignedTo` | ❌ Not mapped |
| `qualification` | — | ❌ Not mapped (defaults to mql) |

### Step 1: Map `assignedTo` to Closer
- The GHL `assignedTo` field contains a GHL user ID (the Contact Owner).
- We need to either:
  - **Option A**: Store the GHL user ID directly and create/match closers by fetching GHL users list (via `/users/?locationId=...`) to get their names, then upsert into the `closers` table.
  - This means the sync will: (1) fetch GHL users for the location, (2) upsert them into `closers` with a new `ghl_user_id` column, (3) map `assignedTo` → `closer_id` via the lookup.
- Add `ghl_user_id text` column to the `closers` table for mapping.

### Step 2: Derive Qualification from Tags
- Tags like `sql wl`, `sql ca`, `mql wl`, `mql ca` already encode the qualification.
- Logic: if any tag starts with "sql" → qualification = "sql"; if any starts with "mql" → "mql"; otherwise keep default.
- Set this in `buildLeadRow()` during sync.

### Step 3: Re-sync
- Trigger a manual sync to populate `closer_id` and `qualification` for all existing leads.

### Technical Changes
- **1 migration**: Add `ghl_user_id text` column to `closers` table (with unique constraint).
- **Edge function (`ghl-sync`)**: 
  - Fetch GHL users via `/users/?locationId=...` and upsert into closers.
  - Map `opp.assignedTo` → `closer_id` via `ghl_user_id` lookup.
  - Derive `qualification` from tag prefixes (sql/mql).
  - Include both fields in `buildLeadRow()` output.

