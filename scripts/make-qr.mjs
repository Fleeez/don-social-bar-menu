// Genera el QR de la carta (PNG alta resolución + SVG) para imprimir.
// Uso: QR_URL=https://criollo-menu.vercel.app QR_OUT=carpeta node scripts/make-qr.mjs
import QRCode from "qrcode";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.QR_URL || "https://criollo-menu.vercel.app";
const out = process.env.QR_OUT || ".";

const opts = {
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#181410ff", light: "#ffffffff" },
};

await QRCode.toFile(path.join(out, "criollo-qr.png"), url, { ...opts, width: 1200 });
const svg = await QRCode.toString(url, { ...opts, type: "svg", width: 1200 });
await writeFile(path.join(out, "criollo-qr.svg"), svg);

console.log("QR generado para:", url);
console.log("->", path.join(out, "criollo-qr.png"));
console.log("->", path.join(out, "criollo-qr.svg"));
