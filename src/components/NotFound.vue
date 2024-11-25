<script setup>

</script>

<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <router-link to="/">Go Back Home</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}
h1 {
  font-size: 2.5rem;
  color: #ff5252;
}
p {
  margin: 20px 0;
  font-size: 1.25rem;
}
</style>


