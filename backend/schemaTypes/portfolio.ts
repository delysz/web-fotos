import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'portfolio', // Nombre de la tabla para SQL/GROQ
  title: 'Portafolio', // Nombre visible en el panel
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
      options: { hotspot: true }, // Permite recortar el centro de atención
    }),
  ],
})