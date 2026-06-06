"use client";

import { useEffect } from "react";
import type { Dish, Lang, DishTag } from "@/lib/types";
import { dishName, dishDesc } from "@/lib/types";
import { CARTA_I18N, priceLabels, DON_BAR } from "@/lib/i18n";
import { formatARS } from "@/lib/format";
import { PlaceholderMark } from "@/components/LogoMark";

type T = (typeof CARTA_I18N)["es"];

const BADGE_ORDER: DishTag[] = ["recom", "compartir", "veg", "tacc", "picante"];
const BADGE_EMOJI: Partial<Record<DishTag, string>> = { recom: "⭐", veg: "🌿", picante: "🌶" };

const WA_MSG: Record<Lang, (name: string) => string> = {
  es: (n) => `¡Hola! Quería consultar por: ${n}`,
  en: (n) => `Hi! I'd like to ask about: ${n}`,
  pt: (n) => `Olá! Queria perguntar sobre: ${n}`,
};

export function DishModal({
  dish: d,
  lang,
  t,
  categoryLabel,
  onClose,
}: {
  dish: Dish;
  lang: Lang;
  t: T;
  categoryLabel: string;
  onClose: () => void;
}) {
  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const name = dishName(d, lang);
  const desc = dishDesc(d, lang);
  const agotado = !d.is_available;
  const tags = BADGE_ORDER.filter((tag) => d.tags.includes(tag));
  const waHref = `${DON_BAR.whatsappLink}?text=${encodeURIComponent(WA_MSG[lang](name))}`;

  return (
    <div className="dish-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={name}>
      <div className="dish-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dish-modal-close" onClick={onClose} aria-label={t.close}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={`dish-modal-hero${agotado ? " agotado" : ""}`}>
          {d.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.photo_url} alt={name} />
          ) : (
            <div className="dish-modal-noimg">
              <PlaceholderMark />
            </div>
          )}
          <div className="dish-modal-hero-grad" />
          {agotado && <span className="dish-modal-agotado">{t.agotado}</span>}
          <div className="dish-modal-hero-text">
            {categoryLabel && <span className="dish-modal-cat">{categoryLabel}</span>}
            <h2 className="dish-modal-title">{name}</h2>
          </div>
        </div>

        <div className="dish-modal-body">
          {tags.length > 0 && (
            <div className="dish-badges">
              {tags.map((tag) => (
                <span key={tag} className={`badge badge-${tag}`}>
                  {BADGE_EMOJI[tag] ? BADGE_EMOJI[tag] + " " : ""}
                  {t.badge[tag]}
                </span>
              ))}
            </div>
          )}

          <ModalPrice dish={d} lang={lang} t={t} />

          {desc && <p className="dish-modal-desc">{desc}</p>}

          <a className="dish-modal-wa" href={waHref} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {t.btn_whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
}

function ModalPrice({ dish: d, lang, t }: { dish: Dish; lang: Lang; t: T }) {
  if (d.price_tbd || (d.price == null && d.price2 == null)) {
    return <div className="dish-modal-price tbd">{t.price_tbd}</div>;
  }
  if (d.price_kind !== "single" && d.price != null && d.price2 != null) {
    const [l1, l2] = priceLabels(d.price_kind, lang);
    return (
      <div className="dish-modal-price dual">
        <div className="col">
          <span className="plabel">{l1}</span>
          <span className="pval">{formatARS(d.price)}</span>
        </div>
        <div className="col">
          <span className="plabel">{l2}</span>
          <span className="pval">{formatARS(d.price2)}</span>
        </div>
      </div>
    );
  }
  return <div className="dish-modal-price">{formatARS((d.price ?? d.price2)!)}</div>;
}
