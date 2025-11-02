import { Result } from 'typescript-result'

export interface EntityAdapter<T extends { id: string }> {
  entities: ReadonlyMap<string, T>
  ids: ComputedRef<string[]>
  all: ComputedRef<T[]>
  selectById: (id: string) => ComputedRef<T | undefined>
  selectMany: (ids: string[]) => ComputedRef<T[]>
  addOne: (entity: T) => Result<T, Error>
  addMany: (items: T[]) => Result<T[], Error>
  updateOne: (id: string, changes: Partial<T>) => Result<T, Error>
  upsertOne: (entity: T) => Result<T, Error>
  upsertMany: (items: T[]) => Result<T[], Error>
  removeOne: (id: string) => Result<void, Error>
  removeMany: (ids: string[]) => Result<void, Error>
  setAll: (items: T[]) => Result<T[], Error>
  reset: () => void
}

export function createEntityAdapter<T extends { id: string }>(): EntityAdapter<T> {
  const entities = shallowReactive(new Map<string, T>())

  const ids = computed(() => Array.from(entities.keys()))
  const all = computed(() => Array.from(entities.values()))

  function selectById(id: string) {
    return computed(() => entities.get(id))
  }

  function selectMany(ids: string[]) {
    return computed(() =>
      ids.map(id => entities.get(id)).filter((e): e is T => !!e)
    )
  }

  function addOne(entity: T): Result<T, Error> {
    if (entities.has(entity.id))
      return Result.error(new Error(`Entity ${entity.id} already exists`))

    entities.set(entity.id, entity)

    return Result.ok(entity) as Result<T, Error>
  }

  function addMany(items: T[]): Result<T[], Error> {
    const conflicts = items.filter(item => entities.has(item.id))

    if (conflicts.length > 0)
      return Result.error(new Error(`Entities already exist: ${conflicts.map(c => c.id).join(', ')}`))

    items.forEach(item => entities.set(item.id, item))

    return Result.ok(items) as Result<T[], Error>
  }

  function updateOne(id: string, changes: Partial<T>): Result<T, Error> {
    const entity = entities.get(id)

    if (!entity)
      return Result.error(new Error(`Entity ${id} not found`))

    const updated = { ...entity, ...changes } as T

    entities.set(id, updated)

    return Result.ok(updated) as Result<T, Error>
  }

  function upsertOne(entity: T): Result<T, Error> {
    entities.set(entity.id, entity)

    return Result.ok(entity) as Result<T, Error>
  }

  function upsertMany(items: T[]): Result<T[], Error> {
    items.forEach(item => entities.set(item.id, item))

    return Result.ok(items) as Result<T[], Error>
  }

  function removeOne(id: string): Result<void, Error> {
    if (!entities.has(id))
      return Result.error(new Error(`Entity ${id} not found`))

    entities.delete(id)

    return Result.ok(undefined) as Result<void, Error>
  }

  function removeMany(ids: string[]): Result<void, Error> {
    const missing = ids.filter(id => !entities.has(id))

    if (missing.length > 0)
      return Result.error(new Error(`Entities not found: ${missing.join(', ')}`))

    ids.forEach(id => entities.delete(id))

    return Result.ok(undefined) as Result<void, Error>
  }

  function setAll(items: T[]): Result<T[], Error> {
    entities.clear()
    items.forEach(item => entities.set(item.id, item))

    return Result.ok(items) as Result<T[], Error>
  }

  function reset() {
    entities.clear()
  }

  return {
    entities: readonly(entities) as ReadonlyMap<string, T>,
    ids,
    all,
    selectById,
    selectMany,
    addOne,
    addMany,
    updateOne,
    upsertOne,
    upsertMany,
    removeOne,
    removeMany,
    setAll,
    reset
  }
}
