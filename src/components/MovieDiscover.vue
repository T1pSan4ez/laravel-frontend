<script setup>
import { onMounted, ref, watch } from "vue";
import ApiService from "@/services/api";
import notAvailableImage from "@/assets/not-avaliable.png";
import debounce from "lodash.debounce";
import {useRoute, useRouter} from "vue-router";

const movies = ref([]);
const genres = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref("");
const selectedGenres = ref([]);
const appliedGenres = ref([]);
const sortBy = ref("");
const sortOrder = ref("desc");
const route = useRoute();
const router = useRouter();

const fetchMovies = async () => {
  try {
    const params = {
      search: searchQuery.value || undefined,
      genre_ids: appliedGenres.value.length ? appliedGenres.value : undefined,
      sort_by: sortBy.value || undefined,
      order: sortOrder.value || undefined,
      page: currentPage.value || 1,
    };

    console.log("Fetching movies with params:", params);

    const response = await ApiService.getMovies(params);

    movies.value = response.data;
    totalPages.value = response.meta.last_page;
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
};

const fetchGenres = async () => {
  try {
    genres.value = await ApiService.getGenres("/genres");
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
};

const toggleGenre = (genreId) => {
  if (selectedGenres.value.includes(genreId)) {
    selectedGenres.value = selectedGenres.value.filter((id) => id !== genreId);
  } else {
    selectedGenres.value.push(genreId);
  }
};

const updateQueryParams = () => {
  const query = {
    search: searchQuery.value || undefined,
    genre_ids: selectedGenres.value.length ? selectedGenres.value.join(",") : undefined,
    sort_by: sortBy.value || undefined,
    order: sortOrder.value || undefined,
    page: currentPage.value > 1 ? currentPage.value : undefined,
  };
  router.replace({ query });
};

const applyFilters = () => {
  appliedGenres.value = [...selectedGenres.value];
  currentPage.value = 1;
  updateQueryParams();
  fetchMovies();
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedGenres.value = [];
  appliedGenres.value = [];
  sortBy.value = "";
  sortOrder.value = "desc";
  currentPage.value = 1;
  fetchMovies();
};

const debouncedFetchMovies = debounce(fetchMovies, 500);

watch(searchQuery, (newSearch) => {
  debouncedFetchMovies();
  updateQueryParams();
});

watch([sortBy, sortOrder, currentPage], () => {
  updateQueryParams();
  fetchMovies();
  scrollToTop();
});

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

onMounted(() => {
  fetchGenres();

  const { search, genre_ids, sort_by, order, page } = route.query;

  searchQuery.value = search || "";
  selectedGenres.value = genre_ids ? genre_ids.split(",").map(Number) : [];
  appliedGenres.value = [...selectedGenres.value];
  sortBy.value = sort_by || "";
  sortOrder.value = order || "desc";
  currentPage.value = parseInt(page) || 1;

  fetchMovies();
});
</script>

<template>
  <div class="container py-4">
    <div class="mb-3">
      <input
        type="text"
        class="form-control"
        placeholder="Search movies..."
        v-model="searchQuery"
      />
    </div>

    <div class="mb-3">
      <h5>Filter by Genres</h5>
      <div class="d-flex flex-wrap gap-2">
        <button
          v-for="genre in genres"
          :key="genre.id"
          :class="['btn', selectedGenres.includes(genre.id) ? 'btn-primary' : 'btn-outline-primary']"
          @click="toggleGenre(genre.id)"
        >
          {{ genre.name }}
        </button>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary" @click="applyFilters">Apply Filters</button>
        <button class="btn btn-secondary ms-2" @click="resetFilters">Reset Filters</button>
      </div>
    </div>

    <div class="mb-3">
      <h5>Sort Movies</h5>
      <div class="d-flex align-items-center gap-3">
        <select v-model="sortBy" class="form-select w-auto">
          <option value="" disabled>Sort By</option>
          <option value="release_date">Release Date</option>
        </select>

        <select v-model="sortOrder" class="form-select w-auto">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>

    <div v-if="movies.length === 0" class="alert alert-warning text-center">
      No movies found. Try adjusting your search or filters.
    </div>

    <div v-else class="row">
      <div v-for="movie in movies" :key="movie.id" class="col-md-4 mb-4">
        <div class="card">
          <router-link :to="{ name: 'MovieDetails', params: { id: movie.id } }">
            <img
              :src="movie.poster || notAvailableImage"
              alt="Movie Poster"
              class="card-img-top"
            />
          </router-link>
          <div class="card-body">
            <h5 class="card-title">{{ movie.title }}</h5>
            <p class="card-text">
              Release Date: {{ movie.release_date || "N/A" }} <br />
            </p>
          </div>
        </div>
      </div>
    </div>

    <nav v-if="totalPages > 1" aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="currentPage--"
            :disabled="currentPage === 1"
          >
            Previous
          </button>
        </li>

        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="currentPage = page">{{ page }}</button>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="currentPage++"
            :disabled="currentPage === totalPages"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.card-text {
  margin-bottom: auto;
}

.card img {
  height: 600px;

  object-fit: cover;
  margin-bottom: 1rem;
}

.alert {
  margin-top: 20px;
}
</style>
