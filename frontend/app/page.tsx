export const dynamic = 'force-dynamic';

import { client } from "@/sanity/client";
import Gallery from "./components/Gallery"; 

// Service: Fetch de datos
async function getFotos() {
  return client.fetch(`
    *[_type == "portfolio"] | order(_createdAt desc) {
      _id,
      titulo,
      
      // 👇 AQUI ESTA EL CAMBIO:
      // Antes era: "category": categoria->titulo
      // Ahora buscamos en la lista (array):
      "categories": categorias[]->titulo, 
      
      imagen {
        asset->{
          _id,
          url,
          metadata {
            palette {
              dominant {
                background
              }
            }
          }
        }
      }
    }
  `);
}

export default async function Home() {
  const fotos = await getFotos();

  return (
    <main>
      <Gallery fotos={fotos} />
    </main>
  );
}