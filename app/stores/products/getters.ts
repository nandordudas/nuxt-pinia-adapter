import type { EntityAdapter } from '~/composables/useEntityAdapter'
import type { Product } from '~/types/errors'

import type { ProductState } from './state'

export function createProductGetters(
  adapter: EntityAdapter<Product>,
  state: ProductState,
) {
  const all = adapter.all
  const ids = adapter.ids
  const byId = (id: string) => adapter.selectById(id)

  const sorted = computed(() =>
    adapter.all.value.sort((a, b) => a.name.localeCompare(b.name))
  )

  const isLoading = computed(() => state.fetch.loading)
  const isCreating = computed(() => state.create.loading)
  const isUpdating = (id: string) => computed(() => state.update.get(id)?.loading ?? false)
  const isDeleting = (id: string) => computed(() => state.delete.get(id)?.loading ?? false)

  const error = computed(() => state.fetch.error)
  const createError = computed(() => state.create.error)
  const updateError = (id: string) => computed(() => state.update.get(id)?.error ?? null)
  const deleteError = (id: string) => computed(() => state.delete.get(id)?.error ?? null)

  const isFresh = computed(() => !isStale(state.fetch))
  const count = computed(() => adapter.all.value.length)

  return {
    all,
    ids,
    byId,
    sorted,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createError,
    updateError,
    deleteError,
    isFresh,
    count,
  }
}
