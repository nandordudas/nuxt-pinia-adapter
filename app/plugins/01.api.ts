export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest(context) {
      // console.log('API Request:', context.request)
    },

    onResponse(context) {
      // console.log('API Response:', context.response.status, context.response._data)
    },

    onResponseError(context) {
      // console.error('API Error:', context.response?.status, context.error)
    },
  })

  return {
    provide: {
      api,
    },
  }
})
