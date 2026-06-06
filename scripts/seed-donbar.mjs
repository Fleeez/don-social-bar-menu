// scripts/seed-donbar.mjs
// Uso: node --env-file=.env.local scripts/seed-donbar.mjs
import { createClient } from "@supabase/supabase-js";
import { readdir } from "node:fs/promises";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

console.log("Conectando a Supabase:", url);
const supabase = createClient(url, key, { auth: { persistSession: false } });

// Scan public/images/dishes directory to find image files
const dishesDir = path.join("public", "images", "dishes");
let imageFiles = [];
try {
  imageFiles = await readdir(dishesDir);
} catch (e) {
  console.log("No se pudo leer la carpeta de imágenes:", dishesDir, e.message);
}

// Separate files into named dish files and numbered/hash jpg files
const namedFiles = [];
const numberedFiles = [];

imageFiles.forEach((file) => {
  const baseName = path.parse(file).name;
  // If it starts with a sequence of 8+ digits, or contains only numbers/symbols, it's a numbered file
  const isNumbered = /^\d{8,}/.test(baseName) || /^\d+$/.test(baseName) || (!/[a-zA-Z]/i.test(baseName.replace(/_n$/, '').replace(/_n\s*\(\d+\)$/, '')));
  if (isNumbered) {
    numberedFiles.push(file);
  } else {
    namedFiles.push(file);
  }
});

console.log(`Imágenes encontradas: ${imageFiles.length} en total. (Nombradas: ${namedFiles.length}, Numeradas/Bebidas: ${numberedFiles.length})`);

let numberedIdx = 0;
function getNumberedImage() {
  if (numberedFiles.length === 0) return null;
  const file = numberedFiles[numberedIdx % numberedFiles.length];
  numberedIdx++;
  return `/images/dishes/${file}`;
}

function findImage(keywords) {
  const match = namedFiles.find((file) => {
    const fLower = file.toLowerCase();
    return keywords.every((kw) => fLower.includes(kw.toLowerCase()));
  });
  if (match) {
    return `/images/dishes/${match}`;
  }
  // Fallback to a numbered image if no exact match is found
  return getNumberedImage();
}

// Categories definitions
const categories = [
  { slug: "don-di-vino", name_es: "DON di VINO", name_en: "DON di VINO", name_pt: "DON di VINO", sort_order: 1 },
  { slug: "primeros-dones", name_es: "Primeros Dones", name_en: "Starters", name_pt: "Entradas", sort_order: 2 },
  { slug: "flat-breads", name_es: "Flat Breads", name_en: "Flat Breads", name_pt: "Flat Breads", sort_order: 3 },
  { slug: "dones-entre-panes", name_es: "Dones Entre Panes", name_en: "Sandwiches & Burgers", name_pt: "Sanduíches", sort_order: 4 },
  { slug: "ensaladas", name_es: "Ensaladas del Cielo", name_en: "Salads", name_pt: "Saladas", sort_order: 5 },
  { slug: "compartiendo-talentos", name_es: "Compartiendo Talentos", name_en: "Sharing Plates", name_pt: "Para Compartir", sort_order: 6 },
  { slug: "dulzura-dotada", name_es: "Dulzura Dotada", name_en: "Desserts", name_pt: "Sobremesas", sort_order: 7 },
  { slug: "bebidas-simples", name_es: "Bebidas Simples & Cervezas", name_en: "Soft Drinks & Beers", name_pt: "Bebidas Simples & Cervejas", sort_order: 8 },
  { slug: "cocteles", name_es: "Coctelería de Autor", name_en: "Signature Cocktails", name_pt: "Coquetéis de Autor", sort_order: 9 },
  { slug: "tragos-clasicos", name_es: "Tragos Clásicos", name_en: "Classic Cocktails", name_pt: "Coquetéis Clássicos", sort_order: 10 },
  { slug: "medidas-botellas", name_es: "Medidas & Botellas", name_en: "Spirits & Bottles", name_pt: "Doses & Garrafas", sort_order: 11 }
];

// Dishes definitions
const dishes = [
  // 1. DON di VINO
  {
    category_slug: "don-di-vino",
    slug: "tiradito-mollejas-paso",
    name_es: "Entrada: Tiradito de Mollejas",
    name_en: "Starter: Sweetbread Tiradito",
    name_pt: "Entrada: Tiradito de Molejas",
    desc_es: "Tiradito de mollejas, crema de ají amarillo, emulsión de lima y gremolata. (Maridaje sugerido: Copa de Chacra La Papay Sauvignon Blanc)",
    desc_en: "Sweetbread tiradito, yellow chili cream, lime emulsion, and gremolata. (Suggested pairing: Glass of Chacra La Papay Sauvignon Blanc)",
    desc_pt: "Tiradito de molejas, creme de pimenta amarela, emulsão de lima e gremolata. (Sugestão de harmonização: Taça de Chacra La Papay Sauvignon Blanc)",
    price: null, price_kind: "single", price_tbd: true, tags: ["recom"],
    photo_url: findImage(["tiradito"])
  },
  {
    category_slug: "don-di-vino",
    slug: "filet-mignon-paso",
    name_es: "Principal: Filet Mignon en Costra",
    name_en: "Main: Filet Mignon in Crust",
    name_pt: "Principal: Filet Mignon em Crosta",
    desc_es: "Filet mignon en costra de frutos secos, salsa de portobellos y shiitake, cremoso de papa y ajo negro. (Maridaje sugerido: Copa de MALMA Reserva Merlot)",
    desc_en: "Filet mignon in nut crust, portobello and shiitake sauce, creamy potato, and black garlic. (Suggested pairing: Glass of MALMA Reserva Merlot)",
    desc_pt: "Filet mignon em crosta de nozes, molho de portobello e shiitake, cremoso de batata e alho negro. (Sugestão de harmonização: Taça de MALMA Reserva Merlot)",
    price: null, price_kind: "single", price_tbd: true, tags: ["recom"],
    photo_url: findImage(["filet mignon"])
  },
  {
    category_slug: "don-di-vino",
    slug: "mandarinas-texturas-paso",
    name_es: "Postre: Mandarinas en Texturas",
    name_en: "Dessert: Mandarin Textures",
    name_pt: "Sobremesa: Texturas de Tangerina",
    desc_es: "Mandarinas en texturas, ganache de chocolate y tuile cítrica. (Maridaje sugerido: Copa de La Puerta Alta Dulce Natural)",
    desc_en: "Mandarin textures, chocolate ganache, and citrus tuile. (Suggested pairing: Glass of La Puerta Alta Dulce Natural)",
    desc_pt: "Texturas de tangerina, ganache de chocolate e tuile cítrica. (Sugestão de harmonização: Taça de La Puerta Alta Dulce Natural)",
    price: null, price_kind: "single", price_tbd: true, tags: ["recom"],
    photo_url: findImage(["mandarinas"])
  },
  {
    category_slug: "don-di-vino",
    slug: "menu-2-pasos",
    name_es: "Menú de 2 Pasos (Sin Maridaje)",
    name_en: "2-Step Menu (No Wine Pairing)",
    name_pt: "Menu de 2 Passos (Sem Harmonização)",
    desc_es: "Entrada y principal, o principal y postre. Servicio de agua incluido.",
    desc_en: "Starter and main course, or main course and dessert. Water service included.",
    desc_pt: "Entrada e prato principal, ou prato principal e sobremesa. Serviço de água incluído.",
    price: 30000, price_kind: "single", price_tbd: false, tags: ["compartir"],
    photo_url: findImage(["2 pasos"]) || getNumberedImage()
  },
  {
    category_slug: "don-di-vino",
    slug: "menu-3-pasos-sin-maridaje",
    name_es: "Menú de 3 Pasos (Sin Maridaje)",
    name_en: "3-Step Menu (No Wine Pairing)",
    name_pt: "Menu de 3 Passos (Sem Harmonização)",
    desc_es: "Entrada, principal y postre. Servicio de agua incluido.",
    desc_en: "Starter, main course, and dessert. Water service included.",
    desc_pt: "Entrada, prato principal e sobremesa. Serviço de água incluído.",
    price: 35000, price_kind: "single", price_tbd: false, tags: ["compartir"],
    photo_url: findImage(["3 pasos sin"]) || getNumberedImage()
  },
  {
    category_slug: "don-di-vino",
    slug: "menu-3-pasos-con-maridaje",
    name_es: "Menú de 3 Pasos (Con Maridaje)",
    name_en: "3-Step Menu (With Wine Pairing)",
    name_pt: "Menu de 3 Passos (Com Harmonização)",
    desc_es: "Entrada, principal, postre y maridaje de vinos sugerido para cada paso. Servicio de agua incluido.",
    desc_en: "Starter, main course, dessert, and suggested wine pairing for each step. Water service included.",
    desc_pt: "Entrada, prato principal, sobremesa e harmonização de vinhos sugerida para cada passo. Serviço de água incluído.",
    price: 49000, price_kind: "single", price_tbd: false, tags: ["recom", "compartir"],
    photo_url: findImage(["3 pasos con"]) || getNumberedImage()
  },

  // 2. Primeros Dones
  {
    category_slug: "primeros-dones",
    slug: "duo-empanadas",
    name_es: "Dúo de Empanadas Fritas",
    name_en: "Fried Empanadas Duo",
    name_pt: "Dupla de Empanadas Fritas",
    desc_es: "Empanadas de vacío y bondiola, acompañadas de salsa criolla.",
    desc_en: "Beef flank and pork shoulder empanadas, served with criolla sauce.",
    desc_pt: "Empanadas de vazio e bondiola, acompanhadas de molho criollo.",
    price: 12000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "primeros-dones",
    slug: "pollito-crispy",
    name_es: "Pollito Crispy",
    name_en: "Crispy Chicken Bites",
    name_pt: "Franguinho Crispy",
    desc_es: "Trozos de pollo súper crocantes con aderezo especial de la casa.",
    desc_en: "Super crispy chicken bites with special house dressing.",
    desc_pt: "Pedaços de frango super crocantes com molho especial da casa.",
    price: 20000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "primeros-dones",
    slug: "papas-cheddar-bacon",
    name_es: "Papas Cheddar & Bacon",
    name_en: "Cheddar & Bacon Fries",
    name_pt: "Batatas com Cheddar e Bacon",
    desc_es: "Papas fritas abundantes bañadas en queso cheddar fundido y bacon crocante.",
    desc_en: "Generous fries smothered in melted cheddar cheese and crispy bacon.",
    desc_pt: "Batatas fritas abundantes cobertas com queijo cheddar derretido e bacon crocante.",
    price: 25000, price_kind: "single", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "primeros-dones",
    slug: "papas-don",
    name_es: "Papas Don",
    name_en: "Don Fries",
    name_pt: "Batatas Don",
    desc_es: "Papas de la casa servidas con huevo poché, alioli y salsa criolla.",
    desc_en: "House fries served with poached egg, garlic aioli, and criolla sauce.",
    desc_pt: "Batatas da casa servidas com ovo pochê, maionese de alho e molho criollo.",
    price: 19000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "primeros-dones",
    slug: "salchichita-parrillera",
    name_es: "Salchichita Parrillera Flambeada",
    name_en: "Flambéed Grilled Sausage",
    name_pt: "Linguiça de Grelha Flambada",
    desc_es: "Salchicha parrillera artesanal flambeada a la mesa.",
    desc_en: "Artisanal grilled thin sausage flambéed at the table.",
    desc_pt: "Linguiça fina de grelha artesanal flambada na mesa.",
    price: 15000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "primeros-dones",
    slug: "provoleta-parrilla",
    name_es: "Provoleta a la Parrilla",
    name_en: "Grilled Provoleta Cheese",
    name_pt: "Provoleta na Grelha",
    desc_es: "Queso provolone fundido a la parrilla, crujiente por fuera y suave por dentro.",
    desc_en: "Grilled provolone cheese, crispy outside, melted and warm inside.",
    desc_pt: "Queijo provolone derretido na grelha, crocante por fora e macio por dentro.",
    price: 17500, price_kind: "single", price_tbd: false, tags: ["veg"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "primeros-dones",
    slug: "mollejitas-salsa-azul",
    name_es: "Mollejitas Asadas en Salsa Azul",
    name_en: "Grilled Sweetbreads in Blue Cheese",
    name_pt: "Molejas Grelhadas ao Molho Azul",
    desc_es: "Mollejitas doradas a la parrilla servidas con una cremosa salsa de queso azul.",
    desc_en: "Crispy grilled sweetbreads served with a rich blue cheese cream sauce.",
    desc_pt: "Molejas douradas na grelha servidas com um molho cremoso de queijo azul.",
    price: 19000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: findImage(["mollejas", "crocantes"])
  },
  {
    category_slug: "primeros-dones",
    slug: "tortellini-cordero",
    name_es: "Tortellini de Cordero",
    name_en: "Lamb Tortellini",
    name_pt: "Tortellini de Cordeiro",
    desc_es: "Pasta frita rellena de cordero desmechado, servida con variedad de dips cremosos.",
    desc_en: "Fried pasta stuffed with shredded lamb, served with a selection of creamy dips.",
    desc_pt: "Massa frita recheada com cordeiro desfiado, servida com uma variedade de molhos cremosos.",
    price: 15000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: findImage(["tortellini"])
  },
  {
    category_slug: "primeros-dones",
    slug: "picada-don",
    name_es: "Picada Don",
    name_en: "Don Charcuterie Board",
    name_pt: "Tábua Don",
    desc_es: "Salame de la Colonia, mortadela con pistacho, jamón crudo, queso sardo, quesillo aliñado, tomates cherrys, pan casero, papas fritas y dips.",
    desc_en: "Colonia salami, mortadella with pistachio, cured ham, sardo cheese, seasoned cheese, cherry tomatoes, homemade bread, fries, and dips.",
    desc_pt: "Salame de Colonia, mortadela com pistache, presunto cru, queijo sardo, queijo temperado, tomates cereja, pão caseiro, batatas fritas e molhos.",
    price: 40000, price_kind: "single", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },

  // 3. Flat Breads
  {
    category_slug: "flat-breads",
    slug: "stracciatella-divina",
    name_es: "Stracciatella Divina",
    name_en: "Divine Stracciatella Flatbread",
    name_pt: "Stracciatella Divina",
    desc_es: "Nuestra versión de la pizza con base crujiente, stracciatella, mortadela premium y lluvia de pistachos.",
    desc_en: "Our flatbread pizza version with a crispy base, stracciatella, premium mortadella, and pistachio crumble.",
    desc_pt: "Nossa versão de pizza com massa crocante, stracciatella, mortadela premium e chuva de pistaches.",
    price: 36000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: findImage(["stracciatella"])
  },
  {
    category_slug: "flat-breads",
    slug: "sabor-en-rucula",
    name_es: "Sabor en Rúcula",
    name_en: "Arugula Flavor Flatbread",
    name_pt: "Sabor de Rúcula",
    desc_es: "Base crujiente con abundante rúcula fresca, tomates cherrys dulces y jamón crudo estacionado.",
    desc_en: "Crispy flatbread topped with fresh arugula, sweet cherry tomatoes, and cured ham.",
    desc_pt: "Massa crocante com rúcula fresca abundante, tomates cereja doces e presunto cru.",
    price: 36000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "flat-breads",
    slug: "muzarella-sin-tacc",
    name_es: "Muzarella Sin TACC",
    name_en: "Gluten-Free Mozzarella Pizza",
    name_pt: "Mussarela Sem Glúten",
    desc_es: "Clásica masa apta para celíacos con salsa de tomate de la casa y abundante queso muzzarella fundido.",
    desc_en: "Classic gluten-free crust with house tomato sauce and plenty of melted mozzarella cheese.",
    desc_pt: "Massa clássica sem glúten com molho de tomate da casa e queijo mussarela derretido abundante.",
    price: 20000, price_kind: "single", price_tbd: false, tags: ["tacc"],
    photo_url: getNumberedImage()
  },

  // 4. Dones Entre Panes
  {
    category_slug: "dones-entre-panes",
    slug: "burger-del-don",
    name_es: "Burger del Don",
    name_en: "The Don Burger",
    name_pt: "Hambúrguer do Don",
    desc_es: "En pan de papa blando, doble medallón de ternera seleccionado a la parrilla, queso mozzarella derretido, tomates cherrys asados, rúcula y alioli.",
    desc_en: "In soft potato bun, double grilled beef patty, melted mozzarella, roasted cherry tomatoes, arugula, and garlic aioli.",
    desc_pt: "No pão de batata, duplo hambúrguer de vitela grelhado, queijo mussarela, tomates cereja assados, rúcula e maionese de alho.",
    price: 25000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "dones-entre-panes",
    slug: "cordero-con-dones",
    name_es: "Cordero con Dones",
    name_en: "Lamb Sandwich",
    name_pt: "Cordeiro com Dones",
    desc_es: "Pan negro exclusivo, cordero braseado súper tierno, cebollas encurtidas, huevo poché y reducción de salsa demiglacé.",
    desc_en: "Exclusive black bread, ultra-tender braised lamb, pickled onions, poached egg, and demiglace sauce reduction.",
    desc_pt: "Pão preto exclusivo, cordeiro assado super macio, cebolas em conserva, ovo pochê e redução de molho demi-glace.",
    price: 22500, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "dones-entre-panes",
    slug: "inspiracion-argenta",
    name_es: "Inspiración Argenta",
    name_en: "Argentine Inspiration",
    name_pt: "Inspiração Argenta",
    desc_es: "Baguette de manteca tostada, vacío desmechado jugoso, cebollas y tomates asados, champignones salteados y alioli de la casa.",
    desc_en: "Toasted butter baguette, juicy pulled flank steak, roasted onions and tomatoes, sautéed mushrooms, and house garlic aioli.",
    desc_pt: "Baguete de manteiga torrada, vazio desfiado suculento, cebolas e tomates assados, cogumelos salteados e maionese de alho da casa.",
    price: 26500, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "dones-entre-panes",
    slug: "mollejitas-espirituales",
    name_es: "Mollejitas Espirituales",
    name_en: "Spiritual Sweetbread Sandwich",
    name_pt: "Molejas Espirituais",
    desc_es: "Baguette integral crocante, mollejas asadas al limón, rúcula fresca, salsa criolla clásica y alioli.",
    desc_en: "Crispy whole wheat baguette, grilled lemon-sprinkled sweetbreads, fresh arugula, classic criolla, and aioli.",
    desc_pt: "Baguete integral crocante, molejas grelhadas com limão, rúcula fresca, molho criollo clássico e maionese de alho.",
    price: 25000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "dones-entre-panes",
    slug: "entrana-bendecida",
    name_es: "Entraña Bendecida",
    name_en: "Blessed Skirt Steak Sandwich",
    name_pt: "Fraldinha Abençoada",
    desc_es: "Baguette de manteca, entraña tierna asada a la parrilla, rúcula, tomate fresco, cebolla morada encurtida y alioli.",
    desc_en: "Butter baguette, tender grilled skirt steak, arugula, fresh tomato, pickled red onion, and garlic aioli.",
    desc_pt: "Baguete de manteiga, fraldinha macia na grelha, rúcula, tomate fresco, cebola roxa em conserva e maionese de alho.",
    price: 28000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "dones-entre-panes",
    slug: "osobuco-magistral",
    name_es: "Osobuco Magistral",
    name_en: "Masterful Osobuco Sandwich",
    name_pt: "Ossobuco Magistral",
    desc_es: "Baguette de manteca, osobuco estofado al disco cocido por horas, rúcula y lactonesa suave.",
    desc_en: "Butter baguette, slow-braised osobuco, fresh arugula, and light milk-garlic mayo.",
    desc_pt: "Baguete de mariposa, ossobuco cozido lentamente por horas, rúcula e lactonese suave.",
    price: 25000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },

  // 5. Ensaladas
  {
    category_slug: "ensaladas",
    slug: "ensalada-divina-vegetales",
    name_es: "Ensalada Divina de Vegetales",
    name_en: "Divine Vegetable Salad",
    name_pt: "Salada Divina de Vegetais",
    desc_es: "Tomates cherry maduros, cebolla encurtida morada, zanahoria rallada, repollo y variedad de hojas verdes frescas.",
    desc_en: "Ripe cherry tomatoes, pickled red onion, grated carrot, cabbage, and selected fresh greens.",
    desc_pt: "Tomates cereja, cebola roxa em conserva, cenoura ralada, repolho e folhas verdes frescas selecionadas.",
    price: 19000, price_kind: "single", price_tbd: false, tags: ["veg", "tacc"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "ensaladas",
    slug: "ensalada-gloria-don",
    name_es: "Ensalada Gloria Don",
    name_en: "Gloria Don Salad",
    name_pt: "Salada Gloria Don",
    desc_es: "Hojas de lechuga crocantes, pollo crispy desmechado, lascas de queso tybo y aderezo alioli.",
    desc_en: "Crispy lettuce, shredded crispy chicken, shaved tybo cheese, and garlic aioli dressing.",
    desc_pt: "Alface crocante, frango crispy desfiado, lascas de queijo tybo e molho de alho.",
    price: 23000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },

  // 6. Compartiendo Talentos
  {
    category_slug: "compartiendo-talentos",
    slug: "matambrito-don-clasico",
    name_es: "Matambrito Don Clásico",
    name_en: "Classic Don Pork Flank",
    name_pt: "Matambrito Don Clássico",
    desc_es: "Matambrito de cerdo tierno asado a las brasas con papas cuña crocantes y ensalada fresca de rúcula y tomates cherrys.",
    desc_en: "Tender grilled pork flank served with crispy wedge potatoes and a fresh arugula and cherry tomato salad.",
    desc_pt: "Matambrito de porco grelhado na brasa com batatas rústicas e salada fresca de rúcula e tomates cereja.",
    price: 32000, price2: 60000, price_kind: "p2p4", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "matambrito-don-a-la-pizza",
    name_es: "Matambrito Don a la Pizza",
    name_en: "Matambrito Pizza-Style",
    name_pt: "Matambrito Don à Pizza",
    desc_es: "Matambrito de cerdo asado gratinado con salsa de tomate y queso mozzarella, servido con papas cuña y ensalada de rúcula y cherrys.",
    desc_en: "Grilled pork flank topped with house tomato sauce and melted mozzarella, with wedges and salad.",
    desc_pt: "Matambrito de porco grelhado gratinado com molho de tomate e mussarela, com batatas rústicas e salada.",
    price: 35000, price2: 63000, price_kind: "p2p4", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "talento-parrillero-clasico",
    name_es: "Talento Parrillero Clásico",
    name_en: "Classic Grilled Skirt Steak",
    name_pt: "Talento de Grelha Clássico",
    desc_es: "Porción de entraña jugosa a la parrilla, acompañada de papas fritas con huevo revuelto y ensalada de rúcula y cherrys.",
    desc_en: "Juicy grilled skirt steak served with scrambled egg fries and arugula/cherry tomato salad.",
    desc_pt: "Fraldinha grelhada suculenta acompanhada de batatas com ovo e salada de rúcula e cereja.",
    price: 38000, price2: 65000, price_kind: "p2p4", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "talento-parrillero-queso-azul",
    name_es: "Talento Parrillero con Queso Azul",
    name_en: "Skirt Steak with Blue Cheese",
    name_pt: "Talento na Grelha ao Queijo Azul",
    desc_es: "Entraña a la parrilla gratinada con abundante queso azul fundido, papas con huevo y ensalada.",
    desc_en: "Grilled skirt steak gratined with rich blue cheese, served with egg fries and salad.",
    desc_pt: "Fraldinha na grelha gratinada com queijo azul derretido, batatas com ovo e salada.",
    price: 41000, price2: 68000, price_kind: "p2p4", price_tbd: false, tags: ["recom", "compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "banderita-virtuosa",
    name_es: "Banderita Virtuosa",
    name_en: "Virtuous Short Ribs",
    name_pt: "Costela Virtuosa",
    desc_es: "Costillas de asado banderita tiernas a la parrilla, acompañadas de pimientos asados rellenos de huevo y papas cuña.",
    desc_en: "Tender grilled strip short ribs served with egg-stuffed roasted peppers and potato wedges.",
    desc_pt: "Costela de tira macia na grelha acompanhada de pimentões assados recheados com ovo e batatas rústicas.",
    price: 30000, price2: 55000, price_kind: "p2p4", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "seleccion-de-dones",
    name_es: "Selección de Dones (Parrilla)",
    name_en: "Selection of Dones (Mixed Grill)",
    name_pt: "Seleção de Dones (Grelhado Misto)",
    desc_es: "Nuestras mejores carnes a la parrilla reunidas: matambrito de cerdo, entraña premium y salchichita parrillera flambeada. Acompañado de papas cuña con huevo poché y ensalada fresca.",
    desc_en: "Our best grilled meats: pork flank, premium skirt steak, and flambéed sausage. Served with poached egg wedges and salad.",
    desc_pt: "Nossas melhores carnes grelhadas: matambrito de porco, fraldinha premium e linguiça flambada. Com batatas rústicas com ovo pochê e salada.",
    price: 65000, price_kind: "single", price_tbd: false, tags: ["recom", "compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "excelencia-de-cordero",
    name_es: "Excelencia de Cordero",
    name_en: "Excellence of Lamb",
    name_pt: "Excelência de Cordeiro",
    desc_es: "Rack de cordero asado premium a las hierbas, servido con papas cuña doradas y salsa criolla.",
    desc_en: "Premium herb-crusted grilled rack of lamb served with golden potato wedges and criolla sauce.",
    desc_pt: "Rack de cordeiro grelhado premium com ervas, servido com batatas rústicas e molho criollo.",
    price: 38000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: findImage(["cordero", "calabazas"])
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "vacio-supremo",
    name_es: "Vacío Supremo",
    name_en: "Supreme Flank Steak",
    name_pt: "Vazio Supremo",
    desc_es: "Vacío inyectado cocido lentamente con reducción de vino Malbec, papas cuña al queso azul y ensalada fresca.",
    desc_en: "Slow-cooked flank steak injected with Malbec wine reduction, blue cheese potato wedges, and fresh salad.",
    desc_pt: "Vazio cozido lentamente com redução de vinho Malbec, batatas rústicas ao queijo azul e salada fresca.",
    price: 32000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: findImage(["vacio", "asado"])
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "picana-superior",
    name_es: "Picaña Superior",
    name_en: "Superior Picanha",
    name_pt: "Picanha Superior",
    desc_es: "Corte clásico de picaña tierna a la parrilla, acompañada de papas cuña crujientes y ensalada de rúcula y cherrys.",
    desc_en: "Tender grilled picanha steak served with crispy potato wedges and arugula/cherry tomato salad.",
    desc_pt: "Corte clássico de picanha grelhada macia com batatas rústicas e salada de rúcula e cerejas.",
    price: 28000, price2: 49000, price_kind: "p2p4", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "compartiendo-talentos",
    slug: "fondue-de-dones-veggie",
    name_es: "Fondue de Dones (Veggie)",
    name_en: "Dones Cheese Fondue (Veggie)",
    name_pt: "Fondue de Dones (Veggie)",
    desc_es: "Cremosa fondue de queso servida dentro de una calabaza Cabutia entera, acompañada de papas cuña, tomates cherrys, champignones salteados y pan casero.",
    desc_en: "Rich cheese fondue served inside a whole Cabutia pumpkin, with potato wedges, cherry tomatoes, mushrooms, and bread.",
    desc_pt: "Fondue cremosa de queijo servida dentro de uma abóbora Cabotiá inteira, com batatas rústicas, tomates cereja, cogumelos e pão.",
    price: 38000, price_kind: "single", price_tbd: false, tags: ["veg", "compartir"],
    photo_url: getNumberedImage()
  },

  // 7. Dulzura Dotada
  {
    category_slug: "dulzura-dotada",
    slug: "volcan-chocolate",
    name_es: "Volcán de Chocolate",
    name_en: "Chocolate Lava Cake",
    name_pt: "Vulcão de Chocolate",
    desc_es: "Volcán tibio con centro líquido de chocolate, acompañado de helado de crema americana y salsa ácida de arándanos.",
    desc_en: "Warm chocolate lava cake with a molten center, served with vanilla ice cream and blueberry sauce.",
    desc_pt: "Vulcão quente com centro de chocolate líquido, sorvete de creme e calda de mirtilo.",
    price: 10000, price_kind: "single", price_tbd: false, tags: ["recom", "veg"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "dulzura-dotada",
    slug: "pavlova-frutos-celestiales",
    name_es: "Pavlova de Frutos Celestiales",
    name_en: "Heavenly Fruits Pavlova",
    name_pt: "Pavlova de Frutas Celestiais",
    desc_es: "Nido de merengue crocante por fuera y suave por dentro, relleno de crema batida y frutas frescas de estación.",
    desc_en: "Crispy meringue nest, soft inside, filled with whipped cream and fresh seasonal fruits.",
    desc_pt: "Ninho de merengue crocante por fora e macio por dentro, recheado com chantilly e frutas frescas da estação.",
    price: 10000, price_kind: "single", price_tbd: false, tags: ["veg", "tacc"],
    photo_url: getNumberedImage()
  },

  // 8. Bebidas Simples & Cervezas
  {
    category_slug: "bebidas-simples",
    slug: "agua-saborizada",
    name_es: "Agua y Agua Saborizada (500 cc)",
    name_en: "Water & Flavored Water (500 cc)",
    name_pt: "Água e Água Saborizada (500 cc)",
    desc_es: "Agua mineral con o sin gas, o aguas saborizadas frutales de la casa.",
    desc_en: "Still or sparkling mineral water, or house fruit flavored waters.",
    desc_pt: "Água mineral com ou sem gás, ou águas saborizadas de frutas da casa.",
    price: 6000, price_kind: "single", price_tbd: false, tags: ["veg", "tacc"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "bebidas-simples",
    slug: "gaseosas",
    name_es: "Gaseosas (354 cc)",
    name_en: "Sodas (354 cc)",
    name_pt: "Refrigerantes (354 cc)",
    desc_es: "Variedad de gaseosas línea Coca-Cola bien frías.",
    desc_en: "Assorted Coca-Cola sodas, served ice-cold.",
    desc_pt: "Variedade de refrigerantes da linha Coca-Cola bem gelados.",
    price: 6000, price_kind: "single", price_tbd: false, tags: ["tacc"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "bebidas-simples",
    slug: "limonada-don",
    name_es: "Limonada Don",
    name_en: "Don Lemonade",
    name_pt: "Limonada Don",
    desc_es: "Preparación artesanal a elección: clásica, frutos rojos, maracuyá o pomelada fresca.",
    desc_en: "Artisanal preparation: classic, red berries, passion fruit, or fresh pink grapefruit.",
    desc_pt: "Preparação artesanal à escolha: clássica, frutas vermelhas, maracujá ou toranja fresca.",
    price: 6000, price_kind: "single", price_tbd: false, tags: ["recom", "veg", "tacc"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "bebidas-simples",
    slug: "red-bull",
    name_es: "Red Bull / Sugar Free",
    name_en: "Red Bull / Sugar Free",
    name_pt: "Red Bull / Sugar Free",
    desc_es: "Bebida energizante lata de 250 cc.",
    desc_en: "Energy drink 250 cc can.",
    desc_pt: "Bebida energética lata de 250 cc.",
    price: 8000, price_kind: "single", price_tbd: false, tags: ["tacc"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "bebidas-simples",
    slug: "pinta-patagonia",
    name_es: "Pinta Patagonia (500 cc)",
    name_en: "Patagonia Pint (500 cc)",
    name_pt: "Chope Patagonia (500 cc)",
    desc_es: "Cerveza tirada premium Patagonia bien fría en copa chopera.",
    desc_en: "Ice-cold Patagonia draft beer served in a pint glass.",
    desc_pt: "Chope premium Patagonia bem gelado servido no copo pint.",
    price: 12000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "bebidas-simples",
    slug: "corona-330",
    name_es: "Corona (330 cc)",
    name_en: "Corona Bottle (330 cc)",
    name_pt: "Cerveja Corona (330 cc)",
    desc_es: "Cerveza mexicana en botella individual servida con rodaja de lima.",
    desc_en: "Individual bottled Mexican beer served with a wedge of lime.",
    desc_pt: "Cerveja mexicana de garrafa servida com fatia de limão.",
    price: 13000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "bebidas-simples",
    slug: "stella-artois",
    name_es: "Stella Artois (473 cc)",
    name_en: "Stella Artois Can (473 cc)",
    name_pt: "Lata Stella Artois (473 cc)",
    desc_es: "Lata de cerveza rubia Stella Artois premium.",
    desc_en: "Premium Stella Artois lager can.",
    desc_pt: "Lata de cerveja premium Stella Artois.",
    price: 13000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },

  // 9. Cocteles
  {
    category_slug: "cocteles",
    slug: "coctel-vision",
    name_es: "Visión (Cóctel de Autor)",
    name_en: "Vision (Signature Cocktail)",
    name_pt: "Visão (Coquetel de Autor)",
    desc_es: "Gin Gordons, syrup de lavanda de la casa, leche de coco, jugo de limón fresco y agua tónica.",
    desc_en: "Gordons Gin, house lavender syrup, coconut milk, fresh lemon juice, and tonic water.",
    desc_pt: "Gin Gordons, xarope de lavanda da casa, leite de coco, suco de limão fresco e água tônica.",
    price: 12000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-don-divino",
    name_es: "Don Divino (Cóctel de Autor)",
    name_en: "Don Divino (Signature Cocktail)",
    name_pt: "Don Divino (Coquetel de Autor)",
    desc_es: "Gin Gordons, licor Campari, vermut seco aromático, agua con gas y decoración con pieles de cítrico.",
    desc_en: "Gordons Gin, Campari, aromatic dry vermouth, sparkling water, and citrus peels.",
    desc_pt: "Gin Gordons, licor Campari, vermute seco aromático, água com gás e casca de cítricos.",
    price: 12000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-sabiduria",
    name_es: "Sabiduría",
    name_en: "Wisdom Cocktail",
    name_pt: "Sabedoria",
    desc_es: "Ron dorado añejo, frambuesas machacadas, licor de naranja y un toque perfumado de té Earl Grey.",
    desc_en: "Aged gold rum, muddled raspberries, orange liqueur, and a fragrant touch of Earl Grey tea.",
    desc_pt: "Rum dourado, framboesas maceradas, licor de laranja e um toque perfumado de chá Earl Grey.",
    price: 14000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-espiritu",
    name_es: "Espíritu",
    name_en: "Spirit Cocktail",
    name_pt: "Espírito",
    desc_es: "Ron dorado, acedera brasileña, pulpa de maracuyá dulce y leche de coco cremosa.",
    desc_en: "Gold rum, Brazilian cachaça, sweet passion fruit pulp, and creamy coconut milk.",
    desc_pt: "Rum dourado, cachaça brasileira, polpa de maracujá doce e leite de coco cremoso.",
    price: 12000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-destino",
    name_es: "Destino",
    name_en: "Destiny Cocktail",
    name_pt: "Destino",
    desc_es: "Vodka Smirnoff, syrup casero de frambuesas y remolacha, jugo de pomelo y topping de vino espumoso.",
    desc_en: "Smirnoff Vodka, homemade raspberry and beetroot syrup, grapefruit juice, and sparkling wine topping.",
    desc_pt: "Vodka Smirnoff, xarope de framboesa e beterraba da casa, suco de toranja e cobertura de espumante.",
    price: 14000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-talento",
    name_es: "Talento",
    name_en: "Talent Cocktail",
    name_pt: "Talento",
    desc_es: "Ron claro, vermut seco, jarabe de jengibre picante, menta fresca y agua con gas.",
    desc_en: "Light rum, dry vermouth, spicy ginger syrup, fresh mint, and sparkling water.",
    desc_pt: "Rum claro, vermute seco, xarope de gengibre picante, hortelã fresca e água com gás.",
    price: 12000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-armonia",
    name_es: "Armonía",
    name_en: "Harmony Cocktail",
    name_pt: "Harmonia",
    desc_es: "Whisky Johnnie Walker, crema de Baileys, infusión de té Earl Grey y crema batida.",
    desc_en: "Johnnie Walker Scotch, Baileys Irish Cream, Earl Grey tea infusion, and whipped cream.",
    desc_pt: "Johnnie Walker Scotch, licor Baileys, infusão de chá Earl Grey e chantilly.",
    price: 14000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-frescura",
    name_es: "Frescura",
    name_en: "Freshness Cocktail",
    name_pt: "Frescura",
    desc_es: "Gin Gordons, vodka macerada en piña/ananá, syrup de jengibre, jugo de limón y agua tónica.",
    desc_en: "Gordons Gin, pineapple-infused vodka, ginger syrup, lemon juice, and tonic water.",
    desc_pt: "Gin Gordons, vodka infusionada com abacaxi, xarope de gengibre, suco de limão e água tônica.",
    price: 14000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-fortaleza",
    name_es: "Fortaleza",
    name_en: "Fortitude Cocktail",
    name_pt: "Fortaleza",
    desc_es: "Ron claro, ron de coco aromático, jugo de naranja dulce y almíbar de especias de la casa.",
    desc_en: "Light rum, aromatic coconut rum, sweet orange juice, and house spice syrup.",
    desc_pt: "Rum claro, rum de coco aromático, suco de laranja doce e xarope de especiarias da casa.",
    price: 24000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-don-herbal",
    name_es: "Don Herbal",
    name_en: "Don Herbal Cocktail",
    name_pt: "Don Herbal",
    desc_es: "Gin macerado en romero y apio fresco, vermut blanco, jugo de pomelo y claras batidas para espuma.",
    desc_en: "Rosemary and fresh celery infused Gin, white vermouth, grapefruit juice, and egg whites.",
    desc_pt: "Gin macerado com alecrim e aipo fresco, vermute branco, suco de toranja e claras.",
    price: 12000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-coco-magistral",
    name_es: "Coco Magistral",
    name_en: "Masterful Coco",
    name_pt: "Coco Magistral",
    desc_es: "Ron especial de manteca y coco, vodka saborizado a café y copo de crema batida.",
    desc_en: "Special butter and coconut rum, coffee flavored vodka, and a dollop of whipped cream.",
    desc_pt: "Rum especial de manteiga e coco, vodka de café e um toque de chantilly.",
    price: 12000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-bienestar",
    name_es: "Bienestar (Sin Alcohol)",
    name_en: "Well-Being Mocktail (Alcohol-Free)",
    name_pt: "Bem-estar (Sem Álcool)",
    desc_es: "Pulpa fresca de frambuesas, extracto de remolacha dulce y agua con gas bien fría.",
    desc_en: "Fresh raspberry pulp, sweet beetroot extract, and chilled sparkling water.",
    desc_pt: "Polpa de framboesa, extrato de beterraba doce e água com gás bem gelada.",
    price: 10000, price_kind: "single", price_tbd: false, tags: ["veg"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "cocteles",
    slug: "coctel-paz",
    name_es: "Paz (Sin Alcohol)",
    name_en: "Peace Mocktail (Alcohol-Free)",
    name_pt: "Paz (Sem Álcool)",
    desc_es: "Leche de coco cremosa, jarabe de lavanda aromático, jugo de limón y agua tónica.",
    desc_en: "Creamy coconut milk, aromatic lavender syrup, lemon juice, and tonic water.",
    desc_pt: "Leite de coco cremoso, xarope de lavanda, suco de limão e água tônica.",
    price: 10000, price_kind: "single", price_tbd: false, tags: ["veg"],
    photo_url: getNumberedImage()
  },

  // 10. Tragos Clásicos
  {
    category_slug: "tragos-clasicos",
    slug: "fernet-coca",
    name_es: "Fernet con Coca",
    name_en: "Fernet and Coke",
    name_pt: "Fernet com Coca",
    desc_es: "El clásico trago cordobés de Fernet Branca y Coca-Cola con mucho hielo.",
    desc_en: "The classic Cordoba cocktail: Fernet Branca and Coca-Cola over plenty of ice.",
    desc_pt: "O clássico drinque cordobês de Fernet Branca e Coca-Cola com muito gelo.",
    price: 15000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "tragos-clasicos",
    slug: "campari-tonica",
    name_es: "Campari con Tónica",
    name_en: "Campari and Tonic",
    name_pt: "Campari com Tônica",
    desc_es: "Licor Campari italiano servido con agua tónica bien fría y rodaja de naranja.",
    desc_en: "Italian Campari liqueur served with cold tonic water and an orange slice.",
    desc_pt: "Licor Campari italiano servido com água tônica bem gelada e uma rodada de laranja.",
    price: 14000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "tragos-clasicos",
    slug: "aperol-spritz-clasico",
    name_es: "Aperol Spritz",
    name_en: "Aperol Spritz",
    name_pt: "Aperol Spritz",
    desc_es: "Vino espumante prosecco, licor Aperol, chorrito de agua con gas y rodaja de naranja fresca.",
    desc_en: "Prosecco sparkling wine, Aperol, splash of club soda, and fresh orange slice.",
    desc_pt: "Prosecco espumante, Aperol, um toque de água com gás e rodela de laranja fresca.",
    price: 18000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "tragos-clasicos",
    slug: "lunfa-bianco-spritz",
    name_es: "Lunfa Bianco Spritz",
    name_en: "Lunfa Bianco Spritz",
    name_pt: "Lunfa Bianco Spritz",
    desc_es: "Vermut local Lunfa Bianco, espumante prosecco y soda.",
    desc_en: "Local Lunfa Bianco Vermouth, prosecco, and soda.",
    desc_pt: "Vermute local Lunfa Bianco, espumante prosecco e refrigerante.",
    price: 18000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "tragos-clasicos",
    slug: "negroni-clasico",
    name_es: "Negroni",
    name_en: "Negroni",
    name_pt: "Negroni",
    desc_es: "Partes iguales de Gin Gordons, Vermut Rosso Carpano y Campari con piel de naranja.",
    desc_en: "Equal parts of Gordons Gin, Carpano Sweet Vermouth, and Campari with orange peel.",
    desc_pt: "Partes iguais de Gin Gordons, Vermute Rosso Carpano e Campari com casca de laranja.",
    price: 18000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "tragos-clasicos",
    slug: "servicio-gines-premium",
    name_es: "Servicio de Gines Premium",
    name_en: "Premium Gin Service",
    name_pt: "Serviço de Gins Premium",
    desc_es: "Servicio de los mejores gines, variedad de botellas, donde elegís en tu mesa cuál querés que te preparemos o nos pedís recomendación.",
    desc_en: "Premium Gin service: selection of bottles, choose at the table or ask for our recommendations.",
    desc_pt: "Serviço de gin premium: variedade de garrafas, escolha na mesa ou peça recomendações.",
    price: 30000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  },

  // 11. Medidas & Botellas
  {
    category_slug: "medidas-botellas",
    slug: "medida-don-julio-blanco",
    name_es: "Medida: Tequila Don Julio Blanco",
    name_en: "Shot: Don Julio Blanco Tequila",
    name_pt: "Dose: Tequila Don Julio Blanco",
    desc_es: "Medida individual de Tequila Don Julio premium.",
    desc_en: "Single shot of premium Don Julio White Tequila.",
    desc_pt: "Dose individual de Tequila Don Julio Blanco premium.",
    price: 30000, price_kind: "single", price_tbd: false, tags: [],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "medidas-botellas",
    slug: "botella-gin-gordons",
    name_es: "Botella: Gin Gordons",
    name_en: "Bottle: Gordons Gin",
    name_pt: "Garrafa: Gin Gordons",
    desc_es: "Servicio de botella entera de Gin Gordons para compartir en mesa.",
    desc_en: "Full bottle service of Gordons Gin to share at the table.",
    desc_pt: "Serviço de garrafa inteira de Gin Gordons para compartilhar na mesa.",
    price: 85000, price_kind: "single", price_tbd: false, tags: ["compartir"],
    photo_url: getNumberedImage()
  },
  {
    category_slug: "medidas-botellas",
    slug: "botella-champagne-chandon",
    name_es: "Vino: Chandon Extra Brut",
    name_en: "Wine: Chandon Extra Brut",
    name_pt: "Vinho: Chandon Extra Brut",
    desc_es: "Botella de espumante argentino Chandon Extra Brut bien helado.",
    desc_en: "Bottle of chilled Argentine sparkling wine Chandon Extra Brut.",
    desc_pt: "Garrafa de espumante argentino Chandon Extra Brut bem gelada.",
    price: 56000, price_kind: "single", price_tbd: false, tags: ["recom"],
    photo_url: getNumberedImage()
  }
];

function assignPhotosToDishes(dishes, imageFiles) {
  // Create a pool of unused files
  const unusedFiles = [...imageFiles];

  // Helper to find a file matching keywords, and remove it from unused pool
  function getSpecific(keywords) {
    const idx = unusedFiles.findIndex(file => {
      const fLower = file.toLowerCase();
      return keywords.every(kw => fLower.includes(kw.toLowerCase()));
    });
    if (idx !== -1) {
      const file = unusedFiles[idx];
      unusedFiles.splice(idx, 1);
      return `/images/dishes/${file}`;
    }
    // Fallback search in entire pool if not in unused
    const file = imageFiles.find(file => {
      const fLower = file.toLowerCase();
      return keywords.every(kw => fLower.includes(kw.toLowerCase()));
    });
    if (file) return `/images/dishes/${file}`;
    return null;
  }

  // Define specific mappings for known items
  const specificMappings = {
    "tiradito-mollejas-paso": ["tiradito"],
    "filet-mignon-paso": ["filet mignon"],
    "mandarinas-texturas-paso": ["mandarinas"],
    "menu-2-pasos": ["2 pasos"],
    "menu-3-pasos-sin-maridaje": ["3 pasos sin"],
    "menu-3-pasos-con-maridaje": ["3 pasos con"],
    "mollejitas-salsa-azul": ["mollejas crocantes"],
    "tortellini-cordero": ["tortellini"],
    "stracciatella-divina": ["stracciatella"],
    "cordero-con-dones": ["cordero, calabazas"],
    "excelencia-de-cordero": ["cordero, calabazas"],
    "osobuco-magistral": ["rótolo de osobuco"],
    "ensalada-divina-vegetales": ["hinojo, peras"],
    "ensalada-gloria-don": ["boconcino, rúcula"],
    "vacio-supremo": ["vacio de cerdo asado"],
    "matambrito-don-clasico": ["vacio de cerdo laqueado"],
    "matambrito-don-a-la-pizza": ["vacio de cerdo laqueado"],
    "volcan-chocolate": ["selva negra"],
    "pavlova-frutos-celestiales": ["sablé de vainilla"],
  };

  // First pass: assign specific mappings
  dishes.forEach(dish => {
    const kws = specificMappings[dish.slug];
    if (kws) {
      dish.photo_url = getSpecific(kws);
    }
  });

  // Second pass: assign remaining named files that match categories
  // For desserts, let's use postre/pre postre files
  dishes.forEach(dish => {
    if (!dish.photo_url) {
      if (dish.category_slug === "dulzura-dotada") {
        const idx = unusedFiles.findIndex(file => file.toLowerCase().includes("postre"));
        if (idx !== -1) {
          dish.photo_url = `/images/dishes/${unusedFiles[idx]}`;
          unusedFiles.splice(idx, 1);
        }
      } else if (dish.category_slug === "primeros-dones" || dish.category_slug === "flat-breads") {
        const idx = unusedFiles.findIndex(file => file.toLowerCase().includes("appetizer") || file.toLowerCase().includes("entrada"));
        if (idx !== -1) {
          dish.photo_url = `/images/dishes/${unusedFiles[idx]}`;
          unusedFiles.splice(idx, 1);
        }
      } else if (dish.category_slug === "compartiendo-talentos") {
        const idx = unusedFiles.findIndex(file => file.toLowerCase().includes("principal"));
        if (idx !== -1) {
          dish.photo_url = `/images/dishes/${unusedFiles[idx]}`;
          unusedFiles.splice(idx, 1);
        }
      }
    }
  });

  // Third pass: assign remaining unused files to anything still lacking a photo_url
  dishes.forEach(dish => {
    if (!dish.photo_url) {
      if (unusedFiles.length > 0) {
        // Pop the first remaining image
        const file = unusedFiles.shift();
        dish.photo_url = `/images/dishes/${file}`;
      } else {
        // Fallback to random image from all files
        const file = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        dish.photo_url = `/images/dishes/${file}`;
      }
    }
  });

  console.log(`Asignadas fotos: ${dishes.filter(d => d.photo_url).length} platos con foto de ${dishes.length} en total.`);
  console.log(`Imágenes sobrantes en pool: ${unusedFiles.length}`);
}

async function seed() {
  console.log("Iniciando poblado de Don Social Bar...");
  assignPhotosToDishes(dishes, imageFiles);

  try {
    // 1. Borrar platos y categorías antiguas
    console.log("Limpiando base de datos...");
    const { error: err1 } = await supabase.from("dishes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (err1) throw new Error("Error borrando platos: " + err1.message);

    const { error: err2 } = await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (err2) throw new Error("Error borrando categorías: " + err2.message);

    console.log("Estructura antigua eliminada con éxito.");

    // 2. Insertar categorías
    const catMap = {};
    for (const cat of categories) {
      console.log(`Insertando categoría: ${cat.name_es}...`);
      const { data, error } = await supabase
        .from("categories")
        .insert({
          slug: cat.slug,
          name_es: cat.name_es,
          name_en: cat.name_en,
          name_pt: cat.name_pt,
          sort_order: cat.sort_order,
          is_visible: true
        })
        .select("id")
        .single();

      if (error) {
        console.error(`Fallo categoría ${cat.name_es}:`, error.message);
        throw error;
      }
      catMap[cat.slug] = data.id;
    }
    console.log("Categorías cargadas correctamente.");

    // 3. Insertar platos
    for (let index = 0; index < dishes.length; index++) {
      const dish = dishes[index];
      const categoryId = catMap[dish.category_slug];
      if (!categoryId) {
        console.warn(`Categoría no encontrada para el plato: ${dish.name_es} (slug: ${dish.category_slug})`);
        continue;
      }

      console.log(`Insertando plato [${index + 1}/${dishes.length}]: ${dish.name_es}...`);
      const { error } = await supabase.from("dishes").insert({
        category_id: categoryId,
        slug: dish.slug,
        name_es: dish.name_es,
        name_en: dish.name_en,
        name_pt: dish.name_pt,
        desc_es: dish.desc_es || null,
        desc_en: dish.desc_en || null,
        desc_pt: dish.desc_pt || null,
        price: dish.price || null,
        price2: dish.price2 || null,
        price_kind: dish.price_kind,
        price_tbd: dish.price_tbd,
        tags: dish.tags || [],
        photo_url: dish.photo_url || null,
        is_available: true,
        is_visible: true,
        sort_order: index + 1
      });

      if (error) {
        console.error(`Fallo plato ${dish.name_es}:`, error.message);
        throw error;
      }
    }

    console.log("\n=== POBLADO DE DON SOCIAL BAR FINALIZADO CON ÉXITO ===");
    console.log(`Se insertaron ${categories.length} categorías y ${dishes.length} platos.`);
  } catch (e) {
    console.error("Fallo general en la migración:", e.message);
  }
}

seed();
