"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category, Dish } from "@/lib/types";
import { formatARS } from "@/lib/format";
import { setDishAvailable, deleteDish, moveDish } from "@/app/admin/actions";

function priceText(d: Dish): { text: string; tbd: boolean } {
  if (d.price_tbd || (d.price == null && d.price2 == null))
    return { text: "Precio a confirmar", tbd: true };
  if (d.price_kind !== "single" && d.price != null && d.price2 != null) {
    const labels = d.price_kind === "p2p4" ? ["P2", "P4"] : ["Copa", "Bot."];
    return { text: `${labels[0]} ${formatARS(d.price)} · ${labels[1]} ${formatARS(d.price2)}`, tbd: false };
  }
  return { text: formatARS((d.price ?? d.price2)!), tbd: false };
}

export function DishList({
  categories,
  dishes,
}: {
  categories: Category[];
  dishes: Dish[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const q = query.trim().toLowerCase();

  const grouped = useMemo(
    () =>
      categories.map((cat) => ({
        cat,
        dishes: dishes
          .filter((d) => d.category_id === cat.id)
          .filter(
            (d) =>
              !q ||
              d.name_es.toLowerCase().includes(q) ||
              d.name_en.toLowerCase().includes(q) ||
              d.name_pt.toLowerCase().includes(q)
          ),
      })),
    [categories, dishes, q]
  );

  function runAction(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPendingId(id);
    start(async () => {
      const res = await fn();
      setPendingId(null);
      if (!res.ok && res.error) alert(res.error);
      else router.refresh();
    });
  }

  function onToggleAgotado(d: Dish) {
    runAction(d.id, () => setDishAvailable(d.id, !d.is_available));
  }

  function onDelete(d: Dish) {
    if (!confirm(`¿Eliminar "${d.name_es}" de la carta? Esta acción no se puede deshacer.`)) return;
    runAction(d.id, () => deleteDish(d.id));
  }

  const total = grouped.reduce((n, g) => n + g.dishes.length, 0);

  return (
    <>
      <div className="admin-search-bar">
        <input
          className="admin-search"
          type="search"
          placeholder="Buscar plato…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {total === 0 && (
        <p className="empty-cat">No hay platos que coincidan con la búsqueda.</p>
      )}

      {grouped.map(({ cat, dishes: ds }) => {
        if (ds.length === 0) return null;
        return (
          <section key={cat.id} className="cat-group">
            <div className="cat-group-head">
              <span className="cat-group-name">{cat.name_es}</span>
              <span className="cat-group-count">{ds.length} platos</span>
            </div>
            {ds.map((d, i) => {
              const pt = priceText(d);
              const busy = pendingId === d.id;
              const status = !d.is_visible ? "oculto" : !d.is_available ? "agotado" : "ok";
              return (
                <div key={d.id} className={`dish-row${status !== "ok" ? " dim" : ""}`}>
                  <div className="dish-thumb">
                    {d.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.photo_url} alt="" />
                    ) : (
                      <div className="ph">DON BAR</div>
                    )}
                  </div>
                  <div className="dish-row-info">
                    <div className="dish-row-name">{d.name_es}</div>
                    <div className={`dish-row-price${pt.tbd ? " tbd" : ""}`}>{pt.text}</div>
                  </div>

                  {status === "agotado" && <span className="pill pill-agotado">Agotado</span>}
                  {status === "oculto" && <span className="pill pill-oculto">Oculto</span>}

                  <div className="row-actions">
                    <button
                      className="row-btn"
                      title="Subir"
                      disabled={busy || i === 0}
                      onClick={() => runAction(d.id, () => moveDish(d.id, "up"))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
                    </button>
                    <button
                      className="row-btn"
                      title="Bajar"
                      disabled={busy || i === ds.length - 1}
                      onClick={() => runAction(d.id, () => moveDish(d.id, "down"))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <button
                      className="row-btn"
                      title={d.is_available ? "Marcar agotado" : "Marcar disponible"}
                      disabled={busy}
                      onClick={() => onToggleAgotado(d)}
                    >
                      {d.is_available ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="5.6" y1="5.6" x2="18.4" y2="18.4" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                    <Link className="row-btn" title="Editar" href={`/admin/platos/${d.id}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </Link>
                    <button
                      className="row-btn danger"
                      title="Eliminar"
                      disabled={busy}
                      onClick={() => onDelete(d)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
