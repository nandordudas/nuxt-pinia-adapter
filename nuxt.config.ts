// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  // ssr: false,
  // nitro: {
  //   preset: 'static',
  //   devProxy: {
  //     '/api': {
  //       target: 'https://.../api',
  //       changeOrigin: true,
  //       prependPath: true,
  //     },
  //   },
  // },
  runtimeConfig: {
    public: {
      apiBase: '/api',
    },
  },
})
