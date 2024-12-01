// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/fonts", "@scalar/nuxt"],
  css: ["~/assets/css/main.css"],
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  scalar: {
   spec: {
      url: '/_openapi.json',
    },

  }
});
