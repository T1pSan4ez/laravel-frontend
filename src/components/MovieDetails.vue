<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ApiService from "@/services/api";
import notAvailableImage from "@/assets/not-avaliable.png";

const route = useRoute();
const movie = ref(null);
const error = ref(null);
const isLoading = ref(true);

const fetchMovie = async () => {
  try {
    isLoading.value = true;
    const movieId = route.params.id;
    movie.value = await ApiService.getMovie(movieId);
    isLoading.value = false;
  } catch (err) {
    console.error("Error fetching movie:", err);
    error.value = "Failed to load movie details. Please try again.";
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMovie();
});
</script>

<template>
  <div class="container py-4">
    <div v-if="isLoading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger text-center">
      {{ error }}
    </div>

    <div v-else class="movie-details">
      <div class="row">
        <div class="col-md-4">
          <img
            :src="movie.data.poster || notAvailableImage"
            alt="Movie Poster"
            class="img-fluid rounded shadow img"
          />
        </div>
        <div class="col-md-8">
          <h2>{{ movie.data.title }}</h2>
          <p class="text-muted">
            <span style="font-weight: bold">Release Date:</span>
            {{ movie.data.release_date || "N/A" }}<br />
          </p>
          <p class="text-muted">
            <span style="font-weight: bold">Age Rating:</span>
           {{ movie.data.age_rating || "N/A" }}
          </p>
          <p class="text-muted">
            <span style="font-weight: bold">Duration (minutes):</span>
          {{ movie.data.duration || "N/A" }}
          </p>
          <p>{{ movie.description }}</p>
          <div v-if="movie.data.genres && movie.data.genres.length > 0">
            <span style="font-weight: bold">Genres: </span>
            <span>{{ movie.data.genres.map(genre => genre.name).join(", ") }}</span>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <h4>Description</h4>
        <p>{{ movie.data.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

.img-fluid {
  object-fit: cover;
}

.img {
  height: 500px;
}

.movie-details h2 {
  margin-bottom: 1rem;
}

.movie-details p {
  line-height: 1.6;
}
</style>
