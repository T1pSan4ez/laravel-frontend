<script setup>
import {onMounted, watch, ref, computed} from "vue";
import ApiService from "@/services/api";
import { useCinemaStore } from "@/stores/cinemaStore";

const props = defineProps({
  cinema: {
    type: Object,
    required: false,
  },
});

const cinemaStore = useCinemaStore();
const movies = ref([]);
const swiperContainer = ref(null);
const placeholderImage = "https://via.placeholder.com/300x450?text=No+Image";
const showModal = ref(false);
const iframeSrc = ref("https://www.youtube.com/embed/dQw4w9WgXcQ");

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const fetchMoviesByCinema = async () => {
  if (!cinemaStore.selectedCinema) {
    movies.value = [];
    return;
  }

  try {
    const response = await ApiService.getMoviesByCinema(cinemaStore.selectedCinema.id);
    console.log(response.data);

    movies.value = response.data.map((movie) => {
      const uniqueDates = Array.from(
        new Set(
          movie.sessions.map((session) =>
            new Date(session.start_time).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          )
        )
      ).sort((a, b) => new Date(a) - new Date(b));

      return {
        ...movie,
        availableDates: Array.from(uniqueDates).sort(
          (a, b) => new Date(a) - new Date(b)
        ),
        selectedDate: uniqueDates[0] || "",
        filteredSessions: movie.sessions.map((session) => ({
          id: session.id,
          date: new Date(session.start_time).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: new Date(session.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isPast: new Date() > new Date(session.start_time),
        })),
      };
    });

    movies.value.forEach((movie) => filterSessionsByDate(movie));
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
};


const scrollLeft = () => {
  swiperContainer.value.scrollBy({
    left: -400,
    behavior: "smooth",
  });
};

const scrollRight = () => {
  swiperContainer.value.scrollBy({
    left: 400,
    behavior: "smooth",
  });
};

const filterSessionsByDate = (movie) => {
  if (!movie.selectedDate) {
    movie.filteredSessions = movie.sessions.map((session) => ({
      id: session.id,
      date: new Date(session.start_time).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: new Date(session.start_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  } else {
    movie.filteredSessions = movie.sessions
      .filter(
        (session) =>
          new Date(session.start_time).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) === movie.selectedDate
      )
      .map((session) => ({
        id: session.id,
        date: new Date(session.start_time).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date(session.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isPast: new Date() > new Date(session.start_time),
      }));
  }
};

watch(
  () => cinemaStore.selectedCinema,
  () => {
    fetchMoviesByCinema();
  },
  { immediate: true }
);

onMounted(() => {
  fetchMoviesByCinema();
});
</script>

<template>
  <div class="position-relative swiper-container">
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

    <div
      ref="swiperContainer"
      class="d-flex h-100"
      style="scroll-snap-type: x mandatory; overflow-x: scroll; overflow-y: hidden; -ms-overflow-style: none; scrollbar-width: none;"
    >
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="swiper-slide d-flex flex-column align-items-center justify-content-end flex-shrink-0 position-relative"
        style="width: 350px; height: 100%; scroll-snap-align: center; background-size: cover; background-position: center; background-repeat: no-repeat;"
        :style="{ backgroundImage: `url(${movie.poster || placeholderImage})` }"
      >
        <div class="movie-blur">
          <div class="blur-overlay"></div>
          <div class="movie-info">
            <div class="movie-top">
              <router-link style="text-decoration: none; color: white" :to="{ name: 'MovieDetails', params: { id: movie.id } }">
                <span class="movie-action">More details</span>
              </router-link>
              <span class="movie-action" style="cursor: pointer;" @click="openModal">Watch</span>
            </div>
            <div class="movie-bottom">
              <h3 style="margin-top: 150px">Global</h3>
              <div class="mb-3">
                <select
                  v-model="movie.selectedDate"
                  class="form-select"
                  @change="filterSessionsByDate(movie)"
                >
                  <option
                    v-for="(date, index) in movie.availableDates"
                    :key="index"
                    :value="date"
                  >
                    {{ date }}
                  </option>
                </select>
              </div>
              <p>Session schedule:</p>
              <div class="session-info">
                <span
                  v-for="(session, index) in movie.filteredSessions"
                  :key="index"
                  class="session-time"
                >
                  <router-link
                    v-if="!session.isPast"
                    style="text-decoration: none; color: #5b9aff;"
                    :to="{ name: 'session', params: { id: session.id } }"
                  >
                    {{ session.time }}
                  </router-link>
                  <span v-else style="color: #fdfdfd;">{{ session.time }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="movie-title-overlay">
          <h2 class="movie-title">{{ movie.title || "Unknown Title" }}</h2>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;"
    >
      <div class="modal-content" style="position: relative; width: 80%; height: 80%; background: #000;">
        <button
          @click="closeModal"
          style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;"
        >&times;</button>
        <iframe
          :src="iframeSrc"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
          style="width: 100%; height: 100%;"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<style scoped>
html,
body {
  overflow-x: hidden;
  margin: 0;
}

.swiper-container {
  width: 100vw;
  height: calc(100vh - 54px);
  overflow: hidden;
  position: relative;
  background-color: black;
}

.swiper-container > .d-flex::-webkit-scrollbar {
  display: none;
}

.swiper-slide {
  position: relative;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.movie-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 60px);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;

  color: white;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  z-index: 2;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: -1;
}

.movie-info {
  display: flex;
  flex-direction: column;
  height: 80%;
  gap: 25px;
}

.movie-top,
.movie-bottom {
  text-align: center;
}

.session-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 400;
  margin-top: 5px;
}

.session-time {
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 10px;
  border-radius: 5px;
}

.movie-top {
  font-size: 1rem;
  display: flex;
  justify-content: space-around;
}

.movie-bottom h4 {
  font-size: 1.25rem;
  margin-bottom: 5px;
}

.movie-title-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px;
  text-align: center;
  z-index: 3;
}

.movie-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

button {
  background-color: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

button:hover {
  background-color: rgb(86, 164, 244);
}

.swiper-slide:hover .movie-blur {
  opacity: 1;
}
</style>
