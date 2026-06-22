const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PLACEHOLDER = "/images/author-placeholder.svg";

/** Static portrait path — files live in public/images/authors/{slug}.jpg */
export function authorPortraitPath(slug: string | null | undefined): string {
  if (!slug) return PLACEHOLDER;
  return `/images/authors/${slug}.jpg`;
}

/** Author portraits always served from frontend public folder. */
export function resolveAuthorImageUrl(
  slug: string | null | undefined,
  _src?: string | null,
): string {
  return authorPortraitPath(slug);
}

/** Resolves other media paths from API upload or external URLs. */
export function resolveMediaUrl(src: string | null | undefined): string {
  if (!src) return PLACEHOLDER;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/upload/authors/")) {
    const slug = src.replace("/upload/authors/", "").replace(/\.jpg$/i, "");
    return authorPortraitPath(slug);
  }
  if (src.startsWith("/upload/")) return `${API_URL}${src}`;
  return src;
}
