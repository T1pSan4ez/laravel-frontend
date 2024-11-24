<script setup>
import { ref, onMounted } from "vue";
import ApiService from "@/services/api";

const emit = defineEmits(["select", "close"]);

const cities = ref([]);
const selectedCity = ref(null);

const fetchCities = async () => {
  try {
    const response = await ApiService.getCities();
    cities.value = response.data;

    if (cities.value.length > 0) {
      selectedCity.value = cities.value[0];
      if (selectedCity.value.cinemas.length > 0) {
        emit("select", selectedCity.value, selectedCity.value.cinemas[0]);
      }
    }
  } catch (error) {
    console.error("Ошибка при запросе городов:", error);
  }
};

const selectCity = (cityId) => {
  selectedCity.value = cities.value.find((city) => city.id === parseInt(cityId));
};

const selectCinema = (cinema) => {
  if (selectedCity.value) {
    emit("select", selectedCity.value, cinema);
  }
};

onMounted(() => {
  fetchCities();
});
</script>

<template>
  <div class="d-flex">
    <div
      class="city-list"
      style="width: 250px; background-color: #333; color: white; padding: 20px;"
    >
      <h4 style="color: white;">City:</h4>
      <select
        class="form-select"
        style="background-color: #333; color: white; border: none;"
        @change="selectCity($event.target.value)"
      >
        <option
          v-for="city in cities"
          :key="city.id"
          :value="city.id"
          :selected="city.id === selectedCity?.id"
        >
          {{ city.name }}
        </option>
      </select>
    </div>

    <div class="cinema-list ms-3 flex-grow-1">
      <h4>Cinema:</h4>
      <div v-if="selectedCity">
        <div v-for="cinema in selectedCity.cinemas" :key="cinema.id" class="mb-3">
          <div class="row align-items-center">
            <div class="col">
              <h6>{{ cinema.name }}</h6>
              <p>{{ cinema.address }}</p>
              <button
                class="btn btn-link text-decoration-none p-0"
                @click="selectCinema(cinema)"
              >
                Select
              </button>
            </div>
          </div>
          <hr/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.city-list select {
  padding: 5px;
}

hr {
  border-top: 1px solid #ccc;
}
</style>
