# Atlas 3D de Arquitectura de Software — React

Electiva III · PWA (UPTC). Visor de **8 patrones de arquitectura de software en 3D** (arquitectura en capas, MVC, árbol binario, cliente-servidor, cliente-caché-servidor, microservicios, publicador-suscriptor y repositorio), dibujados con Three.js a partir de **datos** (sin archivos .glb), con realidad aumentada opcional.

Es la misma aplicación en tres versiones (sin framework, React y Angular): el motor (`visor.ts`, `xr.ts`, `gestos.ts`, `sw.ts`, `db.ts`, `crypto.ts`, los modelos y el manifest) es el mismo; cambia solo la pantalla. Esta es la versión **React 19 + Vite**.

## Qué hace
- Visor 3D: arrastra para girar, toca una pieza para leer qué hace y su ficha ampliada.
- Sensores de orientación y cámara como fondo (opcionales, con plan B).
- **Realidad aumentada (WebXR)**: retícula con hit-test, el modelo se apoya en una superficie, ancla, y se mueve / gira / escala con los dedos; ◀ ▶ recorren las piezas. Con plan B si el dispositivo no ofrece hit-test o anclas.
- Progreso en IndexedDB (visto, favoritos) y **notas de estudio cifradas** (PBKDF2 + AES-GCM) con contraseña.
- PWA: instalable (botón «Instalar», también guía para iOS), Service Worker propio con Workbox, funciona sin conexión, fichas descargables con Background Sync, avisos locales, banda de «sin conexión».
- Lighthouse: Three.js en su propio paquete, dibujo bajo demanda, espacio reservado (CLS ≈ 0).

## Cómo probarlo
```
npm install
npm run build
```
Servir `dist/` (por ejemplo `npx vite preview`) y abrir http://localhost:4173. La AR necesita un teléfono Android con ARCore y Chrome sobre HTTPS (GitHub Pages) o, en el escritorio, la extensión *Immersive Web Emulator*. No funciona en iPhone (Safari no ofrece WebXR immersive-ar); allí queda el visor 3D.

## Lista de verificación (13 puntos)
```
cd pruebas && npm install playwright && npx playwright install chromium
ATLASDIR=.. node checklist-atlas.js        # tras `npm run build`
```
Comprueba documento, manifest, instalabilidad según Chrome, Service Worker, uso sin conexión, CLS, dibujo bajo demanda y que una nota escrita no se pierde al marcar un favorito.

## Publicación
Cada `push` a `main` publica en GitHub Pages con `.github/workflows/pages.yml`.
