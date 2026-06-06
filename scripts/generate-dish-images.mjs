// Genera fotos de los platos con Gemini "Nano Banana", guiándose por las fotos
// reales del local como referencia de estilo, y las sube a Supabase.
//
// Uso (PowerShell):
//   $env:GEMINI_API_KEY="..."; $env:SUPABASE_URL="..."; $env:SUPABASE_SERVICE_ROLE_KEY="..."
//   node scripts/generate-dish-images.mjs            # todos los platos sin foto
//   node scripts/generate-dish-images.mjs --limit=1  # de a uno (prueba)
//   node scripts/generate-dish-images.mjs --only=glotona
//   node scripts/generate-dish-images.mjs --force    # regenera aunque ya tengan foto
import { createClient } from "@supabase/supabase-js";

const API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MODEL = process.env.MODEL || "gemini-2.5-flash-image";

if (!API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan GEMINI_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || 0);
const force = args.includes("--force");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// Fotos reales del local como referencia de estilo (bucket público `ambient`).
const REFERENCE_URLS = [
  `${SUPABASE_URL}/storage/v1/object/public/ambient/ambient-5.jpg`, // bife en tabla
  `${SUPABASE_URL}/storage/v1/object/public/ambient/ambient-1.jpg`, // spread del local
];

const STYLE = [
  "Professional, appetizing food photography of a single Argentine 'bodegón' (steakhouse) dish.",
  "Dark moody background, green-and-white checkered tablecloth, served on a rustic dark wooden board or a black ceramic plate.",
  "Warm restaurant lighting, shallow depth of field, small metal cup of chimichurri or salsa criolla when it fits, garnished with a lemon wedge and chopped parsley where appropriate.",
  "Match the lighting, color palette and table setting of the reference photos.",
  "Realistic, high detail, mouth-watering. Square composition, the dish centered and filling the frame.",
  "No text, no logos, no watermarks, no people, no hands.",
].join(" ");

async function fetchAsInlineData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ref ${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { inlineData: { mimeType: "image/jpeg", data: buf.toString("base64") } };
}

function buildPrompt(d) {
  const desc = d.desc_es ? ` Descripción: ${d.desc_es}` : "";
  return (
    `${STYLE}\n\nPlato a representar (cocina argentina): "${d.name_es}".${desc}\n` +
    `Generá UNA sola foto realista de ESTE plato, emplatado y listo para servir.`
  );
}

async function generateImage(refs, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [...refs, { text: prompt }] }],
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`gemini ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) {
    const text = parts.find((p) => p.text)?.text ?? "(sin imagen)";
    throw new Error(`sin imagen: ${text.slice(0, 200)}`);
  }
  return Buffer.from(imgPart.inlineData.data, "base64");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let query = supabase.from("dishes").select("id, slug, name_es, desc_es, photo_url").order("sort_order");
  const { data: dishes, error } = await query;
  if (error) throw error;

  let targets = dishes.filter((d) => force || !d.photo_url);
  if (only) targets = targets.filter((d) => d.slug === only);
  if (limit > 0) targets = targets.slice(0, limit);

  console.log(`Platos a generar: ${targets.length} (modelo ${MODEL})`);
  if (targets.length === 0) return;

  console.log("Descargando fotos de referencia…");
  const refs = await Promise.all(REFERENCE_URLS.map(fetchAsInlineData));

  let ok = 0;
  let fail = 0;
  for (const d of targets) {
    try {
      const img = await generateImage(refs, buildPrompt(d));
      const path = `${d.slug}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("dish-photos")
        .upload(path, img, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("dish-photos").getPublicUrl(path);
      const { error: updErr } = await supabase
        .from("dishes")
        .update({ photo_url: pub.publicUrl })
        .eq("id", d.id);
      if (updErr) throw updErr;
      ok++;
      console.log(`ok   ${d.slug}  (${(img.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      fail++;
      console.log(`FAIL ${d.slug}: ${e.message}`);
    }
    await sleep(1500);
  }
  console.log(`\nListo. ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
