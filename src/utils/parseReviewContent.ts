/**
 * Utilities for cleaning G2/Capterra review content
 */

/** Extract only the positive "What do you like best" section from G2-formatted reviews */
export function extractPositiveContent(content: string): string {
  // Try to match G2 format: text between "like best" header and "dislike" header
  const likeMatch = content.match(
    /\*?\*?What do you like best[^?]*\?\*?\*?\s*([\s\S]*?)(?:\*?\*?What do you dislike|$)/i
  );
  if (likeMatch && likeMatch[1].trim().length > 10) {
    return cleanMarkdown(likeMatch[1].trim());
  }
  // Fallback: just clean markdown
  return cleanMarkdown(content);
}

/** Strip markdown bold/italic markers */
export function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]*)\*\*/g, "$1") // bold
    .replace(/\*([^*]*)\*/g, "$1")     // italic
    .replace(/_{2}([^_]*)_{2}/g, "$1") // __bold__
    .replace(/_([^_]*)_/g, "$1")       // _italic_
    .trim();
}

/** Truncate text to a max length with ellipsis */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const truncated = text.slice(0, max);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? truncated.slice(0, lastSpace) : truncated) + "…";
}
