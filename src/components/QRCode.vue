<script setup>
import { useTicketStore } from "@/stores/ticketStore";
import { ref, computed, onMounted } from "vue";
import QRCode from "qrcode";

const ticketStore = useTicketStore();

const qrCodeDataUrl = ref("");
const email = ref("");
const hasData = computed(() => {
  return (
    ticketStore.selectedSeats.length > 0 ||
    ticketStore.selectedProducts.length > 0
  );
});

const generateQRCode = async () => {
  if (!hasData.value) return;

  try {
    const formattedData = [];

    ticketStore.selectedSeats.forEach((seat) => {
      const price = parseFloat(seat.price);
      formattedData.push(`Row: ${seat.row}, Seat: ${seat.number} - ${price.toFixed(2)} UAH`);
    });

    ticketStore.selectedProducts.forEach((product) => {
      const price = parseFloat(product.price);
      formattedData.push(`${product.name} - ${product.quantity} x ${price.toFixed(2)} UAH`);
    });

    const total = parseFloat(ticketStore.totalAmount);
    formattedData.push(`Total: ${total.toFixed(2)} UAH`);

    const qrDataString = formattedData.join("\n");
    qrCodeDataUrl.value = await QRCode.toDataURL(qrDataString, {
      width: 300,
      margin: 2,
    });
  } catch (error) {
    console.error("Error generating QR Code:", error);
  }
};


const handlePayment = () => {
  if (!email.value.trim()) {
    return;
  }
};

onMounted(() => {
  generateQRCode();
});
</script>

<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-6">
        <h3 class="text-center">Ticket Information</h3>
        <div class="card shadow-sm p-4">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              type="email"
              class="form-control"
              v-model="email"
              placeholder="Enter your email"
            />
          </div>
          <hr />
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
          <button class="btn btn-success w-100 mt-3" @click="handlePayment">
            Pay Now
          </button>
        </div>
      </div>

      <div class="col-md-6">
        <h3 class="text-center">Your QR Code</h3>
        <div class="text-center my-4">
          <div v-if="!hasData" class="alert alert-warning">
            No data available to generate QR Code.
          </div>
          <img
            v-else-if="qrCodeDataUrl"
            :src="qrCodeDataUrl"
            alt="QR Code"
            class="img-fluid"
          />
          <div v-else>Generating QR Code...</div>
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

img {
  max-width: 100%;
  height: auto;
}

.alert {
  margin-top: 20px;
}
</style>
