import type { Product } from '~/types/errors'
import { productsDb } from '~~/server/utils/products'

interface UpdateProductBody {
  name?: string
  price?: number
  description?: string
}

export default defineEventHandler(async (event): Promise<Product> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is required',
    })
  }

  const existing = productsDb.get(id)

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: `Product with ID ${id} not found`,
    })
  }

  const body = await readBody<UpdateProductBody>(event)

  // Validation
  if (body.name !== undefined && typeof body.name !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Name must be a string',
    })
  }

  if (body.price !== undefined && (typeof body.price !== 'number' || body.price <= 0)) {
    throw createError({
      statusCode: 400,
      message: 'Price must be a positive number',
    })
  }

  const updated: Product = {
    ...existing,
    ...(body.name !== undefined && { name: body.name }),
    ...(body.price !== undefined && { price: body.price }),
  }

  productsDb.set(id, updated)

  return updated
})
