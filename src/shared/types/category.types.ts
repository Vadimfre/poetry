/** Падкалекцыя ўнутры катэгорыі (спрошаны тып для фронта) */
export interface Collection {
  id: number;
  title?: string;
  slug?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  collections?: Collection[];
  _count?: {
    collections: number;
  };
}
