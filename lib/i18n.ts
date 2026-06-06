import type { Lang, DishTag, PriceKind } from "./types";

export interface CartaStrings {
  tagline: string;
  search: string;
  search_placeholder: string;
  close: string;
  filters_title: string;
  filter_all: string;
  filter_veg: string;
  filter_tacc: string;
  filter_picante: string;
  filter_recom: string;
  filter_compartir: string;
  badge: Record<DishTag, string>;
  agotado: string;
  price_tbd: string;
  no_results: string;
  no_results_sub: string;
  footer_horarios: string;
  footer_horarios_val: string;
  footer_ubicacion: string;
  footer_ubicacion_val: string;
  footer_whatsapp: string;
  footer_instagram: string;
  btn_whatsapp: string;
  btn_instagram: string;
  btn_map: string;
  price_label: { p2: string; p4: string; copa: string; botella: string };
}

export const CARTA_I18N: Record<Lang, CartaStrings> = {
  es: {
    tagline: "Drinks Experts · Don Social Bar",
    search: "Buscar",
    search_placeholder: "Buscar plato…",
    close: "Cerrar",
    filters_title: "Filtros",
    filter_all: "Todos",
    filter_veg: "Vegetariano",
    filter_tacc: "Sin TACC",
    filter_picante: "Picante",
    filter_recom: "Recomendado",
    filter_compartir: "Para compartir",
    badge: {
      recom: "Recomendado",
      veg: "Veg",
      tacc: "Sin TACC",
      picante: "Picante",
      compartir: "Para compartir",
    },
    agotado: "No disponible hoy",
    price_tbd: "Precio a confirmar",
    no_results: "No encontramos ese plato en la carta",
    no_results_sub: "Probá con otro nombre o quitá los filtros",
    footer_horarios: "Horarios",
    footer_horarios_val: "Mar a Vie · Solo noche",
    footer_ubicacion: "Ubicación",
    footer_ubicacion_val: "Córdoba, Argentina",
    footer_whatsapp: "WhatsApp",
    footer_instagram: "Instagram",
    btn_whatsapp: "Consultar por WhatsApp",
    btn_instagram: "Seguinos en Instagram",
    btn_map: "Ver en el mapa",
    price_label: { p2: "P2", p4: "P4", copa: "Copa", botella: "Botella" },
  },
  en: {
    tagline: "Drinks Experts · Don Social Bar",
    search: "Search",
    search_placeholder: "Search a dish…",
    close: "Close",
    filters_title: "Filters",
    filter_all: "All",
    filter_veg: "Vegetarian",
    filter_tacc: "Gluten-free",
    filter_picante: "Spicy",
    filter_recom: "Recommended",
    filter_compartir: "To share",
    badge: {
      recom: "Recommended",
      veg: "Veg",
      tacc: "Gluten-free",
      picante: "Spicy",
      compartir: "To share",
    },
    agotado: "Sold out today",
    price_tbd: "Price to be confirmed",
    no_results: "We couldn't find that dish",
    no_results_sub: "Try a different name or clear the filters",
    footer_horarios: "Hours",
    footer_horarios_val: "Tue to Fri · Evenings only",
    footer_ubicacion: "Location",
    footer_ubicacion_val: "Córdoba, Argentina",
    footer_whatsapp: "WhatsApp",
    footer_instagram: "Instagram",
    btn_whatsapp: "Message us on WhatsApp",
    btn_instagram: "Follow us on Instagram",
    btn_map: "Open in maps",
    price_label: { p2: "For 2", p4: "For 4", copa: "Glass", botella: "Bottle" },
  },
  pt: {
    tagline: "Drinks Experts · Don Social Bar",
    search: "Buscar",
    search_placeholder: "Buscar prato…",
    close: "Fechar",
    filters_title: "Filtros",
    filter_all: "Todos",
    filter_veg: "Vegetariano",
    filter_tacc: "Sem glúten",
    filter_picante: "Picante",
    filter_recom: "Recomendado",
    filter_compartir: "Para compartilhar",
    badge: {
      recom: "Recomendado",
      veg: "Veg",
      tacc: "Sem glúten",
      picante: "Picante",
      compartir: "Compartilhar",
    },
    agotado: "Esgotado hoje",
    price_tbd: "Preço a confirmar",
    no_results: "Não encontramos esse prato",
    no_results_sub: "Tente outro nome ou remova os filtros",
    footer_horarios: "Horários",
    footer_horarios_val: "Ter a Sex · Só à noite",
    footer_ubicacion: "Localização",
    footer_ubicacion_val: "Córdoba, Argentina",
    footer_whatsapp: "WhatsApp",
    footer_instagram: "Instagram",
    btn_whatsapp: "Fale conosco no WhatsApp",
    btn_instagram: "Siga no Instagram",
    btn_map: "Abrir no mapa",
    price_label: { p2: "Para 2", p4: "Para 4", copa: "Taça", botella: "Garrafa" },
  },
};

/** Labels for the two-price layouts, localized. */
export function priceLabels(kind: PriceKind, lang: Lang): [string, string] {
  const pl = CARTA_I18N[lang].price_label;
  if (kind === "p2p4") return [pl.p2, pl.p4];
  if (kind === "copa_botella") return [pl.copa, pl.botella];
  return ["", ""];
}

export const LANGS: { code: Lang; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

/** Restaurant contact info (from the brief). */
export const DON_BAR = {
  whatsappDisplay: "+54 351 686 8254",
  whatsappLink: "https://wa.me/543516868254",
  instagramHandle: "@donsocialbar",
  instagramLink: "https://instagram.com/donsocialbar",
  mapsLink: "https://maps.google.com/?q=Don+Social+Bar+Achaval+Rodriguez+Cordoba",
  city: "Córdoba, Argentina",
};
