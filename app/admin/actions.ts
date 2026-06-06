"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DishTag, PriceKind } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

async function requireClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado. Iniciá sesión de nuevo.");
  return supabase;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categorias");
}

function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: "dishes" | "categories",
  base: string
): Promise<string> {
  let slug = base;
  let n = 1;
  // Try a handful of suffixes; collisions are rare.
  while (true) {
    const { data } = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// ============================================================
// Dishes
// ============================================================

export interface DishInput {
  id?: string;
  category_id: string;
  name_es: string;
  name_en: string;
  name_pt: string;
  desc_es: string;
  desc_en: string;
  desc_pt: string;
  price: number | null;
  price2: number | null;
  price_kind: PriceKind;
  price_tbd: boolean;
  tags: DishTag[];
  photo_url: string | null;
  is_available: boolean;
  is_visible: boolean;
}

export async function saveDish(input: DishInput): Promise<ActionResult> {
  try {
    const supabase = await requireClient();

    const name_es = input.name_es.trim();
    if (!name_es) return { ok: false, error: "El nombre en español es obligatorio." };
    if (!input.category_id) return { ok: false, error: "Elegí una categoría." };

    const payload = {
      category_id: input.category_id,
      name_es,
      name_en: input.name_en.trim() || name_es,
      name_pt: input.name_pt.trim() || name_es,
      desc_es: input.desc_es.trim() || null,
      desc_en: input.desc_en.trim() || null,
      desc_pt: input.desc_pt.trim() || null,
      price: input.price_tbd ? null : input.price,
      price2: input.price_tbd ? null : input.price2,
      price_kind: input.price_kind,
      price_tbd: input.price_tbd,
      tags: input.tags,
      photo_url: input.photo_url,
      is_available: input.is_available,
      is_visible: input.is_visible,
    };

    if (input.id) {
      const { error } = await supabase.from("dishes").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      revalidateAll();
      return { ok: true, id: input.id };
    }

    // New dish: compute slug + sort_order at end of its category.
    const slug = await uniqueSlug(supabase, "dishes", slugify(name_es));
    const { data: last } = await supabase
      .from("dishes")
      .select("sort_order")
      .eq("category_id", input.category_id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = (last?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("dishes")
      .insert({ ...payload, slug, sort_order })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setDishAvailable(id: string, value: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const { error } = await supabase.from("dishes").update({ is_available: value }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setDishVisible(id: string, value: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const { error } = await supabase.from("dishes").update({ is_visible: value }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteDish(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const { error } = await supabase.from("dishes").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function moveDish(id: string, dir: "up" | "down"): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const { data: dish } = await supabase
      .from("dishes")
      .select("id, category_id, sort_order")
      .eq("id", id)
      .single();
    if (!dish) return { ok: false, error: "Plato no encontrado." };

    const query = supabase
      .from("dishes")
      .select("id, sort_order")
      .eq("category_id", dish.category_id);
    const { data: neighbour } = await (dir === "up"
      ? query.lt("sort_order", dish.sort_order).order("sort_order", { ascending: false })
      : query.gt("sort_order", dish.sort_order).order("sort_order", { ascending: true })
    )
      .limit(1)
      .maybeSingle();
    if (!neighbour) return { ok: true }; // already at edge

    await supabase.from("dishes").update({ sort_order: neighbour.sort_order }).eq("id", dish.id);
    await supabase.from("dishes").update({ sort_order: dish.sort_order }).eq("id", neighbour.id);
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ============================================================
// Categories
// ============================================================

export async function addCategory(input: {
  name_es: string;
  name_en: string;
  name_pt: string;
}): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const name_es = input.name_es.trim();
    if (!name_es) return { ok: false, error: "Poné un nombre para la categoría." };
    const slug = await uniqueSlug(supabase, "categories", slugify(name_es));
    const { data: last } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = (last?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        slug,
        name_es,
        name_en: input.name_en.trim() || name_es,
        name_pt: input.name_pt.trim() || name_es,
        sort_order,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function renameCategory(input: {
  id: string;
  name_es: string;
  name_en: string;
  name_pt: string;
}): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const name_es = input.name_es.trim();
    if (!name_es) return { ok: false, error: "El nombre no puede quedar vacío." };
    const { error } = await supabase
      .from("categories")
      .update({
        name_es,
        name_en: input.name_en.trim() || name_es,
        name_pt: input.name_pt.trim() || name_es,
      })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setCategoryVisible(id: string, value: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const { error } = await supabase.from("categories").update({ is_visible: value }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function moveCategory(id: string, dir: "up" | "down"): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const { data: cat } = await supabase
      .from("categories")
      .select("id, sort_order")
      .eq("id", id)
      .single();
    if (!cat) return { ok: false, error: "Categoría no encontrada." };
    const query = supabase.from("categories").select("id, sort_order");
    const { data: neighbour } = await (dir === "up"
      ? query.lt("sort_order", cat.sort_order).order("sort_order", { ascending: false })
      : query.gt("sort_order", cat.sort_order).order("sort_order", { ascending: true })
    )
      .limit(1)
      .maybeSingle();
    if (!neighbour) return { ok: true };
    await supabase.from("categories").update({ sort_order: neighbour.sort_order }).eq("id", cat.id);
    await supabase.from("categories").update({ sort_order: cat.sort_order }).eq("id", neighbour.id);
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireClient();
    const { count } = await supabase
      .from("dishes")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error: "La categoría tiene platos. Movélos o eliminálos primero.",
      };
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidateAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
