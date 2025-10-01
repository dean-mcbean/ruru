<template>
  <nav :class="['navbar', { expanded }]">
    <ul class="nav-items">
      <li v-for="item in navItems" :key="item.label" class="nav-item">
        <i :class="item.icon"></i>
        <span v-if="expanded">{{ item.label }}</span>
      </li>
    </ul>
    <div class="navbar-bottom">
      <button class="expand-btn" @click="toggleExpand">
        <i :class="expanded ? 'fas fa-angle-left' : 'fas fa-angle-right'"></i>
      </button>
      <div class="user-icon">
        <img
          v-if="userProfileImageUrl"
          :src="userProfileImageUrl"
          alt="User"
          class="profile-img"
        />
        <i v-else class="fas fa-user-circle"></i>
        <span v-if="expanded" class="user-name">{{ firstName }}</span>
        <i v-if="expanded" class="logout-icon fa-solid fa-right-from-bracket" @click="authStore.logout()"></i>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
const authStore = useAuthStore()

const expanded = ref(false)
const toggleExpand = () => {
  expanded.value = !expanded.value
}

const navItems = [
  { label: 'Home', icon: 'fas fa-home' },
  { label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  { label: 'Messages', icon: 'fas fa-envelope' },
  { label: 'Settings', icon: 'fas fa-cog' }
]

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
}
.nav-item:hover {
  background: #333;
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
  margin-bottom: 16px;
  cursor: pointer;
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