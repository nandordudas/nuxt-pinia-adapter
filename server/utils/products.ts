import type { Product } from '~/types/errors'

// In-memory database for demo purposes
export const productsDb = new Map<string, Product>([
  ['1', { id: '1', name: 'Laptop', price: 999.99 }],
  ['2', { id: '2', name: 'Mouse', price: 29.99 }],
  ['3', { id: '3', name: 'Keyboard', price: 79.99 }],
])

let nextId = 4

export function generateProductId(): string {
  return String(nextId++)
}
