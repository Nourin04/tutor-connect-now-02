/**
 * Capitalizes the first letter of each word in a string, handling word boundaries.
 * E.g., "john-luc o'connor" -> "John-Luc O'Connor"
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
