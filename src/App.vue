<script setup>
import {computed, ref} from "vue";
import { useCinemaStore } from "@/stores/cinemaStore";
import { useAuthStore } from "@/stores/authStore";
import CityCinemaSelector from "@/components/CityCinemaSelector.vue";
import router from "@/router/index.js";
import ApiService from "@/services/api";

const showModal = ref(false);
const cinemaStore = useCinemaStore();
const authStore = useAuthStore();

const handleSelection = (city, cinema) => {
  cinemaStore.selectCity(city);
  cinemaStore.selectCinema(cinema);
};

const closeOnBackdrop = (event) => {
  const modalDialog = document.querySelector(".modal-dialog");
  if (!modalDialog.contains(event.target)) {
    showModal.value = false;
  }
};

const navigateToAuth = () => {
  router.push({ name: "auth" });
};

const navigateToProfile = () => {
  router.push({ name: "profile" });
};

const logout = () => {
  ApiService.logout();
  authStore.logout();
};

authStore.$subscribe((mutation, state) => {
  if (!state.isAuthenticated && router.currentRoute.value.name === "profile") {
    router.push({ name: "Home" });
  }
});

const truncatedUserName = computed(() => {
  const userName = authStore.user || "User";
  return userName.length > 20 ? userName.substring(0, 20) + "..." : userName;
});
</script>

<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div class="container-fluid">
        <router-link to="/"><span class="navbar-brand">Movie App</span></router-link>
        <router-link to="/movies"><span class="navbar-brand">Discover</span></router-link>

        <button class="btn btn-outline-light ms-auto" @click="showModal = true">
          <span v-if="cinemaStore.selectedCinema">
            {{ cinemaStore.selectedCinema.name }} ({{ cinemaStore.selectedCity.name }})
          </span>
          <span v-else>
            Cities (Cinemas)
          </span>
          <i class="mdi mdi-chevron-down"></i>
        </button>

        <template v-if="authStore.isAuthenticated">
          <button class="btn btn-outline-light ms-3" @click="navigateToProfile">
            {{ truncatedUserName }}
          </button>
          <button class="btn btn-outline-light ms-3" @click="logout">
            Logout
          </button>
        </template>
        <template v-else>
          <button class="btn btn-outline-light ms-3" @click="navigateToAuth">
            Sign In
          </button>
        </template>
      </div>

      <div
        class="modal fade"
        id="cityCinemaModal"
        tabindex="-1"
        :aria-hidden="!showModal"
        ref="modal"
        :class="{ show: showModal, 'd-block': showModal }"
        @click="closeOnBackdrop"
        style="background: rgba(0,0,0,0.5);"
      >
        <div class="modal-dialog modal-dialog-centered" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Select City & Cinema</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Close"
                @click="showModal = false"
              ></button>
            </div>
            <div class="modal-body">
              <CityCinemaSelector
                @close="showModal = false"
                @select="handleSelection"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.modal.fade {
  display: none;
}
.modal.fade.d-block {
  display: block;
}

.modal-dialog {
  max-width: 750px;
  width: 100%;
}

.modal-content {
  height: auto;
}
</style>
