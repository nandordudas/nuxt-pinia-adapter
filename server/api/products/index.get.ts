import type { Product } from '~/types/errors'
import { productsDb } from '~~/server/utils/products'

export default defineEventHandler((): Product[] => {
  return Array.from(productsDb.values())
})
