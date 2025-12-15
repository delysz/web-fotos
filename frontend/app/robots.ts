import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/studio/', // Bloqueamos el panel de administración de Sanity para que no salga en Google
    },
    sitemap: 'https://www.marianfotografia.com/sitemap.xml', // Tu dominio
  }
}