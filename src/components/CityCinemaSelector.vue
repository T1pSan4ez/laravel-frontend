<script setup>
import { ref, onMounted } from "vue";
import ApiService from "@/services/api";
// Импорт компонента CinemaList

const cities = ref([]);
const selectedCity = ref(null); // Текущий выбранный город

const fetchCities = async () => {
  try {
    const response = await ApiService.getCities();
    console.log("Список городов:", response);
    cities.value = response.data;
  } catch (error) {
    console.error("Ошибка при запросе городов:", error);
  }
};

const selectCity = (city) => {
  selectedCity.value = city; // Установка выбранного города
};

onMounted(() => {
  fetchCities();
});
</script>

<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Select a City</span>
    </v-card-title>

    <v-card-text>
      <!-- Список городов -->
      <v-list>
        <v-list-item
          v-for="city in cities"
          :key="city.id"
          @click="selectCity(city)"
        >
          <v-list-item-title>{{ city.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Список кинотеатров выбранного города -->
    <v-card-text v-if="selectedCity">
      <h2>{{ selectedCity.name }}</h2>
      <v-list>
        <v-list-item v-for="cinema in selectedCity.cinemas" :key="cinema.id">
          <v-list-item-title>{{ cinema.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ cinema.address }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions>
      <v-btn  @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
h2 {
  color: red;
  margin-top: 1rem;
}
</style>
