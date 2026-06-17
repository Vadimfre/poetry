const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** Resolves author/media paths from API upload or external URLs. */
export function resolveMediaUrl(src: string | null | undefined): string {
  if (!src) return "/images/author-placeholder.svg";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/upload/")) return `${API_URL}${src}`;
  return src;
}
