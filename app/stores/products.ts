import { createEntityAdapter } from '~/composables/useEntityAdapter'
import type { Product } from '~/types/errors'

import { createProductState } from './products/state'
import { createProductActions } from './products/actions'
import { createProductGetters } from './products/getters'

export const useProductStore = defineStore('products', () => {
  const adapter = createEntityAdapter<Product>()
  const state = reactive(createProductState())
  const actions = createProductActions(adapter, state)
  const getters = createProductGetters(adapter, state)

  return {
    ...getters,
    ...actions,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useProductStore, import.meta.hot))
