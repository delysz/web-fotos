export const dynamic = 'force-dynamic';

import { client } from "@/sanity/client";
import Gallery from "./components/Gallery"; 

// Service: Fetch de datos
async function getFotos() {
  // Usamos comillas invertidas (backticks) directas para evitar el error de importación de 'groq'
  return client.fetch(`
    *[_type == "portfolio"] | order(_createdAt desc) {
      _id,
      titulo,
      
      // 1. MANTENEMOS TU LÓGICA DE CATEGORÍA
      "category": categoria->titulo,
      
      // 2. AÑADIMOS LA ESTRUCTURA COMPLETA DE IMAGEN PARA EL COLOR
      imagen {
        asset->{
          _id,
          url,
          // Esto es lo que necesita el Gallery.tsx para ordenar por color:
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