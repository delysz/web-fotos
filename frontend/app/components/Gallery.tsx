'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; 
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface Foto {
  _id: string;
  titulo: string;
  imagen: any;
  category: string;
  width?: number;
  height?: number;
}

interface GalleryProps {
  fotos: Foto[];
}

export default function Gallery({ fotos }: GalleryProps) {
  const [filter, setFilter] = useState<string>('todos');
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // NUEVO ESTADO: Para el modal de Contacto
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Memorizar categorías
  const categories = useMemo(() => {
    const rawCategories = fotos
      .map((f) => f.category)
      .filter((c): c is string => Boolean(c));
    return ['todos', ...Array.from(new Set(rawCategories))];
  }, [fotos]);

  // Memorizar fotos filtradas
  const filteredFotos = useMemo(() => {
    return filter === 'todos' 
      ? fotos 
      : fotos.filter((f) => f.category === filter);
  }, [fotos, filter]);

  // Manejar el modal de FOTO
  const handleOpenModal = useCallback((foto: Foto) => {
    setIsImageLoaded(false);
    setSelectedFoto(foto);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => setSelectedFoto(null), 300);
  }, []);

  // Manejar el modal de CONTACTO
  const toggleContact = useCallback(() => {
    const newState = !isContactOpen;
    setIsContactOpen(newState);
    document.body.style.overflow = newState ? 'hidden' : 'unset';
  }, [isContactOpen]);

  // Manejar tecla Escape (Cierra fotos y contacto)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) handleCloseModal();
        if (isContactOpen) toggleContact();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, isContactOpen, handleCloseModal, toggleContact]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Error loading image:', e);
  }, []);

  // Cerrar menú filtro al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };
    if (isMenuOpen) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <LayoutGroup>
      <section className="bg-[#0a0a0a] min-h-screen pt-20 pb-10 px-4 sm:px-8 select-none flex flex-col">
        
        {/* --- ENCABEZADO --- */}
        <header className="relative text-center mb-12 space-y-4">
          
          {/* BOTÓN CONTACTO (Posicionado absoluto a la derecha o centrado en móvil) */}
          <div className="absolute top-0 right-0 hidden md:block">
            <button 
              onClick={toggleContact}
              className="text-xs font-medium tracking-[0.2em] text-gray-400 hover:text-white uppercase transition-colors border-b border-transparent hover:border-white pb-1"
            >
              Contacto
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-widest uppercase opacity-90">
            Marian <span className="text-gray-600 font-light">&</span> Fotografía
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
            Portfolio Selecto
          </p>
          
          {/* Botón contacto para móvil (debajo del título) */}
          <div className="md:hidden pt-4">
             <button 
              onClick={toggleContact}
              className="text-xs font-medium tracking-[0.2em] text-gray-400 border border-gray-800 px-4 py-2 rounded-full uppercase"
            >
              Contacto
            </button>
          </div>
        </header>

        {/* --- FILTRO DESPLEGABLE --- */}
        <div className="relative flex justify-center mb-16 z-30">
          <div className="relative inline-block text-left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="flex items-center justify-between gap-3 w-48 px-6 py-3 
                         bg-neutral-900 border border-neutral-800 rounded-full 
                         text-white text-xs font-medium tracking-[0.2em] uppercase 
                         hover:border-neutral-600 transition-colors duration-300
                         focus:outline-none focus:ring-2 focus:ring-neutral-600"
            >
              <span>{filter}</span>
              <motion.svg 
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                className="w-4 h-4 text-gray-400" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute mt-2 w-48 bg-neutral-900 border border-neutral-800 
                             rounded-xl shadow-2xl overflow-hidden z-40"
                >
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => {
                          setFilter(cat);
                          setIsMenuOpen(false);
                        }}
                        className={`
                          w-full text-left px-6 py-3 text-xs tracking-[0.2em] uppercase 
                          transition-colors duration-200 
                          ${filter === cat 
                            ? 'bg-white text-black font-bold' 
                            : 'text-gray-400 hover:bg-neutral-800 hover:text-white'}
                        `}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- GRID UNIFORME (Cuadrado Perfecto) --- */}
        <div className="flex-grow">
          {filteredFotos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No hay imágenes en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredFotos.map((foto) => (
                  <motion.article
                    layoutId={`card-${foto._id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    key={foto._id}
                    onClick={() => handleOpenModal(foto)}
                    className="relative group cursor-pointer"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 border-4 border-white shadow-sm hover:shadow-white/20 transition-shadow duration-300">
                      {foto.imagen && (
                        <Image 
                          src={urlFor(foto.imagen).width(800).height(800).fit('crop').quality(80).url()}
                          alt={foto.titulo || "Fotografía de Marian"}
                          width={800}
                          height={800}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          onContextMenu={handleContextMenu}
                          onError={handleImageError}
                          draggable={false} 
                          loading="lazy"
                          className="block w-full h-full object-cover transition-all duration-500 
                                     grayscale-[20%] contrast-[0.95] 
                                     group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-[1.05]"
                        />
                      )}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent 
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                   flex items-end p-4 pointer-events-none"
                      >
                        <div>
                          <h3 className="text-white font-serif text-sm tracking-wide relative top-2 group-hover:top-0 transition-all duration-300">
                            {foto.titulo}
                          </h3>
                          <p className="text-gray-300 text-[10px] mt-1 uppercase tracking-wider relative top-2 group-hover:top-0 transition-all duration-300 delay-75">
                            {foto.category}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <footer className="mt-20 pt-8 border-t border-neutral-900 text-center space-y-2">
          <p className="text-neutral-600 text-[10px] tracking-[0.2em] uppercase">
            &copy; {new Date().getFullYear()} Marian Fotografía. Todos los derechos reservados.
          </p>
          <p className="text-neutral-700 text-[9px]">
            Prohibida la reproducción total o parcial sin autorización escrita.
          </p>
          <a 
            href="https://github.com/delysz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-neutral-500 text-[9px] tracking-[0.1em] hover:text-neutral-300 transition-colors pt-2 border-b border-transparent hover:border-neutral-500"
          >
            design by Delysz
          </a>
        </footer>

        {/* --- MODAL FOTO (LIGHTBOX) --- */}
        <AnimatePresence>
          {isModalOpen && selectedFoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out"
            >
              <motion.div
                layoutId={`card-${selectedFoto._id}`}
                className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedFoto.imagen && (
                  <>
                    {!isImageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center z-0">
                        <div className="w-10 h-10 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                    <Image 
                      src={urlFor(selectedFoto.imagen).width(1920).quality(90).url()}
                      alt={selectedFoto.titulo}
                      width={1920}
                      height={1080}
                      quality={90}
                      priority
                      onContextMenu={handleContextMenu}
                      draggable={false}
                      onLoadingComplete={() => setIsImageLoaded(true)}
                      className={`
                        w-full h-full object-contain max-h-[90vh] mx-auto z-10 
                        transition-opacity duration-500
                        ${isImageLoaded ? 'opacity-100' : 'opacity-0'} 
                      `}
                    />
                  </>
                )}
                
                {isImageLoaded && (
                  <>
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 pointer-events-none">
                      <h2 className="text-2xl text-white font-serif">{selectedFoto.titulo}</h2>
                      <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">{selectedFoto.category}</p>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-30 p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODAL CONTACTO (NUEVO) --- */}
        <AnimatePresence>
          {isContactOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleContact}
              className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/98 p-6"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full text-center space-y-8"
              >
                {/* Logo o Título en el Modal */}
                <h2 className="text-3xl font-serif text-white tracking-widest uppercase">
                  Marian Fotografía
                </h2>
                
                {/* Breve Bio */}
                <p className="text-gray-400 font-light leading-relaxed">
                  Capturando la esencia de los momentos efímeros. Especializada en fotografía de retrato y paisaje. Disponible para proyectos editoriales y eventos privados.
                </p>

                <div className="w-16 h-[1px] bg-neutral-800 mx-auto"></div>

                {/* Enlaces de Contacto */}
                <div className="space-y-4">
                  <a href="mailto:tuemail@ejemplo.com" className="block text-white text-lg hover:text-gray-300 transition-colors tracking-wide">
                    hola@marianfoto.com
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block text-white text-lg hover:text-gray-300 transition-colors tracking-wide">
                    @marian_visual
                  </a>
                </div>

                {/* Ubicación */}
                <p className="text-xs text-neutral-600 uppercase tracking-[0.2em] pt-8">
                  Zaragoza, España
                </p>

                {/* Botón Cerrar */}
                <button 
                  onClick={toggleContact}
                  className="mt-12 text-gray-500 hover:text-white text-xs uppercase tracking-widest border border-gray-800 px-6 py-3 rounded-full hover:border-white transition-all"
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>
    </LayoutGroup>
  );
}