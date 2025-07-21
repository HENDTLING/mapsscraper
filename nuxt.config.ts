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
      title: 'LeadPro - Professionelles Lead Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Professionelle Lead-Management-Plattform für effiziente Kundengewinnung und Pipeline-Verwaltung' },
        { name: 'theme-color', content: '#0284c7' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        // Preconnect für bessere Performance
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Material Icons
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
        // Inter Font mit erweiterten Gewichten
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' 
        },
        // Favicon und App Icons
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }
      ]
    }
  },
  // Performance Optimierungen
  nitro: {
    compressPublicAssets: true,
  },
  // Build Optimierungen
  vite: {
    css: {
      preprocessorOptions: {
        css: {
          charset: false
        }
      }
    }
  }
})
