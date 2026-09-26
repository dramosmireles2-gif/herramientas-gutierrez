# Herramientas Gutiérrez · Tienda en línea (DEMO)

Proyecto de RamosMKT (RMKT Web & Apps). Cliente: Herramientas Gutiérrez, ferretería/herramientas con 5 sucursales en el noreste de México.
> Confirmar ortografía final del nombre con el cliente ("Gutiérrez").

## Objetivo de esta etapa
Demo **visual y navegable** para cerrar la venta. Debe verse y sentirse como la tienda real.
- Datos desde JSON local (sin Supabase todavía).
- Pago **simulado** (no integrar pasarela real).
- Pedido por WhatsApp **funcional** (abre wa.me con el mensaje armado).
- La arquitectura debe permitir cambiar a Supabase + pasarela real sin reescribir la UI.

## Repositorio
- Repositorio: https://github.com/dramosmireles2-gif/herramientas-gutierrez.git (rama `main`)
- Link del demo: https://dramosmireles2-gif.github.io/herramientas-gutierrez/
- Si el repo se renombra, actualizar `base` en vite.config.js.

## Stack
- Vite + React + React Router + Tailwind CSS
- Deploy: GitHub Pages vía GitHub Actions (push a `main` = publica)
  - `vite.config.js`: `base: '/herramientas-gutierrez/'` (debe coincidir con el nombre del repo)
  - Usar **HashRouter** (no BrowserRouter) para evitar 404 en Pages. En producción se cambiará a URLs limpias.
  - Rutas a assets de `public/` siempre con `import.meta.env.BASE_URL` (ej. `${import.meta.env.BASE_URL}img/productos/slug.webp`), nunca `/img/...`
  - Workflow: `.github/workflows/deploy.yml` con el flujo oficial de Vite para Pages (checkout, setup-node, npm ci, npm run build, upload-pages-artifact de `dist`, deploy-pages)
- Sin librerías pesadas innecesarias. Priorizar velocidad de carga.

## Estructura
```
src/
  data/
    products.json      # 40–60 productos de ejemplo, mismo esquema que la BD futura
    categories.json    # usar las categorías reales (ver 'Catálogo real')
    brands.json
    branches.json      # 5 sucursales (datos pendientes = placeholders)
  services/            # ÚNICA capa que toca datos. La UI nunca importa JSON directo.
    catalog.js         # getProducts({filtros}), getProduct(slug), getCategories()...
    orders.js          # createOrder() -> en demo guarda en memoria/localStorage y genera folio
    payments/          # adaptador: index.js expone createCheckout(order)
      mock.js          # demo: simula pago aprobado
      # futuro: mercadopago.js / stripe.js con la misma interfaz
    whatsapp.js        # buildOrderMessage(order, branch) -> URL wa.me
  context/
    CartContext.jsx    # carrito con persistencia en localStorage (try/catch)
    BranchContext.jsx  # sucursal seleccionada (persistida)
  components/ pages/ hooks/ lib/
```

## Esquema de datos (igual a futuras tablas de Supabase)
- **products**: id, sku, slug, name, brand_id, category_id, price (MXN, entero en centavos), compare_at_price?, stock, short_description, specs (objeto clave/valor), images [urls], featured (bool), active (bool)
- **categories**: id, slug, name, icon?
- **brands**: id, slug, name
- **branches**: id, slug, city, state, address, phone, whatsapp (formato 52XXXXXXXXXX), hours, maps_url, pickup (bool)
- **orders**: id, folio (ej. HG-000123), branch_id, channel ("web" | "whatsapp"), status ("pendiente" | "pagado" | "pendiente_whatsapp" | "cancelado"), customer {name, phone, email}, delivery ("recoger" | "envio"), address?, subtotal, shipping, total, created_at
- **order_items**: order_id, product_id, sku, name, unit_price, qty

## Sucursales
Cd. Victoria (Tamps), Reynosa (Tamps), Saltillo (Coah), Tampico (Tamps), San Nicolás de los Garza (NL).
- Selector de sucursal en el header (chip con ícono de ubicación). Se pide al entrar si no hay una elegida.
- La sucursal elegida define: WhatsApp destino del pedido y punto de recolección.
- Datos de cada sucursal aún no disponibles: usar placeholders claramente marcados ("Dirección por confirmar") en `branches.json`.
- Copy: decir "en el noreste" / "5 sucursales", no "en todo el país".

## Identidad visual (ELEGIDA: Opción 05 · Titanio y Azul Hielo)
Definir como tokens en `tailwind.config` / CSS variables. No usar colores fuera de estos.

| Token | Hex | Uso |
|---|---|---|
| titanio | #2B3440 | Header, footer, superficies oscuras, títulos |
| hielo | #0EA5E9 | CTA principal ("Agregar al carrito", "Pagar"), acentos |
| hielo-hover | #0284C7 | Hover/active del CTA |
| hielo-texto | #0369A1 | Links y texto azul sobre fondo claro (el #0EA5E9 NO pasa contraste como texto) |
| cta-ink | #0B2233 | Texto sobre botones hielo (nunca texto blanco sobre #0EA5E9) |
| texto | #161C24 | Texto principal |
| gris | #687483 | Texto secundario, metadatos |
| fondo | #F1F4F7 | Fondo general |
| blanco | #FFFFFF | Tarjetas |
| whatsapp | #25D366 | SOLO botón/acciones de WhatsApp |
| ok / agotado | #1E7A45 / #C62828 | Solo estados de existencia |

Tipografía (Google Fonts):
- Títulos, precios, logo: **Archivo** variable, peso 800, `font-stretch: 75%` (condensada), MAYÚSCULAS en headings principales.
- Texto: **Public Sans** 400/600/700.
- Precios con `font-variant-numeric: tabular-nums`.

Logo provisional: hexágono (tuerca) color hielo con círculo titanio al centro + "HERRAMIENTAS / GUTIÉRREZ" en Archivo condensada. Es provisional, el cliente no tiene logo (oportunidad de venta de identidad).

## Pantallas del demo
1. **Inicio**: hero con propuesta de valor ("Todo para la obra, en 5 sucursales del noreste"), categorías, destacados, marcas, franja de sucursales, CTA WhatsApp.
2. **Catálogo** `/catalogo`: buscador, filtros (categoría, marca, rango de precio, en existencia), orden (relevancia, precio), paginación o "cargar más". Filtros en drawer en móvil.
3. **Producto** `/producto/:slug`: galería, marca, SKU, precio, existencia, specs en tabla, cantidad, "Agregar al carrito" + "Preguntar por WhatsApp", relacionados.
4. **Carrito**: drawer lateral + página `/carrito`.
5. **Checkout** `/checkout`: datos de contacto → recoger en sucursal / envío → resumen → "Pagar" (mock) o "Enviar pedido por WhatsApp".
6. **Confirmación** `/pedido/:folio`: folio, resumen, siguiente paso según canal.
7. **Sucursales** `/sucursales`: 5 tarjetas con dirección, horario, teléfono, botón WhatsApp y enlace a Maps.
8. **Contacto / Nosotros** simple.

Botón flotante de WhatsApp en todas las páginas (usa la sucursal elegida).

## Mensaje de WhatsApp (formato)
```
Hola, quiero hacer este pedido (Folio HG-000123):
• 1 x Rotomartillo 1/2" 850 W (SKU RT-850) - $1,899
• 2 x Llave combinada 12 pzs (SKU LL-12) - $1,298
Total: $3,197 MXN
Sucursal: Reynosa · Recoger en tienda
Nombre: ...
```
Usar `encodeURIComponent`. Formato de moneda con `Intl.NumberFormat('es-MX', {style:'currency', currency:'MXN'})`.

## Reglas de seguridad (aplicar desde el demo en el diseño, obligatorias en producción)
- Nunca procesar ni guardar datos de tarjeta. Producción usará checkout alojado (Mercado Pago Checkout Pro o Stripe Checkout).
- El total real se calcula en el servidor (Supabase Edge Function) con precios de la BD. El precio del carrito del navegador es solo visual.
- Un pedido solo pasa a "pagado" por webhook firmado y verificado de la pasarela.
- Supabase con RLS: público solo lee productos/categorías/sucursales activas.
- Secretos únicamente en variables de entorno de Edge Functions. Nada sensible en el frontend ni en el repo.
- Sanitizar todo texto que venga del usuario antes de mostrarlo o mandarlo a WhatsApp.

## UX / calidad
- Mobile first (tráfico viene de Meta Ads). Probar a 375 px.
- CTA de compra siempre visible; en móvil, barra fija inferior en la ficha de producto.
- Imágenes: fondo blanco, `loading="lazy"`, tamaños definidos (evitar CLS), WebP.
- Accesibilidad: contraste AA, foco visible, labels en inputs, alt en imágenes.
- SEO básico: title/description por página, Open Graph, idioma es-MX.
- Textos en español de México, tuteando, claros y orientados a beneficio. Nada de lorem ipsum.

## Catálogo real (primer lote)
- Imágenes normalizadas en `Productos_web/` (800×800, fondo blanco, WebP, nombre = slug). Copiarlas a `public/img/productos/`.
- Datos base en `catalogo_borrador.csv` (slug, nombre, marca, categoría, imagen). Generar `products.json` a partir de este CSV. Si `precio_mxn` está vacío, usar precios de ejemplo creíbles y marcar `demo_price: true`.
- Categorías reales: Generadores, Hidrolavadoras, Compresores, Podadoras, Carpintería, Construcción, Automotriz.
- Marcas: Predator, DeWalt, Ryobi, Bauer, Husky, Champion, Enerwell, Hercules, Central Machinery, McGraw, Warrior, Atlas, Echo, Murray, Daytona, Pittsburgh, Bauker.
- `Productos/` son los originales: no modificar.

## Fotos
El cliente tiene fotos propias tomadas en tienda (fondos y luz irregulares).
- Fichas: usar fotos con fondo blanco (sus fotos con fondo removido, o imágenes oficiales del fabricante).
- Sus fotos reales se usan en secciones de confianza ("Nuestras sucursales", "En existencia en tienda").
- En el demo, si no hay foto, usar placeholder neutro con el color fondo.

## Fuera de alcance del demo (fase 2)
Supabase real, panel admin, carga masiva CSV/Excel, pagos reales, webhooks, correos, existencia por sucursal, facturación CFDI, guías de envío, catálogo Meta + Pixel, cotizaciones/mayoreo para contratistas.
