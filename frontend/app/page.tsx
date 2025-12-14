export const dynamic = 'force-dynamic';

import { client, urlFor } from "@/sanity/client";
import Image from "next/image";

// Definimos la Entidad (DTO)
interface Foto {
  _id: string;
  titulo: string;
  imagen: any;
}

// Service: Fetch de datos
async function getFotos() {
  // Query GROQ (parecido a SQL)
  return client.fetch(`*[_type == "portfolio"]`);
}

export default async function Home() {
  const fotos: Foto[] = await getFotos();

  return (
    <main className="min-h-screen p-10 bg-black text-white">
      <h1 className="text-4xl font-bold mb-10 text-center">
        Portafolio de Mamá
      </h1>
      
      {/* Grid de Fotos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fotos.map((foto) => (
          <div key={foto._id} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-900">
            {foto.imagen && (
              <Image 
                src={urlFor(foto.imagen).width(800).url()}
                alt={foto.titulo || "Foto"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
               <p className="text-lg font-medium">{foto.titulo}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}