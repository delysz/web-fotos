// backend/schemaTypes/categoria.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'categoria',
  title: 'Categorías',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Nombre de la Categoría',
      type: 'string',
    }),
  ],
})