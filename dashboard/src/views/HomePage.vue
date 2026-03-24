<template>
  <div class="dashboard-view">
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard!</p>
    <br />
    <h2>Quick Links</h2>
    <div class="quick-links">
      <div class="link-card" @click="router.push('/project-management')">
        <VIcon large class="icon">mdi-clipboard-list</VIcon>
        <div class="link-info">
          <h3>Project Management</h3>
          <p>Manage your projects across platforms.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { VIcon } from "vuetify/components";

const router = useRouter();
</script>

<style scoped>
.dashboard-view {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 32px 64px;
  overflow: auto;
  max-height: 100vh;
  background-color: #124875;
  align-self: stretch;
}
h1 {
  margin-bottom: 16px;
  color: #ecf0f1;
}
.quick-links {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}
.link-card {
  background: #1e5a85;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  width: 320px;
  transition: box-shadow 0.2s;
  display: flex;
  gap: 12px;
}
.link-card .icon {
  height: 48px;
  width: 48px;
  font-size: 48px;
  color: #ecf0f1;
}
.link-card:hover {
  box-shadow: 8px 8px 0 0 rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.link-info {
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
