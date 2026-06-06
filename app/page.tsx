import { getPublicMenu } from "@/lib/menu";
import { Carta } from "@/components/carta/Carta";
import "./carta.css";

// Cache the menu but allow on-demand revalidation from the admin (revalidatePath("/")).
export const revalidate = 60;

async function checkImageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", next: { revalidate: 3600 } });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function Page() {
  const menu = await getPublicMenu();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let ambientUrl = "/images/brand/hero-bg.jpg";

  if (base) {
    const supabaseUrl = `${base}/storage/v1/object/public/ambient/ambient-1.jpg`;
    const exists = await checkImageExists(supabaseUrl);
    if (exists) {
      ambientUrl = supabaseUrl;
    }
  }

  return <Carta menu={menu} ambientUrl={ambientUrl} />;
}
