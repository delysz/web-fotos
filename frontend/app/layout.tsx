import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL('https://marianfotografia.vercel.app'), 

  title: {
    default: "Marian Fotografía",
    template: "%s | Marian Fotografía"
  },
  description: "Portfolio de fotografía artística, paisajes inmensos y fotografía macro en Zaragoza. Explorando la luz y la textura de la naturaleza.",
  keywords: ["fotógrafo zaragoza", "fotografía paisaje", "fotografía macro", "arte visual", "marian fotografía", "naturaleza aragón"],
  authors: [{ name: "Marian" }],
  creator: "Marian",

  // Configuración para WhatsApp/Redes
  openGraph: {
    title: "Marian Fotografía | Portfolio Selecto",
    description: "Exploradora de la luz y el entorno natural. Paisaje y Macro.",
    url: "https://marianfotografia.vercel.app",
    siteName: "Marian Fotografía",
    locale: "es_ES",
    type: "website",
    // 👇 2. AQUÍ FORZAMOS A QUE COJA LA IMAGEN
    images: [
      {
        url: '/opengraph-image.jpg', // Asegúrate de que tu foto se llame así en la carpeta app
        width: 1200,
        height: 630,
        alt: 'Portfolio de Marian Fotografía',
      },
    ],
  },
  
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
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}