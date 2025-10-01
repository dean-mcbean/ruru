import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from './authGuard'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
    beforeEnter: requireGuest
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/',
    redirect: '/home'
  }
]


const router = createRouter({
  history: createWebHistory('/dashboard/'),
  routes
})

export default router