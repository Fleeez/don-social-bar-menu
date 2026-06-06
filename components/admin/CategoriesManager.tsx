"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import {
  addCategory,
  renameCategory,
  setCategoryVisible,
  moveCategory,
  deleteCategory,
} from "@/app/admin/actions";

export function CategoriesManager({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Local editable copies of the names.
  const [edits, setEdits] = useState<Record<string, { es: string; en: string; pt: string }>>(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.id, { es: c.name_es, en: c.name_en, pt: c.name_pt }])
      )
  );

  const [newEs, setNewEs] = useState("");
  const [newEn, setNewEn] = useState("");
  const [newPt, setNewPt] = useState("");

  function run(id: string | null, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    start(async () => {
      const res = await fn();
      setBusyId(null);
      if (!res.ok && res.error) alert(res.error);
      else router.refresh();
    });
  }

  function onSaveName(c: Category) {
    const e = edits[c.id];
    run(c.id, () => renameCategory({ id: c.id, name_es: e.es, name_en: e.en, name_pt: e.pt }));
  }

  function onAdd() {
    if (!newEs.trim()) {
      alert("Poné un nombre para la categoría.");
      return;
    }
    run(null, async () => {
      const res = await addCategory({ name_es: newEs, name_en: newEn, name_pt: newPt });
      if (res.ok) {
        setNewEs("");
        setNewEn("");
        setNewPt("");
      }
      return res;
    });
  }

  return (
    <>
      <p className="hint" style={{ padding: "8px 16px 0" }}>
        Los cambios se ven al instante en la carta. Para eliminar una categoría, primero movés o
        borrás sus platos.
      </p>

      <div className="cat-list">
        {categories.map((c, i) => {
          const e = edits[c.id] ?? { es: c.name_es, en: c.name_en, pt: c.name_pt };
          const count = counts[c.id] ?? 0;
          const busy = busyId === c.id;
          const dirty = e.es !== c.name_es || e.en !== c.name_en || e.pt !== c.name_pt;
          return (
            <div key={c.id} className={`cat-card${c.is_visible ? "" : " hidden-cat"}`}>
              <div className="cat-card-top">
                <div className="cat-move">
                  <button className="row-btn" title="Subir" disabled={busy || i === 0} onClick={() => run(c.id, () => moveCategory(c.id, "up"))}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
                  </button>
                  <button className="row-btn" title="Bajar" disabled={busy || i === categories.length - 1} onClick={() => run(c.id, () => moveCategory(c.id, "down"))}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                </div>
                <div className="nm">
                  {c.name_es}
                  <div className="cat-group-count">{count} platos{c.is_visible ? "" : " · oculta"}</div>
                </div>
              </div>

              <div className="cat-card-names">
                <input className="input" value={e.es} placeholder="Nombre ES" onChange={(ev) => setEdits((p) => ({ ...p, [c.id]: { ...e, es: ev.target.value } }))} />
                <input className="input" value={e.en} placeholder="Nombre EN" onChange={(ev) => setEdits((p) => ({ ...p, [c.id]: { ...e, en: ev.target.value } }))} />
                <input className="input" value={e.pt} placeholder="Nombre PT" onChange={(ev) => setEdits((p) => ({ ...p, [c.id]: { ...e, pt: ev.target.value } }))} />
              </div>

              <div className="cat-card-actions">
                <button className="btn-primary" disabled={busy || !dirty} onClick={() => onSaveName(c)} style={{ padding: "9px 14px", fontSize: 13 }}>
                  Guardar nombre
                </button>
                <button className="btn-ghost" disabled={busy} onClick={() => run(c.id, () => setCategoryVisible(c.id, !c.is_visible))} style={{ padding: "9px 14px", fontSize: 13 }}>
                  {c.is_visible ? "Ocultar" : "Mostrar"}
                </button>
                <button className="btn-ghost" disabled={busy} onClick={() => { if (confirm(`¿Eliminar la categoría "${c.name_es}"?`)) run(c.id, () => deleteCategory(c.id)); }} style={{ padding: "9px 14px", fontSize: 13, color: "var(--danger)" }}>
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cat-add">
        <h3>Nueva categoría</h3>
        <div className="row3">
          <input className="input" value={newEs} placeholder="Nombre ES (ej. Cafetería)" onChange={(e) => setNewEs(e.target.value)} />
          <input className="input" value={newEn} placeholder="Nombre EN" onChange={(e) => setNewEn(e.target.value)} />
          <input className="input" value={newPt} placeholder="Nombre PT" onChange={(e) => setNewPt(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={onAdd} disabled={busyId === null && false} style={{ width: "100%", justifyContent: "center" }}>
          Agregar categoría
        </button>
      </div>
    </>
  );
}
