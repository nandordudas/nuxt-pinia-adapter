import type { AsyncState } from '~/composables/useAsyncState'
import type { ApiError } from '~/types/errors'

export interface ProductState {
  fetch: AsyncState<ApiError>
  create: AsyncState<ApiError>
  update: Map<string, AsyncState<ApiError>>
  delete: Map<string, AsyncState<ApiError>>
}

export function createProductState(): ProductState {
  return {
    fetch: createAsyncState<ApiError>(),
    create: createAsyncState<ApiError>(),
    update: new Map(),
    delete: new Map(),
  }
}
