import { Result } from 'typescript-result'
import type { EntityAdapter } from '~/composables/useEntityAdapter'
import { ApiError, type Product } from '~/types/errors'

import { createProductState, type ProductState } from './state'

interface CreateProductData {
  name: string
  price: number
  description?: string
}

interface UpdateProductData {
  name?: string
  price?: number
  description?: string
}

export function createProductActions(
  adapter: EntityAdapter<Product>,
  state: ProductState
) {
  const { $api } = useNuxtApp()

  // Wrap API calls - reusable functions
  const fetchProductsApi = Result.wrap(
    () => $api<Product[]>('/products'),
    (error) => new ApiError('Failed to fetch products', error),
  )

  const createProductApi = Result.wrap(
    (data: CreateProductData) => $api<Product>('/products', {
      method: 'POST',
      body: data
    }),
    (error) => new ApiError('Failed to create product', error),
  )

  const updateProductApi = Result.wrap(
    (id: string, data: UpdateProductData) => $api<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: data
    }),
    (error) => new ApiError('Failed to update product', error),
  )

  const deleteProductApi = Result.wrap(
    (id: string) => $api(`/products/${id}`, { method: 'DELETE' }),
    (error) => new ApiError('Failed to delete product', error),
  )

  // Fetch all products
  async function fetchAll(options?: {
    force?: boolean
    staleTime?: number
  }): Promise<Result<Product[], ApiError>> {
    const { force = false, staleTime = 5 * 60 * 1000 } = options ?? {}

    if (!force && !isStale(state.fetch, staleTime))
      return Result.ok(adapter.all.value) as Result<Product[], ApiError>

    return withAsyncState(
      state.fetch,
      async () => {
        const productsResult = await fetchProductsApi()

        if (!productsResult.ok)
          throw productsResult.error

        adapter.setAll(productsResult.value)

        return productsResult.value
      }
    )
  }

  // Create product
  async function create(data: CreateProductData): Promise<Result<Product, ApiError>> {
    return withAsyncState(
      state.create,
      async () => {
        const createdResult = await createProductApi(data)

        if (!createdResult.ok)
          throw createdResult.error

        adapter.addOne(createdResult.value)

        return createdResult.value
      },
      {
        onSuccess: () => {
          state.fetch.lastFetch = null
        }
      }
    )
  }

  // Update with optimistic update
  async function update(
    id: string,
    data: UpdateProductData
  ): Promise<Result<Product, ApiError>> {
    const existing = adapter.selectById(id).value

    if (!existing)
      return Result.error(new ApiError('Product not found')) as Result<Product, ApiError>

    if (!state.update.has(id))
      state.update.set(id, createAsyncState<ApiError>())

    return withAsyncState(
      state.update.get(id)!,
      async () => {
        const updatedResult = await updateProductApi(id, data)

        if (!updatedResult.ok)
          throw updatedResult.error

        adapter.upsertOne(updatedResult.value)

        return updatedResult.value
      },
      {
        optimistic: {
          apply: () => {
            adapter.updateOne(id, data)
          },
          rollback: () => {
            adapter.upsertOne(existing)
          }
        },
        onSuccess: () => {
          state.fetch.lastFetch = null
        }
      }
    )
  }

  // Delete with optimistic delete
  async function remove(id: string): Promise<Result<void, ApiError>> {
    const existing = adapter.selectById(id).value

    if (!existing)
      return Result.error(new ApiError('Product not found')) as Result<void, ApiError>

    if (!state.delete.has(id))
      state.delete.set(id, createAsyncState<ApiError>())

    return withAsyncState(
      state.delete.get(id)!,
      async () => {
        const deleteResult = await deleteProductApi(id)

        if (!deleteResult.ok)
          throw deleteResult.error
      },
      {
        optimistic: {
          apply: () => {
            adapter.removeOne(id)
          },
          rollback: () => {
            adapter.upsertOne(existing)
          }
        },
        onSuccess: () => {
          state.fetch.lastFetch = null

          state.delete.delete(id)
          state.update.delete(id)
        }
      }
    )
  }

  function invalidate() {
    state.fetch.lastFetch = null
  }

  function reset() {
    adapter.reset()
    Object.assign(state, createProductState())
  }

  return {
    fetchAll,
    create,
    update,
    remove,
    invalidate,
    reset,
  }
}
