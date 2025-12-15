'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; 
import { motion, AnimatePresence, LayoutGroup, Variants } from 'framer-motion';

// --- INTERFACES STRICT TYPING ---
interface SanityPalette {
  dominant?: { background?: string; };
}
interface SanityMetadata { palette?: SanityPalette; }
interface SanityAsset { url: string; metadata?: SanityMetadata; }
interface SanityImage { asset: SanityAsset; }

export interface Foto {
  _id: string;
  titulo: string;
  categories: string[]; 
  imagen: SanityImage;
  width?: number;
  height?: number;
}

interface GalleryProps {
  fotos: Foto[];
}

// --- UTILIDADES ---
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

// --- ICONOS SVG ---
const Icons = {
  Mail: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>),
  Instagram: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>),
  Facebook: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>),
  Flickr: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3"/></svg>)
};

// --- VARIANTES ---
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
  hidden: { opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 100, damping: 20 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function Gallery({ fotos }: GalleryProps) {
  const [filter, setFilter] = useState<string>('todos');
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Categorías y Filtrado
  const categories = useMemo(() => {
    const allTags = fotos.flatMap(f => f.categories || []);
    return ['todos', ...Array.from(new Set(allTags))];
  }, [fotos]);

  const filteredFotos = useMemo(() => {
    const filtered = filter === 'todos' ? fotos : fotos.filter((f) => f.categories?.includes(filter));
    return [...filtered].sort((a, b) => {
      const colorA = a.imagen?.asset?.metadata?.palette?.dominant?.background || '#000000';
      const colorB = b.imagen?.asset?.metadata?.palette?.dominant?.background || '#000000';
      return getHue(colorA) - getHue(colorB);
    });
  }, [fotos, filter]);

  // Handlers
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
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => e.preventDefault(), []);

  return (
    <LayoutGroup>
      <section className="bg-[#0a0a0a] min-h-screen pt-20 pb-10 px-4 sm:px-8 select-none flex flex-col relative overflow-x-hidden">
        
        {/* EFECTO "NOISE" (TEXTURA DE GRANO - MANTENIDO) */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        {/* HEADER */}
        <header className="relative text-center mb-20 space-y-4 z-10">
          <div className="absolute top-0 right-0 hidden md:block z-50">
            <button onClick={toggleContact} className="group flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-gray-400 hover:text-white uppercase transition-colors cursor-pointer pointer-events-auto">
              <span>Sobre mí</span>
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${isContactOpen ? 'bg-white' : 'bg-transparent border border-gray-600 group-hover:border-white'}`}></span>
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-4xl md:text-6xl font-serif text-white tracking-widest uppercase opacity-90 relative z-0">
              Marian <span className="text-gray-600 font-light italic">&</span> Fotografía
            </h1>
            <motion.div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto mt-6" initial={{ width: 0 }} animate={{ width: 100 }} transition={{ delay: 0.5, duration: 1 }} />
            <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase relative z-0 mt-6">Exploradora de la luz y el detalle</p>
          </motion.div>
          <div className="md:hidden pt-8 relative z-50">
             <button onClick={toggleContact} className="text-xs font-medium tracking-[0.2em] text-gray-400 border border-gray-800 px-6 py-3 rounded-full uppercase cursor-pointer hover:bg-neutral-900 transition-colors">Sobre mí</button>
          </div>
        </header>

        {/* FILTRO */}
        <div className="w-full max-w-7xl mx-auto mb-12 px-1 z-40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8">
                {categories.map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => setFilter(cat)} 
                      className={`text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer relative ${filter === cat ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
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
                    transition={{ delay: index * 0.08 }} // Retraso en cascada
                    onClick={() => handleOpenModal(foto)}
                    className="relative group cursor-pointer"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 border-0 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      {foto.imagen && (
                        <Image 
                          src={urlFor(foto.imagen as any).width(800).height(800).fit('crop').url()}
                          alt={foto.titulo || "Fotografía de Marian"}
                          width={800} height={800}
                          onContextMenu={handleContextMenu} draggable={false} 
                          className="block w-full h-full object-cover transition-transform duration-700 ease-in-out grayscale-[100%] contrast-[1.1] group-hover:grayscale-0 group-hover:scale-110"
                        />
                      )}
                      {/* OVERLAY SUTIL */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                      
                      <motion.div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 pointer-events-none">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-white font-serif text-lg tracking-wide">{foto.titulo}</h3>
                          <p className="text-gray-300 text-[9px] mt-1 uppercase tracking-widest opacity-80">
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
        <footer className="mt-24 pt-10 border-t border-neutral-900 text-center space-y-4 z-10 pb-10">
          <p className="text-neutral-600 text-[10px] tracking-[0.2em] uppercase">&copy; {new Date().getFullYear()} Marian Fotografía.</p>
          <a href="https://github.com/delysz" target="_blank" rel="noopener noreferrer" className="inline-block text-neutral-800 hover:text-neutral-600 transition-colors text-[9px] tracking-widest cursor-pointer">DESIGN BY DELYSZ</a>
        </footer>

        {/* MODAL */}
        <AnimatePresence>
          {isModalOpen && selectedFoto && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/98 backdrop-blur-md p-4 cursor-zoom-out">
              {filteredFotos.length > 1 && (<button onClick={(e) => { e.stopPropagation(); goToPrevious(e); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 text-white/30 hover:text-white rounded-full transition-all cursor-pointer hidden md:block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>)}
              {filteredFotos.length > 1 && (<button onClick={(e) => { e.stopPropagation(); goToNext(e); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 text-white/30 hover:text-white rounded-full transition-all cursor-pointer hidden md:block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>)}
              
              <motion.div layoutId={`card-${selectedFoto._id}`} className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {selectedFoto.imagen && (
                  <>
                    {!isImageLoaded && (<div className="absolute inset-0 flex items-center justify-center z-0"><div className="w-10 h-10 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div></div>)}
                    <Image 
                      key={selectedFoto._id} 
                      src={urlFor(selectedFoto.imagen as any).width(1920).quality(95).url()} 
                      alt={selectedFoto.titulo} width={1920} height={1080} quality={95} priority onContextMenu={handleContextMenu} draggable={false} onLoadingComplete={() => setIsImageLoaded(true)} className={`w-full h-full object-contain max-h-[90vh] mx-auto z-10 transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </>
                )}
                {isImageLoaded && (<button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-30 p-2 rounded-full cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DRAWER PERFIL / CONTACTO */}
        <AnimatePresence>
          {isContactOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleContact} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] cursor-default" />
              
              <motion.aside variants={drawerVariants} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 z-[80] h-full w-full md:w-[500px] bg-[#0c0c0c] border-l border-neutral-900 shadow-2xl overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={toggleContact} className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-800 z-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col min-h-full p-12 pt-24">
                  <motion.div variants={itemVariants}>
                    
                    <div className="mb-10 relative w-28 h-28 rounded-full overflow-hidden border border-neutral-800 group shadow-lg">
                         <Image 
                            src="/perfil.jpg" 
                            alt="Marian" 
                            fill 
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; (e.target as HTMLElement).parentElement!.style.display = 'none'; }}
                         />
                    </div>

                    <h2 className="text-4xl font-serif text-white tracking-widest uppercase mb-3">Marian</h2>
                    <p className="text-neutral-500 text-xs tracking-[0.4em] uppercase mb-12 border-b border-neutral-900 pb-8">Fotografía y Naturaleza</p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="mb-16">
                    <p className="text-gray-400 font-light leading-loose text-sm italic">
                      "Exploradora de la luz y el entorno natural. Mi obra transita entre la inmensidad del paisaje abierto y la delicadeza del mundo macro."
                    </p>
                  </motion.div>
                  
                  {/* REDES */}
                  <motion.div variants={itemVariants} className="space-y-6">
                      <a href="mailto:mariaantoniaazucena@gmail.com" className="group flex items-center justify-between p-4 rounded border border-transparent hover:border-neutral-800 hover:bg-neutral-900/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <span className="text-neutral-600 group-hover:text-white transition-colors"><Icons.Mail /></span>
                            <span className="text-sm font-light text-gray-400 group-hover:text-white tracking-wide">Contactar por Email</span>
                        </div>
                        <span className="text-neutral-700 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                      </a>
                      
                      <a href="https://www.instagram.com/marian_y_sus_mundos?igsh=MXg0YmM3dDhjNnM1cQ==" target="_blank" className="group flex items-center justify-between p-4 rounded border border-transparent hover:border-neutral-800 hover:bg-neutral-900/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <span className="text-neutral-600 group-hover:text-white transition-colors"><Icons.Instagram /></span>
                            <span className="text-sm font-light text-gray-400 group-hover:text-white tracking-wide">Instagram</span>
                        </div>
                        <span className="text-neutral-700 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                      </a>

                      <a href="https://www.facebook.com/profile.php?id=100011486713808" target="_blank" className="group flex items-center justify-between p-4 rounded border border-transparent hover:border-neutral-800 hover:bg-neutral-900/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <span className="text-neutral-600 group-hover:text-white transition-colors"><Icons.Facebook /></span>
                            <span className="text-sm font-light text-gray-400 group-hover:text-white tracking-wide">Facebook</span>
                        </div>
                        <span className="text-neutral-700 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                      </a>

                      <a href="https://www.flickr.com/" target="_blank" className="group flex items-center justify-between p-4 rounded border border-transparent hover:border-neutral-800 hover:bg-neutral-900/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <span className="text-neutral-600 group-hover:text-white transition-colors"><Icons.Flickr /></span>
                            <span className="text-sm font-light text-gray-400 group-hover:text-white tracking-wide">Flickr</span>
                        </div>
                        <span className="text-neutral-700 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                      </a>
                  </motion.div>
                  
                  <div className="flex-grow"></div>
                  <motion.div variants={itemVariants} className="pt-12 border-t border-neutral-900">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Base</p>
                    <p className="text-white text-sm font-light tracking-wide">Zaragoza, España</p>
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