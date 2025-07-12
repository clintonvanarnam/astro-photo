import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent', // Use blockContent for rich text
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'About Page'
      }
    }
  }
})
