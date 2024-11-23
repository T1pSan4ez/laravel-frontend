<script setup>
import { ref } from "vue";
import ApiService from "@/services/api";

const credentials = ref({
  email: "",
  password: "",
});

const error = ref("");

const handleLogin = async () => {
  try {
    const response = await ApiService.login(credentials.value);
    console.log("Успешный вход:", response);
  } catch (error) {
    console.error("Ошибка входа:", error);
    error.value = error.message;
  }
};

</script>

<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="pa-4" width="400">
      <v-card-title>Вход</v-card-title>
      <v-card-text>
        <v-form >
          <v-text-field
            label="Email"
            v-model="credentials.email"
            required
          ></v-text-field>

          <v-text-field
            label="Пароль"
            v-model="credentials.password"
            type="password"
            required
          ></v-text-field>

          <v-alert v-if="error" type="error" dense class="mt-2">
            {{ error }}
          </v-alert>

          <v-btn  color="primary" class="mt-4" block @click="handleLogin">
            Войти
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Вы можете добавить кастомный стиль здесь */
</style>
