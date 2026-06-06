import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DishList } from "@/components/admin/DishList";
import { getAdminCategories, getAdminDishes } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [categories, dishes] = await Promise.all([
    getAdminCategories(),
    getAdminDishes(),
  ]);

  const action = (
    <Link className="btn-primary" href="/admin/platos/nuevo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Nuevo plato
    </Link>
  );

  return (
    <AdminShell
      active="carta"
      title="La carta"
      sub={`${dishes.length} platos · ${categories.length} categorías`}
      action={action}
    >
      <DishList categories={categories} dishes={dishes} />
    </AdminShell>
  );
}
