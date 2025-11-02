import { productsDb } from '~~/server/utils/products'

export default defineEventHandler((event): void => {
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

  productsDb.delete(id)
  setResponseStatus(event, 204)
})
