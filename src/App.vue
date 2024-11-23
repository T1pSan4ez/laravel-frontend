<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import CityCinemaSelector from "@/components/CityCinemaSelector.vue";

const showModal = ref(false);
const router = useRouter();

const goToLogin = () => {
  router.push("/login");
};
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-btn icon @click="console.log('Menu opened')">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <v-spacer></v-spacer>

      <!-- Кнопка открытия модального окна -->
      <v-btn @click="showModal = true">
        Cities (Cinemas) <v-icon right>mdi-chevron-down</v-icon>
      </v-btn>

      <v-btn outlined @click="goToLogin">
        Sign In
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <!-- Модальное окно -->
        <v-dialog v-model="showModal" max-width="600">
          <CityCinemaSelector @close="showModal = false" />
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>

  <router-view></router-view>
</template>

<style scoped>
</style>
