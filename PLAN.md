# Plan de trabajo · Demo Herramientas Gutiérrez

Ir en orden. Al terminar cada paso: `npm run build` sin errores y revisar en móvil (375 px).

## 1. Base del proyecto
- [ ] Vite + React + React Router + Tailwind
- [ ] Tokens de color y fuentes de la Opción 05 (ver CLAUDE.md)
- [ ] `vite.config` con `base: '/herramientas-gutierrez/'`, HashRouter y `.github/workflows/deploy.yml`
- [ ] `.gitignore` (node_modules, dist) y excluir `Productos/`, `_tmp/` y `Paletas_*.png` del repo
- [ ] Layout: Header (logo provisional, buscador, selector de sucursal, carrito), Footer, botón flotante WhatsApp

## 2. Datos mock
- [ ] `categories.json` con las 7 categorías reales del CSV
- [ ] `brands.json` con las marcas del CSV
- [ ] `products.json` generado desde `catalogo_borrador.csv` (39 productos) + imágenes de `Productos_web/`, con specs reales de cada modelo
- [ ] `branches.json` 5 sucursales con placeholders
- [ ] `services/catalog.js` con filtros, búsqueda y orden

## 3. Catálogo y producto
- [ ] Inicio
- [ ] Catálogo con filtros (drawer en móvil) y buscador
- [ ] Ficha de producto con barra CTA fija en móvil
- [ ] Estados vacíos (sin resultados, agotado)

## 4. Carrito y sucursal
- [ ] CartContext con persistencia
- [ ] Drawer de carrito + página carrito
- [ ] BranchContext + modal de selección de sucursal al primer ingreso

## 5. Checkout
- [ ] Formulario con validación (nombre, teléfono 10 dígitos, correo opcional)
- [ ] Recoger en sucursal / envío a domicilio
- [ ] `payments/mock.js` → pantalla de "procesando" → confirmación
- [ ] `whatsapp.js` → pedido por WhatsApp a la sucursal elegida
- [ ] Página de confirmación con folio

## 6. Sucursales y contenido
- [ ] Página de sucursales
- [ ] Nosotros / Contacto
- [ ] Metadatos SEO y Open Graph

## 7. Pulido y entrega
- [ ] Lighthouse móvil: Performance y Accesibilidad > 90
- [ ] Revisar textos y ortografía
- [ ] Push a GitHub → verificar que Actions publique y probar el link en celular (incluye recargar en una ficha de producto)
- [ ] Recorrido de presentación: Inicio → buscar producto → agregar → checkout → pagar (demo) → pedido por WhatsApp → sucursales
