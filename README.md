# Criollo · Paladar Argento — Menú Digital

Carta digital trilingüe (ES / EN / PT) + panel de administración para los dueños.
Bodegón argentino en Córdoba. Construido con **Next.js 16** (App Router) y **Supabase**
(Postgres + Storage + Auth). Pensado para desplegarse en **Vercel**.

## Qué incluye

- **Carta pública** (`/`): mobile-first, selector de idioma ES/EN/PT, búsqueda, filtros
  (vegetariano, sin TACC, picante, recomendado, para compartir), navegación por categorías,
  estados "no disponible hoy" y "precio a confirmar". Se actualiza al instante cuando el dueño edita.
- **Panel privado** (`/admin`): login con email/contraseña; editar precios, platos, fotos,
  disponibilidad y categorías; reordenar; cargar textos en los 3 idiomas. "Si sabés usar Instagram,
  sabés usar esto."

## Stack

- Next.js 16 + React + TypeScript (App Router, Server Components, Server Actions).
- Supabase: base de datos, storage de fotos y auth de los dueños.
- CSS propio portado del sistema de diseño Criollo (paleta OKLCH, fuentes Fraunces / Barlow
  Condensed / Inter). Sin Tailwind.

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá con los datos del proyecto Supabase
(Dashboard → Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` es **opcional** y sólo lo usan los scripts de setup locales
(`scripts/`). La app en runtime **no** lo necesita. No lo subas a Vercel salvo que lo precises.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
```

## Base de datos

- `supabase/schema.sql` — tablas (`categories`, `dishes`), enum de precio, RLS y buckets de storage.
- `supabase/seed.sql` — carga inicial del menú real (37 platos en 6 categorías), con descripciones
  en ES/EN/PT.

Ejecutar ambos en el SQL Editor de Supabase (o por la Management API). Son idempotentes.

### Reglas de seguridad (RLS)

- El público (anon) **sólo lee** categorías y platos visibles.
- Sólo usuarios **autenticados** (los dueños) pueden escribir.
- Fotos: buckets públicos `dish-photos` y `ambient`; subida sólo para autenticados.

## Despliegue (Vercel)

1. Importar el repo en Vercel.
2. Cargar las env vars `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. La carta queda en la URL raíz y el panel en `/admin`.

## Estructura

```
app/                 # rutas (carta en /, panel en /admin)
components/carta/     # UI de la carta (cliente)
components/admin/     # UI del panel (cliente)
lib/                  # supabase clients, tipos, i18n, helpers de datos
supabase/             # schema.sql + seed.sql
scripts/              # utilidades de setup (subir fotos, etc.)
proxy.ts              # refresco de sesión + protección de /admin (Next 16 "Proxy")
```

## Pendientes (del brief)

- Sesión de fotos reales por plato (hoy: placeholder con logo + fotos del local de ambiente).
- Confirmar precios de Guarniciones / Postres / Bebidas (hoy "precio a confirmar").
- Confirmar lista/marcas de bebidas y precios.
- Validar traducciones EN/PT con los dueños antes de publicar.
