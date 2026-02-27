

## Fix Wall of Love -- Content Parsing and Visual Polish

### Problems Identified

1. **"Dislike" in Word Cloud**: The G2 reviews contain the repeated prompt text `**What do you dislike about the product?**` and `**What do you like best about the product?**`. The word cloud extracts "dislike" as a top keyword because it appears in every review.

2. **Raw Markdown in Cards**: The testimonial cards display raw markdown (`**What do you like best...**`) instead of clean text. The `review_data` field is `null` for these imported reviews, so the card falls back to showing the full raw `content`.

3. **Visual issues**: Cards all say "Anonymous" / "Not specified" which looks repetitive and unimpressive. The content is too long on some cards, making the masonry layout feel unbalanced.

---

### Plan

#### 1. Add a content-cleaning utility (`src/utils/parseReviewContent.ts`)

Create a helper function that:
- Extracts just the "What do you like best" answer from G2-formatted reviews (the positive section only)
- Strips markdown bold markers (`**`)
- Falls back to full content if no G2 structure is detected
- Truncates to ~300 characters with ellipsis for card display

#### 2. Fix the Word Cloud (`src/components/wall/WordCloud.tsx`)

- Add G2 prompt phrases to the stop-word filter: "dislike", "product", "best", "like" (already there but "dislike" is missing)
- Before extracting words, run the same content-cleaning utility to only analyze the positive section of reviews
- Add more common filler words: "also", "well", "really", "much", "very" etc. (some are already there but double-check)

#### 3. Fix TestimonialCard display (`src/components/wall/TestimonialCard.tsx`)

- Use the content-cleaning utility to show only the positive excerpt
- Cap displayed text at ~250 chars with "..." to keep cards balanced
- Hide "Not specified" for job titles -- just show company name if job title is missing or "Not specified"
- Hide "Anonymous" avatar fallback text when the name is literally "Anonymous" -- show a generic icon instead

#### 4. Minor visual improvements

- Give the StatsHero a slightly more refined gradient (the current bright blue feels flat)
- Ensure the word cloud filters out brand names like "spotdraft" which are meaningless to visitors

### Technical Details

**New file:** `src/utils/parseReviewContent.ts`
- `extractPositiveContent(content: string): string` -- regex to grab text between "like best" and "dislike" headers
- `cleanMarkdown(text: string): string` -- strip `**` markers
- `truncate(text: string, max: number): string`

**Modified files:**
- `src/components/wall/WordCloud.tsx` -- use `extractPositiveContent` before word extraction; add "dislike", "spotdraft", "product" to stop words
- `src/components/wall/TestimonialCard.tsx` -- use cleaned content; hide empty/placeholder metadata
- `src/components/wall/StatsHero.tsx` -- tweak gradient colors for a warmer, more polished look

