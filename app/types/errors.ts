export class ApiError extends Error {
  readonly type = 'api-error'

  constructor(message: string, cause?: unknown) {
    super(message)
  }
}

export class ValidationError extends Error {
  readonly type = 'validation-error'

  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message)
  }
}

export class NetworkError extends Error {
  readonly type = 'network-error'

  constructor(message: string) {
    super(message)
  }
}

export interface Product {
  id: string
  name: string
  price: number
}
