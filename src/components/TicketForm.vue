<script setup>
import { ref, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import ApiService from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useTicketStore } from "@/stores/ticketStore";
import router from "@/router/index.js";

const props = defineProps({
  sessionId: {
    type: String,
    required: true,
  },
  selectedSeats: {
    type: Array,
    required: true,
  },
  selectedProducts: {
    type: Array,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["remove-seat", "remove-product", "switch-view"]);

const isSubmitting = ref(false);
const currentView = ref("seating");
const currentUser = ref(null);
const ticketStore = useTicketStore();
const authStore = useAuthStore();

const fetchCurrentUser = async () => {
  if (authStore.isAuthenticated) {
    try {
      const response = await ApiService.getUserProfile();
      authStore.setUser(response.data);
      currentUser.value = response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }
};

const handleViewSwitch = () => {
  if (currentView.value === "seating") {
    currentView.value = "snacks";
    emit("switch-view", "snacks");
  } else {
    currentView.value = "seating";
    emit("switch-view", "seating");
  }
};

const activityData = {
  movie_id: props.movieId,
  action: "booking",
};

const handleSubmit = async () => {
  const sessionId = props.sessionId;
  const slots = props.selectedSeats.map((seat) => ({
    slot_id: seat.id,
    status: "booked",
  }));
  console.log("Slots to be sent:", slots);

  isSubmitting.value = true;

  try {
    const response = await ApiService.updateSessionSlots(sessionId, slots);
    console.log("Response from server:", response);

    if (currentUser.value) {
      await addUserActivity(activityData);
    }
  } catch (error) {
    console.error("Error updating session slots or recording activity:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const addUserActivity = async (activityData) => {
  try {
    const response = await ApiService.addUserActivity( {
      movie_id: activityData.movie_id,
      action: activityData.action,
    });
    return response.data;
  } catch (error) {
    console.error("Error recording user activity:", error);
    throw error;
  }
};

const handleGenerateQRCode = () => {
  ticketStore.setSelectedSeats(props.selectedSeats);
  ticketStore.setSelectedProducts(props.selectedProducts);

  router.push({name: "QRCodePage"});
};

onMounted(() => {
  fetchCurrentUser();
});
</script>

<template>
  <div class="card shadow-sm h-100 d-flex flex-column">
    <div class="card-header bg-light">
      <h5 class="card-title">Tickets</h5>
      <p class="text-muted mb-0">
        {{ selectedSeats.length }} tickets, {{ selectedProducts.length }} snacks {{ totalAmount.toFixed(2) }} UAH
      </p>
    </div>
    <div class="card-body overflow-auto flex-grow-1">
      <div
        v-for="seat in selectedSeats"
        :key="`selected-seat-${seat.row}-${seat.number}`"
        class="ticket-item mb-3 border rounded p-3 d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>
            Row {{ seat.row }}, Seat {{ seat.number }}
            ({{ seat.type ? seat.type.toUpperCase() : "UNKNOWN" }})
          </strong>
          <p class="mb-1 text-muted">{{ seat.price }} UAH</p>
        </div>
        <button
          class="btn btn-sm btn-danger ms-2"
          @click="$emit('remove-seat', seat)"
        >
          X
        </button>
      </div>

      <hr class="my-4"/>

      <div
        v-for="product in selectedProducts"
        :key="`selected-product-${product.id}`"
        class="ticket-item mb-3 border rounded p-3 d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ product.name }}</strong>
          <p class="mb-1 text-muted">
            {{ product.quantity }} x {{ product.price }} UAH
          </p>
        </div>
        <button
          class="btn btn-sm btn-danger ms-2"
          @click="$emit('remove-product', product)"
        >
          X
        </button>
      </div>
    </div>
    <div class="card-footer bg-white border-top">
      <h5 class="mb-3">
        Total: <span class="text-danger">{{ totalAmount.toFixed(2) }} UAH</span>
      </h5>
      <button
        v-if="currentView === 'seating'"
        class="btn btn-primary w-100 mt-2"
        @click="handleViewSwitch"
      >
        Continue to Snacks
      </button>
      <button
        v-else
        class="btn btn-secondary w-100 mt-2"
        @click="handleViewSwitch"
      >
        Back to Seating
      </button>
      <button
        class="btn btn-danger w-100 mt-2"
        :disabled="isSubmitting"
        @click="handleSubmit"
      >
        {{ isSubmitting ? "Processing..." : "Book Now" }}
      </button>
      <button class="btn btn-success w-100 mt-3" @click="handleGenerateQRCode">
        Generate QR Code
      </button>
    </div>
  </div>
</template>

<style scoped>
.card-body {
  overflow-y: auto;
}

.card-footer {
  border-top: 1px solid #ddd;
}

.ticket-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
