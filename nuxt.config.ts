export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    '@nuxt/icon'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: 'https://nzpocksgynzksjrdfynd.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cG9ja3NneW56a3NqcmRmeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MjMwMzIsImV4cCI6MjA3ODA5OTAzMn0.ilp-Z7XR9Alr0MArVzfMvz3e4xu9stzAkbRZQmZDm54',
    }
  },

  app: {
    head: {
      title: 'E-commerce Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ]
    }
  }
})