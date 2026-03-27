# Mejoras propuestas: arquitectura, SEO y diseño (sin cambiar la paleta)

Este documento prioriza mejoras para que el sitio sea **más profesional, confiable y orientado a ventas**, manteniendo los **colores y la identidad cromática actuales** (violeta, amarillo, etc.). El enfoque es: **mejor jerarquía, claridad, SEO técnico, accesibilidad y conversiones**.

---

## 1. Estado actual (resumen)

| Área | Situación breve |
|------|------------------|
| Stack | Express + EJS + Sequelize + MySQL; vistas en `app/views/` |
| SEO base | `meta description` fija en `app/views/partials/head.ejs`; `title` dinámico |
| Estilos | `style.css` + utilidades vía Tailwind en CDN en `head.ejs` |
| Riesgos conocidos | Partial `header.ejs` referenciado en `index.ejs` pero ausente en `partials/`; evento `'listening !!'` en `app/bin/www`; datos en `onclick` sin escapar seguro |

---

## 2. Restricción de diseño

- **No modificar** valores de paleta existentes (por ejemplo variables como `--violet-700`, `--yellow` en `app/public/stylesheets/style.css`).
- **Sí permitido** sin romper la regla: espaciado, tamaños de tipo, pesos, alineación, bordes, sombras sutiles con tonos neutros, grid, microcopy y componentes más limpios usando **la misma paleta**.

---

## 3. Arquitectura y operación (priorizado)

### P0 — Estabilidad y coherencia

| # | Mejora | Motivo | Dónde |
|---|--------|--------|--------|
| 1 | Crear `partials/header.ejs` o sustituir el include por `nav`/`head` según intención | Evitar fallo al renderizar la home | `app/views/index.ejs` |
| 2 | Corregir `server.on('listening !!', …)` → `server.on('listening', …)` | Logging y callbacks de arranque correctos | `app/bin/www` |
| 3 | Unificar configuración DB: variables de entorno + un solo origen de verdad | Compose inyecta `MYSQL_*` pero Sequelize usa `config.json`; reduce desajustes en Docker/local | `app/models/index.js`, `app/config/config.json`, `docker-compose.yaml` |
| 4 | Hacer `SESSION_SECRET` obligatorio al arrancar (fallar rápido con mensaje claro) | Seguridad de sesiones | `app/app.js` |

### P1 — Mantenibilidad

| # | Mejora | Motivo | Dónde |
|---|--------|--------|--------|
| 5 | Layout EJS único (DOCTYPE + `html` + `head` + `body`) | Menos duplicación, menos errores de `lang`/`meta` | `app/views/**/*.ejs` |
| 6 | Separar capa “presentación” de strings de negocio (CTAs, subtítulos) | Facilita A/B de copy sin tocar lógica | Nuevo módulo JSON o `res.locals` |
| 7 | Eliminar o consolidar `bcrypt` + `bcryptjs` | Menos superficie de dependencias | `app/package.json`, usos en rutas |
| 8 | Docker producción: `CMD` con `npm start` y `NODE_ENV=production` | Contenedor alineado a prod | `app/Dockerfile`, Compose opcional |

### P2 — Calidad y evolución

| # | Mejora | Motivo |
|---|--------|--------|
| 9 | Introducir migraciones Sequelize en lugar de solo `sync()` | Esquema versionado y despliegues seguros |
| 10 | Lint + formato (ESLint/Prettier) y CI mínimo | Consistencia y regresiones |
| 11 | Tests de humo de rutas críticas (`/`, `/admin`, CRUD admin) | Confianza al refactorizar |

---

## 4. SEO técnico y contenido (priorizado)

### P0 — Correcciones de impacto inmediato

| # | Mejora | Detalle | Archivos típicos |
|---|--------|---------|-------------------|
| 1 | Un solo `<h1>` por página | La home y listados usan varios `h1`; diluye la señal. Hero = `h1`; secciones = `h2`; tarjetas = `h3` | `app/views/index.ejs`, `app/views/pages/products.ejs` |
| 2 | `lang="es"` en todas las vistas base | La home usa `<html>` sin `lang` | `index.ejs`, layout común |
| 3 | Pasar **descripción (y OG) por ruta** | Misma meta para todo el sitio limita CTR y relevancia | `res.render(..., { description, canonical, ogImage })`, ampliar `head.ejs` |

### P1 — Rich results y rastreo

| # | Mejora | Detalle |
|---|--------|---------|
| 4 | `link rel="canonical"` por URL | Evita duplicados si hay varias rutas al mismo contenido |
| 5 | Open Graph + Twitter Card | `og:title`, `og:description`, `og:image` (1200×630), `og:url` |
| 6 | `robots.txt` y `sitemap.xml` | En `app/public/` o generación dinámica mínima |
| 7 | JSON-LD `LocalBusiness` (y opcional `WebSite` con `SearchAction` si aplica) | Mejor comprensión en Google y búsqueda local |
| 8 | Favicon con ruta absoluta desde raíz | `href="/images/3dprinter.svg"` en lugar de relativa frágil | `head.ejs` |

### P2 — Contenido que vende sin cambiar colores

| # | Mejora |
|---|--------|
| 9 | Páginas o secciones dedicadas: “Cómo encargar”, plazos, materiales, zona de envío, garantía breve |
| 10 | Si hay productos estrella, enlazarlos desde la home con texto de beneficio (no solo el nombre) |

### KPIs SEO sugeridos

- Impresiones y CTR en Search Console por página clave.
- Posición media de consultas branded + “impresión 3D [ciudad]”.
- Errores de indexación y cobertura.

---

## 5. Diseño, UX y conversión (misma paleta)

### Principios

1. **Jerarquía**: un mensaje principal + un CTA principal por pantalla (hero y secciones).
2. **Confianza**: datos de contacto reales, política breve de respuesta, ejemplos de trabajos si existen.
3. **Fricción baja**: WhatsApp/mail/Instagram como enlaces reales, no solo iconos.

### P0 — UX y accesibilidad

| # | Mejora | Detalle | Archivos |
|---|--------|---------|----------|
| 1 | Contacto con enlaces operativos | `mailto:`, `https://wa.me/...`, Instagram; textos **distintos** por canal (no repetir el mismo párrafo tres veces) | `app/views/index.ejs` |
| 2 | Menú móvil coherente | Alinear IDs `openMenu`/`closeMenu` con el HTML o eliminar JS huérfano | `app/views/partials/nav.ejs` + scripts |
| 3 | Evitar `<button><a></a></button>` | Un solo elemento interactivo estilizado como botón | `index.ejs`, `products.ejs` |
| 4 | Modal de producto accesible | `role="dialog"`, `aria-modal`, foco al abrir, Escape, botón de cierre semántico | `index.ejs`, `products.ejs`, `app/public/javascript/details.js` |
| 5 | Datos del producto fuera de `onclick` con strings sin escapar | `data-*` + JSON seguro en servidor o endpoint de detalle | Vistas + `details.js` |

### P1 — Percepción “pro” sin tocar colores

| # | Mejora |
|---|--------|
| 6 | Tipografía: reservar fuente muy expresiva (p. ej. Lacquer) solo a titulares; cuerpo con fuente legible ya cargada o sistema |
| 7 | Espaciado vertical consistente entre secciones (escala 4/8 px) |
| 8 | Imágenes producto: mismo ratio, fondo consistente donde aplique |
| 9 | Revisar **copy**: corregir “Sing in” → “Sign in”, unificar ortografía (“éxito”, “correo electrónico”) | Rutas `singin`/`singup` pueden mantenerse con redirección 301 después si se renombran |
| 10 | `logo` con `href="/"` | `nav.ejs` |

### P2 — Rendimiento percibido

| # | Mejora |
|---|--------|
| 11 | Sustituir Tailwind CDN por build estático (CLI/PostCSS) para CSS purgado en producción |
| 12 | `preconnect` a dominios de fuentes/CDN usados |
| 13 | Compresión HTTP y cabeceras de caché para estáticos (middleware `compression`, `maxAge` en `express.static`) |

---

## 6. Roadmap sugerido (fases)

| Fase | Alcance | Duración orientativa |
|------|---------|----------------------|
| **Fase 0** | P0 arquitectura (header, `listening`, secretos, include JS defensivo) | 1–2 días |
| **Fase 1** | P0 SEO + jerarquía de títulos + `lang` + meta por ruta | 2–4 días |
| **Fase 2** | UX contacto, nav móvil, modal a11y, botones/anidación HTML | 2–5 días |
| **Fase 3** | OG, canonical, sitemap, JSON-LD, Tailwind build, Docker prod | 1–2 semanas según carga |

---

## 7. Referencia rápida de archivos

| Tema | Ruta |
|------|------|
| Entrada servidor | `app/bin/www` |
| Express | `app/app.js` |
| Head / meta | `app/views/partials/head.ejs` |
| Home | `app/views/index.ejs` |
| Navegación | `app/views/partials/nav.ejs` |
| Estilos | `app/public/stylesheets/style.css` |
| Config DB | `app/config/config.json`, `app/models/index.js` |
| Compose | `docker-compose.yaml` |

---

## 8. Nota final

Implementar primero los **P0** reduce riesgo (caídas, sesiones, SEO básico mal formado) y deja el terreno listo para que cambios visuales “premium” y de copy **sumen conversión** sin rediseñar colores.
