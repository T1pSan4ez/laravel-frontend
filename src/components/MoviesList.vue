<script setup>
import { onMounted, ref } from "vue";
import ApiService from "@/services/api";

const movies = ref([]);
const swiperContainer = ref(null);

const placeholderImage = "https://via.placeholder.com/400x600?text=No+Image";

const fetchMovies = async () => {
  try {
    const response = await ApiService.getMovies();
    movies.value = response.data;
  } catch (error) {
    console.error("Ошибка при запросе списка фильмов:", error);
  }
};

const scrollLeft = () => {
  swiperContainer.value.scrollBy({
    left: -window.innerWidth * 0.7, // Прокрутка влево
    behavior: "smooth",
  });
};

const scrollRight = () => {
  swiperContainer.value.scrollBy({
    left: window.innerWidth * 0.7, // Прокрутка вправо
    behavior: "smooth",
  });
};

onMounted(() => {
  fetchMovies();
});
</script>

<template>
  <div class="position-relative swiper-container">
    <!-- Кнопки управления -->
    <button
      class="btn btn-dark position-absolute start-0 top-50 translate-middle-y"
      @click="scrollLeft"
      style="z-index: 10;"
    >
      <i class="bi bi-chevron-left"></i>
    </button>
    <button
      class="btn btn-dark position-absolute end-0 top-50 translate-middle-y"
      @click="scrollRight"
      style="z-index: 10;"
    >
      <i class="bi bi-chevron-right"></i>
    </button>

    <!-- Список фильмов -->
    <div
      ref="swiperContainer"
      class="d-flex h-100"
      style="scroll-snap-type: x mandatory; overflow-x: scroll;"
    >
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="swiper-slide d-flex flex-column align-items-center justify-content-end flex-shrink-0"
        style="width: 70vw; height: 100vh; scroll-snap-align: center; background-size: cover; background-position: center; background-repeat: no-repeat;"
        :style="{ backgroundImage: `url(${movie.poster || placeholderImage})` }"
      >
        <div class="movie-overlay">
          <h2 class="movie-title">{{ movie.title || "Unknown Title" }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Контейнер свайпера */
.swiper-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: black;
}

/* Слайды */
.swiper-slide {
  position: relative;
  transition: transform 0.3s ease;
  border-radius: 12px;
}

/* Текстовое перекрытие */
.movie-overlay {
  background: rgba(0, 0, 0, 0.7);
  width: 100%;
  padding: 20px 0;
  text-align: center;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* Кнопки управления */
button {
  background-color: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
