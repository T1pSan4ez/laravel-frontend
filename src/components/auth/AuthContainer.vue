<script setup>
import { ref } from "vue";
import LoginForm from "@/components/auth/LoginForm.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";

const currentTab = ref("login");

const switchTab = () => {
  currentTab.value = currentTab.value === "login" ? "register" : "login";
};
</script>

<template>
  <div class="auth-container container mt-5">
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white text-center">
        <slot name="header">
          <h3>{{ currentTab === "login" ? "Login" : "Register" }}</h3>
        </slot>
      </div>
      <div class="card-body">
        <slot name="body">
          <LoginForm v-if="currentTab === 'login'">
            <template #footer>
              <div class="d-flex justify-content-between mt-3">
                <button
                  type="button"
                  class="btn btn-link"
                  @click="switchTab"
                >
                  Switch to Register
                </button>
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
            </template>
          </LoginForm>

          <RegisterForm v-if="currentTab === 'register'">
            <template #footer>
              <div class="d-flex justify-content-between mt-3">
                <button
                  type="button"
                  class="btn btn-link"
                  @click="switchTab"
                >
                  Switch to Login
                </button>
                <button type="submit" class="btn btn-success">Register</button>
              </div>
            </template>
          </RegisterForm>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 500px;
}
</style>
