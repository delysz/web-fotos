export const dynamic = 'force-dynamic';

import { client } from "@/sanity/client";
import Gallery from "./components/Gallery"; 

// Service: Fetch de datos
async function getFotos() {
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
    // Quitamos clases de estilo aquí (ni p-10, ni bg-black).
    // Dejamos que el componente Gallery controle todo el diseño.
    <main>
      <Gallery fotos={fotos} />
    </main>
  );
}