// Genera fotos de platos con el CLI de Higgsfield (modelo nano_banana_2),
// usando una foto real del local como referencia de estilo, comprime a JPEG
// liviano con sharp y sube a Supabase (bucket dish-photos) seteando photo_url.
//
// Requiere estar logueado en el CLI (hf auth login).
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HF_BIN, REF_IMAGE, [PROVO_FILE]
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HF_BIN, REF_IMAGE, PROVO_FILE } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !HF_BIN || !REF_IMAGE) {
  console.error("Faltan env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / HF_BIN / REF_IMAGE");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const STYLE =
  "Fondo oscuro, mantel a cuadros verde y blanco, servido en tabla de madera o plato negro, " +
  "copita metalica de salsa criolla o chimichurri cuando corresponda, iluminacion calida de restaurante, " +
  "estilo bodegon argentino, misma ambientacion, encuadre y luz que la foto de referencia. " +
  "Un solo plato centrado, apetitoso, fotografia gastronomica realista de alta nitidez, sin texto ni logos ni personas ni manos.";

const JOBS = [
  // provo-y-gusto ya fue generado: se sube el archivo si se pasa PROVO_FILE.
  PROVO_FILE ? { slug: "provo-y-gusto", file: PROVO_FILE } : null,
  {
    slug: "la-que-comia-san-martin",
    prompt: `Empanadas criollas argentinas horneadas, doradas, con repulgue a mano, en un plato, junto a una copita de salsa criolla. ${STYLE}`,
  },
  {
    slug: "papita-a-lo-criollo",
    prompt: `Papas fritas en bastones cubiertas con queso fundido y trozos de salchicha parrillera dorada, con perejil, en un plato hondo. ${STYLE}`,
  },
  {
    slug: "glotona",
    prompt: `Tortilla de papas espanola gruesa y jugosa, cortada mostrando el relleno de chorizo y queso derretido, en un plato. ${STYLE}`,
  },
  {
    slug: "glotona-a-caballo",
    prompt: `Tortilla de papas gruesa rellena de chorizo y queso, coronada con dos huevos fritos de yema brillante, en un plato. ${STYLE}`,
  },
].filter(Boolean);

function generate(prompt) {
  const out = execFileSync(
    HF_BIN,
    ["generate", "create", "nano_banana_2", "--prompt", prompt, "--image", REF_IMAGE, "--aspect_ratio", "1:1", "--resolution", "1k", "--wait", "--json"],
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 200 }
  );
  const start = out.indexOf("[");
  const arr = JSON.parse(out.slice(start));
  const url = arr[0]?.result_url;
  if (!url) throw new Error("sin result_url");
  return url;
}

async function toThumbJpeg(buf) {
  return sharp(buf).resize(1080, 1080, { fit: "cover" }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

let ok = 0,
  fail = 0;
for (const job of JOBS) {
  try {
    let raw;
    if (job.file) {
      raw = await readFile(job.file);
    } else {
      const url = generate(job.prompt);
      const res = await fetch(url);
      raw = Buffer.from(await res.arrayBuffer());
    }
    const jpg = await toThumbJpeg(raw);
    const dest = `${job.slug}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("dish-photos")
      .upload(dest, jpg, { contentType: "image/jpeg", upsert: true });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from("dish-photos").getPublicUrl(dest);
    const { error: updErr } = await supabase.from("dishes").update({ photo_url: pub.publicUrl }).eq("slug", job.slug);
    if (updErr) throw updErr;
    ok++;
    console.log(`ok   ${job.slug}  (${(jpg.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    fail++;
    console.log(`FAIL ${job.slug}: ${String(e.message).slice(0, 200)}`);
  }
}
console.log(`\nListo. ok=${ok} fail=${fail}`);
