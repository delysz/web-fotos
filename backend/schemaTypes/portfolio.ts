// backend/schemaTypes/portfolio.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'portfolio',
  title: 'Portafolio',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
    }),
    defineField({
      name: 'imagen',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
    }),
    // 👇 AQUÍ ESTÁ LA MAGIA
    defineField({
      name: 'categoria',
      title: 'Categoría',
      type: 'reference', // <--- Ya no es string, es una referencia
      to: [{ type: 'categoria' }], // <--- Apunta al archivo que creamos antes
    }),
  ],
})