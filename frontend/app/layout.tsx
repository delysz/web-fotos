import type { Metadata } from "next";
import "./globals.css";

// Configuración SEO
export const metadata: Metadata = {
  // El título que sale en la pestaña y en Google
  title: {
    default: "Marian Fotografía",
    template: "%s | Marian Fotografía"
  },
  // La descripción gris que sale debajo del título
  description: "Portfolio de fotografía artística, paisajes inmensos y fotografía macro en Zaragoza. Explorando la luz y la textura de la naturaleza.",
  
  // Palabras clave para ayudar a Google
  keywords: ["fotógrafo zaragoza", "fotografía paisaje", "fotografía macro", "arte visual", "marian fotografía", "naturaleza aragón"],
  
  // Autores y creador
  authors: [{ name: "Marian" }],
  creator: "Marian",
  
  // Para que se vea bonito al compartir en WhatsApp/Twitter/LinkedIn
  openGraph: {
    title: "Marian Fotografía | Portfolio Selecto",
    description: "Exploradora de la luz y el entorno natural. Paisaje y Macro.",
    url: "https://www.marianfotografia.vercel.app", // PON TU DOMINIO REAL AQUÍ
    siteName: "Marian Fotografía",
    locale: "es_ES",
    type: "website",
  },
  
  // Instrucciones para robots
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}