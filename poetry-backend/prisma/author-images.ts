/**
 * Author portrait paths. Prefer local files in /public/images/authors.
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
  "yakub-kolas":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Kanstantyn_Mickievi%C4%8D_%28Jakub_Ko%C5%82as%29._%D0%9A%D0%B0%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%82%D1%8B%D0%BD_%D0%9C%D1%96%D1%86%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%28%D0%AF%D0%BA%D1%83%D0%B1_%D0%9A%D0%BE%D0%BB%D0%B0%D1%81%29_%281925%29.jpg/330px-Kanstantyn_Mickievi%C4%8D_%28Jakub_Ko%C5%82as%29._%D0%9A%D0%B0%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%82%D1%8B%D0%BD_%D0%9C%D1%96%D1%86%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%28%D0%AF%D0%BA%D1%83%D0%B1_%D0%9A%D0%BE%D0%BB%D0%B0%D1%81%29_%281925%29.jpg",
  tsiotka:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/A%C5%82aiza_Pa%C5%A1kievi%C4%8D._%D0%90%D0%BB%D0%B0%D1%96%D0%B7%D0%B0_%D0%9F%D0%B0%D1%88%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%281912%29.jpg/330px-A%C5%82aiza_Pa%C5%A1kievi%C4%8D._%D0%90%D0%BB%D0%B0%D1%96%D0%B7%D0%B0_%D0%9F%D0%B0%D1%88%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%281912%29.jpg",
  "larysa-hieniyush":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/%C5%81arysa_Hieniju%C5%A1._%D0%9B%D0%B0%D1%80%D1%8B%D1%81%D0%B0_%D0%93%D0%B5%D0%BD%D1%96%D1%8E%D1%88_%281930-39%29.jpg/330px-%C5%81arysa_Hieniju%C5%A1._%D0%9B%D0%B0%D1%80%D1%8B%D1%81%D0%B0_%D0%93%D0%B5%D0%BD%D1%96%D1%8E%D1%88_%281930-39%29.jpg",
  "andrei-khadanovich":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hadanovich2011.jpg/330px-Hadanovich2011.jpg",
  "kastus-veranitsyn":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gorodok-verenitsyn.JPG/330px-Gorodok-verenitsyn.JPG",
};

export function authorImageForSlug(slug: string): string | null {
  return AUTHOR_IMAGES[slug] ?? null;
}
