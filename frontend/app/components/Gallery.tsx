'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/client'; 
import { motion, AnimatePresence, LayoutGroup, Variants, useInView, useScroll, useTransform, useSpring } from 'framer-motion';

// --- INTERFACES ---
interface SanityPalette { dominant?: { background?: string; }; }
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

// --- ICONOS ---
const Icons = {
  Mail: ({ size = 18, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>),
  Instagram: ({ size = 18, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>),
  Facebook: ({ size = 18, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>),
  Flickr: ({ size = 18, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3"/></svg>),
  ChevronLeft: ({ size = 24, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>),
  ChevronRight: ({ size = 24, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>),
  X: ({ size = 24, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18M6 6l12 12"/></svg>),
  Heart: ({ size = 16, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  ImageIcon: ({ size = 16, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>),
  Aperture: ({ size = 16, className = "" }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="14.31" y1="8" x2="20.05" y2="17.94"/><line x1="9.69" y1="8" x2="21.17" y2="8"/><line x1="7.38" y1="12" x2="13.12" y2="2.06"/><line x1="9.69" y1="16" x2="3.95" y2="6.06"/><line x1="14.31" y1="16" x2="2.83" y2="16"/><line x1="16.62" y1="12" x2="10.88" y2="21.94"/></svg>)
};

// --- VARIANTES DE ANIMACIÓN ---
const drawerVariants: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: '0%', opacity: 1, 
    transition: { type: 'spring', damping: 25, stiffness: 300, when: "beforeChildren", staggerChildren: 0.1 } 
  },
  exit: { 
    x: '100%', opacity: 0, 
    transition: { ease: 'easeInOut', duration: 0.4, when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 } 
  }
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, opacity: 1, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
  exit: { y: 30, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const photoCardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9, filter: "blur(10px)" },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.5 } 
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.25 } },
  hover: { y: -10, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

// ANIMACIÓN DEL MODAL (POP-UP LIMPIO)
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// --- PRELOADER (CINE) ---
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 2.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="overflow-hidden text-center px-4">
        <motion.h1 
          className="text-5xl md:text-8xl font-serif text-white tracking-widest uppercase"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        >
          Marian
        </motion.h1>
        <motion.div 
          className="h-[1px] bg-white mt-6 mx-auto"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
          style={{ maxWidth: '300px' }}
        />
      </div>
    </motion.div>
  );
};

// --- PARTÍCULAS ---
const FloatingParticles = () => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/5"
          style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
          animate={{ y: [0, -30, 0], x: [0, Math.random() * 20 - 10, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

export default function Gallery({ fotos }: GalleryProps) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
   
  // Scroll animations
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  const headerSpring = useSpring(headerScale, { stiffness: 100, damping: 30 });

  // InView
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, amount: 0.1 });

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
    setTimeout(() => {
      document.body.style.overflow = 'unset';
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); };
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
      {/* PRELOADER */}
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      <section className="bg-[#0a0a0a] min-h-screen pt-20 pb-10 px-4 sm:px-8 select-none flex flex-col relative overflow-x-hidden">
        
        <FloatingParticles />
        
        {/* NOISE BACKGROUND */}
        <motion.div 
          className="fixed inset-0 opacity-[0.02] pointer-events-none z-0 mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          animate={{ opacity: [0.02, 0.03, 0.02] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* HEADER */}
        <motion.header 
          className="fixed top-0 left-0 right-0 text-center pt-8 pb-4 px-4 sm:px-8 z-50 backdrop-blur-md"
          style={{ opacity: headerOpacity, scale: headerSpring, background: isScrolled ? 'rgba(10, 10, 10, 0.8)' : 'transparent', borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}
          animate={{ paddingTop: isScrolled ? '1.5rem' : '2rem', paddingBottom: isScrolled ? '1rem' : '1.5rem' }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <motion.div className="text-left" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 3 }}>
              <h1 className="text-xl md:text-2xl font-serif text-white tracking-widest uppercase opacity-90">Marian <span className="text-gray-600 font-light italic">&</span></h1>
              <p className="text-gray-500 text-[8px] tracking-[0.3em] uppercase mt-1">Fotografía</p>
            </motion.div>

            <motion.button 
              onClick={toggleContact} 
              className="group flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-gray-400 hover:text-white uppercase transition-all cursor-pointer relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              <span className="hidden md:block">Sobre mí</span>
              <motion.span 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${isContactOpen ? 'bg-white text-black border-white' : 'bg-transparent border-gray-600 group-hover:border-white'}`}
                animate={{ rotate: isContactOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icons.Aperture size={16} />
              </motion.span>
            </motion.button>
          </div>
        </motion.header>

        {/* HERO */}
        <div className="relative mt-32 mb-20 text-center z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 3 }}>
            <div className="relative inline-block">
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-tight uppercase opacity-90"
                animate={{ letterSpacing: ['0.1em', '0.15em', '0.1em'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Explorando la luz
              </motion.h1>
              <motion.div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white to-transparent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 3.8, duration: 1.5, ease: "easeOut" }} />
            </div>
            
            <motion.p className="text-gray-500 text-sm tracking-[0.3em] uppercase mt-12 max-w-2xl mx-auto leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.2, duration: 1 }}>
              Capturando momentos únicos donde la naturaleza y la emoción se encuentran
            </motion.p>
          </motion.div>
        </div>

        {/* FILTRO */}
        <motion.div 
          className="w-full max-w-7xl mx-auto mb-16 px-1 z-40 sticky top-32 bg-[#0a0a0a]/90 backdrop-blur-sm py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5 }}
        >
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((cat, index) => (
              <motion.button 
                key={cat} 
                onClick={() => setFilter(cat)} 
                className={`text-xs px-5 py-3 rounded-full font-medium tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer relative overflow-hidden group ${filter === cat ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600'}`}
                whileHover={{ scale: 1.05, y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.5 + (index * 0.1) }}
              >
                {filter === cat && (<motion.div layoutId="activeFilter" className="absolute inset-0 bg-white" transition={{ type: "spring", stiffness: 300, damping: 30 }} />)}
                <span className="relative z-10">{cat}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* GRID */}
        <div ref={gridRef} className="flex-grow z-0">
          {filteredFotos.length === 0 ? (
            <motion.div className="text-center py-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-16 h-16 text-gray-800 mx-auto mb-6"><Icons.ImageIcon size={64} /></div>
              <p className="text-gray-600 tracking-widest uppercase text-sm">No hay imágenes en esta categoría</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredFotos.map((foto, index) => {
                  return (
                    <motion.article
                      key={foto._id}
                      // 👇 IMPORTANTE: Quitamos layoutId de aquí para evitar el bug de "hueco blanco"
                      variants={photoCardVariants}
                      initial="hidden" animate={gridInView ? "visible" : "hidden"} exit="exit" whileHover="hover"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      transition={{ delay: index * 0.05, type: "spring" }}
                      onClick={() => handleOpenModal(foto)}
                      className="relative cursor-pointer"
                    >
                      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-900 shadow-2xl shadow-black/50 group-hover:shadow-white/10 transition-all duration-700">
                        <motion.div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100" animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                        {foto.imagen && (
                          <>
                            <Image 
                              src={urlFor(foto.imagen as any).width(800).quality(80).format('webp').url()}
                              alt={foto.titulo || "Fotografía de Marian"}
                              width={800} height={800}
                              onContextMenu={handleContextMenu} draggable={false}
                              // 👇 "sizes" optimiza la carga en móviles y evita saltos
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="block w-full h-full object-cover transition-all duration-1000 ease-out grayscale-[50%] contrast-[1.1] group-hover:grayscale-0 group-hover:scale-110 group-hover:contrast-[1.2]"
                              onLoadingComplete={() => setIsImageLoaded(true)}
                              priority={index < 4}
                            />
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        <motion.div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-full group-hover:translate-y-0 transition-all duration-700 ease-out" initial={false}>
                          <div className="space-y-3">
                            <h3 className="text-white font-serif text-2xl tracking-wide">{foto.titulo}</h3>
                            <div className="flex flex-wrap gap-2">
                              {foto.categories?.map((cat, i) => (
                                <motion.span key={cat} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-[10px] tracking-widest uppercase border border-white/10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>{cat}</motion.span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <motion.footer className="mt-32 pt-12 border-t border-neutral-900 text-center space-y-6 z-10 pb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4">
            <div className="text-left mb-6 md:mb-0">
              <h4 className="text-white font-serif text-lg tracking-widest mb-2">Marian Fotografía</h4>
              <p className="text-neutral-600 text-xs tracking-[0.2em] uppercase">Zaragoza, España</p>
            </div>
            <div className="flex items-center gap-6">
              {[
                  { name: 'Instagram', url: 'https://www.instagram.com/marian_y_sus_mundos?igsh=MXg0YmM3dDhjNnM1cQ==' },
                  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100011486713808' },
                  { name: 'Email', url: 'mailto:mariaantoniaazucena@gmail.com' }
              ].map((social, i) => (
                <motion.a key={social.name} href={social.url} target="_blank" className="text-neutral-600 hover:text-white transition-colors cursor-pointer" whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  {social.name === 'Instagram' && <Icons.Instagram size={20} />}
                  {social.name === 'Facebook' && <Icons.Facebook size={20} />}
                  {social.name === 'Email' && <Icons.Mail size={20} />}
                </motion.a>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-900">
            <p className="text-neutral-600 text-[10px] tracking-[0.2em] uppercase mb-2">&copy; {new Date().getFullYear()} Marian Fotografía. Todos los derechos reservados.</p>
            <a href="https://github.com/delysz" target="_blank" rel="noopener noreferrer" className="inline-block text-neutral-800 hover:text-neutral-600 transition-colors text-[9px] tracking-widest cursor-pointer group">
              <span className="group-hover:underline">DESIGN BY DELYSZ</span>
              <motion.span className="inline-block ml-2" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>↗</motion.span>
            </a>
          </div>
        </motion.footer>

        {/* MODAL (LIMPIO Y RÁPIDO) */}
        <AnimatePresence>
          {isModalOpen && selectedFoto && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 cursor-zoom-out">
              
              {/* Botones de navegación */}
              {filteredFotos.length > 1 && (
                <>
                  <motion.button onClick={(e) => { e.stopPropagation(); goToPrevious(e); }} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-4 text-white/50 hover:text-white rounded-full transition-all cursor-pointer hidden md:flex items-center justify-center bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/30" whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.9 }}>
                    <Icons.ChevronLeft size={32} />
                  </motion.button>
                  <motion.button onClick={(e) => { e.stopPropagation(); goToNext(e); }} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-4 text-white/50 hover:text-white rounded-full transition-all cursor-pointer hidden md:flex items-center justify-center bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/30" whileHover={{ scale: 1.1, x: 5 }} whileTap={{ scale: 0.9 }}>
                    <Icons.ChevronRight size={32} />
                  </motion.button>
                </>
              )}
              
              {/* Contenido del Modal (Animación Pop-up) */}
              <motion.div 
                variants={modalVariants} 
                initial="hidden" 
                animate="visible" 
                exit="exit" 
                className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center justify-center overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {selectedFoto.imagen && (
                    <>
                      {/* Spinner de carga */}
                      {!isImageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                          <div className="relative"><div className="w-16 h-16 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div></div>
                        </div>
                      )}
                      
                      {/* Imagen Grande */}
                      <div className="relative z-10">
                        <Image 
                          key={selectedFoto._id} 
                          src={urlFor(selectedFoto.imagen as any).width(1920).quality(90).format('webp').url()} 
                          alt={selectedFoto.titulo} 
                          width={1920} height={1080} quality={90} priority 
                          onContextMenu={handleContextMenu} draggable={false} 
                          onLoadingComplete={() => setIsImageLoaded(true)} 
                          className={`w-full h-auto max-h-[85vh] object-contain rounded-sm shadow-2xl transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                        />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Info de la foto */}
                {isImageLoaded && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-center max-w-2xl">
                    <h3 className="text-white text-2xl font-serif mb-2">{selectedFoto.titulo}</h3>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        {selectedFoto.categories?.map((cat) => (<span key={cat} className="px-3 py-1 bg-white/5 rounded-full text-xs tracking-widest">{cat}</span>))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Botón Cerrar */}
              <motion.button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-30 p-3 rounded-full cursor-pointer bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/30" whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <Icons.X size={24} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DRAWER PERFIL (SCROLL ARREGLADO) */}
        <AnimatePresence>
          {isContactOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleContact} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] cursor-default" />
              <motion.aside variants={drawerVariants} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 z-[80] h-full w-full md:w-[600px] bg-gradient-to-b from-[#0c0c0c] to-black border-l border-neutral-900 shadow-2xl overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
                
                <motion.button onClick={toggleContact} className="absolute top-6 right-6 p-3 text-neutral-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-800/50 backdrop-blur-sm z-50 border border-white/10" whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Icons.X size={20} />
                </motion.button>
                
                <div className="flex flex-col min-h-full p-8 md:p-12 pt-24">
                  <motion.div variants={itemVariants} className="mb-12">
                    <div className="relative mb-10">
                      <div className="absolute -inset-4 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-xl opacity-50" />
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 group shadow-2xl">
                        <Image src="/perfil.jpg" alt="Marian" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; (e.target as HTMLElement).parentElement!.style.display = 'none'; }} />
                      </div>
                    </div>
                    <motion.h2 className="text-5xl font-serif text-white tracking-widest uppercase mb-4" animate={{ textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.3)", "0 0 0px rgba(255,255,255,0)"] }} transition={{ duration: 3, repeat: Infinity }}>Marian</motion.h2>
                    <p className="text-neutral-500 text-sm tracking-[0.3em] uppercase mb-6 border-b border-white/10 pb-8">Fotógrafa & Artista Visual</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="mb-16">
                    <p className="text-gray-400 font-light leading-relaxed text-lg italic mb-8">"Exploradora de la luz y el entorno natural. Mi obra transita entre la inmensidad del paisaje abierto y la delicadeza del mundo macro, buscando siempre ese instante donde la emoción y la naturaleza convergen."</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-white text-sm tracking-widest uppercase">Especialidades</h4>
                        <ul className="text-gray-400 text-sm space-y-1">
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white/50 rounded-full" /> Fotografía de paisaje</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white/50 rounded-full" /> Fotografía macro</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white/50 rounded-full" /> Retrato natural</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        {/* EQUIPO REAL (CANON 700D) */}
                        <h4 className="text-white text-sm tracking-widest uppercase">Equipo</h4>
                        <ul className="text-gray-400 text-sm space-y-1">
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white/50 rounded-full" /> Canon 700D</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white/50 rounded-full" /> Objetivo Macro</li>
                          <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white/50 rounded-full" /> Luz Natural</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-4 mb-16">
                    <h4 className="text-white text-sm tracking-widest uppercase mb-6">Conectemos</h4>
                    {[
                      { icon: <Icons.Mail size={20} />, label: 'Email', href: 'mailto:mariaantoniaazucena@gmail.com' },
                      { icon: <Icons.Instagram size={20} />, label: 'Instagram', href: 'https://www.instagram.com/marian_y_sus_mundos?igsh=MXg0YmM3dDhjNnM1cQ==' },
                      { icon: <Icons.Facebook size={20} />, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100011486713808' },
                      { icon: <Icons.Flickr size={20} />, label: 'Flickr', href: 'https://www.flickr.com/' }
                    ].map((link, i) => (
                      <motion.a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer bg-gradient-to-r from-transparent to-white/5" whileHover={{ x: 10 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="flex items-center gap-5">
                          <span className="text-white/60 group-hover:text-white transition-colors text-xl">{link.icon}</span>
                          <div>
                            <span className="text-sm font-light text-gray-400 group-hover:text-white tracking-wide block">{link.label}</span>
                            <span className="text-xs text-gray-600 group-hover:text-gray-400">{link.label === 'Email' ? 'Respuesta en 24h' : 'Sígueme'}</span>
                          </div>
                        </div>
                        <motion.span className="text-gray-600 group-hover:text-white group-hover:translate-x-2 transition-all text-xl" whileHover={{ scale: 1.2 }}>↗</motion.span>
                      </motion.a>
                    ))}
                  </motion.div>
                  <motion.div variants={itemVariants} className="pt-8 border-t border-white/10">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Ubicación</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                      <p className="text-white text-sm font-light tracking-wide">Zaragoza, España</p>
                    </div>
                  </motion.div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* SCROLL TO TOP */}
        <AnimatePresence>
          {isScrolled && (
            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center z-50 cursor-pointer hover:bg-white/20 transition-all" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
              <Icons.ChevronLeft size={20} className="rotate-90 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </section>
    </LayoutGroup>
  );
}