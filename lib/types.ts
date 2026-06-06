export type Lang = "es" | "en" | "pt";

export type PriceKind = "single" | "p2p4" | "copa_botella";

export type DishTag = "recom" | "veg" | "tacc" | "picante" | "compartir";

export const DISH_TAGS: DishTag[] = [
  "recom",
  "veg",
  "tacc",
  "picante",
  "compartir",
];

export interface Category {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  name_pt: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
}

export interface Dish {
  id: string;
  category_id: string;
  slug: string;
  name_es: string;
  name_en: string;
  name_pt: string;
  desc_es: string | null;
  desc_en: string | null;
  desc_pt: string | null;
  price: number | null;
  price2: number | null;
  price_kind: PriceKind;
  price_tbd: boolean;
  tags: DishTag[];
  photo_url: string | null;
  is_available: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithDishes extends Category {
  dishes: Dish[];
}

/** Helpers to read the right localized field. */
export function dishName(d: Dish, lang: Lang): string {
  return (lang === "en" ? d.name_en : lang === "pt" ? d.name_pt : d.name_es) || d.name_es;
}

export function dishDesc(d: Dish, lang: Lang): string {
  const v = lang === "en" ? d.desc_en : lang === "pt" ? d.desc_pt : d.desc_es;
  // Fall back to Spanish when a translation is missing (dishes loaded ES-only).
  return v || d.desc_es || "";
}

export function categoryName(c: Pick<Category, "name_es" | "name_en" | "name_pt">, lang: Lang): string {
  return (lang === "en" ? c.name_en : lang === "pt" ? c.name_pt : c.name_es) || c.name_es;
}
