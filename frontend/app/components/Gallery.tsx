'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; 
import { motion, AnimatePresence, LayoutGroup, Variants } from 'framer-motion';

// --- INTERFACES STRICT TYPING ---
interface SanityPalette {
  dominant?: {
    background?: string;
  };
}

interface SanityMetadata {
  palette?: SanityPalette;
}

interface SanityAsset {
  url: string;
  metadata?: SanityMetadata;
}

interface SanityImage {
  asset: SanityAsset;
}

export interface Foto {
  _id: string;
  titulo: string;
  // CAMBIO 1: Ahora esperamos un array (lista) de textos
  categories: string[]; 
  imagen: SanityImage;
  width?: number;
  height?: number;
}

interface GalleryProps {
  fotos: Foto[];
}

// --- UTILIDAD: HEX a HUE (Color a Número 0-360) ---
function getHue(hex: string): number {
  if (!hex || typeof hex !== 'string') return 0;
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt("0x" + cleanHex[0] + cleanHex[0]);
    g = parseInt("0x" + cleanHex[1] + cleanHex[1]);
    b = parseInt("0x" + cleanHex[2] + cleanHex[2]);
  } else if (cleanHex.length === 6) {
    r = parseInt("0x" + cleanHex.substring(0, 2));
    g = parseInt("0x" + cleanHex.substring(2, 4));
    b = parseInt("0x" + cleanHex.substring(4, 6));
  }
  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
  let h = 0;
  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}

// --- VARIANTES DE ANIMACIÓN ---
const drawerVariants: Variants = {
  hidden: { x: '100%', opacity: 0.5 },
  visible: { x: '0%', opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit: { x: '100%', opacity: 0, transition: { ease: 'easeInOut', duration: 0.3 } }
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};
const containerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const photoCardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function Gallery({ fotos }: GalleryProps) {
  const [filter, setFilter] = useState<string>('todos');
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // CAMBIO 2: Lógica para sacar categorías únicas de listas (Arrays)
  const categories = useMemo(() => {
    // flatMap une todas las listas de todas las fotos en una sola gran lista
    const allTags = fotos.flatMap(f => f.categories || []);
    // Set elimina los duplicados
    return ['todos', ...Array.from(new Set(allTags))];
  }, [fotos]);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredFotos = useMemo(() => {
    // CAMBIO 3: Usamos .includes() porque ahora es una lista
    const filtered = filter === 'todos' 
      ? fotos 
      : fotos.filter((f) => f.categories?.includes(filter));
    
    return [...filtered].sort((a, b) => {
      const colorA = a.imagen?.asset?.metadata?.palette?.dominant?.background || '#000000';
      const colorB = b.imagen?.asset?.metadata?.palette?.dominant?.background || '#000000';
      return getHue(colorA) - getHue(colorB);
    });
  }, [fotos, filter]);

  const handleOpenModal = useCallback((foto: Foto) => {
    const index = filteredFotos.findIndex(f => f._id === foto._id);
    setCurrentIndex(index);
    setSelectedFoto(foto);
    setIsImageLoaded(false);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, [filteredFotos]);

  const goToNext = useCallback((e?: React.MouseEvent | Event) => {
    e?.stopPropagation();
    if (currentIndex === -1 || filteredFotos.length === 0) return;
    const nextIndex = (currentIndex + 1) % filteredFotos.length;
    setCurrentIndex(nextIndex);
    setSelectedFoto(filteredFotos[nextIndex]);
    setIsImageLoaded(false);
  }, [currentIndex, filteredFotos]);

  const goToPrevious = useCallback((e?: React.MouseEvent | Event) => {
    e?.stopPropagation();
    if (currentIndex === -1 || filteredFotos.length === 0) return;
    const prevIndex = currentIndex === 0 ? filteredFotos.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setSelectedFoto(filteredFotos[prevIndex]);
    setIsImageLoaded(false);
  }, [currentIndex, filteredFotos]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => { setSelectedFoto(null); setCurrentIndex(-1); }, 300);
  }, []);

  const toggleContact = useCallback(() => {
    setIsContactOpen(prev => {
      const newState = !prev;
      document.body.style.overflow = newState ? 'hidden' : 'unset';
      return newState;
    });
  }, []);

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
  
// --- EASTER EGG ---
  useEffect(() => {
    const hasRun = sessionStorage.getItem('easter_egg_shown');
    if (!hasRun) {
      console.log(
        `%c
        📷 MARIAN FOTOGRAFÍA
        ----------------------------------------
        Explorando la naturaleza y el código.
        
        🎨 Arte: Marian
        💻 Dev:  Delysz (https://github.com/delysz)
        
        "La fotografía ayuda a las personas a ver."
        ----------------------------------------
        `,
        'font-family: monospace; font-size: 12px; color: #d4d4d4; background: #171717; padding: 15px; border-radius: 5px; border-left: 4px solid #fff;'
      );
      sessionStorage.setItem('easter_egg_shown', 'true');
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => e.preventDefault(), []);

  return (
    <LayoutGroup>
      <section className="bg-[#0a0a0a] min-h-screen pt-20 pb-10 px-4 sm:px-8 select-none flex flex-col relative overflow-x-hidden">
        
        {/* HEADER */}
        <header className="relative text-center mb-16 space-y-4 z-10">
          <div className="absolute top-0 right-0 hidden md:block z-50">
            <button onClick={toggleContact} className="group flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-gray-400 hover:text-white uppercase transition-colors cursor-pointer pointer-events-auto">
              <span>Contacto</span>
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${isContactOpen ? 'bg-white' : 'bg-transparent border border-gray-600 group-hover:border-white'}`}></span>
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-white tracking-widest uppercase opacity-90 relative z-0">
              Marian <span className="text-gray-600 font-light">&</span> Fotografía
            </h1>
            <p className="text-gray-500 text-xs tracking-[0.3em] uppercase relative z-0 mt-4">Portfolio Selecto</p>
          </motion.div>
          <div className="md:hidden pt-4 relative z-50">
             <button onClick={toggleContact} className="text-xs font-medium tracking-[0.2em] text-gray-400 border border-gray-800 px-4 py-2 rounded-full uppercase cursor-pointer hover:bg-neutral-900 transition-colors">Contacto</button>
          </div>
        </header>

        {/* FILTRO DERECHA */}
        <div className="w-full max-w-7xl mx-auto mb-8 px-1 z-40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8">
                {categories.map((cat) => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer relative ${filter === cat ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                        {cat}
                        {filter === cat && (<motion.div layoutId="activeFilter" className="absolute -bottom-2 left-0 right-0 h-[1px] bg-white" transition={{ type: "spring", stiffness: 300, damping: 30 }} />)}
                    </button>
                ))}
            </motion.div>
        </div>

        {/* GRID */}
        <div className="flex-grow z-0">
          {filteredFotos.length === 0 ? (
            <div className="text-center py-20"><p className="text-gray-500">No hay imágenes en esta categoría</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredFotos.map((foto, index) => (
                  <motion.article
                    key={foto._id}
                    layoutId={`card-${foto._id}`}
                    variants={photoCardVariants}
                    initial="hidden" animate="visible" exit="exit"
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleOpenModal(foto)}
                    className="relative group cursor-pointer"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 border-4 border-white shadow-sm hover:shadow-white/20 transition-shadow duration-300">
                      {foto.imagen && (
                        <Image 
                          // ¡OJO! 'as any' aquí es clave para que TS no se pelee con Sanity
                          src={urlFor(foto.imagen as any).width(800).height(800).fit('crop').url()}
                          alt={foto.titulo || "Fotografía de Marian"}
                          width={800} height={800}
                          onContextMenu={handleContextMenu} draggable={false} 
                          className="block w-full h-full object-cover transition-all duration-500 grayscale-[20%] contrast-[0.95] group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-[1.05]"
                        />
                      )}
                      <motion.div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                        <div>
                          <h3 className="text-white font-serif text-sm tracking-wide relative top-2 group-hover:top-0 transition-all duration-300">{foto.titulo}</h3>
                          {/* CAMBIO 4: Mostrar las categorías unidas por un punto */}
                          <p className="text-gray-300 text-[10px] mt-1 uppercase tracking-wider relative top-2 group-hover:top-0 transition-all duration-300 delay-75">
                             {foto.categories && foto.categories.length > 0 ? foto.categories.join(' • ') : ''}
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

        {/* FOOTER */}
        <footer className="mt-20 pt-8 border-t border-neutral-900 text-center space-y-2 z-10">
          <p className="text-neutral-600 text-[10px] tracking-[0.2em] uppercase">&copy; {new Date().getFullYear()} Marian Fotografía. Todos los derechos reservados.</p>
          <p className="text-neutral-700 text-[9px]">Prohibida la reproducción total o parcial sin autorización escrita.</p>
          <a href="https://github.com/delysz" target="_blank" rel="noopener noreferrer" className="inline-block text-neutral-500 text-[9px] tracking-[0.1em] hover:text-neutral-300 transition-colors pt-2 cursor-pointer">design by Delysz</a>
        </footer>

        {/* MODAL */}
        <AnimatePresence>
          {isModalOpen && selectedFoto && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out">
              {filteredFotos.length > 1 && (<button onClick={(e) => { e.stopPropagation(); goToPrevious(e); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer hidden md:block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>)}
              {filteredFotos.length > 1 && (<button onClick={(e) => { e.stopPropagation(); goToNext(e); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer hidden md:block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>)}
              <motion.div layoutId={`card-${selectedFoto._id}`} className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {selectedFoto.imagen && (
                  <>
                    {!isImageLoaded && (<div className="absolute inset-0 flex items-center justify-center z-0"><div className="w-10 h-10 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div></div>)}
                    <Image 
                      key={selectedFoto._id} 
                      // Aquí también usamos 'as any' para el modal
                      src={urlFor(selectedFoto.imagen as any).width(1920).quality(90).url()} 
                      alt={selectedFoto.titulo} width={1920} height={1080} quality={90} priority onContextMenu={handleContextMenu} draggable={false} onLoadingComplete={() => setIsImageLoaded(true)} className={`w-full h-full object-contain max-h-[90vh] mx-auto z-10 transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </>
                )}
                {isImageLoaded && (<button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DRAWER CONTACTO */}
        <AnimatePresence>
          {isContactOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleContact} className="fixed inset-0 bg-black/60 z-[70]" />
              <motion.aside variants={drawerVariants} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 z-[80] h-full w-full md:w-[450px] bg-[#0f0f0f] border-l border-neutral-800 shadow-2xl p-10 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
                <button onClick={toggleContact} className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-800"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col h-full mt-10">
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-serif text-white tracking-widest uppercase mb-2">Marian</h2>
                    <p className="text-neutral-500 text-xs tracking-[0.3em] uppercase mb-10">Visual Artist & Photographer</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="mb-12"><p className="text-gray-300 font-light leading-relaxed text-sm md:text-base border-l-2 border-neutral-700 pl-4">Exploradora de la luz y el entorno natural. Mi obra transita entre la inmensidad del paisaje abierto y la delicadeza del mundo macro.</p></motion.div>
                  <motion.div variants={itemVariants} className="space-y-4">
                      <a href="mailto:hola@marianfoto.com" className="group flex items-center justify-between p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 transition-all cursor-pointer"><span className="text-sm font-medium text-gray-300 group-hover:text-white tracking-wide">hola@marianfoto.com</span><span className="text-neutral-600 group-hover:translate-x-1 transition-transform">→</span></a>
                      <a href="https://instagram.com" target="_blank" className="group flex items-center justify-between p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 transition-all cursor-pointer"><span className="text-sm font-medium text-gray-300 group-hover:text-white tracking-wide">@marian_fotografia</span><span className="text-neutral-600 group-hover:translate-x-1 transition-transform">→</span></a>
                  </motion.div>
                  <div className="flex-grow"></div>
                  <motion.div variants={itemVariants} className="pt-8 border-t border-neutral-800"><p className="text-xs text-neutral-500 uppercase tracking-[0.2em] mb-1">Base</p><p className="text-white text-sm font-light">Zaragoza, España</p></motion.div>
                </motion.div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </section>
    </LayoutGroup>
  );
}