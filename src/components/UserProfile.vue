<script setup>
import {ref, onMounted} from "vue";
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

const avatar = ref(null);
const avatarPreview = ref(null);
const isUploadingAvatar = ref(false);

const nameError = ref("");
const passwordError = ref("");
const avatarError = ref("");

const successMessage = ref("");
const serverError = ref("");

const activeTab = ref("profile");
const purchases = ref([]);

const fetchUserProfile = async () => {
  try {
    const user = await ApiService.getUserProfile();
    name.value = user.data.name;
    email.value = user.data.email;
    avatarPreview.value = user.data.avatar;
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
};

const fetchUserPurchases = async () => {
  try {
    const response = await ApiService.getUserPurchases();
    purchases.value = response.data;
  } catch (error) {
    console.error("Error fetching purchase history:", error);
  }
};

const uploadAvatar = async () => {
  avatarError.value = "";
  successMessage.value = "";
  serverError.value = "";

  if (!avatar.value) {
    avatarError.value = "Please select an image to upload.";
    return;
  }

  const formData = new FormData();
  formData.append("avatar", avatar.value);

  try {
    isUploadingAvatar.value = true;
    await ApiService.updateAvatar(formData);
    successMessage.value = "Avatar updated successfully.";
    await fetchUserProfile();
  } catch (error) {
    console.error("Error uploading avatar:", error);
    serverError.value = "Failed to upload avatar. Please try again later.";
  } finally {
    isUploadingAvatar.value = false;
  }
};

const updateProfile = async () => {
  resetMessages();
  if (!validateName()) return;

  try {
    await ApiService.changeProfile({name: name.value});
    await fetchUserProfile();
    successMessage.value = "Profile updated successfully.";
  } catch (error) {
    console.error("Error updating profile:", error);
    serverError.value = "Failed to update profile. Please check the data or try again later.";
  }
};

const updatePassword = async () => {
  resetMessages();
  if (!validatePassword()) return;

  try {
    await ApiService.changePassword({
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    password.value = "";
    passwordConfirmation.value = "";
    successMessage.value = "Password updated successfully.";
  } catch (error) {
    console.error("Error updating password:", error);
    serverError.value = "Failed to update password. Please try again later.";
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
    qrError.value = "Error generating QR Code. Please try again.";
    console.error("Error:", error);
  } finally {
    isGeneratingQR.value = false;
  }
};

const handleAvatarChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatar.value = file;
    avatarPreview.value = URL.createObjectURL(file);
  }
};

const resetMessages = () => {
  successMessage.value = "";
  serverError.value = "";
};

const validateName = () => {
  if (!name.value.trim()) {
    nameError.value = "Name cannot be empty.";
    return false;
  }
  if (name.value.length < 3) {
    nameError.value = "Name must be at least 3 characters.";
    return false;
  }
  if (name.value.length > 30) {
    nameError.value = "Name cannot be longer than 30 characters.";
    return false;
  }
  nameError.value = "";
  return true;
};

const validatePassword = () => {
  passwordError.value = "";

  if (!password.value || password.value.length < 8) {
    passwordError.value = "Password must be at least 8 characters.";
    return false;
  }

  if (password.value.length > 30) {
    passwordError.value = "Password must be shorter than 30 characters.";
    return false;
  }

  if (password.value !== passwordConfirmation.value) {
    passwordError.value = "Passwords do not match.";
    return false;
  }
  return true;
};

onMounted(() => {
  fetchUserProfile();
  fetchUserPurchases();
});
</script>

<template>
  <div class="container mt-4">

    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">Profile</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'purchases' }" @click="activeTab = 'purchases'">Purchase
          History</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'recommendations' }" @click="activeTab = 'recommendations'">Recommendations</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'qr' }" @click="activeTab = 'qr'">QR Code</a>
      </li>
    </ul>

    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    <div v-if="serverError" class="alert alert-danger mt-3">{{ serverError }}</div>

    <div class="tab-content mt-3">
      <div v-if="activeTab === 'profile'" class="row">
        <div class="col-md-6">
          <h5>Avatar</h5>
          <div class="text-center">
            <img
              :src="avatarPreview || 'default-avatar.png'"
              alt="Avatar"
              class="rounded-circle mb-3 border"
              style="width: 200px; height: 200px; object-fit: cover;"
            />
            <input type="file" class="form-control" @change="handleAvatarChange"/>
            <button @click="uploadAvatar" class="btn btn-primary mt-2" :disabled="isUploadingAvatar">
              {{ isUploadingAvatar ? "Uploading..." : "Upload Avatar" }}
            </button>
            <div v-if="avatarError" class="text-danger mt-2">{{ avatarError }}</div>
          </div>
        </div>
        <div class="col-md-6">
          <h5>Update Profile</h5>
          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label>Email: {{ email }}</label>
            </div>
            <div class="mb-3">
              <label for="name">Name:</label>
              <input v-model="name" type="text" class="form-control"/>
              <div v-if="nameError" class="text-danger">{{ nameError }}</div>
            </div>
            <button type="submit" class="btn btn-primary">Update Profile</button>
          </form>

          <h5 class="mt-4">Update Password</h5>
          <form @submit.prevent="updatePassword">
            <div class="mb-3">
              <label>New Password:</label>
              <input v-model="password" type="password" class="form-control"/>
            </div>
            <div class="mb-3">
              <label>Confirm Password:</label>
              <input v-model="passwordConfirmation" type="password" class="form-control"/>
            </div>
            <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>
            <button type="submit" class="btn btn-danger">Update Password</button>
          </form>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'purchases'">
      <h3>Purchase History</h3>
      <div v-if="purchases.length === 0" class="alert alert-warning">
        No purchases found.
      </div>
      <table v-else class="table table-bordered">
        <thead>
        <tr>
          <th>#</th>
          <th>Purchase Code</th>
          <th>Items</th>
          <th>Date</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(purchase, index) in purchases" :key="purchase.id">
          <td>{{ index + 1 }}</td>
          <td>{{ purchase.purchase_code }}</td>
          <td>
            <ul>
              <li v-for="item in purchase.items" :key="item.id">
                {{ item.item_name }} ({{ item.quantity }} x {{ item.price }} UAH)
              </li>
            </ul>
          </td>
          <td>{{ purchase.created_at }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'recommendations'">
      <MovieRecommendation/>
    </div>

    <div v-if="activeTab === 'qr'">
      <h3>Generate QR Code</h3>
      <button @click="generateQRCode" class="btn btn-primary" :disabled="isGeneratingQR">
        {{ isGeneratingQR ? "Generating..." : "Generate QR Code" }}
      </button>
      <div v-if="qrCodeImage" class="mt-3">
        <img :src="qrCodeImage" alt="QR Code"/>
        <p class="text-muted">QR Code expires in 5 minutes.</p>
      </div>
      <div v-if="qrError" class="text-danger">{{ qrError }}</div>
    </div>
  </div>


</template>

<style scoped>
.nav-tabs .nav-link {
  cursor: pointer;
}

.rounded-circle {
  border: 3px solid #007bff;
}
</style>
