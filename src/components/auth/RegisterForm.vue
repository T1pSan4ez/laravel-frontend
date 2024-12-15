<script setup>
import {ref} from "vue";
import ApiService from "@/services/api";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";

const authStore = useAuthStore();

const registerForm = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const errors = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const generalError = ref("");

const validateForm = () => {
  let isValid = true;

  errors.value = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  };

  if (!registerForm.value.name.trim()) {
    errors.value.name = "Name is required.";
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!registerForm.value.email.trim()) {
    errors.value.email = "Email is required.";
    isValid = false;
  } else if (!emailPattern.test(registerForm.value.email)) {
    errors.value.email = "Invalid email address.";
    isValid = false;
  }

  if (!registerForm.value.password.trim()) {
    errors.value.password = "Password is required.";
    isValid = false;
  } else if (registerForm.value.password.length < 8) {
    errors.value.password = "Password must be at least 8 characters.";
    isValid = false;
  }

  if (registerForm.value.password !== registerForm.value.password_confirmation) {
    errors.value.password_confirmation = "Passwords do not match.";
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  generalError.value = "";

  try {
    const response = await ApiService.register(registerForm.value);

    const token = response.token;

    if (token) {
      localStorage.setItem("authToken", token);
      authStore.loginSuccess(token);
      console.log("Registration successful:", response);

      await router.push({ name: "Home" });
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      generalError.value = error.response.data.message || "This email is already registered. Please use another one.";
    } else {
      generalError.value = "An unexpected error occurred. Please try again later.";
    }
    console.error("Registration error:", error);
  }
};
</script>

<template>
  <form @submit.prevent="handleRegister">
    <div class="mb-3">
      <div v-if="generalError" class="alert alert-danger mt-3">
        {{ generalError }}
      </div>
      <label for="registerName" class="form-label">Full Name</label>
      <input
        type="text"
        class="form-control"
        id="registerName"
        v-model="registerForm.name"
      />
      <div v-if="errors.name" class="text-danger mt-1">{{ errors.name }}</div>
    </div>
    <div class="mb-3">
      <label for="registerEmail" class="form-label">Email address</label>
      <input
        type="email"
        class="form-control"
        id="registerEmail"
        v-model="registerForm.email"
      />
      <div v-if="errors.email" class="text-danger mt-1">{{ errors.email }}</div>
    </div>
    <div class="mb-3">
      <label for="registerPassword" class="form-label">Password</label>
      <input
        type="password"
        class="form-control"
        id="registerPassword"
        v-model="registerForm.password"
      />
      <div v-if="errors.password" class="text-danger mt-1">
        {{ errors.password }}
      </div>
    </div>
    <div class="mb-3">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input
        type="password"
        class="form-control"
        id="confirmPassword"
        v-model="registerForm.password_confirmation"
      />
      <div v-if="errors.password_confirmation" class="text-danger mt-1">
        {{ errors.password_confirmation }}
      </div>
    </div>
    <slot name="footer">
      <button
        type="submit"
        class="btn btn-success w-100"
        :disabled="Object.values(errors).some((error) => error)"
      >
        Register
      </button>
    </slot>
  </form>
</template>
