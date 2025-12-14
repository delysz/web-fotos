export const dynamic = 'force-dynamic';

import { client } from "@/sanity/client";
import Gallery from "./components/Gallery"; // <--- Aquí traemos el Ferrari

// Service: Fetch de datos
async function getFotos() {
  // Query GROQ
  // IMPORTANTE: Aquí añadimos la línea de la categoría para que los filtros funcionen
  return client.fetch(`
    *[_type == "portfolio"] | order(_createdAt desc) {
      _id,
      titulo,
      imagen,
      "category": categoria->titulo 
    }
  `);
}

export default async function Home() {
  const fotos = await getFotos();

  return (
    <main className="min-h-screen p-10 bg-black text-white">
      <h1 className="text-4xl font-bold mb-10 text-center font-serif">
        Portafolio de Mamá
      </h1>
      
      {/* ANTES: Tenías aquí un <div> con un map...
         AHORA: Usamos el componente Gallery y le pasamos las fotos
      */}
      <Gallery fotos={fotos} />
      
    </main>
  );
}