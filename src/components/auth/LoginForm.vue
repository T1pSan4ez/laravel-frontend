<script setup>
import { ref, onMounted } from "vue";
import ApiService from "@/services/api";
import router from "@/router/index.js";
import { useAuthStore } from "@/stores/authStore.js";

const authStore = useAuthStore();

const loginForm = ref({
  email: "",
  password: "",
  rememberMe: false,
});

const qrToken = ref("");
const qrError = ref(null);

const errors = ref({
  email: "",
  password: "",
});

const validateForm = () => {
  let isValid = true;

  errors.value = {
    email: "",
    password: "",
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!loginForm.value.email.trim()) {
    errors.value.email = "Email is required.";
    isValid = false;
  } else if (!emailPattern.test(loginForm.value.email)) {
    errors.value.email = "Invalid email address.";
    isValid = false;
  }

  if (!loginForm.value.password.trim()) {
    errors.value.password = "Password is required.";
    isValid = false;
  } else if (loginForm.value.password.length < 8) {
    errors.value.password = "Password must be at least 8 characters.";
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    const response = await ApiService.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
      remember: loginForm.value.rememberMe,
    });

    const token = response.token;

    if (token) {
      localStorage.setItem("authToken", token);
      authStore.loginSuccess(token);

      const userData = await ApiService.getUserProfile();
      authStore.setUser(userData);
      console.log("Login successful:", response);

      await router.push({ name: "Home" });
    }
  } catch (error) {
    console.error("Login error:", error);
  }
};

const loginWithGoogle = async () => {
  try {
    window.location.href = await ApiService.loginWithGoogleRedirect();
  } catch (error) {
    console.error("Ошибка входа через Google:", error);
  }
};

const handleUrlToken = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    localStorage.setItem("authToken", token);
    authStore.loginSuccess(token);

    const userData = await ApiService.getUserProfile();
    authStore.setUser(userData);

    router.push({name: "Home"});
  }
};

const handleQRTokenLogin = async () => {
  qrError.value = null;
  try {
    const response = await ApiService.loginWithQRToken(qrToken.value);

    const token = response.token;

    if (token) {
      localStorage.setItem("authToken", token);
      authStore.loginSuccess(token);

      const userData = await ApiService.getUserProfile();
      authStore.setUser(userData);

      console.log("QR Token Login successful:", response);
      await router.push({ name: "Home" });
    }
  } catch (error) {
    qrError.value =
      error.message || "Ошибка при входе с использованием QR-кода.";
    console.error("Ошибка при авторизации через QR-код:", error);
  }
};

onMounted(() => {
  handleUrlToken();
});
</script>

<template>
  <form @submit.prevent="handleLogin">
    <div class="mb-3">
      <label for="loginEmail" class="form-label">Email address</label>
      <input
        type="email"
        class="form-control"
        id="loginEmail"
        v-model="loginForm.email"
      />
      <div v-if="errors.email" class="text-danger mt-1">{{ errors.email }}</div>
    </div>
    <div class="mb-3">
      <label for="loginPassword" class="form-label">Password</label>
      <input
        type="password"
        class="form-control"
        id="loginPassword"
        v-model="loginForm.password"
      />
      <div v-if="errors.password" class="text-danger mt-1">
        {{ errors.password }}
      </div>
    </div>
    <div class="form-check mb-3">
      <input
        type="checkbox"
        class="form-check-input"
        id="rememberMe"
        v-model="loginForm.rememberMe"
      />
      <label class="form-check-label" for="rememberMe">Remember me</label>
    </div>
    <slot name="footer">
      <button type="submit" class="btn btn-primary w-100">Login</button>
    </slot>
  </form>

  <button type="button" class="btn btn-danger w-100 mt-3" @click="loginWithGoogle">
    Login with Google
  </button>

  <div class="mt-4">
    <h5>Login with QR Token</h5>
    <div class="mb-3">
      <label for="qrToken" class="form-label">QR Token</label>
      <input
        type="text"
        id="qrToken"
        class="form-control"
        v-model="qrToken"
        placeholder="Enter your QR token"
      />
    </div>
    <button class="btn btn-secondary w-100" @click="handleQRTokenLogin">
      Login with QR Token
    </button>
    <div v-if="qrError" class="text-danger mt-2">
      {{ qrError }}
    </div>
  </div>
</template>
