'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; 
// Importamos Variants para el tipado correcto
import { motion, AnimatePresence, LayoutGroup, Variants } from 'framer-motion';

// --- INTERFACES ---
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

// --- VARIANTES DE ANIMACIÓN PRO ---

// Animación del cajón de contacto lateral
const drawerVariants: Variants = {
  hidden: { x: '100%', opacity: 0.5 },
  visible: { 
    x: '0%', 
    opacity: 1,
    transition: { type: 'spring', damping: 30, stiffness: 300 } 
  },
  exit: { 
    x: '100%', 
    opacity: 0, 
    transition: { ease: 'easeInOut', duration: 0.3 } 
  }
};

// Animación para los elementos de texto dentro del contacto
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// Contenedor para escalonar (stagger) los elementos de texto
const containerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// NUEVO: Animación para las fotos del GRID (Entrada sutil hacia arriba)
const photoCardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};


export default function Gallery({ fotos }: GalleryProps) {
  const [filter, setFilter] = useState<string>('todos');
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  // NUEVO: Índice actual para la navegación
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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


  // --- LÓGICA DE NAVEGACIÓN (Next/Prev) ---

  // Función para abrir el modal y establecer el índice inicial
  const handleOpenModal = useCallback((foto: Foto) => {
    // Encontramos el índice de la foto clickada dentro de la lista filtrada actual
    const index = filteredFotos.findIndex(f => f._id === foto._id);
    setCurrentIndex(index);
    setSelectedFoto(foto);
    setIsImageLoaded(false);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, [filteredFotos]);

  // Ir a la siguiente foto (con loop)
  const goToNext = useCallback((e?: Event) => {
    e?.stopPropagation();
    if (currentIndex === -1 || filteredFotos.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % filteredFotos.length;
    setCurrentIndex(nextIndex);
    setSelectedFoto(filteredFotos[nextIndex]);
    setIsImageLoaded(false); // Resetear carga para el spinner
  }, [currentIndex, filteredFotos]);

  // Ir a la foto anterior (con loop)
  const goToPrevious = useCallback((e?: Event) => {
    e?.stopPropagation();
    if (currentIndex === -1 || filteredFotos.length === 0) return;

    // Lógica para el loop hacia atrás: si es 0, vamos al último
    const prevIndex = currentIndex === 0 ? filteredFotos.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setSelectedFoto(filteredFotos[prevIndex]);
    setIsImageLoaded(false);
  }, [currentIndex, filteredFotos]);


  // --- MANEJADORES DE CIERRE Y TECLADO ---

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
    // Reseteamos estados después de la animación de cierre
    setTimeout(() => {
      setSelectedFoto(null);
      setCurrentIndex(-1);
    }, 300);
  }, []);

  const toggleContact = useCallback(() => {
    setIsContactOpen(prev => {
      const newState = !prev;
      document.body.style.overflow = newState ? 'hidden' : 'unset';
      return newState;
    });
  }, []);

  // Manejo de Teclado (Escape y Flechas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) {
        switch (e.key) {
          case 'Escape': handleCloseModal(); break;
          case 'ArrowRight': goToNext(); break;
          case 'ArrowLeft': goToPrevious(); break;
        }
      } else if (isContactOpen && e.key === 'Escape') {
          setIsContactOpen(false);
          document.body.style.overflow = 'unset';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isContactOpen, handleCloseModal, goToNext, goToPrevious]);

  // Cerrar menú filtro al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => { if (isMenuOpen) setIsMenuOpen(false); };
    if (isMenuOpen) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => e.preventDefault(), []);

  return (
    <LayoutGroup>
      <section className="bg-[#0a0a0a] min-h-screen pt-20 pb-10 px-4 sm:px-8 select-none flex flex-col relative overflow-x-hidden">
        
        {/* --- ENCABEZADO --- */}
        <header className="relative text-center mb-12 space-y-4 z-10">
          <div className="absolute top-0 right-0 hidden md:block z-50">
            <button 
              onClick={toggleContact}
              className="group flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-gray-400 hover:text-white uppercase transition-colors cursor-pointer pointer-events-auto"
            >
              <span>Contacto</span>
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${isContactOpen ? 'bg-white' : 'bg-transparent border border-gray-600 group-hover:border-white'}`}></span>
            </button>
          </div>

          {/* Animación sutil de entrada para el título */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-white tracking-widest uppercase opacity-90 relative z-0">
              Marian <span className="text-gray-600 font-light">&</span> Fotografía
            </h1>
            <p className="text-gray-500 text-xs tracking-[0.3em] uppercase relative z-0 mt-4">
              Portfolio Selecto
            </p>
          </motion.div>
          
          <div className="md:hidden pt-4 relative z-50">
             <button 
              onClick={toggleContact}
              className="text-xs font-medium tracking-[0.2em] text-gray-400 border border-gray-800 px-4 py-2 rounded-full uppercase cursor-pointer hover:bg-neutral-900 transition-colors"
            >
              Contacto
            </button>
          </div>
        </header>

        {/* --- FILTRO --- */}
        <motion.div 
          className="relative flex justify-center mb-16 z-40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
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
                         focus:outline-none focus:ring-2 focus:ring-neutral-600 cursor-pointer"
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
                             rounded-xl shadow-2xl overflow-hidden z-50"
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
                          transition-colors duration-200 cursor-pointer
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
        </motion.div>

        {/* --- GRID FOTOS (Con nuevas animaciones) --- */}
        <div className="flex-grow z-0">
          {filteredFotos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No hay imágenes en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Usamos popLayout para que al filtrar las fotos se reordenen suavemente */}
              <AnimatePresence mode="popLayout">
                {filteredFotos.map((foto, index) => (
                  <motion.article
                    key={foto._id}
                    layoutId={`card-${foto._id}`} // Identificador para la transición mágica al modal
                    // Aplicamos las nuevas variantes de animación PRO
                    variants={photoCardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    // Añadimos un delay basado en el índice para el efecto "cascada"
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleOpenModal(foto)}
                    className="relative group cursor-pointer"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 border-4 border-white shadow-sm hover:shadow-white/20 transition-shadow duration-300">
                      {foto.imagen && (
                        <Image 
                          src={urlFor(foto.imagen).width(800).height(800).fit('crop').url()}
                          alt={foto.titulo || "Fotografía de Marian"}
                          width={800}
                          height={800}
                          onContextMenu={handleContextMenu}
                          draggable={false} 
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
        <footer className="mt-20 pt-8 border-t border-neutral-900 text-center space-y-2 z-10">
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
            className="inline-block text-neutral-500 text-[9px] tracking-[0.1em] hover:text-neutral-300 transition-colors pt-2 cursor-pointer"
          >
            design by Delysz
          </a>
        </footer>

        {/* --- MODAL FOTO (LIGHTBOX) CON NAVEGACIÓN --- */}
        <AnimatePresence>
          {isModalOpen && selectedFoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out"
            >
              {/* --- BOTÓN ANTERIOR (<) --- */}
              {filteredFotos.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer hidden md:block"
                  aria-label="Imagen anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}

              {/* --- BOTÓN SIGUIENTE (>) --- */}
              {filteredFotos.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer hidden md:block"
                  aria-label="Imagen siguiente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}

              {/* Contenedor de la imagen principal */}
              <motion.div
                // Usamos el ID para que Framer Motion sepa que esta es la misma foto que la del grid y haga la transición
                layoutId={`card-${selectedFoto._id}`}
                className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic en la foto
              >
                {selectedFoto.imagen && (
                  <>
                    {!isImageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center z-0">
                        <div className="w-10 h-10 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                    {/* Usamos 'key' aquí para forzar a React a que renderice una nueva imagen cuando cambiamos de ID */}
                    <Image 
                      key={selectedFoto._id}
                      src={urlFor(selectedFoto.imagen).width(1920).quality(90).url()}
                      alt={selectedFoto.titulo}
                      width={1920}
                      height={1080}
                      quality={90}
                      priority
                      onContextMenu={handleContextMenu}
                      draggable={false}
                      onLoadingComplete={() => setIsImageLoaded(true)}
                      className={`w-full h-full object-contain max-h-[90vh] mx-auto z-10 transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </>
                )}
                {isImageLoaded && (
                    <button 
                      onClick={handleCloseModal}
                      className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PANEL DESLIZANTE DE CONTACTO (DRAWER) --- */}
        <AnimatePresence>
          {isContactOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={toggleContact} className="fixed inset-0 bg-black/60 z-[70]"
              />
              <motion.aside
                variants={drawerVariants} initial="hidden" animate="visible" exit="exit"
                className="fixed top-0 right-0 z-[80] h-full w-full md:w-[450px] bg-[#0f0f0f] border-l border-neutral-800 shadow-2xl p-10 flex flex-col justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={toggleContact}
                  className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <motion.div 
                  variants={containerVariants} initial="hidden" animate="visible"
                  className="flex flex-col h-full mt-10"
                >
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-serif text-white tracking-widest uppercase mb-2">Marian</h2>
                    <p className="text-neutral-500 text-xs tracking-[0.3em] uppercase mb-10">Visual Artist & Photographer</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="mb-12">
                    <p className="text-gray-300 font-light leading-relaxed text-sm md:text-base border-l-2 border-neutral-700 pl-4">
                      Exploradora de la luz y el entorno natural. Mi obra transita entre la inmensidad del paisaje abierto y la delicadeza del mundo macro.
                    </p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-4">
                    {/* Links de contacto (resumidos para no alargar) */}
                     <a href="mailto:hola@marianfoto.com" className="group flex items-center justify-between p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 transition-all cursor-pointer">
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white tracking-wide">hola@marianfoto.com</span>
                        <span className="text-neutral-600 group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                     <a href="https://instagram.com" target="_blank" className="group flex items-center justify-between p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 transition-all cursor-pointer">
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white tracking-wide">@marian_fotografia</span>
                        <span className="text-neutral-600 group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  </motion.div>
                  <div className="flex-grow"></div>
                  <motion.div variants={itemVariants} className="pt-8 border-t border-neutral-800">
                    <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] mb-1">Base</p>
                    <p className="text-white text-sm font-light">Zaragoza, España</p>
                  </motion.div>
                </motion.div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

      </section>
    </LayoutGroup>
  );
}