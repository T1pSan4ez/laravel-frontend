<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ApiService from "@/services/api";

const route = useRoute();
const sessionData = ref(null);
const error = ref(null);

const fetchSessionData = async () => {
  try {
    const sessionId = route.params.id;
    sessionData.value = await ApiService.getSessionById(sessionId);
  } catch (err) {
    error.value = 'Failed to load session data.';
    console.error(err);
  }
};

onMounted(()=>{
  fetchSessionData();
});

</script>

<template>
  <div>
    <h1>Session Plan</h1>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="sessionData">
      <h2>{{ sessionData.title }}</h2>
      <p>{{ sessionData.description }}</p>
      <p><strong>Start Time:</strong> {{ sessionData.start_time }}</p>
      <p><strong>End Time:</strong> {{ sessionData.end_time }}</p>
      <p><strong>Location:</strong> {{ sessionData.location }}</p>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<style scoped>
.alert {
  color: red;
}
</style>
