<script setup>
import { ref, onMounted, defineProps, defineEmits } from "vue";
import ApiService from "@/services/api";

const props = defineProps({
  sessionId: {
    type: String,
    required: true,
  },
  selectedProducts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["add-product", "remove-product"]);

const products = ref([]);
const isLoading = ref(false);
const error = ref(null);

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const response = await ApiService.getProducts();
    products.value = response.products.map((product) => ({
      ...product,
    }));
    console.log(products.value);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    error.value = "Failed to load products.";
  } finally {
    isLoading.value = false;
  }
};

const addProduct = (product) => {
  emit("add-product", product);
};

const removeProduct = (product) => {
  emit("remove-product", product);
};

onMounted(fetchProducts);
</script>

<template>
  <div>
    <h4>Snacks and Drinks</h4>
    <div v-if="error" class="alert alert-danger text-center">
      {{ error }}
    </div>

    <div v-else-if="isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else class="row">
      <div
        v-for="product in products"
        :key="product.id"
        class="col-md-3 mb-4"
      >
        <div class="card h-100">
          <img
            :src="product.image"
            class="card-img-top"
            alt="Product Image"
          />
          <div class="card-body">
            <h5 class="card-title">{{ product.name }}</h5>
            <p class="text-muted">{{ product.price }} UAH</p>
            <div class="d-flex align-items-center justify-content-between">
              <button
                class="btn btn-danger btn-sm"
                @click="removeProduct(product)"
                :disabled="
                  !selectedProducts.find((p) => p.id === product.id)?.quantity
                "
              >
                -
              </button>
              <span class="mx-2">
                {{
                  selectedProducts.find((p) => p.id === product.id)?.quantity ||
                  0
                }}
              </span>
              <button
                class="btn btn-success btn-sm"
                @click="addProduct(product)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.card-img-top {
  height: 150px;
  object-fit: contain;
  width: 100%;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  text-align: center;
}

.card-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 0.9rem;
  color: #6c757d;
}

.d-flex {
  width: 100%;
  justify-content: center;
  gap: 10px;
  align-items: center;
}

button {
  min-width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
