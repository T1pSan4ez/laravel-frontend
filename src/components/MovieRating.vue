<script setup>
import { ref, computed, onMounted } from "vue";
import ApiService from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();

const props = defineProps({
  movieId: {
    type: [Number, String],
    required: true,
  },
});

const stars = ref([]);
const averageRating = ref(0);
const totalRatings = ref(0);

const userRating = computed(() => {
  const currentUserId = authStore.user?.id;
  const userRatingData = authStore.user?.ratings?.find(
    (rating) => rating.movie_id === props.movieId && rating.user_id === currentUserId
  );
  return userRatingData ? userRatingData.rating : null;
});

const fetchMovieRating = async () => {
  try {
    const data = await ApiService.getMovieRating(props.movieId);

    averageRating.value = Math.max(0, Math.min(10, Math.floor(data.average_rating)));
    totalRatings.value = data.ratings.length;

    if (authStore.isAuthenticated && authStore.user) {
      authStore.user.ratings = data.ratings.filter((rating) => rating.user_id === authStore.user.id);
    }
  } catch (error) {
    console.error("Error fetching movie rating:", error);
  }
};

const submitRating = async (score) => {
  if (!authStore.isAuthenticated) {
    alert("You need to be logged in to rate!");
    return;
  }

  try {
    await ApiService.addMovieRating(props.movieId, { rating: score });
    await fetchMovieRating();

    const existingRating = authStore.user?.ratings?.find(
      (rating) => rating.movie_id === props.movieId
    );
    if (existingRating) {
      existingRating.rating = score;
    } else {
      authStore.user.ratings.push({ movie_id: props.movieId, rating: score });
    }
  } catch (error) {
    console.error("Error submitting movie rating:", error);
  }
};

stars.value = Array.from({ length: 10 }, (_, i) => i + 1);

onMounted(() => {
  fetchMovieRating();
});
</script>

<template>
  <div class="text-end">
    <h4>Rating:</h4>
    <div>
      <div>
        <span
          v-for="star in stars"
          :key="star"
          class="star"
          :class="{ active: star <= averageRating }"
          @click="() => authStore.isAuthenticated && submitRating(star)"
        >
        ★
        </span>
      </div>
      <span>
        {{ averageRating }}
        (<span id="rating-count">{{ totalRatings }}</span> votes)
      </span>
      <div v-if="userRating !== null" class="mt-2">
        <strong>Your rating:</strong> {{ userRating }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.star {
  font-size: 24px;
  cursor: pointer;
  color: lightgray;
  transition: color 0.3s ease;
}

.star.active {
  color: gold;
}

.star.user {
  color: darkorange;
}

.star:hover {
  color: orange;
}

.star[disabled] {
  cursor: not-allowed;
  color: lightgray;
}
</style>
