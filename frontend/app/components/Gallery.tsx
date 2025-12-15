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
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null); // <--- Estado para el Modal

  // Filtramos categorías vacías
  const rawCategories = fotos.map((f) => f.category).filter((c) => c);
  const categories = ['todos', ...Array.from(new Set(rawCategories))];

  const filteredFotos = filter === 'todos' 
    ? fotos 
    : fotos.filter((f) => f.category === filter);

  return (
    <section className="bg-[#0a0a0a] min-h-screen py-20 px-4 sm:px-8">
      
      {/* --- ENCABEZADO --- */}
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-widest uppercase opacity-90">
          Marian <span className="text-gray-600 font-light">&</span> Visual
        </h2>
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">Portfolio Selecto 2024</p>
      </div>

      {/* --- FILTROS --- */}
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
            {filter === cat && (
              <motion.div layoutId="underline" className="absolute left-0 right-0 bottom-0 h-[1px] bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* --- GRID MASONRY (CORREGIDO PARA HUECOS) --- */}
      {/* gap-4 controla el espacio HORIZONTAL. mb-4 controla el VERTICAL */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-7xl mx-auto space-y-0">
        <AnimatePresence>
          {filteredFotos.map((foto) => (
            <motion.div
              layoutId={`card-${foto._id}`} // ID único para la animación de morphing
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              key={foto._id}
              onClick={() => setSelectedFoto(foto)} // <--- Al hacer clic, abrimos modal
              // 'break-inside-avoid' evita que se parta. 'mb-4' crea el hueco vertical exacto.
              className="break-inside-avoid mb-4 relative group cursor-pointer"
            >
              <div className="relative w-full overflow-hidden rounded-sm bg-neutral-900">
                {foto.imagen && (
                  <Image 
                    src={urlFor(foto.imagen).width(800).url()}
                    alt={foto.titulo || "Marian Photography"}
                    width={800}
                    height={1000}
                    // 'block' es vital para eliminar huecos fantasmas debajo de las imagenes
                    className="block w-full h-auto object-cover transition-all duration-700 
                               grayscale-[20%] contrast-[0.95] 
                               group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                
                {/* Overlay Hover */}
                <motion.div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                   <h3 className="text-white font-serif text-sm tracking-wide">{foto.titulo}</h3>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- MODAL (LIGHTBOX) A PANTALLA COMPLETA --- */}
      <AnimatePresence>
        {selectedFoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFoto(null)} // Cierra al hacer clic fuera
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            {/* Imagen Expandida */}
            <motion.div
              layoutId={`card-${selectedFoto._id}`} // Misma ID = Animación mágica
              className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-md bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Evita cerrar si clicas la foto misma
            >
               {selectedFoto.imagen && (
                  <Image 
                    src={urlFor(selectedFoto.imagen).width(1600).url()} // Cargamos versión HD
                    alt={selectedFoto.titulo}
                    width={1600}
                    height={1200}
                    className="w-full h-full object-contain max-h-[90vh] mx-auto"
                  />
               )}
               
               {/* Título en grande dentro del modal */}
               <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h2 className="text-2xl text-white font-serif">{selectedFoto.titulo}</h2>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">{selectedFoto.category}</p>
               </div>

               {/* Botón Cerrar (X) */}
               <button 
                 onClick={() => setSelectedFoto(null)}
                 className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}