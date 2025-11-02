import type { Product } from '~/types/errors'
import { generateProductId, productsDb } from '~~/server/utils/products'

interface CreateProductBody {
  name: string
  price: number
  description?: string
}

export default defineEventHandler(async (event): Promise<Product> => {
  const body = await readBody<CreateProductBody>(event)

  // Validation
  if (!body.name || typeof body.name !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Name is required and must be a string',
    })
  }

  if (typeof body.price !== 'number' || body.price <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Price must be a positive number',
    })
  }

  const newProduct: Product = {
    id: generateProductId(),
    name: body.name,
    price: body.price,
  }

  productsDb.set(newProduct.id, newProduct)

  return newProduct
})
