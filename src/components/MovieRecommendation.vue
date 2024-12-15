<script setup>
import ApiService from "@/services/api.js";
import { onMounted, ref, computed } from "vue";

const recommendations = ref([]);
const recommendedSessions = ref([]);

const fetchUserActivity = async () => {
  try {
    const response = await ApiService.getUserActivity();
    recommendations.value = response.recommendations;
  } catch (error) {
    console.error("Error fetching user activity:", error);
  }
};

const fetchRecommendedSessions = async () => {
  try {
    const response = await ApiService.getRecommendedSessions();
    recommendedSessions.value = response.sessions;
  } catch (error) {
    console.error("Error fetching recommended sessions:", error);
  }
};

const groupedSessions = computed(() => {
  const grouped = {};
  recommendedSessions.value.forEach((session) => {
    const key = `${session.city_name}_${session.cinema_name}`;
    if (!grouped[key]) {
      grouped[key] = {
        city_name: session.city_name,
        cinema_name: session.cinema_name,
        movies: [],
      };
    }
    grouped[key].movies.push({
      session_id: session.session_id,
      movie_title: session.movie_title,
      start_time: session.start_time,
    });
  });
  return Object.values(grouped);
});

onMounted(() => {
  fetchUserActivity();
  fetchRecommendedSessions();
});
</script>

<template>
  <div class="container mt-4">
    <div v-if="recommendations.length > 0" class="container mt-4">
      <h2 class="mb-4">Recommended Movies</h2>
      <div class="row">
        <div
          v-for="movie in recommendations"
          :key="movie.id"
          class="col-md-4 mb-4"
        >
          <div>
            <router-link :to="{ name: 'MovieDetails', params: { id: movie.id } }">
              <img
                :src="movie.poster || '/path/to/default-image.jpg'"
                alt="Movie Poster"
                class="movie-poster"
              />
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center mt-4">
      <p class="alert alert-info">No recommendations available. Stay tuned for new releases!</p>
    </div>

    <div v-if="recommendedSessions.length > 0" class="container mt-4">
      <h2 class="mb-4">Recommended Sessions</h2>
      <div>
        <div
          v-for="session in groupedSessions"
          :key="session.city_name + session.cinema_name"
          class="mb-4"
        >
          <strong>
            {{ session.city_name }} ({{ session.cinema_name }})
          </strong>
          <ul>
            <li
              v-for="movie in session.movies"
              :key="movie.session_id"
            >
              <router-link :to="{ name: 'session', params: { id: movie.session_id } }"  class="custom-link">
                {{ movie.movie_title }}: ({{ movie.start_time }})
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="text-center mt-4">
      <p class="alert alert-info">No sessions available. Check back later for more options!</p>
    </div>
  </div>
</template>

<style scoped>
.movie-poster {
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.custom-link:hover {
  color: #007bff;
}
</style>
