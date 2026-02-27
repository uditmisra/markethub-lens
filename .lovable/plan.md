
## Proposed: Fundamental Conceptual Redesign

### Phase 1: Rename Everything (Breaking Change - High Impact)
1. **Product Name:** "CustomerEvidence" → "TestimonialHub" or "WallOfLove" or "[YourBrand] Testimonials"
2. **Core Terminology:**
   - "Evidence" → "Testimonials"
   - "Submit Evidence" → "Share Feedback"
   - "Dashboard" → "Testimonial Library" (or "My Submissions" for submitters)
   - "Review" → "Pending Approval"
3. **Database/Types:** Update all references from `evidence` to `testimonials` (or keep internal, just change UI)

### Phase 2: Separate User Journeys
1. **Public Submission Flow:**
   - Rename `/submit` page to "Share Your Feedback"
   - Progressive disclosure form (3-4 steps)
   - Success page explaining what happens next
   - No auth required (or optional)

2. **Admin Management Flow:**
   - Clear separation: "Pending" | "Published" | "All"
   - Remove "Approved" status entirely
   - Only "Publish" or "Archive" actions

### Phase 3: Clarify What "Published" Means
1. **Before Publishing:** Show preview of where it will appear
2. **After Publishing:** Success dialog with public URL (already done ✅)
3. **On Landing Page:** Prominently feature the `/testimonials` public wall

### Phase 4: Fix Archive/Delete Confusion
1. **Remove "Reject" button**
2. **Two actions only:**
   - "Publish" → makes it live
   - "Archive" → hides it (can be unarchived)
   - "Delete" → permanently removes (rare, admin-only)

### Phase 5: Separate Imported Reviews
1. **New section:** "Imported Reviews" (separate from submitted testimonials)
2. **Different UI:** Show source badge, external link, can't edit structure
3. **Filter option:** "Show all" | "Submitted only" | "Imported only"

### Phase 6: Landing Page Clarity
1. **Hero:** "Your Wall of Love - Automatically" with visual
2. **3-Step Journey:** Visual diagram showing workflow
3. **Live Example:** Embed the actual `/testimonials` page as demo
4. **One CTA:** "See Live Demo" → `/testimonials`

### Phase 7: Add Submitter Feedback Loop
1. **Post-submit page:** "Thanks! We'll review within 24 hours"
2. **Email notifications:** When approved, when published
3. **Status page:** Simple view for submitters to track their testimonials

