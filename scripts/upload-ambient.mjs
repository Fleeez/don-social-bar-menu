// One-off: sube las fotos del local al bucket `ambient`.
// Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... PHOTOS_DIR=... node scripts/upload-ambient.mjs
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dir = process.env.PHOTOS_DIR;

if (!url || !key || !dir) {
  console.error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / PHOTOS_DIR");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const files = (await readdir(dir))
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

let i = 0;
for (const f of files) {
  i++;
  const buf = await readFile(path.join(dir, f));
  const dest = `ambient-${i}.jpg`;
  const { error } = await supabase.storage
    .from("ambient")
    .upload(dest, buf, { contentType: "image/jpeg", upsert: true });
  console.log(error ? `FAIL ${dest}: ${error.message}` : `ok   ${dest}  <- ${f}`);
}
console.log("done");
