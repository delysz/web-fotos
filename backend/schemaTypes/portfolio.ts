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
    
    // 👇 ESTO ES LO NUEVO (Multi-categoría)
    defineField({
      name: 'categorias',  // <--- Plural
      title: 'Categorías', // <--- Título
      type: 'array',       // <--- AHORA ES UNA LISTA
      of: [{               // <--- ¿De qué es la lista? De referencias.
        type: 'reference', 
        to: [{ type: 'categoria' }] 
      }],
      validation: (rule) => rule.unique().error('No puedes repetir la misma categoría dos veces'),
    }),
  ],
})