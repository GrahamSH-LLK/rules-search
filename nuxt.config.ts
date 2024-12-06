// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/fonts", "@scalar/nuxt", "@nuxtjs/plausible"],
  css: ["~/assets/css/main.css"],
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  scalar: {
    spec: {
      url: "/_openapi.json",
    },
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/logo.svg" }],
    },
  },
  plausible: {
   apiHost: 'https://possible.grahamsh.com'

  }
});
