# ENERGY WATT México Landing Page

Landing page estática, responsive y lista para producción para ENERGY WATT México, construida con HTML5, Tailwind CSS local y JavaScript vanilla.

## Tecnologías

- HTML5 semántico
- Tailwind CSS 4 con CLI local
- JavaScript vanilla
- Assets SVG locales como placeholders visuales

## Requisitos

- Node.js
- npm
- Python 3 solo para `npm run preview`

## Instalación

```bash
npm install
```

## Desarrollo

Compila Tailwind en modo observador:

```bash
npm run dev
```

En otra terminal puedes abrir una vista local:

```bash
npm run preview
```

Después entra a `http://localhost:4173`.

## Producción

```bash
npm run build
```

El CSS final se genera en `dist/styles.css` y `index.html` lo carga con:

```html
<link rel="stylesheet" href="./dist/styles.css">
```

## Publicación

Sube al hosting:

- `index.html`
- `dist/styles.css`
- carpeta `public/`
- `src/main.js`

No es necesario subir `node_modules`.

## Logotipos

El logotipo placeholder está en:

- `public/assets/logos/energy-watt-logo.svg`

Reemplázalo por el archivo vectorial oficial cuando el cliente entregue el logo editable. Mantén las variantes del manual: blanco/verde para fondos oscuros y negro/verde para fondos claros.

## Imágenes

Los placeholders actuales están en `public/assets/images/`. Fotografías recomendadas para reemplazo:

- `hero-energy-watt.webp`
- `about-energy-watt.webp`
- `category-protection.webp`
- `category-cabling.webp`
- `category-control.webp`
- `category-canalization.webp`
- `category-installation.webp`

Usar WebP o AVIF optimizados, sin marcas de agua.

## Datos de Contacto

Los placeholders visibles están en `index.html` y los valores centralizados para uso dinámico están en `src/main.js`, dentro de `siteConfig`.

## WhatsApp

En `src/main.js`, cambia:

```js
whatsappNumber: "5210000000000"
```

por el número real en formato internacional, sin espacios ni signos.

## Formulario

El formulario valida en frontend y actualmente funciona en modo demostración. Para conectarlo, edita `submitContactRequest()` en `src/main.js` y usa Formspree, Web3Forms, EmailJS o un endpoint propio.

## Redes Sociales

Actualiza los enlaces del footer y el objeto `siteConfig.social` en `src/main.js` cuando existan URLs reales.

## Información Pendiente por Confirmar

- Teléfono
- WhatsApp
- Correo
- Dirección
- Horarios
- Redes sociales
- URL definitiva
- Aviso de privacidad
- Términos y condiciones
- Catálogo real
- Marcas distribuidas
- Cobertura geográfica
- Certificaciones
- Años de experiencia
- Cantidad de proyectos o clientes

## Estructura

```text
energy-watt-landing/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   ├── logos/
│   │   └── icons/
│   ├── favicon.svg
│   ├── robots.txt
│   └── site.webmanifest
├── src/
│   ├── input.css
│   └── main.js
├── dist/
│   └── styles.css
├── index.html
├── package.json
├── README.md
└── .gitignore
```
