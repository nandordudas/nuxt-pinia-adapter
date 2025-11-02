import type { useFetch as _useFetch } from 'nuxt/app'

// Only use this in components
export const useAPI: typeof _useFetch = (request, opts) => {
  return useFetch(request, {
    ...opts,
    $fetch: useNuxtApp().$api,
  })
}
