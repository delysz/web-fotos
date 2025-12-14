# 📸 Portfolio de Fotografía Profesional

> Una plataforma web moderna, rápida y minimalista diseñada para exponer el trabajo fotográfico de [Nombre de tu Madre].

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC) ![Sanity](https://img.shields.io/badge/Sanity-v3-F03E2F)

## 📖 Sobre el Proyecto

Este proyecto nace de una necesidad real: crear un espacio digital donde gestionar y mostrar un catálogo fotográfico en crecimiento. A diferencia de soluciones genéricas, esta web ofrece una experiencia de usuario fluida y una gestión de contenido totalmente personalizada.

El objetivo técnico fue construir una aplicación **Full Stack** performante, utilizando **ISR (Incremental Static Regeneration)** para lograr tiempos de carga instantáneos sin sacrificar la frescura de los datos.

## ✨ Características Clave

* **⚡ Rendimiento Extremo:** Arquitectura basada en Next.js App Router.
* **🎨 CMS Headless:** Gestión de contenidos flexible con **Sanity.io**. Permite crear categorías y subir fotos sin tocar código.
* **✨ UI/UX Animada:** Transiciones fluidas y micro-interacciones utilizando **Framer Motion**.
* **📱 Diseño Responsive:** Grid "Masonry-style" adaptado a móviles y escritorio con **Tailwind CSS**.
* **🔍 Filtrado en Cliente:** Sistema de filtrado por categorías instantáneo (sin recargas de página).
* **🖼️ Optimización de Imágenes:** Uso de `next/image` con placeholders (LQIP) y carga diferida.

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js 14 (App Router), React, TypeScript.
* **Estilos:** Tailwind CSS.
* **Animaciones:** Framer Motion.
* **Backend / CMS:** Sanity.io (Content Lake).
* **Despliegue:** Vercel.

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para correr el proyecto en tu máquina:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/nombre-del-repo.git](https://github.com/tu-usuario/nombre-del-repo.git)
    cd nombre-del-repo
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    cd backend && npm install # Para instalar las dependencias de Sanity
    ```

3.  **Configurar Variables de Entorno:**
    Renombra el archivo `.env.example` a `.env.local` y añade tus claves de Sanity:
    ```bash
    NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id
    NEXT_PUBLIC_SANITY_DATASET=production
    ```

4.  **Correr el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

## 📸 Vistazo al CMS (Sanity Studio)

El panel de administración permite:
* Subir imágenes con recorte inteligente (Hotspot).
* Crear y gestionar categorías dinámicas.
* Ver cambios en tiempo real.

---
Hecho con ❤️ por [Tu Nombre]
