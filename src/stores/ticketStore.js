import { defineStore } from "pinia";

export const useTicketStore = defineStore("ticketStore", {
  state: () => ({
    selectedSeats: [],
    selectedProducts: [],
    totalAmount: 0,
    sessionId: null,
  }),
  actions: {
    setSelectedSeats(seats) {
      this.selectedSeats = seats;
      this.updateTotalAmount();
    },
    setSelectedProducts(products) {
      this.selectedProducts = products;
      this.updateTotalAmount();
    },
    updateTotalAmount() {
      const seatTotal = this.selectedSeats.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
      const productTotal = this.selectedProducts.reduce(
        (sum, product) => sum + product.quantity * parseFloat(product.price),
        0
      );
      this.totalAmount = seatTotal + productTotal;
    },
    setSessionId(sessionId) {
      this.sessionId = sessionId;
    },
    resetData() {
      this.selectedSeats = [];
      this.selectedProducts = [];
      this.totalAmount = 0;
    },
  },
});
