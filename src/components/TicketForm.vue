<script setup>
import ApiService from "@/services/api";
import {ref} from "vue";
import { defineProps } from 'vue';

const props = defineProps({
  sessionId: {
    type: String,
    required: true,
  },
  selectedSeats: {
    type: Array,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

defineEmits(["remove-seat"]);

const isSubmitting = ref(false);

const handleSubmit = async () => {
  const sessionId = props.sessionId;
  const slots = props.selectedSeats.map(seat => ({
    slot_id: seat.id,
    status: "booked"
  }));

  try {
    const response = await ApiService.updateSessionSlots(sessionId, slots);
    console.log("Response from server:", response);
    alert("Seats successfully booked!");
  } catch (error) {
    console.error("Error updating session slots:", error);
    alert("Failed to update session slots. Please try again.");
  }
};
</script>

<template>
  <div class="card shadow-sm h-100 d-flex flex-column">
    <div class="card-header bg-light">
      <h5 class="card-title">Tickets</h5>
      <p class="text-muted mb-0">{{ selectedSeats.length }} tickets, {{ totalAmount.toFixed(2) }} UAH</p>
    </div>
    <div class="card-body overflow-auto flex-grow-1">
      <div
        v-for="seat in selectedSeats"
        :key="`selected-${seat.row}-${seat.number}`"
        class="ticket-item mb-3 border rounded p-3 d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>
            Row {{ seat.row }}, Seat {{ seat.number }}
            ({{ seat.type ? seat.type.toUpperCase() : "UNKNOWN" }})
          </strong>
          <p class="mb-1 text-muted">{{ seat.price }} UAH</p>
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Promo code?"
          />
        </div>
        <button
          class="btn btn-sm btn-danger ms-2"
          @click="$emit('remove-seat', seat)"
        >
          X
        </button>
      </div>
    </div>
    <div class="card-footer bg-white border-top">
      <h5 class="mb-3">Total: <span class="text-danger">{{ totalAmount.toFixed(2) }} UAH</span></h5>
      <button
        class="btn btn-danger w-100 mt-2"
        :disabled="selectedSeats.length === 0 || isSubmitting"
        @click="handleSubmit"
      >
        {{ isSubmitting ? "Processing..." : "Continue" }}
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
