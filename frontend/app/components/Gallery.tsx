'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; 
import { motion, AnimatePresence } from 'framer-motion'; // <--- Importamos la magia

interface Foto {
  _id: string;
  titulo: string;
  imagen: any;
  category: string;
}

export default function Gallery({ fotos }: { fotos: Foto[] }) {
  const [filter, setFilter] = useState('todos');

  // Sacamos categorías únicas y limpiamos (quitamos nulls o undefined)
  const rawCategories = fotos.map((f) => f.category).filter((c) => c);
  const categories = ['todos', ...Array.from(new Set(rawCategories))];

  const filteredFotos = filter === 'todos' 
    ? fotos 
    : fotos.filter((f) => f.category === filter);

  return (
    <section>
      {/* --- BOTONES DE FILTRO --- */}
      <div className="flex justify-center flex-wrap gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`
              relative px-6 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-all duration-300
              ${filter === cat 
                ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                : 'text-gray-500 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {cat}
            {/* Pequeño punto indicador si está activo */}
            {filter === cat && (
              <motion.span
                layoutId="activeFilter"
                className="absolute inset-0 rounded-full border-2 border-transparent"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* --- GRID DE FOTOS ANIMADO --- */}
      <motion.div 
        layout 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence>
          {filteredFotos.map((foto) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={foto._id}
              className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-900 shadow-xl cursor-pointer"
            >
              {foto.imagen && (
                <Image 
                  src={urlFor(foto.imagen).width(800).url()}
                  alt={foto.titulo || "Fotografía"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-90"
                />
              )}
              
              {/* Overlay elegante */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                 <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                    {foto.category}
                 </span>
                 <h3 className="text-xl font-serif text-white leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {foto.titulo}
                 </h3>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Mensaje si no hay fotos (por si acaso) */}
      {filteredFotos.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>No hay fotos en esta categoría aún.</p>
        </div>
      )}
    </section>
  );
}