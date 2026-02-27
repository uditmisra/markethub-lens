
## Wall of Love -- Visual Redesign

Transform the `/testimonials` page from a standard card grid into an impressive, fun, customer-facing showcase.

### Design Concept

**Masonry Layout + Animated Word Cloud + Stats Banner + Floating Hearts**

The page will have these sections:

1. **Hero with animated stats** -- Average rating, total testimonials count, and a fun tagline with a gentle gradient background and floating heart particles
2. **Word Cloud section** -- Extract key positive words from all testimonial content and render them as a visual word cloud with varying sizes, colors, and slight rotation
3. **Masonry testimonial wall** -- Replace the uniform grid with a Pinterest-style masonry layout where cards have varying heights based on content length, creating a more organic, impressive feel
4. **Remove heavy filter bar** -- Replace the 4-dropdown filter bar with a simple search + pill-based quick filters (e.g., "5 Stars", "4+ Stars") for a lighter feel
5. **Auto-filter low reviews** -- Only display testimonials with a rating of 4 or higher (or no rating at all). Reviews rated below 4/5 are automatically excluded from the public Wall of Love. This filtering happens at the query level so low-rated reviews never reach the client.

### Technical Details

**New components to create:**

- `src/components/wall/WordCloud.tsx` -- Renders extracted keywords as a responsive word cloud using pure CSS (sized spans with random rotation, color from a palette, positioned in a flex-wrap container)
- `src/components/wall/MasonryGrid.tsx` -- CSS columns-based masonry layout (no library needed, uses `columns: 3` CSS property)
- `src/components/wall/TestimonialCard.tsx` -- Redesigned card with large quote marks, colored left border based on rating, hover lift animation, and a more editorial feel
- `src/components/wall/StatsHero.tsx` -- Animated counters showing average rating, total count, floating decorative elements

**Changes to existing files:**

- `src/pages/Testimonials.tsx` -- Complete rewrite of the render section to use the new components; update the Supabase query to filter out ratings below 4:
  ```ts
  .or("rating.gte.4,rating.is.null")
  ```
  This ensures only high-quality testimonials (4+ stars or unrated) appear on the public wall. Move data fetching/filtering logic to stay but replace the entire visual output.
- `src/index.css` -- Add masonry and word cloud CSS utilities, floating animation keyframes

**Masonry approach:** Use CSS `columns` property (`columns: 1/2/3` at breakpoints) with `break-inside: avoid` on cards. No JS library needed.

**Word cloud approach:** Extract top ~30 words from testimonial content (filtering stop words), assign font sizes proportional to frequency, render as flex-wrap spans with slight CSS transforms for visual variety.

**Visual details:**
- Large decorative quote marks on each card in a faded accent color
- Cards get a colored left border: gold for 5-star, blue for 4-star
- Gentle staggered fade-in animation as cards enter viewport
- Stats section uses a gradient-hero background with white text
- Pill filters instead of dropdowns (clickable badges for "5 Stars", "Case Studies")
- Floating heart/sparkle CSS animations in the hero area
- Reviews below 4/5 are never shown -- only the best testimonials make the wall
