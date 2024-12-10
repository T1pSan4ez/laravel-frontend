<script setup>
import {useTicketStore} from "@/stores/ticketStore";
import {useAuthStore} from "@/stores/authStore";
import {ref, onMounted} from "vue";
import ApiService from "@/services/api";
import router from "@/router";

const ticketStore = useTicketStore();
const authStore = useAuthStore();

const email = ref("");
const emailError = ref("");
const isSubmitting = ref(false);
const showModal = ref(false);
const sessionId = ticketStore.sessionId;

let purchaseCode = "";

const validateEmail = () => {
  if (!email.value.trim()) {
    emailError.value = "Email is required.";
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    emailError.value = "Please enter a valid email.";
    return false;
  }
  emailError.value = "";
  return true;
};

const handlePayment = async () => {
  if (!validateEmail()) {
    return;
  }

  isSubmitting.value = true;

  purchaseCode = `${Date.now()}`;

  const purchaseData = {
    session_id: sessionId,
    purchase_code: purchaseCode,
    user_id: authStore.isAuthenticated ? authStore.user?.id : null,
    email: email.value.trim(),
    items: [
      ...ticketStore.selectedSeats.map((seat) => ({
        slot_id: seat.id,
        item_name: `Row: ${seat.row}, Seat: ${seat.number}`,
        quantity: 1,
        price: parseFloat(seat.price),
      })),
      ...ticketStore.selectedProducts.map((product) => ({
        product_id: product.id,
        item_name: product.name,
        quantity: product.quantity,
        price: parseFloat(product.price),
      })),
    ],
  };

  try {
    console.log("Purchase data:", purchaseData);
    const response = await ApiService.addPurchase(purchaseData);
    console.log("Purchase response:", response);

    showModal.value = true;
  } catch (error) {
    console.error("Error processing payment:", error);
    emailError.value = "There was an error processing your payment. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const setEmailIfAuthenticated = () => {
  if (authStore.isAuthenticated && authStore.user?.email) {
    email.value = authStore.user.email;
  }
};

const handleModalOk = () => {
  showModal.value = false;
  router.push({name: "Home"});
};

onMounted(() => {
  setEmailIfAuthenticated();
});
</script>

<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-8">
        <h3 class="text-center">Ticket Information</h3>
        <div class="card shadow-sm p-4">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              type="email"
              class="form-control"
              v-model="email"
              :class="{ 'is-invalid': emailError }"
              placeholder="Enter your email"
            />
            <div v-if="emailError" class="invalid-feedback">
              {{ emailError }}
            </div>
          </div>
          <hr/>
          <h5>Seats</h5>
          <ul class="list-group mb-3">
            <li
              v-for="seat in ticketStore.selectedSeats"
              :key="`seat-${seat.row}-${seat.number}`"
              class="list-group-item"
            >
              Row: {{ seat.row }}, Seat: {{ seat.number }} - {{ seat.price }} UAH
            </li>
            <li v-if="ticketStore.selectedSeats.length === 0" class="list-group-item text-muted">
              No seats selected
            </li>
          </ul>
          <h5>Products</h5>
          <ul class="list-group mb-3">
            <li
              v-for="product in ticketStore.selectedProducts"
              :key="`product-${product.id}`"
              class="list-group-item"
            >
              {{ product.name }} - {{ product.quantity }} x {{ product.price }} UAH
            </li>
            <li v-if="ticketStore.selectedProducts.length === 0" class="list-group-item text-muted">
              No products selected
            </li>
          </ul>
          <h5>Total: <span class="text-danger">{{ ticketStore.totalAmount }} UAH</span></h5>
          <button
            class="btn btn-success w-100 mt-3"
            :disabled="isSubmitting"
            @click="handlePayment"
          >
            {{ isSubmitting ? "Processing..." : "Pay Now" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="modal"
      tabindex="-1"
      role="dialog"
      style="display: block; background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Payment Successful</h5>
          </div>
          <div class="modal-body">
            <p>Your payment was processed successfully!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="handleModalOk">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invalid-feedback {
  color: red;
  font-size: 0.875em;
}
</style>
