// Archivo: app/icon.tsx
import { ImageResponse } from 'next/og'

// Configuración de la imagen (Tamaño estándar de favicon)
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Generación del icono
export default function Icon() {
  return new ImageResponse(
    (
      // Elemento JSX que se convertirá en imagen
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'serif', // Tipografía elegante a juego con la web
          borderRadius: '4px', // Un poco redondeado, pero serio
        }}
      >
        M
      </div>
    ),
    {
      ...size,
    }
  )
}