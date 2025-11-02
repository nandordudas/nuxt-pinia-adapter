<script lang="ts">
//
</script>

<script setup lang="ts">
definePageMeta({
  name: 'home',
})

useHead({
  title: 'Products Store Demo',
})

const store = useProductStore()
const toast = useToast()

const newProduct = reactive({
  name: '',
  price: 0,
})

const editingPrice = reactive<Record<string, number>>({})

onMounted(async () => {
  const result = await store.fetchAll()

  if (!result.ok) {
    toast.add({ title: `Error: ${result.error.message}`, color: 'error' })
  }
})

async function handleCreate() {
  if (!newProduct.name || newProduct.price <= 0) {
    toast.add({ title: 'Please fill in all fields', color: 'error' })
    return
  }

  const result = await store.create(newProduct)

  if (result.ok) {
    toast.add({ title: `Created ${result.value.name}!`, color: 'success' })
    newProduct.name = ''
    newProduct.price = 0
  } else {
    toast.add({ title: `Error: ${result.error.message}`, color: 'error' })
  }
}

async function handleUpdate(id: string) {
  const price = editingPrice[id]

  if (!price || price <= 0) {
    toast.add({ title: 'Invalid price', color: 'error' })
    return
  }

  const result = await store.update(id, { price })

  if (result.ok) {
    toast.add({ title: `Updated ${result.value.name}!`, color: 'success' })
    delete editingPrice[id]
  } else {
    toast.add({ title: `Error: ${result.error.message}`, color: 'error' })
  }
}

async function handleDelete(id: string, name: string) {
  const result = await store.remove(id)

  if (result.ok) {
    toast.add({ title: `Deleted ${name}!`, color: 'success' })
  } else {
    toast.add({ title: `Error: ${result.error.message}`, color: 'error' })
  }
}

function startEdit(product: { id: string, price: number }) {
  editingPrice[product.id] = product.price
}

function cancelEdit(id: string) {
  delete editingPrice[id]
}
</script>

<template>
  <UContainer class="py-8">
    <UPageHero title="Products Store Demo" description="Testing Pinia store with entity adapter pattern" />

    <div class="mt-8 space-y-8">
      <!-- Create Product Section -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Create New Product</h2>
        </template>

        <div class="grid gap-4">
          <UFormField label="Product Name">
            <UInput v-model="newProduct.name" placeholder="Enter product name" />
          </UFormField>

          <UFormField label="Price">
            <UInput v-model.number="newProduct.price" type="number" step="0.01" placeholder="0.00" />
          </UFormField>

          <UButton :loading="store.isCreating" @click="handleCreate">
            Create Product
          </UButton>
        </div>
      </UCard>

      <!-- Products List Section -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Products ({{ store.count }})</h2>
            <UBadge v-if="store.isFresh" color="success">Fresh</UBadge>
            <UBadge v-else color="neutral">Stale</UBadge>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="store.isLoading" class="text-center py-8">
          <p class="text-gray-500">Loading products...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="store.error" class="text-center py-8">
          <p class="text-red-500">Error: {{ store.error.message }}</p>
        </div>

        <!-- Products Grid -->
        <div v-else-if="store.count > 0" class="grid gap-4">
          <UCard v-for="product in store.sorted" :key="product.id">
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <h3 class="font-semibold text-lg">{{ product.name }}</h3>
                <p class="text-gray-600">ID: {{ product.id }}</p>

                <!-- Edit Price Form -->
                <div v-if="editingPrice[product.id] !== undefined" class="mt-2">
                  <UInput v-model.number="editingPrice[product.id]" type="number" step="0.01" size="sm" />
                </div>
                <p v-else class="text-xl font-bold text-primary mt-1">
                  ${{ product.price.toFixed(2) }}
                </p>
              </div>

              <div class="flex gap-2">
                <!-- Edit Mode Buttons -->
                <template v-if="editingPrice[product.id] !== undefined">
                  <UButton color="success" size="sm" :loading="store.isUpdating(product.id).value"
                    @click="handleUpdate(product.id)">
                    Save
                  </UButton>
                  <UButton color="neutral" size="sm" variant="outline" @click="cancelEdit(product.id)">
                    Cancel
                  </UButton>
                </template>

                <!-- Normal Mode Buttons -->
                <template v-else>
                  <UButton color="primary" size="sm" @click="startEdit(product)">
                    Edit
                  </UButton>
                  <UButton color="error" size="sm" :loading="store.isDeleting(product.id).value"
                    @click="handleDelete(product.id, product.name)">
                    Delete
                  </UButton>
                </template>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <p class="text-gray-500">No products yet. Create one above!</p>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
