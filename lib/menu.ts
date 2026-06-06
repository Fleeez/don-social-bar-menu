import { createSupabasePublicClient } from "./supabase/public";
import { createSupabaseServerClient } from "./supabase/server";
import type { Category, Dish, CategoryWithDishes } from "./types";

/**
 * Public menu for the carta: only visible categories and dishes.
 * Uses the anonymous client (no cookies) so the page stays cacheable.
 */
export async function getPublicMenu(): Promise<CategoryWithDishes[]> {
  try {
    const supabase = createSupabasePublicClient();
    const [{ data: cats }, { data: dishes }] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("dishes")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (!cats) return [];
    const dishList = (dishes ?? []) as Dish[];
    return (cats as Category[])
      .map((c) => ({
        ...c,
        dishes: dishList.filter((d) => d.category_id === c.id),
      }))
      // Hide categories that ended up empty so the nav stays clean.
      .filter((c) => c.dishes.length > 0);
  } catch {
    return [];
  }
}

/** All categories (admin), including hidden, ordered. */
export async function getAdminCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Category[];
}

/** All dishes (admin), including hidden/unavailable, ordered. */
export async function getAdminDishes(): Promise<Dish[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("dishes")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Dish[];
}

export async function getAdminDish(id: string): Promise<Dish | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("dishes")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Dish) ?? null;
}
