export interface ParsedGartnerReview {
  reviewer_name: string;
  company: string;
  job_title?: string;
  rating: number;
  title: string;
  content: string;
  date?: string;
}

/**
 * Parse pasted Gartner Peer Insights review text into structured reviews.
 * 
 * Gartner reviews typically follow this pattern when copied from the page:
 *   "Title of review"
 *   Rating: X.0/5
 *   Reviewer Name, Job Title at Company
 *   Date
 *   "What do you like most..." answer
 *   "What needs improvement..." answer
 */
export function parseGartnerPaste(text: string): ParsedGartnerReview[] {
  const reviews: ParsedGartnerReview[] = [];

  // Try splitting by common Gartner review separators
  // Reviews are often separated by star ratings or "Overall Rating" lines
  const reviewBlocks = text.split(/(?=Overall Rating|(?:^|\n)(?:\d(?:\.\d)?)\s*(?:\/\s*5|out of 5|stars?))/im)
    .filter((block) => block.trim().length > 30);

  if (reviewBlocks.length <= 1) {
    // Fallback: try splitting by double newlines with rating patterns
    const altBlocks = text.split(/\n{3,}/).filter((b) => b.trim().length > 30);
    if (altBlocks.length > 1) {
      reviewBlocks.length = 0;
      reviewBlocks.push(...altBlocks);
    }
  }

  for (const block of reviewBlocks) {
    const review = parseSingleReview(block.trim());
    if (review) {
      reviews.push(review);
    }
  }

  // If no structured reviews found, treat entire text as a single review
  if (reviews.length === 0 && text.trim().length > 20) {
    reviews.push({
      reviewer_name: 'Anonymous',
      company: 'Not specified',
      rating: 0,
      title: text.trim().substring(0, 80),
      content: text.trim(),
    });
  }

  return reviews;
}

function parseSingleReview(block: string): ParsedGartnerReview | null {
  // Extract rating
  const ratingMatch = block.match(/(\d(?:\.\d)?)\s*(?:\/\s*5|out of 5|stars?)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;

  // Extract reviewer info: "Name, Title at Company" or "Name - Title, Company"
  const reviewerMatch = block.match(
    /(?:by\s+|reviewer:\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[,\-]\s*(.+?)(?:\s+at\s+|\s*,\s*)([A-Za-z][\w\s&.]+)/im
  );

  // Extract date
  const dateMatch = block.match(
    /(?:reviewed|posted|date)?:?\s*(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
  );

  // Extract content sections
  const likeMost = block.match(
    /(?:What do you like most|Likes?|Pros?|What I like)[:\s]*([\s\S]*?)(?=What (?:do you )?(?:dislike|needs? improvement)|Cons?:|Dislikes?:|$)/i
  );
  const dislike = block.match(
    /(?:What (?:do you )?(?:dislike|needs? improvement)|Cons?:|Dislikes?:)[:\s]*([\s\S]*?)$/i
  );

  const contentParts: string[] = [];
  if (likeMost?.[1]?.trim()) contentParts.push(likeMost[1].trim());
  if (dislike?.[1]?.trim()) contentParts.push(dislike[1].trim());

  // If no structured content found, use the whole block minus metadata
  const content = contentParts.length > 0
    ? contentParts.join('\n\n')
    : block.replace(/(\d(?:\.\d)?)\s*(?:\/\s*5|out of 5|stars?)/gi, '').trim();

  if (content.length < 10) return null;

  // Try to extract a title (first line or first sentence)
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  const titleCandidate = lines[0]?.length < 120 ? lines[0] : content.substring(0, 80);

  return {
    reviewer_name: reviewerMatch?.[1] || 'Anonymous',
    company: reviewerMatch?.[3]?.trim() || 'Not specified',
    job_title: reviewerMatch?.[2]?.trim() || undefined,
    rating,
    title: titleCandidate.replace(/[*#]/g, '').trim() || 'Gartner Review',
    content,
    date: dateMatch?.[1] || undefined,
  };
}

/**
 * Parse a CSV string into Gartner reviews.
 * Expected columns: Name, Company, Job Title, Rating, Title, Review, Date
 * (column order is flexible, matched by header name)
 */
export function parseGartnerCSV(csvText: string): ParsedGartnerReview[] {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  const nameIdx = headers.findIndex((h) => h.includes('name') && !h.includes('company'));
  const companyIdx = headers.findIndex((h) => h.includes('company'));
  const jobIdx = headers.findIndex((h) => h.includes('job') || h.includes('title') && !h.includes('review'));
  const ratingIdx = headers.findIndex((h) => h.includes('rating') || h.includes('score'));
  const titleIdx = headers.findIndex((h) => h === 'title' || h.includes('review title') || h.includes('headline'));
  const contentIdx = headers.findIndex((h) => h.includes('review') || h.includes('content') || h.includes('text'));
  const dateIdx = headers.findIndex((h) => h.includes('date'));

  const reviews: ParsedGartnerReview[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const content = cols[contentIdx] || cols[cols.length - 1] || '';
    if (content.length < 5) continue;

    reviews.push({
      reviewer_name: cols[nameIdx] || 'Anonymous',
      company: cols[companyIdx] || 'Not specified',
      job_title: jobIdx >= 0 ? cols[jobIdx] : undefined,
      rating: ratingIdx >= 0 ? parseFloat(cols[ratingIdx]) || 0 : 0,
      title: (titleIdx >= 0 ? cols[titleIdx] : content.substring(0, 80)) || 'Gartner Review',
      content,
      date: dateIdx >= 0 ? cols[dateIdx] : undefined,
    });
  }

  return reviews;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
