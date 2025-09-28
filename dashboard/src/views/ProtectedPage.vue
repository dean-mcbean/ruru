<template>
  <div class="protected-view">
    <h1>Protected Page</h1>
    <p>This page is only accessible to authenticated users.</p>
    <router-link to="/dashboard">Back to Dashboard</router-link>
  </div>
</template>

<script setup>
// Add any protected logic here if needed
</script>

<style scoped>
.protected-view { max-width: 600px; margin: 2rem auto; }
</style>
