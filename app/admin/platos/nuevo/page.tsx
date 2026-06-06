import { AdminShell } from "@/components/admin/AdminShell";
import { DishForm } from "@/components/admin/DishForm";
import { getAdminCategories } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function NewDishPage() {
  const categories = await getAdminCategories();
  return (
    <AdminShell active="carta" title="Nuevo plato" sub="Cargá los datos del plato">
      <DishForm categories={categories} />
    </AdminShell>
  );
}
