import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // Cambia esto por tu dominio real cuando lo compres
  const baseUrl = 'https://www.marianfotografia.com' 

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // Si tuvieras más páginas (ej: /contacto), las añadirías aquí
  ]
}