import { AdminShell } from "@/components/admin/AdminShell";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { getAdminCategories, getAdminDishes } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, dishes] = await Promise.all([
    getAdminCategories(),
    getAdminDishes(),
  ]);
  const counts: Record<string, number> = {};
  for (const d of dishes) counts[d.category_id] = (counts[d.category_id] ?? 0) + 1;

  return (
    <AdminShell active="cats" title="Categorías" sub={`${categories.length} categorías`}>
      <CategoriesManager categories={categories} counts={counts} />
    </AdminShell>
  );
}
