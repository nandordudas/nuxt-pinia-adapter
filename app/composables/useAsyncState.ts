import { Result } from 'typescript-result'

export interface AsyncState<E = Error> {
  loading: boolean
  error: E | null
  lastFetch: number | null
  retryCount: number
}

export function createAsyncState<E = Error>(): AsyncState<E> {
  return {
    loading: false,
    error: null,
    lastFetch: null,
    retryCount: 0,
  }
}

export interface WithAsyncStateOptions<T, E> {
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: E) => void | Promise<void>
  onFinally?: () => void | Promise<void>
  resetRetryOnSuccess?: boolean
  optimistic?: {
    apply: () => void
    rollback: () => void
  }
}

export async function withAsyncState<T, E = Error>(
  state: AsyncState<E>,
  operation: () => Promise<T>,
  options?: WithAsyncStateOptions<T, E>,
): Promise<Result<T, E>> {
  const {
    onSuccess,
    onError,
    onFinally,
    resetRetryOnSuccess = true,
    optimistic,
  } = options ?? {}

  state.loading = true
  state.error = null

  optimistic?.apply()

  const result = await Result.gen(
    async function* () {
      const wrapped = Result.wrap(
        operation,
        error => error as E,
      )

      const data = yield* await wrapped()

      state.loading = false
      state.lastFetch = Date.now()

      if (resetRetryOnSuccess)
        state.retryCount = 0

      await onSuccess?.(data)

      return data
    }
  ).mapError(
    async (error) => {
      state.loading = false
      state.error = error as E // [TODO] must be confirmed 3/1

      state.retryCount++

      optimistic?.rollback()

      await onError?.(error as E) // [TODO] must be confirmed 3/2

      return error
    },
  )

  await onFinally?.()

  return result as Result<T, E> // [TODO] must be confirmed 3/3
}

export function isStale(state: AsyncState, staleTime = 5 * 60 * 1_000): boolean {
  if (!state.lastFetch)
    return true

  return Date.now() - state.lastFetch > staleTime
}

export function resetAsyncState<E = Error>(state: AsyncState<E>): void {
  Object.assign(state, createAsyncState<E>())
}
