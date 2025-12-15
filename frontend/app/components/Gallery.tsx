'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; 
import { motion, AnimatePresence } from 'framer-motion';

interface Foto {
  _id: string;
  titulo: string;
  imagen: any;
  category: string;
}

export default function Gallery({ fotos }: { fotos: Foto[] }) {
  const [filter, setFilter] = useState('todos');

  // Filtramos categorías vacías
  const rawCategories = fotos.map((f) => f.category).filter((c) => c);
  const categories = ['todos', ...Array.from(new Set(rawCategories))];

  const filteredFotos = filter === 'todos' 
    ? fotos 
    : fotos.filter((f) => f.category === filter);

  return (
    <section className="bg-[#0a0a0a] min-h-screen py-20 px-4 sm:px-8">
      
      {/* --- ENCABEZADO "FIRMA MARIAN" --- */}
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-widest uppercase opacity-90">
          Marian <span className="text-gray-600 font-light">&</span> Visual
        </h2>
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
          Portfolio Selecto 2025
        </p>
      </div>

      {/* --- FILTROS MINIMALISTAS --- */}
      <div className="flex justify-center flex-wrap gap-8 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="relative group py-2"
          >
            <span className={`
              text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-300
              ${filter === cat ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}
            `}>
              {cat}
            </span>
            {/* Línea elegante debajo del activo */}
            {filter === cat && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 right-0 bottom-0 h-[1px] bg-white"
              />
            )}
          </button>
        ))}
      </div>

      {/* --- GRID MASONRY (CORREGIDO) --- */}
      {/* Nota: Quitamos 'space-y' aquí para evitar bugs de alineación en columnas */}
      <motion.div 
        layout
        className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-7xl mx-auto"
      >
        <AnimatePresence mode='popLayout'>
          {filteredFotos.map((foto) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              key={foto._id}
              // IMPORTANTE: 'mb-6' crea el espacio vertical seguro.
              // 'break-inside-avoid' evita que la foto se corte entre columnas.
              className="break-inside-avoid mb-6 relative group cursor-pointer overflow-hidden rounded-sm"
            >
              {/* Contenedor de imagen */}
              <div className="relative w-full">
                {foto.imagen && (
                  <Image 
                    src={urlFor(foto.imagen).width(800).url()}
                    alt={foto.titulo || "Marian Photography"}
                    width={800}
                    height={1000} // Referencial
                    className="w-full h-auto object-cover transition-all duration-700 ease-out 
                               grayscale-[20%] contrast-[0.95] 
                               group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
                
                {/* Overlay Sutil */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {foto.category}
                  </span>
                  <h3 className="text-lg font-serif text-white mt-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {foto.titulo}
                  </h3>
                </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Mensaje vacío */}
      {filteredFotos.length === 0 && (
        <div className="text-center py-32 text-gray-600 font-serif italic">
          <p>No hay imágenes disponibles en esta colección.</p>
        </div>
      )}
    </section>
  );
}