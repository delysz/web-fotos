'use client';

import { ReactLenis } from '@studio-freight/react-lenis';

export default function SmoothScroll({ children }: { children: any }) {
  return (
    <ReactLenis root options={{ 
        lerp: 0.05,        // Cuanto más bajo, más "pesada" se siente la web. (Antes 0.1)
        duration: 2.5,     // Tarda más segundos en frenar del todo.
        smoothWheel: true,
        wheelMultiplier: 1.2, // Para que baje un poco más rápido con cada tick de la rueda
    }}>
      {children}
    </ReactLenis>
  );
}