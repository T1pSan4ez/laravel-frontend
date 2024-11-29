<script setup>
import { ref } from "vue";
import { useCinemaStore } from "@/stores/cinemaStore";
import CityCinemaSelector from "@/components/CityCinemaSelector.vue";

const showModal = ref(false);

const cinemaStore = useCinemaStore();

const handleSelection = (city, cinema) => {
  cinemaStore.selectCity(city);
  cinemaStore.selectCinema(cinema);
  console.log("Selected cinema:", cinemaStore.selectedCinema);
};

const closeOnBackdrop = (event) => {
  const modalDialog = document.querySelector(".modal-dialog");
  if (!modalDialog.contains(event.target)) {
    showModal.value = false;
  }
};
</script>

<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div class="container-fluid">
        <button class="btn btn-outline-light me-3" @click="console.log('Menu opened')">
          <i class="mdi mdi-menu"></i>
        </button>
        <router-link to="/"><span class="navbar-brand">Movie App</span></router-link>

        <button class="btn btn-outline-light ms-auto" @click="showModal = true">
          <span v-if="cinemaStore.selectedCinema">
            {{ cinemaStore.selectedCinema.name }} ({{ cinemaStore.selectedCity.name }})
          </span>
          <span v-else>
            Cities (Cinemas)
          </span>
          <i class="mdi mdi-chevron-down"></i>
        </button>
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
