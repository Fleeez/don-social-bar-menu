import { getPublicMenu } from "@/lib/menu";
import { Carta } from "@/components/carta/Carta";
import "./carta.css";

// Cache the menu but allow on-demand revalidation from the admin (revalidatePath("/")).
export const revalidate = 60;

export default async function Page() {
  const menu = await getPublicMenu();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ambientUrl = base
    ? `${base}/storage/v1/object/public/ambient/ambient-1.jpg`
    : null;
  return <Carta menu={menu} ambientUrl={ambientUrl} />;
}
