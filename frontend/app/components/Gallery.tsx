// app/components/Gallery.tsx
'use client'; // <--- OBLIGATORIO para que funcionen los clics

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; // Tu importación actual

interface Foto {
  _id: string;
  titulo: string;
  imagen: any;
  category: string; // <--- Nuevo campo
}

export default function Gallery({ fotos }: { fotos: Foto[] }) {
  const [filter, setFilter] = useState('todos');

  // Extraemos las categorías únicas de las fotos cargadas
  const categories = ['todos', ...new Set(fotos.map((f) => f.category).filter(Boolean))];

  // Filtramos las fotos
  const filteredFotos = filter === 'todos' 
    ? fotos 
    : fotos.filter((f) => f.category === filter);

  return (
    <>
      {/* Botones de Filtro */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full capitalize text-sm transition-all border ${
              filter === cat 
                ? 'bg-white text-black border-white font-bold' 
                : 'bg-transparent text-gray-400 border-gray-700 hover:border-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Fotos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFotos.map((foto) => (
          <div key={foto._id} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-900">
            {foto.imagen && (
              <Image 
                src={urlFor(foto.imagen).width(800).url()}
                alt={foto.titulo || "Foto"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-lg font-medium text-white">{foto.titulo}</p>
               <p className="text-xs text-gray-300 uppercase tracking-widest">{foto.category}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}