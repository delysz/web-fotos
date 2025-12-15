# 📷 Marian Fotografía | Portfolio Selecto

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity-F03E2F?style=for-the-badge&logo=sanity&logoColor=white)

> **Portfolio minimalista y de alto rendimiento diseñado para una artista visual.** > Enfocado en la experiencia de usuario (UX), animaciones fluidas y una gestión de contenido headless.

🔗 **[Ver Demo en Vivo](https://marianfotografia.vercel.app)** *(Asegúrate de cambiar este enlace por el tuyo real)*

---

## 🖼️ Sobre el Proyecto

Este proyecto es una galería fotográfica moderna construida con **Next.js 14** (App Router). El objetivo principal era crear una experiencia inmersiva que no distraiga de las obras, utilizando un diseño "dark mode" con texturas orgánicas y transiciones cinematográficas.

Los datos son gestionados dinámicamente a través de **Sanity.io**, permitiendo al cliente subir, categorizar y gestionar sus fotografías sin tocar una sola línea de código.

## ✨ Características Técnicas Destacadas

### 🎨 Frontend & UI/UX
* **Diseño Atmosférico:** Implementación de texturas "noise" (grano de película) y modos de fusión CSS para un acabado orgánico.
* **Animaciones Avanzadas (Framer Motion):**
    * **Preloader Cinematográfico:** Secuencia de entrada coordinada.
    * **Scroll Triggers:** Elementos que reaccionan al desplazamiento.
    * **Micro-interacciones:** Hover effects en tarjetas y botones.
    * **Layout Animations:** Transiciones suaves al filtrar categorías (sin recargas).
* **Algoritmo de Color:** Las imágenes se ordenan automáticamente analizando su **dominancia de color (Hue)** para crear una armonía visual en el grid.

### ⚙️ Backend & CMS
* **Sanity.io Headless CMS:**
    * Esquemas personalizados para gestión de metadatos.
    * Generación automática de URLs optimizadas.
    * Soporte para múltiples categorías por imagen.
* **Optimización de Imágenes:** Uso de `next/image` con carga diferida (lazy loading), placeholders blur y formatos modernos (WebP/AVIF).

## 🛠️ Tecnologías Utilizadas

* **Core:** Next.js 14, React, TypeScript.
* **Estilos:** Tailwind CSS.
* **Animación:** Framer Motion.
* **Datos:** Sanity Client, GROQ (Query Language).
* **Despliegue:** Vercel (CI/CD).

---
