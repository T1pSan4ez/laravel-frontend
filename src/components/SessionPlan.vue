<script setup>
import { onMounted, ref } from "vue";
import Pusher from "pusher-js";
import { useRoute } from "vue-router";
import ApiService from "@/services/api";
import { Tooltip } from "bootstrap";
import TicketForm from "@/components/TicketForm.vue";
import ProductList from "@/components/ProductsList.vue";

const route = useRoute();
const sessionData = ref(null);
const error = ref(null);

const rows = ref(0);
const columns = ref(0);

const selectedSeats = ref([]);
const selectedProducts = ref([]);
const totalAmount = ref(0);
const currentView = ref("seating");

const fetchSessionData = async () => {
  try {
    const sessionId = route.params.id;
    const response = await ApiService.getSessionById(sessionId);
    sessionData.value = response.data;
    console.log(sessionData.value);

    rows.value = Math.max(...sessionData.value.slots.map((slot) => slot.row));
    columns.value = Math.max(...sessionData.value.slots.map((slot) => slot.number));
  } catch (err) {
    error.value = "Failed to load session data.";
    console.error(err);
  }
};

const toggleSeatSelection = (slot) => {
  const existingSeatIndex = selectedSeats.value.findIndex(
    (seat) => seat.row === slot.row && seat.number === slot.number
  );

  if (existingSeatIndex > -1) {
    selectedSeats.value.splice(existingSeatIndex, 1);
  } else {
    selectedSeats.value.push(slot);
  }

  totalAmount.value = selectedSeats.value.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
};

const addProduct = (product) => {
  const existingProduct = selectedProducts.value.find((p) => p.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    selectedProducts.value.push({ ...product, quantity: 1 });
  }
  recalculateTotal();
};

const removeProduct = (product) => {
  const productIndex = selectedProducts.value.findIndex((p) => p.id === product.id);
  if (productIndex > -1) {
    const productToUpdate = selectedProducts.value[productIndex];
    productToUpdate.quantity -= 1;
    if (productToUpdate.quantity === 0) {
      selectedProducts.value.splice(productIndex, 1);
    }
  }
  recalculateTotal();
};

const recalculateTotal = () => {
  const seatsTotal = selectedSeats.value.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
  const productsTotal = selectedProducts.value.reduce(
    (sum, product) => sum + product.quantity * parseFloat(product.price),
    0
  );
  totalAmount.value = seatsTotal + productsTotal;
};

const calculateMinPrice = () => {
  if (!sessionData.value || !sessionData.value.slots || sessionData.value.slots.length === 0) {
    return "N/A";
  }
  const prices = sessionData.value.slots.map((slot) => parseFloat(slot.price));
  return Math.min(...prices).toFixed(2);
};

const calculateMaxPrice = () => {
  if (!sessionData.value || !sessionData.value.slots || sessionData.value.slots.length === 0) {
    return "N/A";
  }
  const prices = sessionData.value.slots.map((slot) => parseFloat(slot.price));
  return Math.max(...prices).toFixed(2);
};

const switchToSnacks = () => {
  currentView.value = "snacks";
};

const switchToSeating = () => {
  currentView.value = "seating";
};

onMounted(() => {
  fetchSessionData();

  const initializeTooltips = () => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new Tooltip(tooltipTriggerEl);
    });
  };

  setTimeout(() => {
    initializeTooltips();
  }, 500);

  const pusher = new Pusher("ec70f976f6bec76964d2", {
    cluster: "eu",
  });

  const channel = pusher.subscribe("booking_slots");
  channel.bind("booking_slots", (data) => {
    console.log("Updated slots:", data.updatedSlots);

    data.updatedSlots.forEach((updatedSlot) => {
      const slot = sessionData.value.slots.find((s) => s.id === updatedSlot.slot_id);
      if (slot) {
        slot.status = updatedSlot.status;
      }
    });
  });

  const slotStatusChannel = pusher.subscribe("slot_status");
  slotStatusChannel.bind("slot.status.updated", (data) => {
    console.log("Slot status updated:", data);

    const slot = sessionData.value.slots.find((s) => s.id === data.slot_id);
    if (slot) {
      slot.status = data.status;
    }
  });
});
</script>

<template>
  <div class="container-fluid py-5">
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="sessionData" class="row">
      <div class="col-lg-3 d-flex  align-items-center flex-column">
        <img
          :src="sessionData.movie.poster"
          alt="Movie Poster"
          class="img-fluid rounded shadow-sm"
          style="max-height: 500px;"
        />
      </div>

      <div class="col-lg-6">
        <div class="movie-info mb-4">
          <h1 class="text-primary">{{ sessionData.movie.title }} {{ sessionData.movie.age_rating }}+</h1>
          <div class="mb-2">
            <span class="badge bg-warning text-dark ms-2">{{ sessionData.movie.duration }} min</span>
            <span v-for="genre in sessionData.movie.genres" :key="genre.id" class="badge bg-secondary ms-2">
              {{ genre.name }}
            </span>
          </div>
        </div>

        <div class="info-section mt-3">
          <div class="info-item">
            <i class="mdi mdi-map-marker"></i>
            <div>
              <h6>Location</h6>
              <p class="m-0">{{ sessionData.hall.cinema.city.name }}, <br> {{ sessionData.hall.cinema.name }}, {{ sessionData.hall.name }}</p>
            </div>
          </div>
          <div class="info-item">
            <i class="mdi mdi-calendar"></i>
            <div>
              <h6>Date</h6>
              <p class="m-0">{{ sessionData.start_time.split(' ')[0] }}</p>
            </div>
          </div>
          <div class="info-item">
            <i class="mdi mdi-clock-outline"></i>
            <div>
              <h6>Time</h6>
              <p class="m-0">
                {{ sessionData.start_time.split(' ')[1].split(':').slice(0, 2).join(':') }} -
                {{ sessionData.end_time.split(' ')[1].split(':').slice(0, 2).join(':') }}
              </p>
            </div>
          </div>
          <div class="info-item">
            <i class="mdi mdi-currency-usd"></i>
            <div>
              <h6>Standard</h6>
              <p class="m-0">{{ calculateMinPrice() }} UAH</p>
            </div>
          </div>
          <div class="info-item">
            <i class="mdi mdi-currency-usd"></i>
            <div>
              <h6>VIP</h6>
              <p class="m-0">{{ calculateMaxPrice() }} UAH</p>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'seating'">
          <div style="text-align: center">
            <hr />
            <h5>Screen</h5>
            <br />
          </div>

          <div class="seating-container mt-5">
            <div
              class="grid-container"
              :style="{ gridTemplateColumns: `repeat(${columns}, 40px)`, gridTemplateRows: `repeat(${rows}, 40px)` }"
            >
              <div
                v-for="slot in sessionData.slots"
                :key="`seat-${slot.row}-${slot.number}`"
                class="seat"
                :class="{
                  'seat-selected': selectedSeats.some((seat) => seat.row === slot.row && seat.number === slot.number),
                  'seat-booked': slot.status === 'booked',
                  'seat-vip': slot.type === 'vip' && slot.status !== 'booked',
                  'seat-available': slot.type !== 'vip' && slot.status !== 'booked' && !selectedSeats.some((seat) => seat.row === slot.row && seat.number === slot.number),
                }"
                :style="{ gridRow: slot.row, gridColumn: slot.number }"
                data-bs-toggle="tooltip"
                :data-bs-placement="'top'"
                :title="`Seat: ${slot.row}-${slot.number}, Type: ${slot.type}, Price: ${slot.price}`"
                @click="toggleSeatSelection(slot)"
              >
                {{ slot.row }}-{{ slot.number }}
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentView === 'snacks'" style="margin-top: 25px;">
          <ProductList
            :session-id="route.params.id"
            :selected-products="selectedProducts"
            @add-product="addProduct"
            @remove-product="removeProduct"
          />
        </div>
      </div>

      <div class="col-lg-3" style="height: 85vh; position: sticky; top: 56px;">
        <TicketForm
          :session-id="route.params.id"
          :selected-seats="selectedSeats"
          :selected-products="selectedProducts"
          :total-amount="totalAmount"
          :movie-id="sessionData.movie.id"
          @remove-seat="toggleSeatSelection"
          @remove-product="removeProduct"
          @switch-view="currentView = $event"
        />
      </div>
    </div>
    <div v-else>
      Loading data...
    </div>
  </div>

</template>


<style scoped>
.container-fluid {
  max-width: 100%;
}

img {
  height: 500px;
  max-width: 400px;
  object-fit: cover;
}

h1 {
  font-size: 2rem;
}

.info-section {
  display: flex;
  gap: 20px;
  justify-content: start;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 15px;
  background: #f9f9f9;
}

.info-item i {
  font-size: 24px;
  color: #555;
}

.info-item h6 {
  font-size: 0.9rem;
  margin-bottom: 0;
}

.info-item p {
  font-size: 0.8rem;
  color: #555;
}

.seating-container {
  display: flex;
  justify-content: center;
  margin: 20px auto;
}

.grid-container {
  display: grid;
  gap: 5px;
  justify-content: center;
}

.seat {
  width: 40px;
  height: 40px;
  display: flex;
  border: 2px solid #56a4f4;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.seat-available {
  background-color: #f0f0f0;
}

.seat-standard {
  border-color: #2e8ef6;
}

.seat-vip {
  border-color: #d5ae16;
}

.seat-selected {
  background-color: #2e8ef6;
  color: white;
}

.seat-selected.seat-vip {
  background-color: #ffd700;
  color: black;
}

.seat-booked {
  background-color: #7a7a7a;
  color: #ffffff;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
