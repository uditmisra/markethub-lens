
## Fundamental Conceptual Redesign — Status

### ✅ Phase 1: Rename Everything (DONE)
- Product: "CustomerEvidence" → "WallOfLove"
- "Evidence" → "Testimonials" in all UI
- "Submit Evidence" → "Share Feedback"
- "Dashboard" → "Testimonial Library"
- "Review" → "Pending Review"
- "Integrations" → "Connections"
- "Widgets" → "Embed"

### ✅ Phase 2: Separate User Journeys (DONE)
- Submit page: multi-step progressive disclosure form
- Post-submit success page with "what happens next"
- Admin: removed "Approve" action — only Publish/Archive/Delete
- Collapsed "approved" status into "published" (DB data migrated)
- Removed "approved" from all filter dropdowns

### ✅ Phase 3: Clarify What "Published" Means (DONE)
- Status tooltips explain where published items go
- Publish success dialog with public URL (was already done)
- Landing page prominently links to Wall of Love

### ✅ Phase 4: Fix Archive/Delete Confusion (DONE)
- Removed "Reject" button entirely
- Two actions: Publish, Archive
- Delete is admin-only, clearly destructive

### ✅ Phase 5: Separate Imported Reviews (Partially)
- Source badges (G2, Capterra) shown on cards
- Filter by source available in dashboard

### ✅ Phase 6: Landing Page Clarity (DONE)
- New hero: "Your Wall of Love — Automatically"
- 3-step visual journey
- Single CTA: "See the Wall of Love"

### 🔲 Phase 7: Submitter Feedback Loop (TODO)
- Email notifications on publish (needs edge function)
- Submitter status tracking page
