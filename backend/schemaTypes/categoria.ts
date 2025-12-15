// backend/schemaTypes/categoria.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'categoria',
  title: 'Categoría',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
    }),
  ],
})