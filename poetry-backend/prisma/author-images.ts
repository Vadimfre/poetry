/**
 * Author portrait paths — all local files in /public/images/authors.
 */
export const AUTHOR_IMAGES: Record<string, string> = {
  "ales-pismanokov": "/images/authors/ales-pismanokov.jpg",
  "arkadz-kuliashou": "/images/authors/arkadz-kuliashou.jpg",
  "zmitrok-biadula": "/images/authors/zmitrok-biadula.jpg",
  "danuta-bichel-zahnetava": "/images/authors/danuta-bichel-zahnetava.jpg",
  "maksim-bahdanovich": "/images/authors/maksim-bahdanovich.jpg",
  "maksim-tank": "/images/authors/maksim-tank.jpg",
  "nil-hilevich": "/images/authors/nil-hilevich.jpg",
  "petrus-brouka": "/images/authors/petrus-brouka.jpg",
  "ryhor-baradulin": "/images/authors/ryhor-baradulin.jpg",
  "uladzimir-karatkevich": "/images/authors/uladzimir-karatkevich.jpg",
  "francishak-bahushevich": "/images/authors/francishak-bahushevich.jpg",
  "yanka-kupala": "/images/authors/yanka-kupala.jpg",
  "yanka-sipakov": "/images/authors/yanka-sipakov.jpg",
  "yanka-bryl": "/images/authors/yanka-bryl.jpg",
  "yakub-kolas": "/images/authors/yakub-kolas.jpg",
  tsiotka: "/images/authors/tsiotka.jpg",
  "larysa-hieniyush": "/images/authors/larysa-hieniyush.jpg",
  "andrei-khadanovich": "/images/authors/andrei-khadanovich.jpg",
  "kastus-veranitsyn": "/images/authors/kastus-veranitsyn.jpg",
};

export function authorImageForSlug(slug: string): string | null {
  return AUTHOR_IMAGES[slug] ?? null;
}
