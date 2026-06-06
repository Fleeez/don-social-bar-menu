"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, Dish, DishTag, Lang, PriceKind } from "@/lib/types";
import { DISH_TAGS } from "@/lib/types";
import { saveDish, deleteDish, type DishInput } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PRICE_KINDS: { value: PriceKind; label: string }[] = [
  { value: "single", label: "Precio único" },
  { value: "p2p4", label: "Por 2 / Por 4 (tablas)" },
  { value: "copa_botella", label: "Copa / Botella (vinos)" },
];

const TAG_LABELS: Record<DishTag, string> = {
  recom: "⭐ Recomendado",
  veg: "🌿 Vegetariano",
  tacc: "Sin TACC",
  picante: "🌶 Picante",
  compartir: "Para compartir",
};

const LANG_TABS: { code: Lang; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

function numOrNull(s: string): number | null {
  const cleaned = s.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function DishForm({
  categories,
  dish,
}: {
  categories: Category[];
  dish?: Dish;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("es");

  const [categoryId, setCategoryId] = useState(dish?.category_id ?? categories[0]?.id ?? "");
  const [nameEs, setNameEs] = useState(dish?.name_es ?? "");
  const [nameEn, setNameEn] = useState(dish?.name_en ?? "");
  const [namePt, setNamePt] = useState(dish?.name_pt ?? "");
  const [descEs, setDescEs] = useState(dish?.desc_es ?? "");
  const [descEn, setDescEn] = useState(dish?.desc_en ?? "");
  const [descPt, setDescPt] = useState(dish?.desc_pt ?? "");
  const [priceKind, setPriceKind] = useState<PriceKind>(dish?.price_kind ?? "single");
  const [priceTbd, setPriceTbd] = useState(dish?.price_tbd ?? false);
  const [price, setPrice] = useState(dish?.price != null ? String(dish.price) : "");
  const [price2, setPrice2] = useState(dish?.price2 != null ? String(dish.price2) : "");
  const [tags, setTags] = useState<Set<DishTag>>(new Set(dish?.tags ?? []));
  const [photoUrl, setPhotoUrl] = useState<string | null>(dish?.photo_url ?? null);
  const [isAvailable, setIsAvailable] = useState(dish?.is_available ?? true);
  const [isVisible, setIsVisible] = useState(dish?.is_visible ?? true);

  const nameByLang = { es: nameEs, en: nameEn, pt: namePt };
  const setNameByLang = { es: setNameEs, en: setNameEn, pt: setNamePt };
  const descByLang = { es: descEs, en: descEn, pt: descPt };
  const setDescByLang = { es: setDescEs, en: setDescEn, pt: setDescPt };

  function toggleTag(tag: DishTag) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("dish-photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setError("No se pudo subir la foto: " + upErr.message);
      } else {
        const { data } = supabase.storage.from("dish-photos").getPublicUrl(path);
        setPhotoUrl(data.publicUrl);
      }
    } catch (err) {
      setError("No se pudo subir la foto: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nameEs.trim()) {
      setError("El nombre en español es obligatorio.");
      setLang("es");
      return;
    }
    const input: DishInput = {
      id: dish?.id,
      category_id: categoryId,
      name_es: nameEs,
      name_en: nameEn,
      name_pt: namePt,
      desc_es: descEs,
      desc_en: descEn,
      desc_pt: descPt,
      price: priceTbd ? null : numOrNull(price),
      price2: priceTbd || priceKind === "single" ? null : numOrNull(price2),
      price_kind: priceKind,
      price_tbd: priceTbd,
      tags: Array.from(tags),
      photo_url: photoUrl,
      is_available: isAvailable,
      is_visible: isVisible,
    };
    start(async () => {
      const res = await saveDish(input);
      if (!res.ok) {
        setError(res.error ?? "No se pudo guardar.");
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  function onDelete() {
    if (!dish) return;
    if (!confirm(`¿Eliminar "${dish.name_es}"? Esta acción no se puede deshacer.`)) return;
    start(async () => {
      const res = await deleteDish(dish.id);
      if (!res.ok) {
        setError(res.error ?? "No se pudo eliminar.");
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form className="form-wrap" onSubmit={onSubmit}>
      {error && <div className="form-error">{error}</div>}

      {/* Photo */}
      <div className="form-card">
        <h2>Foto</h2>
        <div
          className={`photo-upload${photoUrl ? " has-photo" : ""}`}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {photoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="" />
              <button
                type="button"
                className="photo-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoUrl(null);
                }}
                aria-label="Quitar foto"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </>
          ) : uploading ? (
            <span className="uploading">Subiendo foto…</span>
          ) : (
            <>
              <svg className="up-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <span className="up-label">Tocá para subir una foto</span>
              <span className="up-sub">Si no hay foto se usa el logo de Criollo</span>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
      </div>

      {/* Textos por idioma */}
      <div className="form-card">
        <h2>Nombre y descripción</h2>
        <div className="lang-tabs">
          {LANG_TABS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`lang-tab${lang === l.code ? " active" : ""}`}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
        {LANG_TABS.map((l) => (
          <div key={l.code} className={`lang-panel${lang === l.code ? " active" : ""}`}>
            <div className="field">
              <label>Nombre ({l.label})</label>
              <input
                className="input"
                value={nameByLang[l.code]}
                onChange={(e) => setNameByLang[l.code](e.target.value)}
                placeholder={l.code === "es" ? "Ej: Provo y Gustó" : "Igual que en español si no se traduce"}
              />
            </div>
            <div className="field">
              <label>Descripción ({l.label})</label>
              <textarea
                className="textarea"
                value={descByLang[l.code]}
                onChange={(e) => setDescByLang[l.code](e.target.value)}
                placeholder="Descripción del plato…"
              />
            </div>
          </div>
        ))}
        <p className="hint">
          El nombre creativo se suele dejar igual en los tres idiomas; se traduce la descripción.
        </p>
      </div>

      {/* Categoría + precio */}
      <div className="form-card">
        <h2>Categoría y precio</h2>
        <div className="field">
          <label>Categoría</label>
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_es}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Tipo de precio</label>
          <select
            className="select"
            value={priceKind}
            onChange={(e) => setPriceKind(e.target.value as PriceKind)}
          >
            {PRICE_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div className="switch-row">
          <div>
            <div className="label">Precio a confirmar</div>
            <div className="desc">Se muestra “Precio a confirmar” en la carta.</div>
          </div>
          <button
            type="button"
            className={`switch${priceTbd ? " on" : ""}`}
            onClick={() => setPriceTbd((v) => !v)}
            aria-pressed={priceTbd}
          />
        </div>

        {!priceTbd && (
          <div className="field-row" style={{ marginTop: 14 }}>
            <div className="field">
              <label>{priceKind === "single" ? "Precio" : priceKind === "p2p4" ? "Precio P2" : "Precio copa"}</label>
              <div className="price-input">
                <span className="pfx">$</span>
                <input className="input" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="13900" />
              </div>
            </div>
            {priceKind !== "single" && (
              <div className="field">
                <label>{priceKind === "p2p4" ? "Precio P4" : "Precio botella"}</label>
                <div className="price-input">
                  <span className="pfx">$</span>
                  <input className="input" inputMode="numeric" value={price2} onChange={(e) => setPrice2(e.target.value)} placeholder="65500" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Etiquetas */}
      <div className="form-card">
        <h2>Etiquetas</h2>
        <div className="tag-toggles">
          {DISH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag-toggle${tags.has(tag) ? " on" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="form-card">
        <h2>Disponibilidad</h2>
        <div className="switch-row">
          <div>
            <div className="label">Disponible hoy</div>
            <div className="desc">Si lo apagás, se muestra atenuado con “No disponible hoy”.</div>
          </div>
          <button type="button" className={`switch${isAvailable ? " on" : ""}`} onClick={() => setIsAvailable((v) => !v)} aria-pressed={isAvailable} />
        </div>
        <div className="switch-row">
          <div>
            <div className="label">Visible en la carta</div>
            <div className="desc">Si lo apagás, no aparece para los clientes.</div>
          </div>
          <button type="button" className={`switch${isVisible ? " on" : ""}`} onClick={() => setIsVisible((v) => !v)} aria-pressed={isVisible} />
        </div>
      </div>

      {dish && (
        <button type="button" className="btn-ghost" style={{ color: "var(--danger)", width: "100%", justifyContent: "center", marginBottom: 8 }} onClick={onDelete}>
          Eliminar plato
        </button>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={pending || uploading}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push("/admin")}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
