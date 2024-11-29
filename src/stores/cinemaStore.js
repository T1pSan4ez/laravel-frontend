import { ref, computed } from 'vue'
import { defineStore } from "pinia";

export const useCinemaStore = defineStore("cinema", {
  state: () => ({
    selectedCity: null,
    selectedCinema: null,
  }),
  actions: {
    selectCity(city) {
      this.selectedCity = city;
    },
    selectCinema(cinema) {
      this.selectedCinema = cinema;
    },
  },
});
