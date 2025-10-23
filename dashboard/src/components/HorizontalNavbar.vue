<template>
  <nav :class="['navbar', { expanded }]">
    <div class="navbar-top">
      <img src="@/assets/slack-icon.png" alt="App Logo" class="app-logo" />
      <div class="navbar-header" @click="toggleExpand">
        <h2 class="app-title show-on-expand">Ruru</h2>
        <button class="expand-btn">
          <VIcon>{{ expanded ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</VIcon>
        </button>
      </div>
    </div>
    <ul class="nav-items">
      <li v-for="item in navItems" :key="item.label" class="nav-item" @click="router.push(item.route)">
        <VIcon>{{ item.icon }}</VIcon>
        <span class="show-on-expand">{{ item.label }}</span>
      </li>
    </ul>
    <div class="navbar-bottom">
      <div class="user-icon">
        <img
          v-if="userProfileImageUrl"
          :src="userProfileImageUrl"
          alt="User"
          class="profile-img"
        />
        <VIcon v-else>mdi-account-circle</VIcon>
        <span class="user-name show-on-expand">{{ firstName }}</span>
        <VIcon class="logout-icon show-on-expand" @click="authStore.logout()">mdi-logout</VIcon>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router';
import { VIcon } from 'vuetify/components';

const router = useRouter();
const authStore = useAuthStore()

const expanded = ref(false)
const toggleExpand = () => {
  expanded.value = !expanded.value
}

const navItems = [
  { label: 'Home', icon: 'mdi-home', route: '/home' },
  { label: 'Feature Flags', icon: 'mdi-flag', route: '/feature-flags' },
  { label: 'User Management', icon: 'mdi-account-group', route: '/user-management' },
  { label: 'Project Management', icon: 'mdi-clipboard-list', route: '/project-management' },
  { label: 'Upload Markdown', icon: 'mdi-upload', route: '/upload-markdown' }
]
// Vuetify VIcon is globally available, no import needed

// Simulate loading user profile image from auth
const userProfileImageUrl = ref(null)
const firstName = ref(null)
onMounted(() => {
  const { userProfileImage, userFirstName } = authStore
  console.log('User Profile Image from store:', userProfileImage)
  // userProfileImage.value = user?.profileImageUrl
  userProfileImageUrl.value = userProfileImage
  firstName.value = userFirstName
  console.log('HorizontalNavbar mounted')
})
</script>

<style scoped>
.navbar {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 220px;
  background: #00213c;
  color: #fff;
  height: 100vh;
  transition: width 0.2s;
  justify-content: space-between;
}
.navbar:not(.expanded) {
  width: 60px;
}
.nav-items {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-item i {
  font-size: 1.2em;
  width: 24px;
  text-align: center;
  flex: none;
}
.nav-item span {
  margin-left: 16px;
  overflow: hidden;
  white-space: nowrap;
}
.nav-item:hover {
  background: #0004;
}
.app-title {
  margin: 0;
  font-size: 1.5em;
  flex-grow: 1;
  padding-left: 16px;
  user-select: none;
}
.navbar:not(.expanded) .show-on-expand {
  opacity: 0;
  max-width: 0;
  padding: 0 !important;
  transition: opacity 0.2s, max-width 0.2s, padding 0.2s;
}
.navbar.expanded .show-on-expand {
  transition: opacity 0.2s, max-width 0.2s, padding 0.2s;
  opacity: 1;
  max-width: 240px;
}
.navbar-top {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #12487580;
}
.navbar-header {
  width: 100%;
  display: flex;
  cursor: pointer;
  transition: background 0.1s;
  height: 44px;
  align-items: center;
}
.navbar-header:hover {
  background: #12487580;
}
.navbar-top img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  margin: 8px;
  object-fit: cover;
  box-sizing: border-box;
  transition: width 0.2s, height 0.2s, margin 0.2s, border-radius 0.2s, filter 0.2s, opacity 0.2s;
}
.navbar.expanded .navbar-top img {
  height: 64px;
  margin: 0;
  border-radius: 0;
  width: 220px;
  filter: brightness(0.8) saturate(1.4);
  opacity: 0.2;
}
.navbar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.expand-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5em;
}
.user-icon {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  gap: 8px;
  overflow: hidden;
  border-top: 1px solid #12487580;
}
.user-icon .profile-img {
  font-size: 2em;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  margin: 8px;
  border: 1px solid #124875;
}
.user-name {
  white-space: nowrap;
  flex-grow: 1;
}
.logout-icon {
  height: 100%;
  width: 20px;
  padding: 0 16px;
  cursor: pointer;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.logout-icon:hover {
  background: #12487580;
}
.profile-img {
  object-fit: cover;
  background: #12487580;
}
</style>