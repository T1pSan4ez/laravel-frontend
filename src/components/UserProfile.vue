<script setup>
import { ref, onMounted } from "vue";
import ApiService from "@/services/api.js";
import QRCode from "qrcode";
import MovieRecommendation from "@/components/MovieRecommendation.vue";

const name = ref("");
const email = ref(null);
const password = ref("");
const passwordConfirmation = ref("");
const qrCodeImage = ref(null);
const isGeneratingQR = ref(false);
const qrError = ref(null);

const fetchUserProfile = async () => {
  try {
    const user = await ApiService.getUserProfile();
    name.value = user.data.name;
    email.value = user.data.email;
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
  }
};

const updateProfile = async () => {
  const formData = new FormData();
  formData.append("name", name.value);

  try {
    await ApiService.changeProfile(formData);
    await fetchUserProfile();
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error);
  }
};

const updatePassword = async () => {
  try {
    await ApiService.changePassword({
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    password.value = "";
    passwordConfirmation.value = "";
  } catch (error) {
    console.error("Ошибка при обновлении пароля:", error);
  }
};

const generateQRCode = async () => {
  isGeneratingQR.value = true;
  qrError.value = null;

  try {
    const data = await ApiService.generateQRToken();
    const token = data.token;

    qrCodeImage.value = await QRCode.toDataURL(token);
  } catch (error) {
    qrError.value = "Ошибка генерации QR-кода. Пожалуйста, попробуйте снова.";
    console.error("Ошибка:", error);
  } finally {
    isGeneratingQR.value = false;
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">User Profile</h1>
    <div class="row">
      <div class="col-md-6">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Update Profile</h5>
            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <p>Email: {{ email }}</p>
              </div>
              <div class="mb-3">
                <label for="name" class="form-label">Name:</label>
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  class="form-control"
                />
              </div>
              <button type="submit" class="btn btn-primary">
                Update Profile
              </button>
            </form>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Update Password</h5>
            <form @submit.prevent="updatePassword">
              <div class="mb-3">
                <label for="password" class="form-label">New Password:</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="form-control"
                />
              </div>

              <div class="mb-3">
                <label for="password_confirmation" class="form-label">
                  Confirm Password:
                </label>
                <input
                  id="password_confirmation"
                  v-model="passwordConfirmation"
                  type="password"
                  class="form-control"
                />
              </div>

              <button type="submit" class="btn btn-danger">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">QR Code</h5>
            <p>Generate a QR code for secure login.</p>
            <button
              class="btn btn-primary"
              @click="generateQRCode"
              :disabled="isGeneratingQR"
            >
              {{ isGeneratingQR ? "Generating..." : "Generate QR Code" }}
            </button>

            <div v-if="qrCodeImage" class="mt-3">
              <p>Your QR Code:</p>
              <img :src="qrCodeImage" alt="QR Code" />
              <p class="text-muted">QR Code expires in 5 minutes.</p>
            </div>

            <div v-if="qrError" class="text-danger mt-3">
              {{ qrError }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <MovieRecommendation />
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
}
</style>
