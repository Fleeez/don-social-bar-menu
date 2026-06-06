import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { DishForm } from "@/components/admin/DishForm";
import { getAdminCategories, getAdminDish } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function EditDishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, dish] = await Promise.all([
    getAdminCategories(),
    getAdminDish(id),
  ]);
  if (!dish) notFound();

  return (
    <AdminShell active="carta" title="Editar plato" sub={dish.name_es}>
      <DishForm categories={categories} dish={dish} />
    </AdminShell>
  );
}
