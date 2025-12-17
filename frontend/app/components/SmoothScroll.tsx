'use client';

import { ReactLenis } from '@studio-freight/react-lenis';

export default function SmoothScroll({ children }: { children: any }) {
  return (
    <ReactLenis root options={{ 
        lerp: 0.1,       // Viscosidad (0.1 es suave y elegante)
        duration: 1.5,   // Duración del frenado
        smoothWheel: true 
    }}>
      {children}
    </ReactLenis>
  );
}