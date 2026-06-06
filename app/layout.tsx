import type { Metadata, Viewport } from "next";
import { Playfair_Display, Oswald, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Don Social Bar — Drinks Experts",
  description:
    "Menú digital de Don Social Bar, bar de cócteles y comida gourmet en Córdoba. Primeros dones, flat breads, dones entre panes, ensaladas, platos para compartir y coctelería de autor. En español, inglés y portugués.",
  applicationName: "Don Social Bar",
  openGraph: {
    title: "Don Social Bar — Drinks Experts",
    description: "Bar de cócteles y platos premium en Córdoba. Mirá la carta.",
    type: "website",
    locale: "es_AR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${oswald.variable} ${outfit.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

