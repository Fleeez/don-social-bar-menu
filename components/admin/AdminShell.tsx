import Link from "next/link";
import * as React from "react";
import { LogoMark } from "@/components/LogoMark";
import { LogoutButton } from "./LogoutButton";

export function AdminShell({
  active,
  title,
  sub,
  action,
  children,
}: {
  active: "carta" | "cats";
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="admin-topbar">
        <div className="brand">
          <LogoMark size={36} />
          <div>
            <div className="t">CRIOLLO</div>
            <div className="s">Panel de la carta</div>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="admin-head">
        <div className="titles">
          <h1>{title}</h1>
          {sub && <div className="sub">{sub}</div>}
        </div>
        {action}
      </div>

      <nav className="admin-tabs">
        <Link className={`admin-tab${active === "carta" ? " active" : ""}`} href="/admin">
          Carta
        </Link>
        <Link className={`admin-tab${active === "cats" ? " active" : ""}`} href="/admin/categorias">
          Categorías
        </Link>
      </nav>

      <main className="admin-main">{children}</main>
    </>
  );
}
