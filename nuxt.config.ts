// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    googleApiKey: process.env.GOOGLE_API_KEY || 'AIzaSyB6QzeBAKmSSADx4rZ7mg1h0osi6bqzXGw',
    public: {
      // Supabase Konfiguration für Direct Connection
      supabaseUrl: process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY
    },
    // Server-side nur (nicht öffentlich)
    supabaseSecret: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET
  },
  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL,
    key: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY
  },
  app: {
    head: {
      title: 'Maps Scraper Pro',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Professionelle Google Maps Daten-Sammlung für Cold Mailings' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
      ]
    }
  }
})
