"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CategoryWithDishes, Dish, Lang, DishTag } from "@/lib/types";
import { dishName, dishDesc, categoryName } from "@/lib/types";
import { CARTA_I18N, LANGS, priceLabels, DON_BAR } from "@/lib/i18n";
import { formatARS } from "@/lib/format";
import { LogoMark, PlaceholderMark } from "@/components/LogoMark";
import { DishModal } from "./DishModal";

type FilterKey = "all" | DishTag;

const FILTER_KEYS: FilterKey[] = [
  "all",
  "recom",
  "veg",
  "tacc",
  "picante",
  "compartir",
];

const BADGE_ORDER: DishTag[] = ["recom", "compartir", "veg", "tacc", "picante"];
const BADGE_EMOJI: Partial<Record<DishTag, string>> = {
  recom: "⭐",
  veg: "🌿",
  picante: "🌶",
};

export function Carta({
  menu,
  ambientUrl,
}: {
  menu: CategoryWithDishes[];
  ambientUrl?: string | null;
}) {
  const [lang, setLang] = useState<Lang>("es");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [activeCat, setActiveCat] = useState<string>(menu[0]?.slug ?? "");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Deep-link the open dish via ?plato=<slug> so it's shareable and the
  // browser back button closes the modal.
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      setOpenSlug(params.get("plato"));
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function openDish(slug: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("plato", slug);
    window.history.pushState({ donBarModal: true }, "", `?${params.toString()}`);
    setOpenSlug(slug);
  }

  function closeDish() {
    if (window.history.state?.donBarModal) {
      window.history.back();
    } else {
      const params = new URLSearchParams(window.location.search);
      params.delete("plato");
      const qs = params.toString();
      window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
      setOpenSlug(null);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("don-bar-lang") as Lang | null;
    if (saved && ["es", "en", "pt"].includes(saved)) setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("don-bar-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = CARTA_I18N[lang];
  const q = query.trim().toLowerCase();

  const sections = useMemo(
    () =>
      menu.map((cat) => ({
        ...cat,
        dishes: cat.dishes.filter((d) => {
          const matchesFilter = filter === "all" || d.tags.includes(filter);
          const matchesSearch =
            !q ||
            dishName(d, lang).toLowerCase().includes(q) ||
            dishDesc(d, lang).toLowerCase().includes(q);
          return matchesFilter && matchesSearch;
        }),
      })),
    [menu, filter, q, lang]
  );

  const visibleSections = sections.filter((s) => s.dishes.length > 0);
  const noResults = menu.length > 0 && visibleSections.length === 0;
  const menuEmpty = menu.length === 0;

  // The dish open in the detail modal (searched across the full menu so deep
  // links work even when filters are active).
  const opened = openSlug
    ? menu
        .flatMap((c) => c.dishes.map((d) => ({ d, cat: c })))
        .find((x) => x.d.slug === openSlug) ?? null
    : null;

  // Scroll-spy: highlight the category currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const slug = (e.target as HTMLElement).dataset.slug;
            if (slug) setActiveCat(slug);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [visibleSections.length]);

  function scrollToCat(slug: string) {
    sectionRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleSearch() {
    setSearchOpen((open) => {
      const next = !open;
      if (!next) setQuery("");
      return next;
    });
  }

  return (
    <div className="carta">
      {/* Header */}
      <header className="carta-header">
        <div className="carta-header-inner">
          <div className="brand">
            <LogoMark size={40} />
            <div className="brand-text">
              <span className="brand-name">DON</span>
              <span className="brand-sub">Social Bar</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="lang-selector" role="group" aria-label="Idioma">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  className={`lang-btn${lang === l.code ? " active" : ""}`}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              className={`icon-btn${searchOpen ? " active" : ""}`}
              onClick={toggleSearch}
              aria-label={t.search}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className={`search-wrap${searchOpen ? " open" : ""}`}>
        <div className="search-inner">
          <input
            className="search-input"
            type="search"
            placeholder={t.search_placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button className="search-clear" onClick={toggleSearch}>
            {t.close}
          </button>
        </div>
      </div>

      {/* Hero */}
      <section
        className={`carta-hero${ambientUrl ? " has-photo" : ""}`}
        style={ambientUrl ? ({ ["--hero-img" as string]: `url(${ambientUrl})` } as React.CSSProperties) : undefined}
      >
        <LogoMark size={76} className="emblem" />
        <h1>DON</h1>
        <p className="tagline">{t.tagline}</p>
      </section>

      {/* Category nav */}
      {!menuEmpty && (
        <nav className="cat-nav">
          <div className="cat-nav-inner">
            {menu.map((cat) => (
              <button
                key={cat.slug}
                className={`cat-btn${activeCat === cat.slug ? " active" : ""}`}
                onClick={() => scrollToCat(cat.slug)}
              >
                {categoryName(cat, lang)}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Filters */}
      {!menuEmpty && (
        <div className="filter-bar">
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              className={`filter-chip${filter === key ? " active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {filterLabel(key, t)}
            </button>
          ))}
        </div>
      )}

      {/* Menu */}
      <main className="menu-content">
        {menuEmpty && (
          <div className="empty-state">
            <PlaceholderMark />
            <p style={{ marginTop: 16 }}>Estamos preparando la carta.</p>
            <span>Volvé en un ratito.</span>
          </div>
        )}

        {noResults && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p>{t.no_results}</p>
            <span>{t.no_results_sub}</span>
          </div>
        )}

        {visibleSections.map((cat) => (
          <section
            key={cat.slug}
            className="menu-section"
            data-slug={cat.slug}
            ref={(el) => {
              sectionRefs.current[cat.slug] = el;
            }}
          >
            <div className="section-head">
              <div className="line" />
              <span className="label">{categoryName(cat, lang)}</span>
              <div className="line" />
            </div>
            <div className="dish-grid">
              {cat.dishes.map((d) => (
                <DishCard key={d.id} dish={d} lang={lang} t={t} onOpen={openDish} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer t={t} />

      {opened && (
        <DishModal
          dish={opened.d}
          lang={lang}
          t={t}
          categoryLabel={categoryName(opened.cat, lang)}
          onClose={closeDish}
        />
      )}
    </div>
  );
}

function filterLabel(key: FilterKey, t: (typeof CARTA_I18N)["es"]): string {
  switch (key) {
    case "all":
      return t.filter_all;
    case "veg":
      return "🌿 " + t.filter_veg;
    case "tacc":
      return t.filter_tacc;
    case "picante":
      return "🌶 " + t.filter_picante;
    case "recom":
      return "⭐ " + t.filter_recom;
    case "compartir":
      return t.filter_compartir;
  }
}

function DishCard({
  dish: d,
  lang,
  t,
  onOpen,
}: {
  dish: Dish;
  lang: Lang;
  t: (typeof CARTA_I18N)["es"];
  onOpen: (slug: string) => void;
}) {
  const agotado = !d.is_available;
  const tags = BADGE_ORDER.filter((tag) => d.tags.includes(tag));

  return (
    <article
      className={`dish-card${agotado ? " agotado" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(d.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(d.slug);
        }
      }}
    >
      <div className="dish-photo">
        {d.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.photo_url} alt={dishName(d, lang)} loading="lazy" />
        ) : (
          <div className="dish-nophoto">
            <PlaceholderMark />
          </div>
        )}
        {agotado && (
          <div className="agotado-overlay">
            <span className="agotado-label">{t.agotado}</span>
          </div>
        )}
      </div>
      <div className="dish-body">
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
        <h3 className="dish-name">{dishName(d, lang)}</h3>
        {dishDesc(d, lang) && <p className="dish-desc">{dishDesc(d, lang)}</p>}
        <div className="dish-foot">
          <PriceBlock dish={d} lang={lang} t={t} />
        </div>
      </div>
    </article>
  );
}

function PriceBlock({
  dish: d,
  lang,
  t,
}: {
  dish: Dish;
  lang: Lang;
  t: (typeof CARTA_I18N)["es"];
}) {
  if (d.price_tbd || (d.price == null && d.price2 == null)) {
    return <span className="dish-price tbd">{t.price_tbd}</span>;
  }
  if (d.price_kind !== "single" && d.price2 != null && d.price != null) {
    const [l1, l2] = priceLabels(d.price_kind, lang);
    return (
      <div className="price-dual">
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
  return <span className="dish-price">{formatARS((d.price ?? d.price2)!)}</span>;
}

function Footer({ t }: { t: (typeof CARTA_I18N)["es"] }) {
  return (
    <footer className="carta-footer">
      <div className="carta-footer-inner">
        <div className="footer-brand">
          <LogoMark size={46} />
          <div>
            <div className="name">DON</div>
            <div className="sub">Social Bar · Est. 2023</div>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-item">
            <span className="footer-label">{t.footer_horarios}</span>
            <span className="footer-val">{t.footer_horarios_val}</span>
            <span className="footer-val">20:30 – 00:30</span>
          </div>
          <div className="footer-item">
            <span className="footer-label">{t.footer_ubicacion}</span>
            <span className="footer-val">{t.footer_ubicacion_val}</span>
            <span className="footer-val">
              <a href={DON_BAR.mapsLink} target="_blank" rel="noopener noreferrer">
                {t.btn_map} ↗
              </a>
            </span>
          </div>
          <div className="footer-item">
            <span className="footer-label">{t.footer_whatsapp}</span>
            <span className="footer-val">
              <a href={DON_BAR.whatsappLink} target="_blank" rel="noopener noreferrer">
                {DON_BAR.whatsappDisplay}
              </a>
            </span>
          </div>
          <div className="footer-item">
            <span className="footer-label">{t.footer_instagram}</span>
            <span className="footer-val">
              <a href={DON_BAR.instagramLink} target="_blank" rel="noopener noreferrer">
                {DON_BAR.instagramHandle}
              </a>
            </span>
          </div>
        </div>

        <div className="footer-actions">
          <a className="footer-action-btn" href={DON_BAR.whatsappLink} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {t.btn_whatsapp}
          </a>
          <a className="footer-action-btn" href={DON_BAR.instagramLink} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            {t.btn_instagram}
          </a>
        </div>

        <div className="footer-sep" />
        <p className="footer-copy">
          Don Social Bar · {DON_BAR.city}
        </p>
      </div>
    </footer>
  );
}
