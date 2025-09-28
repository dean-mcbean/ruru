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
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/protected',
    name: 'protected',
    component: () => import('@/views/ProtectedPage.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/',
    redirect: '/dashboard'
  }
]


const router = createRouter({
  history: createWebHistory('/dashboard/'),
  routes
})

export default router