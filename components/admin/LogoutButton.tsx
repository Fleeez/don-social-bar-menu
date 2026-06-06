"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function logout() {
    start(async () => {
      await createSupabaseBrowserClient().auth.signOut();
      router.push("/admin/login");
      router.refresh();
    });
  }

  return (
    <button className="btn-logout" onClick={logout} disabled={pending}>
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
